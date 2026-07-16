package com.rainbowforest.orderservice.mongodb;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "system_logs")
public class SystemLog {

    @Id
    private String id;
    private String message;
    private String type; // INFO, ERROR, WARNING
    private LocalDateTime timestamp;

    public SystemLog() {
        this.timestamp = LocalDateTime.now();
    }

    public SystemLog(String message, String type) {
        this.message = message;
        this.type = type;
        this.timestamp = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
