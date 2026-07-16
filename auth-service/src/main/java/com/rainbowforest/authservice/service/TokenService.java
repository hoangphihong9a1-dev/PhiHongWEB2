package com.rainbowforest.authservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class TokenService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    // 7 days expiration in seconds
    private static final long REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

    public String createRefreshToken(Long userId, String username, String role) {
        String refreshToken = UUID.randomUUID().toString();
        String value = userId + ":" + username + ":" + role;
        
        redisTemplate.opsForValue().set("refresh_token:" + refreshToken, value, REFRESH_TOKEN_TTL, TimeUnit.SECONDS);
        return refreshToken;
    }

    public String getRefreshTokenValue(String refreshToken) {
        return redisTemplate.opsForValue().get("refresh_token:" + refreshToken);
    }

    public void deleteRefreshToken(String refreshToken) {
        redisTemplate.delete("refresh_token:" + refreshToken);
    }
}
