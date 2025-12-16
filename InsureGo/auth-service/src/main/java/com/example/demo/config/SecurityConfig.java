package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Essential bean for hashing user passwords (Fixes missing bean error)
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        
        http
            // FIX 1: Disable CSRF for API access (Fixes login failure)
            .csrf(csrf -> csrf.disable())
            
            // Allow cross-origin requests (essential for modern frontends)
            .cors(Customizer.withDefaults())
            
            .authorizeHttpRequests(auth -> auth
                // FIX 2: Whitelist the internal user lookup endpoint (Fixes 403 Forbidden error for VISIT-SERVICE)
                .requestMatchers("/user/name/**").permitAll() 
                
                // Allow public login/registration endpoints
                .requestMatchers("/auth/**").permitAll()
                
                // All other endpoints require a token/authentication
                .anyRequest().authenticated() 
            );
        
        // NOTE: If you are using JWTs, you would configure the filter chain to be STATELESS here.
        
        return http.build();
    }
}