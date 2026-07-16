package com.rainbowforest.authservice.dto;

import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String userName;
    private String userPassword;
    private int active;
    private UserRoleDto role;
    private UserDetailsDto userDetails;
}
