package com.rainbowforest.productcatalogservice.rabbitmq;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.rabbitmq.event.OrderCompletedEvent;
import com.rainbowforest.productcatalogservice.rabbitmq.event.InventoryUpdateFailedEvent;
import com.rainbowforest.productcatalogservice.service.ProductService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class InventoryListener {

    @Autowired
    private ProductService productService;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @RabbitListener(queues = "order-completed-queue")
    @Transactional
    public void handleOrderCompleted(OrderCompletedEvent event) {
        System.out.println("Received OrderCompletedEvent for order: " + event.getOrderId());
        try {
            for (OrderCompletedEvent.OrderItemDto item : event.getItems()) {
                Product product = productService.getProductById(item.getProductId());
                if (product == null) {
                    throw new RuntimeException("Product not found: " + item.getProductId());
                }
                if (product.getAvailability() < item.getQuantity()) {
                    throw new RuntimeException("Product " + product.getProductName() + " is out of stock. Requested: " + item.getQuantity() + ", Available: " + product.getAvailability());
                }
                // Deduct stock
                product.setAvailability(product.getAvailability() - item.getQuantity());
                productService.addProduct(product);
                System.out.println("Deducted stock for product " + product.getId() + " by " + item.getQuantity());
            }
        } catch (Exception e) {
            System.err.println("Failed to deduct stock: " + e.getMessage());
            // Publish compensation event
            InventoryUpdateFailedEvent failEvent = new InventoryUpdateFailedEvent(event.getOrderId(), e.getMessage());
            rabbitTemplate.convertAndSend("saga-exchange", "inventory.failed", failEvent);
        }
    }
}
