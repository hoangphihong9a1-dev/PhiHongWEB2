package com.rainbowforest.authservice.dto;

import lombok.Data;

@Data
public class UserDetailsDto {
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
}
