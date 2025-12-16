package com.example.demo.bean;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="otp_codes")
public class OTP {
    public enum OtpType { PHONE, EMAIL } 

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String identifier; // The email or phone number
    private String code;
    
    @Enumerated(EnumType.STRING)
    private OtpType type; 
    
    private LocalDateTime expiryTime;
    private boolean isUsed = false;

    // Default Constructor
    public OTP() {}

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public OtpType getType() { return type; }
    public void setType(OtpType type) { this.type = type; }

    public LocalDateTime getExpiryTime() { return expiryTime; }
    public void setExpiryTime(LocalDateTime expiryTime) { this.expiryTime = expiryTime; }

    public boolean isUsed() { return isUsed; }
    public void setUsed(boolean used) { isUsed = used; }
}