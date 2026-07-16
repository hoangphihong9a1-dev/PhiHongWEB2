package com.rainbowforest.apigateway.filter;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends ZuulFilter {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitFilter.class);

    // Limit configuration: 30 requests per minute by default
    private final long capacity = 30;
    private final long refillPeriodMs = 60000; // 1 minute
    private final double refillRatePerMs = (double) capacity / refillPeriodMs;

    private final Map<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    private static class TokenBucket {
        private final long capacity;
        private final double refillRatePerMs;
        private double tokens;
        private long lastRefillTime;

        public TokenBucket(long capacity, double refillRatePerMs) {
            this.capacity = capacity;
            this.refillRatePerMs = refillRatePerMs;
            this.tokens = capacity;
            this.lastRefillTime = System.currentTimeMillis();
        }

        public synchronized boolean tryConsume() {
            long now = System.currentTimeMillis();
            long elapsed = now - lastRefillTime;
            lastRefillTime = now;

            // Refill tokens
            tokens = Math.min(capacity, tokens + (elapsed * refillRatePerMs));

            if (tokens >= 1.0) {
                tokens -= 1.0;
                return true;
            }
            return false;
        }
    }

    @Override
    public String filterType() {
        return "pre";
    }

    @Override
    public int filterOrder() {
        return 0; // Run first to block requests before any processing
    }

    @Override
    public boolean shouldFilter() {
        return true;
    }

    @Override
    public Object run() {
        RequestContext ctx = RequestContext.getCurrentContext();
        HttpServletRequest request = ctx.getRequest();
        
        // Get client IP address
        String clientIp = getClientIp(request);
        
        // Retrieve or create rate limit bucket for this IP
        TokenBucket bucket = buckets.computeIfAbsent(clientIp, k -> new TokenBucket(capacity, refillRatePerMs));

        if (!bucket.tryConsume()) {
            logger.warn("Rate limit exceeded for client IP: {} on URL: {}", clientIp, request.getRequestURI());
            
            // Set Zuul response to fail
            ctx.setSendZuulResponse(false);
            ctx.setResponseStatusCode(HttpStatus.TOO_MANY_REQUESTS.value());
            ctx.setResponseBody("{\"error\": \"Too many requests. Please try again later.\", \"status\": 429}");
            ctx.getResponse().setContentType("application/json");
        }
        
        return null;
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
