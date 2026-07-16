package com.rainbowforest.apigateway.filter;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;

@Component
public class JwtAuthFilter extends ZuulFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);

    @Value("${jwt.secret:secretkey12345678901234567890123456789012345678901234567890}")
    private String secret;

    @Override
    public String filterType() {
        return "pre";
    }

    @Override
    public int filterOrder() {
        return 1;
    }

    @Override
    public boolean shouldFilter() {
        return true;
    }

    @Override
    public Object run() {
        RequestContext ctx = RequestContext.getCurrentContext();
        HttpServletRequest request = ctx.getRequest();
        String uri = request.getRequestURI();
        String method = request.getMethod();

        logger.info("Intercepting request: {} {}", method, uri);

        if (isPublicEndpoint(uri, method)) {
            logger.info("Bypassing JWT validation for public endpoint: {}", uri);
            return null;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("Missing or invalid Authorization header for: {}", uri);
            setUnauthorizedResponse(ctx, "Missing or invalid Authorization header");
            return null;
        }

        String token = authHeader.substring(7);
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(secret.getBytes())
                    .parseClaimsJws(token)
                    .getBody();

            String username = claims.getSubject();
            Number userId = claims.get("userId", Number.class);
            String role = claims.get("role", String.class);

            if (username == null || userId == null || role == null) {
                logger.warn("JWT token missing required claims");
                setUnauthorizedResponse(ctx, "Invalid token claims");
                return null;
            }

            ctx.addZuulRequestHeader("X-User-Id", userId.toString());
            ctx.addZuulRequestHeader("X-User-Name", username);
            ctx.addZuulRequestHeader("X-User-Role", role);
            ctx.addZuulRequestHeader("Authorization", authHeader);

            logger.info("Authenticated user: {} (ID: {}, Role: {})", username, userId, role);

            if (isAdminEndpoint(uri) && !role.equals("ROLE_ADMIN")) {
                logger.warn("Access denied for user {} (Role: {}) to admin endpoint: {}", username, role, uri);
                setForbiddenResponse(ctx, "Access denied. Admin role required.");
                return null;
            }

        } catch (Exception e) {
            logger.error("JWT validation failed: {}", e.getMessage());
            setUnauthorizedResponse(ctx, "Invalid or expired JWT token");
        }

        return null;
    }

    private boolean isPublicEndpoint(String uri, String method) {
        if (uri.startsWith("/api/auth/")) {
            return true;
        }
        if (uri.equals("/api/accounts/users") && method.equalsIgnoreCase("POST")) {
            return true;
        }
        if (uri.startsWith("/api/catalog/") || uri.equals("/api/catalog")) {
            if (method.equalsIgnoreCase("GET")) {
                return true;
            }
        }
        if (uri.startsWith("/api/shop/cart")) {
            return true;
        }
        if (uri.startsWith("/api/review/recommendations") && method.equalsIgnoreCase("GET")) {
            return true;
        }
        if (uri.contains("/actuator") || uri.contains("/eureka")) {
            return true;
        }
        if (uri.contains("/swagger-ui.html") || 
            uri.contains("/swagger-resources") || 
            uri.contains("/v2/api-docs") || 
            uri.contains("/webjars")) {
            return true;
        }
        return false;
    }

    private boolean isAdminEndpoint(String uri) {
        if (uri.equals("/api/accounts/users")) {
            return true;
        }
        if (uri.startsWith("/api/shop/admin/")) {
            return true;
        }
        return false;
    }

    private void setUnauthorizedResponse(RequestContext ctx, String message) {
        ctx.setSendZuulResponse(false);
        ctx.setResponseStatusCode(HttpStatus.UNAUTHORIZED.value());
        ctx.setResponseBody("{\"error\": \"" + message + "\"}");
        ctx.getResponse().setContentType("application/json");
    }

    private void setForbiddenResponse(RequestContext ctx, String message) {
        ctx.setSendZuulResponse(false);
        ctx.setResponseStatusCode(HttpStatus.FORBIDDEN.value());
        ctx.setResponseBody("{\"error\": \"" + message + "\"}");
        ctx.getResponse().setContentType("application/json");
    }
}
