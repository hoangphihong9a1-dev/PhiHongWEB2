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

    @Override
    public User updateUser(Long id, User user) {
        User existingUser = userRepository.findById(id).orElse(null);
        if (existingUser == null) {
            throw new RuntimeException("Người dùng không tồn tại");
        }
        if (!existingUser.getUserName().equals(user.getUserName()) && userRepository.findByUserName(user.getUserName()) != null) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        if (user.getUserDetails() != null && existingUser.getUserDetails() != null) {
            if (!existingUser.getUserDetails().getEmail().equals(user.getUserDetails().getEmail()) && 
                userDetailsRepository.findByEmail(user.getUserDetails().getEmail()) != null) {
                throw new RuntimeException("Email đã tồn tại");
            }
        }
        
        existingUser.setUserName(user.getUserName());
        if (user.getUserPassword() != null && !user.getUserPassword().isEmpty()) {
            existingUser.setUserPassword(user.getUserPassword());
        }
        existingUser.setActive(user.getActive());
        
        if (user.getRole() != null) {
            // Find role in db or keep existing
            UserRole role = userRoleRepository.findUserRoleByRoleName(user.getRole().getRoleName());
            if (role != null) {
                existingUser.setRole(role);
            }
        }
        
        if (user.getUserDetails() != null && existingUser.getUserDetails() != null) {
            existingUser.getUserDetails().setFirstName(user.getUserDetails().getFirstName());
            existingUser.getUserDetails().setLastName(user.getUserDetails().getLastName());
            existingUser.getUserDetails().setEmail(user.getUserDetails().getEmail());
            existingUser.getUserDetails().setPhoneNumber(user.getUserDetails().getPhoneNumber());
            existingUser.getUserDetails().setStreet(user.getUserDetails().getStreet());
            existingUser.getUserDetails().setStreetNumber(user.getUserDetails().getStreetNumber());
            existingUser.getUserDetails().setZipCode(user.getUserDetails().getZipCode());
            existingUser.getUserDetails().setLocality(user.getUserDetails().getLocality());
            existingUser.getUserDetails().setCountry(user.getUserDetails().getCountry());
        }
        return userRepository.save(existingUser);
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
