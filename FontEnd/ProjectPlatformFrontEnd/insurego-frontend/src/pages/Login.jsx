import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, ShieldCheck } from 'lucide-react'; 
import api from '../services/api'; 

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // --- 🎨 PROFESSIONAL MEDICAL STYLES ---
    
    // 1. Background: Clean, Trustworthy Blue Gradient
    const pageStyle = {
        background: 'linear-gradient(135deg, #e3f2fd 0%, #f1f5f9 100%)', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
    };

    // 2. Glass Card: The Form Container
    const glassCardStyle = {
        background: 'rgba(255, 255, 255, 0.9)', 
        backdropFilter: 'blur(20px)',
        border: '1px solid #fff',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0, 50, 100, 0.1)' // Soft blueish shadow
    };

    // 3. Input Fields styling
    const inputIconStyle = {
        position: 'absolute',
        top: '14px',
        left: '15px',
        color: '#0284c7', // Medical Blue Icon
        zIndex: 10
    };

    const formControlStyle = {
        paddingLeft: '45px',
        borderRadius: '12px',
        height: '50px',
        border: '1px solid #e0e6ed',
        backgroundColor: '#f8fafc',
        fontSize: '0.95rem'
    };

    // 4. Floating Animation for the 3D Image
    const floatAnimation = `
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
    `;

    // --- 🚀 LOGIN LOGIC (Unchanged) ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.login(email, password);
            const { token, userId, name, role, providerName } = response.data; 

            if (!token) throw new Error("Authentication failed.");

            localStorage.clear(); 
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            localStorage.setItem('userName', name);
            localStorage.setItem('role', role);

            if (role === 'ADMIN') navigate('/admin-dashboard');
            else if (role === 'DOCTOR') navigate('/doctor-dashboard');
            else if (role === 'PROVIDER') {
                if (providerName) {
                    localStorage.setItem('providerName', providerName);
                    navigate('/provider-dashboard');
                } else {
                    setError('Provider Error: Company name missing.');
                    localStorage.clear();
                }
            } else { navigate('/patient-dashboard'); }

        } catch (err) {
            console.error("Login Error:", err);
            if (err.response && err.response.status === 401) setError('Invalid Email or Password.');
            else setError('Login failed. Server unavailable.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Mock Google Login for visual demo
        alert("Redirecting to Google OAuth...");
    };

    return (
        <div style={pageStyle}>
            <style>{floatAnimation}</style> 
            <Container style={{ maxWidth: '1100px' }}>
                <Row className="align-items-center g-0">
                    
                    {/* LEFT SIDE: 3D Doctor Illustration */}
                    <Col lg={6} className="d-none d-lg-block pe-5 text-center">
                        <div style={{ animation: 'float 5s ease-in-out infinite' }}>
                            {/* Professional 3D Medical Illustration */}
                            <img 
                                src="https://img.freepik.com/free-vector/medical-video-call-consultation-illustration_88138-415.jpg?w=826&t=st=1709123456~exp=1709124056~hmac=abcdef" 
                                alt="InsureGo Doctor" 
                                className="img-fluid"
                                style={{ 
                                    mixBlendMode: 'multiply', 
                                    filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.1))',
                                    borderRadius: '20px'
                                }}
                            />
                        </div>
                        <h2 className="fw-bold mt-4" style={{ color: '#0f172a' }}>Your Health, <span style={{color: '#0284c7'}}>Secured.</span></h2>
                        <p className="text-muted" style={{ fontSize: '1.1rem' }}>Manage claims, policies, and care in one unified platform.</p>
                    </Col>

                    {/* RIGHT SIDE: The Glass Login Form */}
                    <Col lg={5} md={8} className="mx-auto">
                        <Card className="border-0 p-4 p-md-5" style={glassCardStyle}>
                            <Card.Body>
                                {/* Header */}
                                <div className="text-center mb-4">
                                    <div className="d-inline-flex align-items-center justify-content-center mb-3 p-3 rounded-circle" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)', boxShadow: '0 8px 16px rgba(2, 132, 199, 0.3)' }}>
                                        <ShieldCheck size={32} color="white" />
                                    </div>
                                    <h3 className="fw-bold text-dark mb-1">Welcome Back</h3>
                                    <p className="text-muted small">Access your InsureGo Portal</p>
                                </div>

                                {error && <Alert variant="danger" className="text-center border-0 small py-2">{error}</Alert>}
                                
                                <Form onSubmit={handleLogin}>
                                    <Form.Group className="mb-3 position-relative">
                                        <Mail size={18} style={inputIconStyle} />
                                        <Form.Control 
                                            type="email" 
                                            placeholder="Email Address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)} 
                                            required
                                            style={formControlStyle}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4 position-relative">
                                        <Lock size={18} style={inputIconStyle} />
                                        <Form.Control 
                                            type="password" 
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)} 
                                            required
                                            style={formControlStyle}
                                        />
                                    </Form.Group>
                                    
                                    <div className="d-grid gap-3">
                                        <Button 
                                            type="submit" 
                                            disabled={loading} 
                                            style={{ 
                                                background: 'linear-gradient(to right, #0284c7, #0ea5e9)', 
                                                border: 'none', 
                                                borderRadius: '12px', 
                                                height: '50px',
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                                            }}
                                        >
                                            {loading ? <Spinner animation="border" size="sm" /> : <span className="d-flex align-items-center justify-content-center gap-2"><LogIn size={18}/> Sign In</span>}
                                        </Button>

                                        {/* Google Button */}
                                        <Button 
                                            variant="light" 
                                            onClick={handleGoogleLogin} 
                                            style={{ 
                                                borderRadius: '12px', 
                                                height: '50px', 
                                                fontWeight: '600', 
                                                color: '#475569',
                                                border: '1px solid #e2e8f0'
                                            }}
                                            className="d-flex align-items-center justify-content-center gap-2 bg-white"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" /><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z" /><path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z" /><path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z" /></svg>
                                            Continue with Google
                                        </Button>
                                    </div>
                                </Form>
                                
                                <div className="text-center mt-4 pt-2 border-top">
                                    <p className="text-muted small mb-0">Don't have an account? <Link to="/register" className="fw-bold text-decoration-none" style={{color: '#0284c7'}}>Sign Up Now</Link></p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Login;