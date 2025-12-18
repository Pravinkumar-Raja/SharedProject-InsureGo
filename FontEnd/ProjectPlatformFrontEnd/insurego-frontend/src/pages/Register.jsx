import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { User, Mail, Lock, Phone, Shield, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react';
import api from '../services/api'; // Ensure this points to your API service

const Register = () => {
    const navigate = useNavigate();
    
    // State Management
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        role: 'PATIENT' // Default role
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Handle Input Change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user types
        if (error) setError('');
    };

    // Handle Form Submit
    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // 1. Validation Logic
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            setLoading(false);
            return;
        }

        // 2. Prepare Payload (Exclude confirmPassword)
        const payload = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            phoneNumber: formData.phoneNumber,
            role: formData.role
        };

        // 3. API Connection
        try {
            // Assuming api.register performs a POST to /auth/register
            await api.register(payload); 
            setSuccess(true);
            
            // Redirect after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error(err);
            // Handle backend error messages
            const msg = err.response?.data?.message || "Registration failed. Try a different email.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // --- 🎨 STYLES ---
    const bgStyle = {
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
    };

    const glassCardStyle = {
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
    };

    const sidePanelStyle = {
        background: 'linear-gradient(135deg, #0d6efd 0%, #0099ff 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3rem',
        height: '100%'
    };

    return (
        <div style={bgStyle}>
            <Container>
                <Row className="justify-content-center">
                    <Col lg={10}>
                        <Card style={glassCardStyle} className="border-0">
                            <Row className="g-0">
                                {/* Left Side: Visuals */}
                                <Col md={5} className="d-none d-md-block">
                                    <div style={sidePanelStyle}>
                                        <div className="mb-4">
                                            <div className="bg-white p-3 rounded-circle d-inline-flex mb-3 shadow-sm">
                                                <Shield size={32} className="text-primary" />
                                            </div>
                                            <h2 className="fw-bold display-6">InsureGo</h2>
                                            <p className="lead opacity-75">Your Health, Secured.</p>
                                        </div>
                                        <div className="mt-auto">
                                            <div className="d-flex align-items-center gap-3 mb-3">
                                                <CheckCircle size={20} className="text-white" /> 
                                                <span>Instant Policy Approval</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-3 mb-3">
                                                <CheckCircle size={20} className="text-white" /> 
                                                <span>Top-tier Medical Network</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-3">
                                                <CheckCircle size={20} className="text-white" /> 
                                                <span>24/7 Claim Support</span>
                                            </div>
                                        </div>
                                    </div>
                                </Col>

                                {/* Right Side: Form */}
                                <Col md={7}>
                                    <Card.Body className="p-5">
                                        <div className="mb-4">
                                            <h3 className="fw-bold text-dark">Create Account</h3>
                                            <p className="text-muted">Join thousands of secured users today.</p>
                                        </div>

                                        {error && <Alert variant="danger" className="d-flex align-items-center gap-2"><div className="fw-bold">Error:</div> {error}</Alert>}
                                        {success && <Alert variant="success" className="d-flex align-items-center gap-2"><CheckCircle size={18}/> Registration successful! Redirecting...</Alert>}

                                        <Form onSubmit={handleRegister}>
                                            <Row>
                                                <Col md={12} className="mb-3">
                                                    <Form.Label className="small fw-bold text-muted">FULL NAME</Form.Label>
                                                    <InputGroup>
                                                        <InputGroup.Text className="bg-light border-end-0"><User size={18} className="text-muted"/></InputGroup.Text>
                                                        <Form.Control name="username" type="text" placeholder="e.g. John Doe" className="bg-light border-start-0" required value={formData.username} onChange={handleChange} />
                                                    </InputGroup>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col md={6} className="mb-3">
                                                    <Form.Label className="small fw-bold text-muted">EMAIL</Form.Label>
                                                    <InputGroup>
                                                        <InputGroup.Text className="bg-light border-end-0"><Mail size={18} className="text-muted"/></InputGroup.Text>
                                                        <Form.Control name="email" type="email" placeholder="name@example.com" className="bg-light border-start-0" required value={formData.email} onChange={handleChange} />
                                                    </InputGroup>
                                                </Col>
                                                <Col md={6} className="mb-3">
                                                    <Form.Label className="small fw-bold text-muted">PHONE</Form.Label>
                                                    <InputGroup>
                                                        <InputGroup.Text className="bg-light border-end-0"><Phone size={18} className="text-muted"/></InputGroup.Text>
                                                        <Form.Control name="phoneNumber" type="tel" placeholder="+1 234 567" className="bg-light border-start-0" required value={formData.phoneNumber} onChange={handleChange} />
                                                    </InputGroup>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col md={6} className="mb-3">
                                                    <Form.Label className="small fw-bold text-muted">PASSWORD</Form.Label>
                                                    <InputGroup>
                                                        <InputGroup.Text className="bg-light border-end-0"><Lock size={18} className="text-muted"/></InputGroup.Text>
                                                        <Form.Control name="password" type={showPassword ? "text" : "password"} placeholder="••••••" className="bg-light border-start-0 border-end-0" required value={formData.password} onChange={handleChange} />
                                                        <InputGroup.Text className="bg-light border-start-0 cursor-pointer" onClick={() => setShowPassword(!showPassword)} style={{cursor: 'pointer'}}>
                                                            {showPassword ? <EyeOff size={18} className="text-muted"/> : <Eye size={18} className="text-muted"/>}
                                                        </InputGroup.Text>
                                                    </InputGroup>
                                                </Col>
                                                <Col md={6} className="mb-3">
                                                    <Form.Label className="small fw-bold text-muted">CONFIRM</Form.Label>
                                                    <InputGroup>
                                                        <InputGroup.Text className="bg-light border-end-0"><Lock size={18} className="text-muted"/></InputGroup.Text>
                                                        <Form.Control name="confirmPassword" type="password" placeholder="••••••" className="bg-light border-start-0" required value={formData.confirmPassword} onChange={handleChange} />
                                                    </InputGroup>
                                                </Col>
                                            </Row>

                                            <div className="mb-4">
                                                <Form.Label className="small fw-bold text-muted">I AM A...</Form.Label>
                                                <div className="d-flex gap-2">
                                                    {['PATIENT', 'DOCTOR', 'PROVIDER'].map((role) => (
                                                        <Button 
                                                            key={role}
                                                            variant={formData.role === role ? 'primary' : 'outline-light'}
                                                            className={`flex-grow-1 ${formData.role === role ? '' : 'text-dark border-secondary-subtle'}`}
                                                            onClick={() => setFormData({...formData, role: role})}
                                                        >
                                                            {role.charAt(0) + role.slice(1).toLowerCase()}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            <Button variant="primary" type="submit" className="w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                                                {loading ? <Spinner size="sm" animation="border" /> : (
                                                    <>Create Account <ArrowRight size={18}/></>
                                                )}
                                            </Button>

                                            <div className="text-center mt-4">
                                                <p className="text-muted small">
                                                    Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Sign In</Link>
                                                </p>
                                            </div>
                                        </Form>
                                    </Card.Body>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Register;