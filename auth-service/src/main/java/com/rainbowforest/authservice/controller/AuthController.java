package com.rainbowforest.authservice.controller;

import com.rainbowforest.authservice.dto.*;
import com.rainbowforest.authservice.feignclient.UserClient;
import com.rainbowforest.authservice.service.TokenService;
import com.rainbowforest.authservice.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class AuthController {

    @Autowired
    private UserClient userClient;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        try {
            UserDto userDto = new UserDto();
            userDto.setUserName(registerRequest.getUsername());
            userDto.setUserPassword(registerRequest.getPassword());
            
            UserDetailsDto detailsDto = new UserDetailsDto();
            detailsDto.setFirstName(registerRequest.getFirstName());
            detailsDto.setLastName(registerRequest.getLastName());
            detailsDto.setEmail(registerRequest.getEmail());
            detailsDto.setPhoneNumber(registerRequest.getPhoneNumber());
            userDto.setUserDetails(detailsDto);
            
            UserDto createdUser = userClient.registerUser(userDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            UserDto user = userClient.getUserByName(loginRequest.getUsername());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Tên đăng nhập không đúng");
            }
            if (!user.getUserPassword().equals(loginRequest.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mật khẩu không đúng");
            }
            if (user.getActive() != 1) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Tài khoản đã bị khóa");
            }
            
            String roleName = (user.getRole() != null) ? user.getRole().getRoleName() : "ROLE_USER";
            
            String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getUserName(), roleName);
            String refreshToken = tokenService.createRefreshToken(user.getId(), user.getUserName(), roleName);
            
            TokenResponse response = new TokenResponse(accessToken, refreshToken, "Bearer", user.getId(), roleName);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestParam("refreshToken") String refreshToken) {
        String tokenValue = tokenService.getRefreshTokenValue(refreshToken);
        if (tokenValue == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh Token không hợp lệ hoặc đã hết hạn");
        }
        
        String[] parts = tokenValue.split(":");
        if (parts.length < 3) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Dữ liệu Refresh Token bị hỏng");
        }
        
        Long userId = Long.parseLong(parts[0]);
        String username = parts[1];
        String role = parts[2];
        
        String newAccessToken = jwtUtil.generateAccessToken(userId, username, role);
        TokenResponse response = new TokenResponse(newAccessToken, refreshToken, "Bearer", userId, role);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestParam("refreshToken") String refreshToken) {
        tokenService.deleteRefreshToken(refreshToken);
        return ResponseEntity.ok("Đăng xuất thành công");
    }
}
