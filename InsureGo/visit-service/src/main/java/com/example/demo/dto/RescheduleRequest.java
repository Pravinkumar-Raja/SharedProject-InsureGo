package com.example.demo.dto;
import java.time.LocalDate;
import java.time.LocalTime;

public class RescheduleRequest {
    private Long appointmentId;
    private Long doctorID;
    private String insurancePolicyId;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String ailmentType;
    private String ailmentReason;

    public RescheduleRequest() {}

    // Getters and Setters
    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }

    public Long getDoctorID() { return doctorID; }
    public void setDoctorID(Long doctorID) { this.doctorID = doctorID; }

    public String getInsurancePolicyId() { return insurancePolicyId; }
    public void setInsurancePolicyId(String insurancePolicyId) { this.insurancePolicyId = insurancePolicyId; }

    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }

    public LocalTime getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(LocalTime appointmentTime) { this.appointmentTime = appointmentTime; }

    public String getAilmentType() { return ailmentType; }
    public void setAilmentType(String ailmentType) { this.ailmentType = ailmentType; }

    public String getAilmentReason() { return ailmentReason; }
    public void setAilmentReason(String ailmentReason) { this.ailmentReason = ailmentReason; }
}