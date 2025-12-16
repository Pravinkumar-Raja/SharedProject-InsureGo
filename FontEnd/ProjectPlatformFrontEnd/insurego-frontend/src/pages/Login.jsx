import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api'; 

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Send Login Request
            const response = await api.login(email, password);
            
            // 2. Destructure ALL possible fields from the backend response
            const { 
                token, 
                userId, 
                name, 
                role, 
                providerName // <--- CRITICAL for Insurance Provider
            } = response.data; 

            if (!token) throw new Error("Authentication failed: Missing token.");

            // 3. Save common data and clear old session
            localStorage.clear(); 
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            localStorage.setItem('userName', name);
            localStorage.setItem('role', role);

            // 4. DYNAMIC REDIRECT based on Role
            if (role === 'ADMIN') {
                navigate('/admin-dashboard');
                
            } else if (role === 'DOCTOR') {
                // Assuming Doctor Dashboard uses userId and userName
                navigate('/doctor-dashboard');
                
            } else if (role === 'PROVIDER') {
                // === PROVIDER-SPECIFIC LOGIC ===
                if (providerName) {
                    localStorage.setItem('providerName', providerName); // <-- SAVE COMPANY NAME
                    navigate('/provider-dashboard'); // <-- REDIRECT TO PROVIDER DASHBOARD
                } else {
                    // Safety check if the backend failed to send the providerName field
                    setError('Provider role detected, but company name is missing. Contact support.');
                    localStorage.clear();
                }

            } else if (role === 'PATIENT' || role === 'USER') { 
                navigate('/user-dashboard'); 
                
            } else {
                setError('Login successful, but role is unrecognized. Access denied.');
                localStorage.clear();
            }

        } catch (err) {
            console.error("Login Error:", err);
            // Check for specific error status if it's an Axios error
            if (err.response && err.response.status === 401) {
                setError('Invalid Email or Password.');
            } else {
                setError('Login failed. Check server connection (Auth-Service).');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center mt-5">
            <Card className="shadow p-4" style={{ width: '400px' }}>
                <h3 className="text-center mb-4">InsureGo Login</h3>
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleLogin}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control 
                            type="email" 
                            placeholder="Enter email"
                            onChange={(e) => setEmail(e.target.value)} 
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control 
                            type="password" 
                            placeholder="Enter password"
                            onChange={(e) => setPassword(e.target.value)} 
                            required
                        />
                    </Form.Group>
                    
                    <Button type="submit" className="w-100" variant="primary" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Secure Login'}
                    </Button>
                </Form>
                
                <div className="text-center mt-3">
                    <small>Don't have an account? </small>
                    <Link to="/register" className="fw-bold">Register Here</Link>
                </div>
            </Card>
        </Container>
    );
};

export default Login;