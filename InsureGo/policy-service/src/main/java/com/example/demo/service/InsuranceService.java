package com.example.demo.service;

import com.example.demo.bean.InsuranceCard;
import com.example.demo.dto.ManualEntryRequest;
import com.example.demo.repository.InsuranceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class InsuranceService {

    @Autowired
    private InsuranceRepository repository;

    // --- 1. MANUAL ENTRY (The Main Feature) ---
    public InsuranceCard saveManualPolicy(ManualEntryRequest request, Long userId) {
        InsuranceCard card = new InsuranceCard();
        
        // Core Mapping
        card.setUserId(userId);
        card.setPolicyNumber(request.getPolicyNumber()); 
        card.setInsuranceProvider(request.getInsuranceProvider());
        card.setPolicyName(request.getPolicyName());
        card.setCoverageAmount(request.getCoverageAmount());
        card.setPatientName(request.getPatientName());

        // Set Status (String)
        card.setStatus("ACTIVE");

        // Set Dates (Handle Nulls)
        if (request.getRegisteredDate() != null) {
            card.setIssueDate(request.getRegisteredDate());
        } else {
            card.setIssueDate(LocalDate.now());
        }

        if (request.getExpiryDate() != null) {
            card.setExpiryDate(request.getExpiryDate());
        } else {
            card.setExpiryDate(LocalDate.now().plusYears(1));
        }
        
        card.setUploadedAt(LocalDateTime.now());

        return repository.save(card);
    }

    // --- 2. FILE UPLOAD (OCR Placeholder) ---
    public InsuranceCard processCardUpload(MultipartFile file, Long userId) {
        InsuranceCard card = new InsuranceCard();
        card.setUserId(userId);
        
        // FIX: Status is now a String, not an Enum
        card.setStatus("PENDING"); 
        
        // Set Dummy Data for now
        card.setFileUri("http://via.placeholder.com/150"); 
        card.setInsuranceProvider("Processing...");
        card.setPolicyNumber("PENDING");
        card.setPatientName("Processing...");
        card.setExpiryDate(LocalDate.now().plusYears(1));
        card.setUploadedAt(LocalDateTime.now());

        return repository.save(card);
    }

    // --- 3. UPDATE POLICY ---
    public InsuranceCard updatePolicy(Long id, InsuranceCard cardDetails) {
        InsuranceCard existingCard = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Card not found with id: " + id));

        // Update all fields allowed to be edited
        existingCard.setInsuranceProvider(cardDetails.getInsuranceProvider());
        existingCard.setPolicyName(cardDetails.getPolicyName());
        existingCard.setPolicyNumber(cardDetails.getPolicyNumber());
        existingCard.setPatientName(cardDetails.getPatientName());
        existingCard.setExpiryDate(cardDetails.getExpiryDate());
        existingCard.setIssueDate(cardDetails.getIssueDate());
        existingCard.setCoverageAmount(cardDetails.getCoverageAmount());

        return repository.save(existingCard);
    }

    // --- 4. DELETE POLICY ---
    public void deletePolicy(Long id) {
        repository.deleteById(id);
    }

    // --- 5. GET LIST ---
    public List<InsuranceCard> getUserPolicies(Long userId) {
        // In a real app, use repository.findByUserId(userId)
        return repository.findAll(); 
    }
}