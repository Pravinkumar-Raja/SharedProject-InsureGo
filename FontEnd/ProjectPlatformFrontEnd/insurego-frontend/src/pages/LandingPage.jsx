import React, { useState, useEffect } from 'react';
import { Container, Navbar, Button, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaUserMd, FaFileInvoiceDollar, FaArrowRight, FaChartLine, FaCheckCircle, FaLock } from 'react-icons/fa';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import '../App.css';

// --- MOCK DATA FOR GRAPHS ---
const claimData = [
  { name: 'Mon', value: 20 },
  { name: 'Tue', value: 45 },
  { name: 'Wed', value: 30 },
  { name: 'Thu', value: 80 },
  { name: 'Fri', value: 55 },
  { name: 'Sat', value: 90 },
  { name: 'Sun', value: 100 },
];

const LandingPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    // --- 1. SIMULATE LOADING EFFECT ---
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2500); // 2.5 seconds loading time
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="loader-container">
                <div className="loader-logo">
                    <FaShieldAlt className="text-accent mb-3" size={60} />
                    <div>InsureGo<span className="text-accent">Pro</span></div>
                </div>
                <div className="loader-bar"><div className="loader-progress"></div></div>
                <small className="text-muted mt-2">Initializing Secure Health Protocol...</small>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: 'var(--bg-light)', minHeight: '100vh', overflowX: 'hidden' }}>
            
            {/* --- NAVBAR --- */}
            <Navbar className="pro-navbar sticky-top" expand="lg">
                <Container>
                    <Navbar.Brand className="d-flex align-items-center gap-2 fw-bold fs-4" style={{ color: 'var(--primary)' }}>
                        <div className="bg-primary text-white p-2 rounded-3 d-flex align-items-center justify-content-center">
                            <FaShieldAlt size={20} />
                        </div>
                        InsureGo<span style={{ color: 'var(--accent)' }}>Pro</span>
                    </Navbar.Brand>
                    
                    {/* ONLY LOGIN BUTTON AT TOP RIGHT */}
                    <div className="d-flex gap-3">
                        <Button className="btn-primary" onClick={() => navigate('/login')}>Log In</Button>
                    </div>
                </Container>
            </Navbar>

            {/* --- HERO SECTION --- */}
            <section className="hero-section hero-bg-image py-5 d-flex align-items-center" style={{ minHeight: '90vh' }}>
                <Container className="position-relative" style={{ zIndex: 2 }}>
                    <Row className="align-items-center">
                        <Col lg={6} className="mb-5 mb-lg-0 animate-fade-up">
                            <div className="d-inline-block px-3 py-1 mb-3 rounded-pill" style={{ background: 'rgba(45, 212, 191, 0.1)', border: '1px solid var(--accent)' }}>
                                <small className="fw-bold text-accent">🚀 The #1 Health Insurance Portal</small>
                            </div>
                            <h1 className="display-3 fw-bold mb-3 text-white lh-sm">
                                Secure. Fast. <br/>
                                <span style={{ color: 'var(--accent)', textShadow: '0 0 20px rgba(45, 212, 191, 0.5)' }}>Reliable.</span>
                            </h1>
                            <p className="lead text-light opacity-75 mb-5" style={{ maxWidth: '500px' }}>
                                The unified platform connecting Patients, Doctors, and Insurance Providers. Experience real-time claim processing and instant approvals.
                            </p>
                            
                            {/* CREATE ACCOUNT BUTTON */}
                            <Button className="btn-glow px-5 py-3 fs-5" onClick={() => navigate('/register')}>
                                Create Account <FaArrowRight className="ms-2" />
                            </Button>

                            <div className="mt-5 d-flex gap-4 opacity-75 text-white">
                                <div className="d-flex align-items-center gap-2"><FaCheckCircle className="text-accent"/> <span>Instant Claims</span></div>
                                <div className="d-flex align-items-center gap-2"><FaLock className="text-accent"/> <span>Bank-Grade Security</span></div>
                            </div>
                        </Col>
                        
                        {/* RIGHT SIDE: DASHBOARD PREVIEW */}
                        <Col lg={6} className="position-relative animate-float delay-200">
                            {/* Main Glass Card */}
                            <div className="p-4 rounded-4 shadow-lg mx-auto position-relative" style={{ 
                                background: 'rgba(255, 255, 255, 0.1)', 
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                transform: 'rotate(-2deg)' 
                            }}>
                                {/* Fake Header */}
                                <div className="d-flex justify-content-between align-items-center mb-4 text-white">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-primary p-2 rounded-circle"><FaUserMd /></div>
                                        <div>
                                            <h6 className="mb-0 fw-bold">Dr. Emily</h6>
                                            <small className="opacity-75">Cardiology Specialist</small>
                                        </div>
                                    </div>
                                    <Badge bg="success" className="px-3">ONLINE</Badge>
                                </div>

                                {/* Fake Stats Row */}
                                <div className="d-flex gap-3 mb-4">
                                    <div className="bg-white p-3 rounded-3 flex-grow-1 shadow-sm">
                                        <small className="text-muted text-uppercase" style={{fontSize: '10px'}}>Patients</small>
                                        <h4 className="fw-bold text-primary mb-0">1,240</h4>
                                    </div>
                                    <div className="bg-white p-3 rounded-3 flex-grow-1 shadow-sm">
                                        <small className="text-muted text-uppercase" style={{fontSize: '10px'}}>Claims</small>
                                        <h4 className="fw-bold text-success mb-0">$85k</h4>
                                    </div>
                                </div>

                                {/* Graph Inside Hero */}
                                <div className="bg-white p-3 rounded-3 shadow-sm">
                                    <h6 className="text-muted small fw-bold mb-3">Weekly Claim Volume</h6>
                                    <div style={{ height: '150px', width: '100%' }}>
                                        <ResponsiveContainer>
                                            <AreaChart data={claimData}>
                                                <defs>
                                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="name" hide />
                                                <Tooltip />
                                                <Area type="monotone" dataKey="value" stroke="#0f766e" fillOpacity={1} fill="url(#colorVal)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* --- FEATURES SECTION --- */}
            <Container className="py-5 mt-5">
                <div className="text-center mb-5 animate-fade-up">
                    <h6 className="text-accent fw-bold text-uppercase ls-2">Powerful Features</h6>
                    <h2 className="fw-bold display-6">Designed for Everyone</h2>
                </div>
                
                <Row className="g-4">
                    {/* Feature 1: Patients */}
                    <Col md={4} className="animate-fade-up delay-100">
                        <Card className="feature-card h-100 p-4 border-0 shadow-sm text-center position-relative overflow-hidden">
                            <div className="mx-auto bg-primary-subtle p-4 rounded-circle mb-4 text-primary d-inline-block">
                                <FaUserMd size={32} />
                            </div>
                            <h4 className="fw-bold">For Patients</h4>
                            <p className="text-muted">Book appointments, manage prescriptions, and track your insurance claims in real-time.</p>
                        </Card>
                    </Col>

                    {/* Feature 2: Doctors */}
                    <Col md={4} className="animate-fade-up delay-200">
                        <Card className="feature-card h-100 p-4 border-0 shadow-sm text-center" style={{ borderBottom: '4px solid var(--accent)' }}>
                            <div className="mx-auto bg-success-subtle p-4 rounded-circle mb-4 text-success d-inline-block">
                                <FaShieldAlt size={32} />
                            </div>
                            <h4 className="fw-bold">For Doctors</h4>
                            <p className="text-muted">Digital prescription management, instant patient verification, and automated billing.</p>
                        </Card>
                    </Col>

                    {/* Feature 3: Providers */}
                    <Col md={4} className="animate-fade-up delay-300">
                        <Card className="feature-card h-100 p-4 border-0 shadow-sm text-center">
                            <div className="mx-auto bg-warning-subtle p-4 rounded-circle mb-4 text-warning d-inline-block">
                                <FaFileInvoiceDollar size={32} />
                            </div>
                            <h4 className="fw-bold">For Insurers</h4>
                            <p className="text-muted">Advanced dashboard to verify claims, detect fraud, and process payouts instantly.</p>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* --- CTA SECTION --- */}
            <section className="py-5 bg-white">
                <Container>
                    <div className="bg-primary rounded-5 p-5 text-center text-white position-relative overflow-hidden shadow-lg">
                        <div className="position-relative" style={{ zIndex: 2 }}>
                            <h2 className="fw-bold display-6 mb-4">Start your journey today.</h2>
                            <Button className="btn-glow px-5 py-3 fs-5" onClick={() => navigate('/register')}>Create Account</Button>
                        </div>
                    </div>
                </Container>
            </section>

            <footer className="py-4 text-center text-muted bg-light border-top">
                <small>© 2024 InsureGo Pro. Empowering Healthcare.</small>
            </footer>
        </div>
    );
};

// Helper
const Badge = ({ children, bg, className }) => (
    <span className={`badge bg-${bg} ${className}`}>{children}</span>
);

export default LandingPage;