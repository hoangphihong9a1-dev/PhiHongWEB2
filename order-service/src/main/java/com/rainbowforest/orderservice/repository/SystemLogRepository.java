package com.rainbowforest.orderservice.repository;

import com.rainbowforest.orderservice.mongodb.SystemLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemLogRepository extends MongoRepository<SystemLog, String> {
}
