package com.rainbowforest.productcatalogservice.rabbitmq.event;

import java.io.Serializable;

public class InventoryUpdateFailedEvent implements Serializable {
    private Long orderId;
    private String reason;

    public InventoryUpdateFailedEvent() {}

    public InventoryUpdateFailedEvent(Long orderId, String reason) {
        this.orderId = orderId;
        this.reason = reason;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
