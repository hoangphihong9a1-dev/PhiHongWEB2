package com.rainbowforest.orderservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String SAGA_EXCHANGE = "saga-exchange";
    public static final String ORDER_COMPLETED_QUEUE = "order-completed-queue";
    public static final String INVENTORY_FAILED_QUEUE = "inventory-failed-queue";
    public static final String ORDER_COMPLETED_ROUTING_KEY = "order.completed";
    public static final String INVENTORY_FAILED_ROUTING_KEY = "inventory.failed";

    @Bean
    public TopicExchange sagaExchange() {
        return new TopicExchange(SAGA_EXCHANGE);
    }

    @Bean
    public Queue orderCompletedQueue() {
        return new Queue(ORDER_COMPLETED_QUEUE);
    }

    @Bean
    public Queue inventoryFailedQueue() {
        return new Queue(INVENTORY_FAILED_QUEUE);
    }

    @Bean
    public Binding bindingOrderCompleted() {
        return BindingBuilder.bind(orderCompletedQueue())
                .to(sagaExchange())
                .with(ORDER_COMPLETED_ROUTING_KEY);
    }

    @Bean
    public Binding bindingInventoryFailed() {
        return BindingBuilder.bind(inventoryFailedQueue())
                .to(sagaExchange())
                .with(INVENTORY_FAILED_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
