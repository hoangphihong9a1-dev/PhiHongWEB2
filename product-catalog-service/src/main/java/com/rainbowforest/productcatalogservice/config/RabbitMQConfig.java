package com.rainbowforest.productcatalogservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String SAGA_EXCHANGE = "saga-exchange";
    public static final String ORDER_COMPLETED_QUEUE = "order-completed-queue";
    public static final String ORDER_COMPLETED_ROUTING_KEY = "order.completed";

    @Bean
    public TopicExchange sagaExchange() {
        return new TopicExchange(SAGA_EXCHANGE);
    }

    @Bean
    public Queue orderCompletedQueue() {
        return new Queue(ORDER_COMPLETED_QUEUE);
    }

    @Bean
    public Binding bindingOrderCompleted() {
        return BindingBuilder.bind(orderCompletedQueue())
                .to(sagaExchange())
                .with(ORDER_COMPLETED_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
