import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Modal, InputGroup } from 'react-bootstrap';
import { useNavigate ,Link} from 'react-router-dom';
import api from '../services/api'; 

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        phoneNumber: '', 
        password: '', 
        role: 'PATIENT' // Default Role
    });

    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // --- HANDLER 1: SUBMIT FORM -> REQUEST OTP ---
    const handleInitialSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (formData.phoneNumber.length < 10) throw new Error("Invalid Phone Number");

            // This now calls the correct endpoint /auth/register/request-phone-otp via api.requestOtp
            await api.requestOtp({ phoneNumber: formData.phoneNumber });

            setLoading(false);
            setShowOtpModal(true);
            alert(`OTP Sent to ${formData.phoneNumber}. (Check Java Console)`);

        } catch (err) {
            setLoading(false);
            console.error(err);
            setError("Failed to send OTP. Check if phone is valid and Auth Service is running.");
        }
    };

    // --- HANDLER 2: VERIFY OTP -> COMPLETE REGISTRATION ---
    const handleVerifyAndRegister = async () => {
        try {
            // This now calls the correct endpoint /auth/register/verify-phone-otp via api.verifyOtp
            await api.verifyOtp({
                identifier: formData.phoneNumber,
                code: otp
            });

            // If verification is successful, proceed to final registration
            await api.register(formData);

            alert("Registration Successful! Please Login.");
            navigate('/login');

        } catch (err) {
            console.error(err);
            alert("Invalid OTP or Registration Failed.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Container className="d-flex justify-content-center align-items-center mt-5">
            <Card className="shadow p-4" style={{ width: '450px' }}>
                <h3 className="text-center mb-3">Create Account</h3>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleInitialSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control 
                            required 
                            placeholder="John Doe"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control 
                            type="email" required 
                            placeholder="john@example.com"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Phone Number</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>+91</InputGroup.Text>
                            <Form.Control 
                                required 
                                placeholder="9876543210"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                            />
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>I am a...</Form.Label>
                        <Form.Select 
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="PATIENT">Patient (User)</option>
                            <option value="DOCTOR">Doctor</option>
                            <option value="PROVIDER">Insurance Provider</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control 
                            type="password" required 
                            placeholder="******"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Button type="submit" className="w-100" variant="primary" disabled={loading}>
                        {loading ? "Sending OTP..." : "Verify & Register"}
                    </Button>
                </Form>

                <div className="text-center mt-3">
                    <small>Already have an account? <Link to="/login">Login</Link></small>
                </div>
            </Card>

            {/* OTP MODAL */}
            <Modal show={showOtpModal} onHide={() => setShowOtpModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Verify Phone Number</Modal.Title></Modal.Header>
                <Modal.Body>
                    <p>Enter the 6-digit code sent to <strong>+91 {formData.phoneNumber}</strong></p>
                    <Form.Control 
                        className="text-center text-primary fw-bold fs-4"
                        placeholder="000000"
                        maxLength={6}
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowOtpModal(false)}>Cancel</Button>
                    <Button variant="success" onClick={handleVerifyAndRegister}>Confirm OTP</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Register;