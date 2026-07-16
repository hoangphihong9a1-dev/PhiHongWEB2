package com.rainbowforest.orderservice.rabbitmq.event;

import java.io.Serializable;
import java.util.List;

public class OrderCompletedEvent implements Serializable {
    private Long orderId;
    private List<OrderItemDto> items;

    public OrderCompletedEvent() {}

    public OrderCompletedEvent(Long orderId, List<OrderItemDto> items) {
        this.orderId = orderId;
        this.items = items;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public List<OrderItemDto> getItems() {
        return items;
    }

    public void setItems(List<OrderItemDto> items) {
        this.items = items;
    }

    public static class OrderItemDto implements Serializable {
        private Long productId;
        private int quantity;

        public OrderItemDto() {}

        public OrderItemDto(Long productId, int quantity) {
            this.productId = productId;
            this.quantity = quantity;
        }

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }
    }
}
