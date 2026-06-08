package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserRole;
import com.rainbowforest.userservice.repository.UserDetailsRepository;
import com.rainbowforest.userservice.repository.UserRepository;
import com.rainbowforest.userservice.repository.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private UserDetailsRepository userDetailsRepository;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public User getUserByName(String userName) {
        return userRepository.findByUserName(userName);
    }

    @Override
    public User saveUser(User user) {
        if (userRepository.findByUserName(user.getUserName()) != null) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        if (user.getUserDetails() != null && userDetailsRepository.findByEmail(user.getUserDetails().getEmail()) != null) {
            throw new RuntimeException("Email đã tồn tại");
        }

        user.setActive(1);
        UserRole role = userRoleRepository.findUserRoleByRoleName("ROLE_USER");
        if (role == null) {
            role = new UserRole();
            role.setRoleName("ROLE_USER");
            role = userRoleRepository.save(role);
        }
        user.setRole(role);
        return userRepository.save(user);
    }
}
