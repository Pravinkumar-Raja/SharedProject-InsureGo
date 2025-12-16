package com.example.demo.controller;

import com.example.demo.bean.Appointment;
import com.example.demo.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentRepository repository;

    // 1. Book an Appointment
    @PostMapping("/book")
    public Appointment bookAppointment(@RequestBody Appointment appointment) {
        appointment.setAppointmentTime(LocalDateTime.now().plusDays(1)); // Default to tomorrow for testing
        appointment.setStatus(Appointment.Status.PENDING);
        return repository.save(appointment);
    }

    // 2. Get Appointments for a User
    @GetMapping("/user/{patientId}")
    public List<Appointment> getMyAppointments(@PathVariable Long patientId) {
        return repository.findByPatientId(patientId);
    }
}
