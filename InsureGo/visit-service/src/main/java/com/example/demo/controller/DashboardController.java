package com.example.demo.controller;


import com.example.demo.bean.Appointment;
import com.example.demo.bean.Review;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@RestController
@RequestMapping("/dashboard")
// @CrossOrigin is handled via Gateway/SecurityConfig now, but keeping it here is harmless for local testing

public class DashboardController {

    @Autowired
    private AppointmentRepository appointmentRepo;

    @Autowired
    private ReviewRepository reviewRepo;

    @Autowired
    private RestTemplate restTemplate;

    // --- 1. SUBMIT REVIEW ---
    @PostMapping("/review")
    public Review submitReview(@RequestBody Review review) {
        return reviewRepo.save(review);
    }

    // --- 2. GET DOCTOR STATS (Merged & Fixed) ---
    @GetMapping("/doctor-stats/{doctorId}")
    public Map<String, Object> getDoctorStats(@PathVariable Long doctorId) {
        Map<String, Object> stats = new HashMap<>();

        // A. LOCAL DATA: Appointments
        List<Appointment> appts = appointmentRepo.findByDoctorID(doctorId);
        if (appts == null) appts = new ArrayList<>();

        long completedAppts = appts.stream().filter(a -> "COMPLETED".equals(a.getStatus())).count();
        stats.put("totalPatients", completedAppts);

        // B. REMOTE DATA: Claims Revenue
        String claimsServiceUrl = "http://localhost:8082/claim/doctor-stats/" + doctorId; 
        try {
            Map<String, Object> claimData = restTemplate.getForObject(claimsServiceUrl, Map.class);
            if (claimData != null) {
                stats.put("totalRevenue", claimData.get("revenue"));
                stats.put("approvalRate", claimData.get("approvalRate"));
            } else {
                stats.put("totalRevenue", 0);
                stats.put("approvalRate", 0);
            }
        } catch (Exception e) {
            stats.put("totalRevenue", 0);
            stats.put("approvalRate", 0);
        }

        // C. GRAPH DATA (Mock Logic for now, using real count)
        List<Map<String, Object>> graphData = new ArrayList<>();
        graphData.add(Map.of("name", "Jan", "visits", 12));
        graphData.add(Map.of("name", "Feb", "visits", 19));
        graphData.add(Map.of("name", "Mar", "visits", 8));
        graphData.add(Map.of("name", "Apr", "visits", (int) completedAppts)); 
        stats.put("graphData", graphData);

        // D. REAL REVIEWS (Fixed: Now fetches from DB)
        List<Review> realReviews = reviewRepo.findByDoctorId(doctorId);
        stats.put("reviews", realReviews); 

        return stats;
    }
}