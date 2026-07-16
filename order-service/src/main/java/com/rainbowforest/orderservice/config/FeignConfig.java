package com.rainbowforest.orderservice.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;

@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attributes != null) {
                    HttpServletRequest request = attributes.getRequest();
                    String authHeader = request.getHeader("Authorization");
                    if (authHeader != null) {
                        template.header("Authorization", authHeader);
                    }
                    String userId = request.getHeader("X-User-Id");
                    if (userId != null) {
                        template.header("X-User-Id", userId);
                    }
                    String userRole = request.getHeader("X-User-Role");
                    if (userRole != null) {
                        template.header("X-User-Role", userRole);
                    }
                }
            }
        };
    }
}
