package com.example.demo.repository;


import com.example.demo.bean.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InsuranceRepository extends JpaRepository<InsuranceCard, Long> {
    List<InsuranceCard> findByUserId(Long userId);
}
