package com.example.demo.service;


import com.example.demo.bean.*;
import com.example.demo.dao.*;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class OtpService {
    @Autowired private OtpRepository otpRepository;
    @Autowired private JavaMailSender mailSender;
    
    @Value("${twilio.account.sid}") private String twilioSid;
    @Value("${twilio.auth.token}") private String twilioToken;
    @Value("${twilio.phone.number}") private String twilioPhone;

    @PostConstruct
    public void initTwilio() { Twilio.init(twilioSid, twilioToken); }

    public void generateAndSendOtp(String identifier, OTP.OtpType type) {
        // 1. Generate Code
        String code = String.format("%06d", new java.security.SecureRandom().nextInt(1000000));
        
        // 2. Save to DB
        OTP otp = new OTP();
        otp.setIdentifier(identifier);
        otp.setCode(code);
        otp.setType(type);
        otp.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        otpRepository.save(otp);

        // --- 3. DEBUGGING: PRINT TO CONSOLE (So you can see it!) ---
        System.out.println("========================================");
        System.out.println("Generated OTP for " + identifier + ": " + code);
        System.out.println("========================================");

        // 4. Send SMS (Twilio) - Wrapped in try-catch so it doesn't crash if unconfigured
        if (type == OTP.OtpType.PHONE) {
            String formattedNumber = identifier.startsWith("+") ? identifier : "+91" + identifier;
            try {
                if (twilioSid != null && !twilioSid.isEmpty()) {
                    Message.creator(
                        new PhoneNumber(formattedNumber),
                        new PhoneNumber(twilioPhone),
                        "InsureGo Verification Code: " + code
                    ).create();
                }
            } catch (Exception e) {
                System.err.println("SMS Failed (Ignore if testing): " + e.getMessage());
            }
        }
    }

    public boolean verifyOtp(String identifier, String code, OTP.OtpType type) {
        return otpRepository.findTopByIdentifierAndTypeAndIsUsedOrderByExpiryTimeDesc(identifier, type, false)
                .filter(otp -> otp.getCode().equals(code) && otp.getExpiryTime().isAfter(LocalDateTime.now()))
                .map(otp -> {
                    otp.setUsed(true);
                    otpRepository.save(otp);
                    return true;
                }).orElse(false);
    }
}
