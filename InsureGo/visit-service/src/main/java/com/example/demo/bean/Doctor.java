package com.example.demo.bean;

import jakarta.persistence.*;

@Entity
@Table(name="doctor")
public class Doctor {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long did;
    
    private String doctorName;
    private String primarySpecialization;
    
    public Doctor() {}

    // Getters and Setters
    public Long getDid() { return did; }
    public void setDid(Long did) { this.did = did; }
    
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    
    public String getPrimarySpecialization() { return primarySpecialization; }
    public void setPrimarySpecialization(String primarySpecialization) { this.primarySpecialization = primarySpecialization; }
}
