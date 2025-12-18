package com.example.demo.controller;

import com.example.demo.bean.*;
import com.example.demo.dto.*;
import com.example.demo.repository.InsuranceRepository;
import com.example.demo.repository.InsurancePlanRepository; 
import com.example.demo.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/insurance")
public class InsuranceController {

    @Autowired private InsuranceService service;
    @Autowired private InsuranceRepository repository;      // For Active User Policies (Wallet)
    @Autowired private InsurancePlanRepository planRepository; // For Marketplace Plans (Menu)

    // ==========================================
    // 🛒 MARKETPLACE ENDPOINTS (Provider Management)
    // ==========================================

    // 1. Create Plan
    @PostMapping("/plans/add")
    public InsurancePlan createPlan(@RequestBody InsurancePlan plan) {
        return planRepository.save(plan);
    }

    // 2. List All Plans
    @GetMapping("/plans/all")
    public List<InsurancePlan> getAllPlans() {
        return planRepository.findAll();
    }

    // 3. 🆕 UPDATE PLAN (Missing Feature Added)
    @PutMapping("/plans/update/{id}")
    public ResponseEntity<InsurancePlan> updatePlan(@PathVariable Long id, @RequestBody InsurancePlan planDetails) {
        return planRepository.findById(id).map(plan -> {
            plan.setPolicyName(planDetails.getPolicyName());
            plan.setCoverageAmount(planDetails.getCoverageAmount());
            plan.setPremium(planDetails.getPremium());
            plan.setBenefits(planDetails.getBenefits());
            // Provider cannot be changed
            return ResponseEntity.ok(planRepository.save(plan));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 4. 🆕 DELETE PLAN (Missing Feature Added)
    @DeleteMapping("/plans/delete/{id}")
    public ResponseEntity<String> deletePlan(@PathVariable Long id) {
        if(planRepository.existsById(id)) {
            planRepository.deleteById(id);
            return ResponseEntity.ok("Plan deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }

    // ==========================================
    // 💳 PURCHASE & WALLET ENDPOINTS
    // ==========================================

    @PostMapping("/purchase")
    public ResponseEntity<?> purchasePolicy(@RequestBody PurchaseRequest request) {
        Optional<InsurancePlan> planOpt = planRepository.findById(request.getPlanId());
        
        if (!planOpt.isPresent()) {
            return ResponseEntity.badRequest().body("Plan not found");
        }
        InsurancePlan plan = planOpt.get();

        InsuranceCard newCard = new InsuranceCard();
        newCard.setUserId(request.getUserId());
        newCard.setPatientName(request.getPatientName());
        newCard.setInsuranceProvider(plan.getProvider()); 
        newCard.setPolicyName(plan.getPolicyName());
        newCard.setCoverageAmount(plan.getCoverageAmount());
        newCard.setPremium(plan.getPremium());
        newCard.setPolicyNumber("POL-" + System.currentTimeMillis());
        newCard.setStatus("ACTIVE");
        newCard.setIssueDate(LocalDate.now()); 
        newCard.setExpiryDate(LocalDate.now().plusYears(1));

        repository.save(newCard);
        return ResponseEntity.ok("Policy Purchased Successfully! ID: " + newCard.getPolicyNumber());
    }

    @GetMapping("/provider/{providerName}")
    public List<InsuranceCard> getProviderCustomers(@PathVariable String providerName) {
        return repository.findAll().stream()
                .filter(c -> c.getInsuranceProvider() != null && 
                             c.getInsuranceProvider().equalsIgnoreCase(providerName))
                .collect(Collectors.toList());
    }

    // ==========================================
    // 📂 POLICY MANAGEMENT (Patient Actions)
    // ==========================================

    // Update Manual Policy (Already existed, looks good)
    @PutMapping("/update/{id}")
    public ResponseEntity<InsuranceCard> updatePolicy(@PathVariable Long id, @RequestBody InsuranceCard cardDetails) {
        try {
            InsuranceCard updatedCard = service.updatePolicy(id, cardDetails);
            return ResponseEntity.ok(updatedCard);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete Manual Policy (Already existed, looks good)
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
            Long userId = 1L; 
            return ResponseEntity.accepted().body(service.processCardUpload(file, userId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/renew/{policyNumber}")
    public ResponseEntity<?> renewPolicy(@PathVariable String policyNumber) {
        Optional<InsuranceCard> policyOpt = repository.findAll().stream()
            .filter(p -> p.getPolicyNumber().equals(policyNumber))
            .findFirst();

        if (policyOpt.isPresent()) {
            InsuranceCard policy = policyOpt.get();
            LocalDate today = LocalDate.now();
            LocalDate currentExpiry = policy.getExpiryDate();
            LocalDate newExpiry = (currentExpiry == null || currentExpiry.isBefore(today)) 
                ? today.plusYears(1) : currentExpiry.plusYears(1);
            
            policy.setExpiryDate(newExpiry);
            policy.setStatus("ACTIVE"); 
            
            repository.save(policy);
            return ResponseEntity.ok("Policy Renewed! Status is now ACTIVE until: " + newExpiry);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/verify/{policyNumber}")
    public ResponseEntity<?> verifyPolicy(@PathVariable String policyNumber) {
        Optional<InsuranceCard> policyOpt = repository.findAll().stream()
            .filter(p -> p.getPolicyNumber().equals(policyNumber))
            .findFirst();

        if (policyOpt.isPresent()) {
            return ResponseEntity.ok(policyOpt.get());
        }
        return ResponseEntity.status(404).body("Policy Not Found");
    }

    @GetMapping("/user/{userId}")
    public List<InsuranceCard> getUserPolicies(@PathVariable Long userId) {
        // ✅ Uses the efficient Repository method
        return repository.findByUserId(userId);
    }

    @PostMapping("/manual-entry")
    public ResponseEntity<InsuranceCard> manualEntry(
            @RequestBody ManualEntryRequest request,
            @RequestHeader(value = "Authorization", required = false) String token) {
        Long userId = 1L; // You might want to get this from the request/token later
        return ResponseEntity.ok(service.saveManualPolicy(request, userId));
    }

    @GetMapping("/list")
    public List<InsuranceCard> listPolicies(@RequestHeader(value = "Authorization", required = false) String token) {
        return repository.findAll();
    }
}