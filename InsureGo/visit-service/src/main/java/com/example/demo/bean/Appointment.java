package com.example.demo.bean;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name="appointment")
public class Appointment {

    public static final String STATUS_CONFIRMED = "CONFIRMED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long appointmentId;

    private Long patientId;
    private String patientName;
    
    private Long doctorID; 
    private String doctorName; 
    
    private LocalDate appointmentDate; 
    private LocalTime appointmentTime; 
    
    private String ailmentReason; 
    private String ailmentType;
    
    private String status;

    // *** NEW FIELD TO FIX SQL ERROR ***
    @Column(name = "insurance_policy_id") 
    private String insurancePolicyId;

    public Appointment() {}

    // --- Getters and Setters ---
    
    // ... (Your existing getters/setters) ...

    public String getInsurancePolicyId() { return insurancePolicyId; }
    public Long getAppointmentId() {
		return appointmentId;
	}

	public void setAppointmentId(Long appointmentId) {
		this.appointmentId = appointmentId;
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

	public Long getDoctorID() {
		return doctorID;
	}

	public void setDoctorID(Long doctorID) {
		this.doctorID = doctorID;
	}

	public String getDoctorName() {
		return doctorName;
	}

	public void setDoctorName(String doctorName) {
		this.doctorName = doctorName;
	}

	public LocalDate getAppointmentDate() {
		return appointmentDate;
	}

	public void setAppointmentDate(LocalDate appointmentDate) {
		this.appointmentDate = appointmentDate;
	}

	public LocalTime getAppointmentTime() {
		return appointmentTime;
	}

	public void setAppointmentTime(LocalTime appointmentTime) {
		this.appointmentTime = appointmentTime;
	}

	public String getAilmentReason() {
		return ailmentReason;
	}

	public void setAilmentReason(String ailmentReason) {
		this.ailmentReason = ailmentReason;
	}

	public String getAilmentType() {
		return ailmentType;
	}

	public void setAilmentType(String ailmentType) {
		this.ailmentType = ailmentType;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}


	public void setInsurancePolicyId(String insurancePolicyId) { this.insurancePolicyId = insurancePolicyId; }
}