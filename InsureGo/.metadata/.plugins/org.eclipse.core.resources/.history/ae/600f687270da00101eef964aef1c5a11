package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.repository.InsuranceRepository;
import com.example.demo.bean.*;
import com.example.demo.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/insurance")
public class InsuranceController {

    @Autowired private InsuranceService service;
    @Autowired  private InsuranceRepository repository;
 // --- NEW: UPDATE METHOD ---
    @PutMapping("/update/{id}")
    public ResponseEntity<InsuranceCard> updatePolicy(@PathVariable Long id, @RequestBody InsuranceCard cardDetails) {
        try {
            InsuranceCard updatedCard = service.updatePolicy(id, cardDetails);
            return ResponseEntity.ok(updatedCard);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // --- NEW: DELETE METHOD ---
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deletePolicy(@PathVariable Long id) {
        service.deletePolicy(id);
        return ResponseEntity.ok("Policy deleted successfully");
    }
    @PostMapping("/upload-card")
    public ResponseEntity<InsuranceCard> uploadCard(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            // For Phase 3 testing, we hardcode userId = 1.
            // In a full environment, the Gateway would pass the user ID.
            Long userId = 1L; 
            return ResponseEntity.accepted().body(service.processCardUpload(file, userId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
 // 1. RENEW POLICY (Adds 1 Year to Expiry)
    @PutMapping("/renew/{policyNumber}")
    public ResponseEntity<?> renewPolicy(@PathVariable String policyNumber) {
        // Find the policy
        Optional<InsuranceCard> policyOpt = repository.findAll().stream()
            .filter(p -> p.getPolicyNumber().equals(policyNumber))
            .findFirst();

        if (policyOpt.isPresent()) {
            InsuranceCard policy = policyOpt.get();
            
            // --- UPDATED LOGIC ---
            // 1. Get current date (It is already a LocalDate object)
            LocalDate currentExpiry = policy.getExpiryDate();
            
            // 2. Add 1 Year (Handle case where date might be null)
            LocalDate newExpiry = (currentExpiry != null) 
                                  ? currentExpiry.plusYears(1) 
                                  : LocalDate.now().plusYears(1);
            
            // 3. Set the new date directly
            policy.setExpiryDate(newExpiry);
            
            // 4. Save
            repository.save(policy);
            return ResponseEntity.ok("Policy Renewed! New Expiry: " + newExpiry);
        }
        
        return ResponseEntity.notFound().build();
    }

    // 2. VERIFY POLICY (For Doctor)
    @GetMapping("/verify/{policyNumber}")
    public ResponseEntity<?> verifyPolicy(@PathVariable String policyNumber) {
        Optional<InsuranceCard> policyOpt = repository.findAll().stream()
            .filter(p -> p.getPolicyNumber().equals(policyNumber))
            .findFirst();

        if (policyOpt.isPresent()) {
            return ResponseEntity.ok(policyOpt.get()); // Return full policy details
        }
        return ResponseEntity.status(404).body("Policy Not Found");
    }
    @PostMapping("/manual-entry")
    public ResponseEntity<InsuranceCard> manualEntry(
            @RequestBody ManualEntryRequest request,
            @RequestHeader(value = "Authorization", required = false) String token) {
        Long userId = 1L; 
        return ResponseEntity.ok(service.saveManualPolicy(request, userId));
    }

    @GetMapping("/list")
    public List<InsuranceCard> listPolicies(@RequestHeader(value = "Authorization", required = false) String token) {
        Long userId = 1L;
        return service.getUserPolicies(userId);
    }
}
