package com.example.demo.dto;

import java.time.LocalDate;

public class ManualEntryRequest {
    // We do NOT use @Entity or @Id here. This is just a JSON holder.

    private String policyNumber;
    private String insuranceProvider;
    private String policyName;
    private Double coverageAmount;
    private Long userId;
    
    private String patientName;
    private LocalDate registeredDate; // Service calls getRegisteredDate()
    private LocalDate expiryDate;

    // --- CONSTRUCTORS ---
    public ManualEntryRequest() {}

    // --- GETTERS AND SETTERS ---
    public String getPolicyNumber() { return policyNumber; }
    public void setPolicyNumber(String policyNumber) { this.policyNumber = policyNumber; }

    public String getInsuranceProvider() { return insuranceProvider; }
    public void setInsuranceProvider(String insuranceProvider) { this.insuranceProvider = insuranceProvider; }

    public String getPolicyName() { return policyName; }
    public void setPolicyName(String policyName) { this.policyName = policyName; }

    public Double getCoverageAmount() { return coverageAmount; }
    public void setCoverageAmount(Double coverageAmount) { this.coverageAmount = coverageAmount; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public LocalDate getRegisteredDate() { return registeredDate; }
    public void setRegisteredDate(LocalDate registeredDate) { this.registeredDate = registeredDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
}