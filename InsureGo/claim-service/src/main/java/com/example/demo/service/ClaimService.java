package com.example.demo.service;


import com.example.demo.bean.Claim;
import com.example.demo.repository.ClaimRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ClaimService {

    @Autowired
    private ClaimRepository claimRepository;

    public Claim submitClaim(Claim claim) {
        claim.setStatus("PENDING");
        return claimRepository.save(claim);
    }
    public List<Claim> getClaimsByProvider(String providerName) {
        // Assuming your ClaimRepository has this method:
        // ClaimRepository.findByInsuranceProvider(String providerName)
        return claimRepository.findByInsuranceProvider(providerName);
    }
    public Optional<Claim> updateClaimStatusWithNotes(Long claimId, String status, String notes, String reviewedBy) {
        return claimRepository.findById(claimId).map(claim -> {
            claim.setStatus(status);
            
            // Calculate Payout Split only if APPROVED
            if ("APPROVED".equals(status)) {
                double total = claim.getTotalBillAmount();
                // Assuming 80% Insurance / 20% User split
                claim.setInsurancePays(total * 0.80);
                claim.setUserPays(total * 0.20);
            } else {
                // REJECTED or other non-approved status
                claim.setInsurancePays(0.0);
                // Optional: User pays full bill if rejected, or 0 if bill wasn't finalized.
                claim.setUserPays(claim.getTotalBillAmount() > 0 ? claim.getTotalBillAmount() : 0.0);
            }
            
            // Add audit notes
            String existingNotes = claim.getTreatmentDescription() != null ? claim.getTreatmentDescription() : "";
            claim.setTreatmentDescription(
                existingNotes + 
                String.format(" | Provider Action (%s by %s): %s", status, reviewedBy, notes)
            );
            
            return claimRepository.save(claim);
        });
    }
    // Method to fetch high-value claims (e.g., > $500)
    public List<Claim> getHighValueClaims(String providerName, double threshold) {
        // Assuming your ClaimRepository has this method:
        // ClaimRepository.findByInsuranceProviderAndTotalBillAmountGreaterThanAndStatus(String providerName, double threshold, String status)
        return claimRepository.findByInsuranceProviderAndTotalBillAmountGreaterThanAndStatus(
            providerName, threshold, "OPEN");
    }

    // Method to calculate simple metrics
    public Map<String, Long> getProviderMetrics(String providerName) {
        List<Claim> allClaims = getClaimsByProvider(providerName);
        
        long totalClaims = allClaims.size();
        long claimsToday = allClaims.stream()
            .filter(c -> c.getDateFiled().equals(LocalDate.now().toString()))
            .count();
            
        Map<String, Long> metrics = new HashMap<>();
        metrics.put("totalClaims", totalClaims);
        metrics.put("claimsToday", claimsToday);
        
        return metrics;
    }
    public List<Claim> getClaimsByUserId(Long userId) {
        return claimRepository.findByUserId(userId);
    }

    public Claim updateClaimStatus(Long id, String status) {
        return claimRepository.findById(id).map(claim -> {
            claim.setStatus(status);
            return claimRepository.save(claim);
        }).orElseThrow(() -> new RuntimeException("Claim not found"));
    }
    
    public List<Claim> getClaimsByStatus(String status) {
        return claimRepository.findByStatus(status);
    }
}
