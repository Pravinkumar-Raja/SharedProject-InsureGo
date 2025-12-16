import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const BookAppointment = () => {
    const navigate = useNavigate();
    
    // UI State
    const [doctorName, setDoctorName] = useState('');
    const [reason, setReason] = useState('');
    const [dateTimeStr, setDateTimeStr] = useState(''); 
    const [error, setError] = useState('');

    // --- SECURITY CHECK ---
    useEffect(() => {
        if (!localStorage.getItem('userId')) {
            alert("Please login first");
            navigate('/login');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // 1. GET REAL USER INFO
            const currentUserId = parseInt(localStorage.getItem('userId'));
            const currentUserName = localStorage.getItem('userName') || "User";

            // 2. Prepare Data
            const parts = dateTimeStr.split('T'); 
            const datePart = parts[0]; 
            const timePart = parts[1] + ":00"; 

            const payload = {
                // *** DYNAMIC ID ***
                patientId: currentUserId, 
                patientName: currentUserName, 
                
                doctorName: doctorName,
                doctorID: 999, // Dummy ID
                
                ailmentReason: reason,    
                appointmentDate: datePart, 
                appointmentTime: timePart,
                status: "CONFIRMED"
            };

            await api.bookAppointment(payload);
            
            alert("Appointment Booked Successfully!");
            navigate('/dashboard'); 
        } catch (err) {
            console.error(err);
            setError("Failed to book: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <Card className="shadow-lg p-4" style={{ width: '100%', maxWidth: '500px' }}>
                <h3 className="text-center mb-4">Book an Appointment</h3>
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Select Doctor</Form.Label>
                        <Form.Select required value={doctorName} onChange={(e) => setDoctorName(e.target.value)}>
                            <option value="">Choose...</option>
                            <option value="Dr. Smith (Cardiology)">Dr. Smith (Cardiology)</option>
                            <option value="Dr. Jane (General)">Dr. Jane (General)</option>
                            <option value="Dr. John (General)">Dr. John (General)</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Reason for Visit</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            placeholder="Fever, Checkup, etc." 
                            required 
                            value={reason}
                            onChange={(e) => setReason(e.target.value)} 
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Preferred Date & Time</Form.Label>
                        <Form.Control 
                            type="datetime-local" 
                            required
                            value={dateTimeStr}
                            onChange={(e) => setDateTimeStr(e.target.value)} 
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100">
                        Confirm Booking
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};

export default BookAppointment;