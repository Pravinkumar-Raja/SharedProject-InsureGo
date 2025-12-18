package com.example.demo.repository;

import com.example.demo.bean.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InsurancePlanRepository extends JpaRepository<InsurancePlan, Long> {
    // Helper to find plans by a specific provider (for Provider Dashboard)
    List<InsurancePlan> findByProvider(String provider);
}
