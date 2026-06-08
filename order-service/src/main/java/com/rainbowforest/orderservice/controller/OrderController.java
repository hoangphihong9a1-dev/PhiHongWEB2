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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

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
    
    @PostMapping(value = "/order/{userId}")
    public ResponseEntity<Order> saveOrder(
    		@PathVariable("userId") Long userId,
    		@RequestHeader(value = "Cart-Id") String cartId,
    		HttpServletRequest request){
    	
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

    @GetMapping(value = "/admin/orders")
    public ResponseEntity<List<Order>> getAllOrders(){
        List<Order> orders = orderService.getAllOrders();
        return new ResponseEntity<List<Order>>(
                orders,
                HttpStatus.OK);
    }
    
    private Order createOrder(List<Item> cart, User user) {
        Order order = new Order();
        order.setItems(cart);
        order.setUser(user);
        order.setTotal(OrderUtilities.countTotalPrice(cart));
        order.setOrderedDate(LocalDate.now());
        order.setStatus("PAYMENT_EXPECTED");
        
        for (Item item : cart) {
            item.setOrder(order);
        }
        
        return order;
    }
}
