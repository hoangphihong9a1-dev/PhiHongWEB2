package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.domain.Product;
import com.rainbowforest.orderservice.domain.User;
import com.rainbowforest.orderservice.feignclient.UserClient;
import com.rainbowforest.orderservice.http.header.HeaderGenerator;
import com.rainbowforest.orderservice.service.CartService;
import com.rainbowforest.orderservice.service.OrderService;
import com.rainbowforest.orderservice.utilities.OrderUtilities;
import com.rainbowforest.orderservice.repository.ProductRepository;
import com.rainbowforest.orderservice.repository.UserRepository;
import com.rainbowforest.orderservice.repository.SystemLogRepository;
import com.rainbowforest.orderservice.mongodb.SystemLog;
import com.rainbowforest.orderservice.rabbitmq.event.OrderCompletedEvent;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

@RestController
public class OrderController {

    @Autowired
    private UserClient userClient;

    @Autowired
    private OrderService orderService;

    @Autowired
    private CartService cartService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private SystemLogRepository systemLogRepository;
    
    @PostMapping(value = "/order/{userId}")
    @CircuitBreaker(name = "userServiceCB", fallbackMethod = "saveOrderFallback")
    @Retry(name = "userServiceRetry")
    public ResponseEntity<Order> saveOrder(
    		@PathVariable("userId") Long userId,
    		@RequestHeader(value = "Cart-Id") String cartId,
            @RequestHeader(value = "X-User-Id", required = false) String authenticatedUserId,
            @RequestHeader(value = "X-User-Role", required = false) String authenticatedUserRole,
    		HttpServletRequest request){
    	
        if (authenticatedUserId != null && !authenticatedUserId.equals(userId.toString())) {
            if (authenticatedUserRole == null || !authenticatedUserRole.equals("ROLE_ADMIN")) {
                return new ResponseEntity<Order>(HttpStatus.FORBIDDEN);
            }
        }

        List<Item> cart = cartService.getAllItemsFromCart(cartId);
        User user = userClient.getUserById(userId);   
        if(cart != null && !cart.isEmpty() && user != null) {
            try {
                // Ensure user exists in local DB
                if (!userRepository.existsById(user.getId())) {
                    userRepository.save(user);
                }

                // Ensure all products exist in local DB
                for (Item item : cart) {
                    Product p = item.getProduct();
                    if (p != null) {
                        if (!productRepository.existsById(p.getId())) {
                            productRepository.save(p);
                        }
                    }
                }

                Order order = this.createOrder(cart, user);
                orderService.saveOrder(order);
                cartService.deleteCart(cartId);
                return new ResponseEntity<Order>(
                        order, 
                        headerGenerator.getHeadersForSuccessPostMethod(request, order.getId().toString()),
                        HttpStatus.CREATED);
            } catch (Exception ex) {
                ex.printStackTrace();
                return new ResponseEntity<Order>(
                        headerGenerator.getHeadersForError(),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
  
        return new ResponseEntity<Order>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<Order> saveOrderFallback(
            Long userId,
            String cartId,
            String authenticatedUserId,
            String authenticatedUserRole,
            HttpServletRequest request,
            Throwable t) {
        Order orderFallback = new Order();
        orderFallback.setStatus("USER_SERVICE_UNAVAILABLE_FALLBACK");
        return new ResponseEntity<Order>(
                orderFallback,
                headerGenerator.getHeadersForError(),
                HttpStatus.SERVICE_UNAVAILABLE);
    }

    @GetMapping(value = "/admin/orders")
    public ResponseEntity<List<Order>> getAllOrders(){
        List<Order> orders = orderService.getAllOrders();
        return new ResponseEntity<List<Order>>(
                orders,
                HttpStatus.OK);
    }

    @GetMapping(value = "/order/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUserId(
            @PathVariable("userId") Long userId,
            @RequestHeader(value = "X-User-Id", required = false) String authenticatedUserId,
            @RequestHeader(value = "X-User-Role", required = false) String authenticatedUserRole) {
        
        if (authenticatedUserId != null && !authenticatedUserId.equals(userId.toString())) {
            if (authenticatedUserRole == null || !authenticatedUserRole.equals("ROLE_ADMIN")) {
                return new ResponseEntity<List<Order>>(HttpStatus.FORBIDDEN);
            }
        }
        
        List<Order> orders = orderService.getAllOrders().stream()
                .filter(o -> o.getUser() != null && o.getUser().getId().equals(userId))
                .collect(Collectors.toList());
        return new ResponseEntity<List<Order>>(orders, HttpStatus.OK);
    }


    @PutMapping(value = "/order/{id}/complete")
    public ResponseEntity<Order> completeOrder(
            @PathVariable("id") Long id,
            @RequestHeader(value = "X-User-Id", required = false) String authenticatedUserId,
            @RequestHeader(value = "X-User-Role", required = false) String authenticatedUserRole) {
        
        Order order = orderService.getOrderById(id);
        if (order != null) {
            if (authenticatedUserId != null && order.getUser() != null) {
                if (!order.getUser().getId().toString().equals(authenticatedUserId)) {
                    if (authenticatedUserRole == null || !authenticatedUserRole.equals("ROLE_ADMIN")) {
                        return new ResponseEntity<Order>(HttpStatus.FORBIDDEN);
                    }
                }
            }
            order.setStatus("COMPLETED");
            orderService.saveOrder(order);

            // Publish OrderCompletedEvent to RabbitMQ (Choreography Saga step)
            try {
                List<OrderCompletedEvent.OrderItemDto> items = order.getItems().stream()
                        .map(item -> new OrderCompletedEvent.OrderItemDto(item.getProduct().getId(), item.getQuantity()))
                        .collect(Collectors.toList());
                OrderCompletedEvent event = new OrderCompletedEvent(order.getId(), items);
                rabbitTemplate.convertAndSend("saga-exchange", "order.completed", event);
                
                // Save log to MongoDB
                SystemLog log = new SystemLog("Order " + id + " has been marked as COMPLETED. Saga event dispatched for inventory deduction.", "INFO");
                systemLogRepository.save(log);
            } catch (Exception e) {
                e.printStackTrace();
            }

            return new ResponseEntity<Order>(order, HttpStatus.OK);
        }
        return new ResponseEntity<Order>(HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/admin/orders/revenue")
    public ResponseEntity<BigDecimal> getRevenue() {
        List<Order> orders = orderService.getAllOrders();
        BigDecimal totalRevenue = orders.stream()
                .filter(o -> "COMPLETED".equals(o.getStatus()))
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new ResponseEntity<BigDecimal>(totalRevenue, HttpStatus.OK);
    }

    @GetMapping(value = "/admin/logs")
    public ResponseEntity<List<SystemLog>> getSystemLogs() {
        try {
            List<SystemLog> logs = systemLogRepository.findAll();
            return new ResponseEntity<List<SystemLog>>(logs, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<List<SystemLog>>(new ArrayList<>(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    private Order createOrder(List<Item> cart, User user) {
        Order order = new Order();
        order.setItems(cart);
        order.setUser(user);
        order.setTotal(OrderUtilities.countTotalPrice(cart));
        order.setOrderedDate(LocalDate.now());
        order.setStatus("PAYMENT_EXPECTED");

        if (user != null) {
            order.setShippingName(user.getUserName());
            if (user.getUserDetails() != null) {
                order.setShippingPhone(user.getUserDetails().getPhoneNumber());
                String street = user.getUserDetails().getStreet() != null ? user.getUserDetails().getStreet() : "";
                String locality = user.getUserDetails().getLocality() != null ? user.getUserDetails().getLocality() : "";
                order.setShippingAddress(street + (street.isEmpty() || locality.isEmpty() ? "" : ", ") + locality);
            }
        }
        
        for (Item item : cart) {
            item.setOrder(order);
        }
        
        return order;
    }
}
