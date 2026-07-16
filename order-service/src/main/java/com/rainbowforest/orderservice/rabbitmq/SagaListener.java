package com.rainbowforest.orderservice.rabbitmq;

import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.rabbitmq.event.InventoryUpdateFailedEvent;
import com.rainbowforest.orderservice.service.OrderService;
import com.rainbowforest.orderservice.repository.SystemLogRepository;
import com.rainbowforest.orderservice.mongodb.SystemLog;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SagaListener {

    @Autowired
    private OrderService orderService;

    @Autowired
    private SystemLogRepository logRepository;

    @RabbitListener(queues = "inventory-failed-queue")
    public void handleInventoryUpdateFailed(InventoryUpdateFailedEvent event) {
        System.out.println("Received InventoryUpdateFailedEvent for order: " + event.getOrderId());
        Order order = orderService.getOrderById(event.getOrderId());
        if (order != null) {
            order.setStatus("CANCELED_SYSTEM_ERROR");
            orderService.saveOrder(order);
            System.out.println("Order status rolled back to CANCELED_SYSTEM_ERROR due to: " + event.getReason());
            
            // Log to MongoDB
            try {
                SystemLog log = new SystemLog("Order " + event.getOrderId() + " rolled back to CANCELED_SYSTEM_ERROR. Reason: " + event.getReason(), "ERROR");
                logRepository.save(log);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
