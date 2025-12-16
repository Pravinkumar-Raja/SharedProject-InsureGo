package com.example.demo.bean;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long patientId;      
    private Long doctorId;       
    private String doctorName;   
    private String patientName;  
    
    private LocalDateTime appointmentTime;
    private String details;      

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    public enum Status { PENDING, CONFIRMED, CANCELLED, COMPLETED }

    public Appointment() {}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getPatientId() {
		return patientId;
	}

	public void setPatientId(Long patientId) {
		this.patientId = patientId;
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

	public String getPatientName() {
		return patientName;
	}

	public void setPatientName(String patientName) {
		this.patientName = patientName;
	}

	public LocalDateTime getAppointmentTime() {
		return appointmentTime;
	}

	public void setAppointmentTime(LocalDateTime appointmentTime) {
		this.appointmentTime = appointmentTime;
	}

	public String getDetails() {
		return details;
	}

	public void setDetails(String details) {
		this.details = details;
	}

	public Status getStatus() {
		return status;
	}

	public void setStatus(Status status) {
		this.status = status;
	}

    // --- Generate Getters and Setters for ALL fields ---
    // (Right Click -> Source -> Generate Getters and Setters -> Select All -> Generate)
    
}
