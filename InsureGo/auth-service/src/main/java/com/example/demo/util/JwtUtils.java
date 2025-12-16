package com.example.demo.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtils {
 
 @Value("${jwt.secret}")
 private String jwtSecret;
 
 @Value("${jwt.expiration}")
 private int jwtExpirationMs;
// 🌟 ADD THIS CONSTRUCTOR FOR DEBUGGING 🌟
 public JwtUtils(@Value("${jwt.secret}") String jwtSecret) {
     this.jwtSecret = jwtSecret;
     // CRITICAL DEBUG: Print the key the validator is using
     System.out.println("JWT_SECRET_VALIDATOR_IS_USING: [" + this.jwtSecret + "]");
 }
 private SecretKey getSigningKey() {
     return Keys.hmacShaKeyFor(jwtSecret.getBytes());
 }
 
 public String generateJwtToken(String email, String role) {
     return Jwts.builder()
             .setSubject(email)
             .claim("role", role)
             .setIssuedAt(new Date())
             .setExpiration(new Date(new Date().getTime() + jwtExpirationMs))
             .signWith(getSigningKey())
             .compact();
 }
 
 public String getUserNameFromJwtToken(String token) {
     return getClaimsFromToken(token).getSubject();
 }
 
 // 🌟 FIX: Use the stable parsing structure 🌟
 private Claims getClaimsFromToken(String token) {
     return Jwts.parserBuilder()
             .setSigningKey(getSigningKey())
             .build() // Use .build() after setting the key/signing method
             .parseClaimsJws(token)
             .getBody();
 }
 
 public boolean validateJwtToken(String authToken) {
     try {
         // 🌟 FIX: Use the stable parsing structure 🌟
         Jwts.parserBuilder()
                 .setSigningKey(getSigningKey())
                 .build()
                 .parseClaimsJws(authToken);
         return true;
     } catch (Exception e) {
         System.err.println("JWT Validation Failed: " + e.getMessage());
         return false;
     }
 }
}
