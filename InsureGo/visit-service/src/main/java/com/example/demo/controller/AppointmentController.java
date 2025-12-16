package com.example.demo.controller;

import com.example.demo.bean.Appointment;
import com.example.demo.bean.Doctor;
import com.example.demo.dto.RescheduleRequest;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointment") // The Gateway forwards /api/appointment here
public class AppointmentController {

    @Autowired private AppointmentService service;
    @Autowired private AppointmentRepository appointmentRepository; 

    // 1. Get List of Doctors
    @GetMapping("/doctors/available")
    public List<Doctor> getDoctors() {
        return service.getAvailableDoctors();
    }

    // 2. Book Appointment (Cleaned up)
    @PostMapping("/book")
    public ResponseEntity<?> book(@RequestBody Appointment appointment) {
        try {
            // A. Handle Patient ID (Default to 1 if missing for testing)
            Long patientId = (appointment.getPatientId() != null) ? appointment.getPatientId() : 1L;
            appointment.setPatientId(patientId);
            
            // B. Handle Doctor ID (Dummy ID if missing, to pass checks)
            if(appointment.getDoctorID() == null) {
                appointment.setDoctorID(999L); 
            }

            // C. Call Service: The Service layer now handles name population and policy ID safety checks
            // We pass the appointment and the patientId.
            return ResponseEntity.ok(service.bookAppointment(appointment, patientId));

        } catch (Exception e) {
            // This prints the specific error to your Java Console so you know exactly what failed
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Server Error: " + e.getMessage());
        }
    }


    // 3. Get My Appointments
    @GetMapping("/user/{patientId}")
    public List<Appointment> getMyBookings(@PathVariable Long patientId) {
        return service.getAppointmentsByPatient(patientId);
    }
 // 1. Get Doctor's Schedule
    @GetMapping("/doctor/{doctorId}")
    public List<Appointment> getDoctorSchedule(@PathVariable Long doctorId) {
        return service.getAppointmentsByDoctor(doctorId);
    }

    // 2. Mark Appointment as Completed
    @PutMapping("/status/{id}")
    public ResponseEntity<Appointment> updateStatus(@PathVariable Long id, @RequestBody String status) {
        return ResponseEntity.ok(service.updateStatus(id, status));
    }
    @PutMapping("/reschedule/{id}")
    public ResponseEntity<?> rescheduleAppointment(@PathVariable Long id, @RequestBody Appointment newDetails) {
        
        return appointmentRepository.findById(id)
            .map(appt -> {
                // 1. Update the appointment fields with new details
                appt.setAppointmentDate(newDetails.getAppointmentDate());
                appt.setAppointmentTime(newDetails.getAppointmentTime());
                appt.setStatus("RESCHEDULED"); 
                
                // 2. Delegate to the service layer for saving and name-fixing.
                // We call the method that performs the save and name correction.
                return service.updateAppointmentDetails(appt); // <-- THIS MUST BE CORRECT
            })
            .map(ResponseEntity::ok) 
            .orElseGet(() -> ResponseEntity.status(404).body(null)); 
    }
    
}