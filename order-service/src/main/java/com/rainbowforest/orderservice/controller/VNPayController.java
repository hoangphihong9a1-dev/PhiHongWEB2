package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.service.OrderService;
import com.rainbowforest.orderservice.repository.SystemLogRepository;
import com.rainbowforest.orderservice.mongodb.SystemLog;
import com.rainbowforest.orderservice.rabbitmq.event.OrderCompletedEvent;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/vnpay")
public class VNPayController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private SystemLogRepository systemLogRepository;

    @Value("${vnpay.tmn-code}")
    private String vnp_TmnCode;

    @Value("${vnpay.hash-secret}")
    private String vnp_HashSecret;

    @Value("${vnpay.url}")
    private String vnp_PayUrl;

    @Value("${vnpay.return-url}")
    private String vnp_ReturnUrl;

    @GetMapping("/create-payment")
    public ResponseEntity<Map<String, String>> createPayment(
            @RequestParam("orderId") Long orderId,
            HttpServletRequest request) {
        
        Order order = orderService.getOrderById(orderId);
        if (order == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Order not found");
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        }

        // VNPay amount is in VND, multiplied by 100
        BigDecimal total = order.getTotal();
        if (total.compareTo(new BigDecimal("1000")) < 0) {
            total = total.multiply(new BigDecimal("25000"));
        }
        long amount = total.multiply(new BigDecimal("100")).longValue();

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", String.valueOf(orderId));
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang " + orderId);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", "127.0.0.1");

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        List<String> hashParts = new ArrayList<>();
        List<String> queryParts = new ArrayList<>();
        for (String fieldName : fieldNames) {
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashParts.add(fieldName + "=" + encode(fieldValue));
                queryParts.add(encode(fieldName) + "=" + encode(fieldValue));
            }
        }
        String hashData = String.join("&", hashParts);
        String queryUrl = String.join("&", queryParts);

        System.out.println("DEBUG VNPAY - hashSecret: " + vnp_HashSecret);
        System.out.println("DEBUG VNPAY - hashData: " + hashData);
        System.out.println("DEBUG VNPAY - queryUrl: " + queryUrl);

        String vnp_SecureHash = hmacSHA512(vnp_HashSecret, hashData);
        
        System.out.println("DEBUG VNPAY - secureHash: " + vnp_SecureHash);
        
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnp_PayUrl + "?" + queryUrl;

        System.out.println("DEBUG VNPAY - paymentUrl: " + paymentUrl);

        Map<String, String> response = new HashMap<>();
        response.put("paymentUrl", paymentUrl);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<Map<String, String>> verifyPayment(@RequestBody Map<String, String> params) {
        Map<String, String> response = new HashMap<>();
        
        String vnp_SecureHash = params.get("vnp_SecureHash");
        if (vnp_SecureHash == null) {
            response.put("status", "error");
            response.put("message", "Missing secure hash");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        // Remove hash from parameters before verifying signature
        Map<String, String> signParams = new HashMap<>(params);
        signParams.remove("vnp_SecureHash");
        signParams.remove("vnp_SecureHashType");

        List<String> fieldNames = new ArrayList<>(signParams.keySet());
        Collections.sort(fieldNames);

        List<String> hashParts = new ArrayList<>();
        for (String fieldName : fieldNames) {
            String fieldValue = signParams.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashParts.add(fieldName + "=" + encode(fieldValue));
            }
        }
        String hashData = String.join("&", hashParts);

        String calculatedHash = hmacSHA512(vnp_HashSecret, hashData);
        if (!calculatedHash.equalsIgnoreCase(vnp_SecureHash)) {
            response.put("status", "error");
            response.put("message", "Invalid signature");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        String responseCode = params.get("vnp_ResponseCode");
        String orderIdStr = params.get("vnp_TxnRef");
        if (orderIdStr == null) {
            response.put("status", "error");
            response.put("message", "Missing order ID");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        Long orderId = Long.valueOf(orderIdStr);
        Order order = orderService.getOrderById(orderId);
        if (order == null) {
            response.put("status", "error");
            response.put("message", "Order not found");
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }

        if ("00".equals(responseCode)) {
            order.setStatus("PAID");
            orderService.saveOrder(order);

            // Publish OrderCompletedEvent to RabbitMQ (Choreography Saga step)
            try {
                List<OrderCompletedEvent.OrderItemDto> items = order.getItems().stream()
                        .map(item -> new OrderCompletedEvent.OrderItemDto(item.getProduct().getId(), item.getQuantity()))
                        .collect(Collectors.toList());
                OrderCompletedEvent event = new OrderCompletedEvent(order.getId(), items);
                rabbitTemplate.convertAndSend("saga-exchange", "order.completed", event);
                
                // Save log to MongoDB
                SystemLog log = new SystemLog("Order " + orderId + " has been marked as PAID via VNPay. Saga event dispatched for inventory deduction.", "INFO");
                systemLogRepository.save(log);
            } catch (Exception e) {
                e.printStackTrace();
            }

            response.put("status", "success");
            response.put("message", "Payment successful");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            response.put("status", "failed");
            response.put("message", "Payment failed with response code: " + responseCode);
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
    }

    private String encode(String value) {
        try {
            return URLEncoder.encode(value, StandardCharsets.US_ASCII.toString());
        } catch (Exception e) {
            return "";
        }
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac sha512_HMAC = Mac.getInstance("HmacSHA512");
            SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            sha512_HMAC.init(secret_key);
            byte[] hashBytes = sha512_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return "";
        }
    }
}
