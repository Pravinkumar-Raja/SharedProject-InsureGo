package com.example.demo.bean;

import jakarta.persistence.*;

@Entity
@Table(name = "insurance_plans")
public class InsurancePlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // These names match your Frontend Form
    private String policyName; 
    private String provider; 
    private double coverageAmount;
    private double premium;
    
    @Column(length = 1000)
    private String benefits;

    private String createdByProviderId;

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPolicyName() { return policyName; }
    public void setPolicyName(String policyName) { this.policyName = policyName; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public double getCoverageAmount() { return coverageAmount; }
    public void setCoverageAmount(double coverageAmount) { this.coverageAmount = coverageAmount; }
    public double getPremium() { return premium; }
    public void setPremium(double premium) { this.premium = premium; }
    public String getBenefits() { return benefits; }
    public void setBenefits(String benefits) { this.benefits = benefits; }
    public String getCreatedByProviderId() { return createdByProviderId; }
    public void setCreatedByProviderId(String createdByProviderId) { this.createdByProviderId = createdByProviderId; }
}