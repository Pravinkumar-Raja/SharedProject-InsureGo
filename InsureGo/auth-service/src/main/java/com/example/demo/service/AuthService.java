package com.example.demo.service;


import com.example.demo.bean.*;
import com.example.demo.dao.*;
import com.example.demo.util.JwtUtils; // Assuming you copy your JwtUtils class here
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtils jwtUtils;

    public User register(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public String login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // --- DEBUGGING START (Remove after fixing) ---
        System.out.println("Login Attempt for: " + email);
        System.out.println("Raw Password entered: " + rawPassword);
        System.out.println("Stored Hash in DB: " + user.getPassword());
        System.out.println("Hash Length: " + user.getPassword().length()); // Should be exactly 60 for BCrypt
        // --- DEBUGGING END ---

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        return jwtUtils.generateJwtToken(user.getEmail(), user.getRole());
    }
}
