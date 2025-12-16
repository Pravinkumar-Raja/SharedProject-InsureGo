package com.example.demo.bean;

import jakarta.persistence.*;

@Entity
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long doctorId;
    private String doctorName;
    private Long patientId;
    private String patientName;
    
    private int rating; // 1 to 5
    private String comment;

    // --- 1. NO-ARG CONSTRUCTOR (Required by JPA) ---
    public Review() {
    }

    // --- 2. ALL-ARGS CONSTRUCTOR ---
    public Review(Long doctorId, String doctorName, Long patientId, String patientName, int rating, String comment) {
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.patientId = patientId;
        this.patientName = patientName;
        this.rating = rating;
        this.comment = comment;
    }

    // --- 3. GETTERS AND SETTERS ---

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public Long getDoctorId() {
        return doctorId;
    }
    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }
    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public Long getPatientId() {
        return patientId;
    }
    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }
    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public int getRating() {
        return rating;
    }
    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }
    public void setComment(String comment) {
        this.comment = comment;
    }

    // --- 4. TO STRING (Optional, good for debugging) ---
    @Override
    public String toString() {
        return "Review{" +
                "id=" + id +
                ", doctorName='" + doctorName + '\'' +
                ", rating=" + rating +
                '}';
    }
}
