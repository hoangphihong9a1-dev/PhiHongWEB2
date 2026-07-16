package com.rainbowforest.authservice.feignclient;

import com.rainbowforest.authservice.dto.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "user-service", url = "${USER_SERVICE_URL:http://localhost:8811/}")
public interface UserClient {

    @GetMapping(value = "/users")
    UserDto getUserByName(@RequestParam("name") String userName);

    @PostMapping(value = "/users")
    UserDto registerUser(@RequestBody UserDto userDto);
}
