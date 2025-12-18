import React from 'react';
import { Container, Navbar, Nav, Button, Row, Col, Badge, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const LandingPage = () => {

    // --- MODERN STYLING CONSTANTS ---
    const bgDark = "#030712"; // Almost black, deep blue-grey
    const accentCyan = "#22d3ee"; // Bright Cyan
    const accentBlue = "#3b82f6"; // Royal Blue
    
    // Gradient Text for the Main Headline
    const gradientText = {
        background: `linear-gradient(to right, ${accentCyan}, ${accentBlue})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        color: "transparent"
    };

    // The "Glow" behind the hero image
    const glowEffect = {
        position: 'absolute',
        width: '600px',
        height: '600px',
        background: `radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, rgba(3, 7, 18, 0) 70%)`,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0,
        pointerEvents: 'none'
    };

    // Glass Card Style (Bento Grid)
    const bentoCardStyle = {
        backgroundColor: "rgba(17, 24, 39, 0.7)", // Dark grey transparent
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        color: "white",
        height: "100%",
        overflow: "hidden"
    };

    return (
        <div style={{ backgroundColor: bgDark, minHeight: '100vh', color: 'white', fontFamily: 'Inter, sans-serif' }}>
            
            {/* --- 1. NAVBAR (Sticky & Minimal) --- */}
            <Navbar expand="lg" fixed="top" className="py-3" style={{ 
                background: 'rgba(3, 7, 18, 0.8)', 
                backdropFilter: 'blur(10px)', 
                borderBottom: '1px solid rgba(255,255,255,0.05)' 
            }}>
                <Container>
                    <div className="d-flex align-items-center">
                        {/* Logo Icon Placeholder */}
                        <div style={{ width: 24, height: 24, background: accentCyan, borderRadius: 6, marginRight: 10 }}></div>
                        <Navbar.Brand href="#" className="fw-bold text-white tracking-tight">InsureGo</Navbar.Brand>
                    </div>
                    <Navbar.Toggle aria-controls="nav" className="border-0 bg-dark" />
                    <Navbar.Collapse id="nav">
                        <Nav className="mx-auto">
                            <Nav.Link href="#features" className="text-white-50 mx-2 hover-white">Platform</Nav.Link>
                            <Nav.Link href="#security" className="text-white-50 mx-2 hover-white">Security</Nav.Link>
                            <Nav.Link href="#pricing" className="text-white-50 mx-2 hover-white">For Doctors</Nav.Link>
                        </Nav>
                        <div className="d-flex gap-3">
                            <Link to="/login">
                                <Button variant="link" className="text-white text-decoration-none fw-semibold">Log in</Button>
                            </Link>
                            <Link to="/register">
                                <Button className="px-4 rounded-pill fw-bold border-0" 
                                    style={{ background: 'white', color: 'black' }}>
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* --- 2. HERO SECTION --- */}
            <section className="position-relative d-flex align-items-center pt-5" style={{ minHeight: '90vh', overflow: 'hidden' }}>
                {/* Background Glow */}
                <div style={glowEffect}></div>

                <Container className="pt-5 mt-5 position-relative" style={{ zIndex: 1 }}>
                    <div className="text-center mx-auto" style={{ maxWidth: '800px' }}>
                        <Badge bg="dark" className="border border-secondary text-info mb-3 px-3 py-2 rounded-pill fw-normal">
                            ✨ V1.0 is now live
                        </Badge>
                        <h1 className="display-3 fw-bold mb-4" style={{ letterSpacing: '-2px', lineHeight: '1.1' }}>
                            The modern standard for <br />
                            <span style={gradientText}>insurance management.</span>
                        </h1>
                        <p className="lead text-secondary mb-5 px-5" style={{ fontSize: '1.25rem' }}>
                            Stop juggling paper cards and confusing portals. InsureGo unifies your claims, policies, and provider network into one beautiful dashboard.
                        </p>
                        
                        <div className="d-flex justify-content-center gap-3 mb-5">
                            <Link to="/register">
                                <Button size="lg" className="px-5 py-3 rounded-pill fw-bold border-0 shadow-lg" 
                                    style={{ background: accentCyan, color: '#000' }}>
                                    Get Started Free
                                </Button>
                            </Link>
                            <Button variant="outline-secondary" size="lg" className="px-5 py-3 rounded-pill fw-bold text-white border-secondary">
                                View Demo
                            </Button>
                        </div>
                    </div>

                    {/* --- ABSTRACT DASHBOARD MOCKUP --- */}
                    {/* This represents the "Product" without needing a real screenshot yet */}
                    <div className="mx-auto mt-5 p-2 rounded-4" 
                        style={{ 
                            maxWidth: '1000px', 
                            background: 'linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                        <div className="rounded-3 overflow-hidden shadow-lg position-relative" style={{ background: '#0f172a', aspectRatio: '16/9' }}>
                            {/* Fake UI Header */}
                            <div className="d-flex align-items-center px-4 py-3 border-bottom border-secondary" style={{ background: '#1e293b' }}>
                                <div className="d-flex gap-2">
                                    <div className="rounded-circle bg-danger" style={{width: 10, height: 10}}></div>
                                    <div className="rounded-circle bg-warning" style={{width: 10, height: 10}}></div>
                                    <div className="rounded-circle bg-success" style={{width: 10, height: 10}}></div>
                                </div>
                                <div className="mx-auto text-secondary small bg-dark px-3 py-1 rounded">insurego.com/dashboard</div>
                            </div>
                            
                            {/* Fake UI Body (The Grid) */}
                            <Row className="p-4 h-100">
                                <Col md={3} className="d-none d-md-block border-end border-secondary p-3">
                                    <div className="mb-3 bg-secondary opacity-25 rounded" style={{height: 20, width: '60%'}}></div>
                                    <div className="mb-2 bg-secondary opacity-25 rounded" style={{height: 10, width: '80%'}}></div>
                                    <div className="mb-2 bg-secondary opacity-25 rounded" style={{height: 10, width: '70%'}}></div>
                                </Col>
                                <Col md={9} className="p-3">
                                    <div className="d-flex justify-content-between mb-4">
                                        <div className="bg-secondary opacity-25 rounded" style={{height: 30, width: '200px'}}></div>
                                        <div className="bg-primary rounded" style={{height: 30, width: '100px'}}></div>
                                    </div>
                                    <Row className="g-3">
                                        <Col md={4}><div className="bg-secondary opacity-10 rounded h-100" style={{minHeight: 100}}></div></Col>
                                        <Col md={4}><div className="bg-secondary opacity-10 rounded h-100" style={{minHeight: 100}}></div></Col>
                                        <Col md={4}><div className="bg-secondary opacity-10 rounded h-100" style={{minHeight: 100}}></div></Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Container>
            </section>

            {/* --- 3. BENTO GRID SECTION (Features) --- */}
            <Container className="py-5 my-5">
                <div className="text-center mb-5">
                    <h6 style={{ color: accentCyan }} className="fw-bold uppercase ls-2">POWERFUL FEATURES</h6>
                    <h2 className="fw-bold display-5">Everything managed in one place.</h2>
                </div>

                <Row className="g-4">
                    {/* Large Card - Left */}
                    <Col lg={7}>
                        <Card className="p-4" style={bentoCardStyle}>
                            <Card.Body>
                                <Badge bg="primary" className="mb-3">Core</Badge>
                                <h3 className="fw-bold">Universal Insurance Card</h3>
                                <p className="text-secondary">
                                    Never lose your physical card again. Upload once, and access a verified digital copy instantly from any device. Securely shareable with doctors via QR code.
                                </p>
                                {/* Abstract Visual */}
                                <div className="mt-4 p-3 rounded" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid #334155' }}>
                                    <div className="d-flex align-items-center gap-3">
                                        <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#3b82f6' }}></div>
                                        <div>
                                            <div style={{ width: 120, height: 10, background: '#475569', borderRadius: 4, marginBottom: 8 }}></div>
                                            <div style={{ width: 80, height: 10, background: '#334155', borderRadius: 4 }}></div>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Small Card - Top Right */}
                    <Col lg={5}>
                        <Card className="p-4" style={bentoCardStyle}>
                            <Card.Body>
                                <div className="display-4 mb-3">⚡</div>
                                <h4 className="fw-bold">Instant Claims</h4>
                                <p className="text-secondary">
                                    File a claim in under 30 seconds. Our system auto-fills provider data and tracks approval status in real-time.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Small Card - Bottom Left */}
                    <Col lg={5}>
                        <Card className="p-4" style={bentoCardStyle}>
                            <Card.Body>
                                <div className="display-4 mb-3">🔒</div>
                                <h4 className="fw-bold">Bank-Grade Security</h4>
                                <p className="text-secondary">
                                    Your health data is encrypted with AES-256. We use Multi-Factor Authentication (OTP) to ensure only you access your records.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Large Card - Bottom Right */}
                    <Col lg={7}>
                         <Card className="p-4" style={bentoCardStyle}>
                            <Card.Body>
                                <Badge bg="info" className="mb-3 text-dark">Beta</Badge>
                                <h3 className="fw-bold">Provider Network</h3>
                                <p className="text-secondary">
                                    Search for specialists within your insurance network. Filter by rating, distance, and availability. Direct booking integration coming soon.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* --- 4. SOCIAL PROOF / TRUST --- */}
            <div className="py-5 border-top border-secondary border-opacity-10 text-center">
                <Container>
                    <p className="text-secondary fw-bold small uppercase mb-4" style={{ letterSpacing: '2px' }}>Trusted by innovative healthcare teams</p>
                    <Row className="justify-content-center align-items-center opacity-50 grayscale gap-5">
                         {/* Text placeholders for Logos to keep it code-only */}
                        <Col xs="auto"><h4 className="fw-bold m-0 text-white">ACME Health</h4></Col>
                        <Col xs="auto"><h4 className="fw-bold m-0 text-white">MediCare+</h4></Col>
                        <Col xs="auto"><h4 className="fw-bold m-0 text-white">GlobalInsure</h4></Col>
                        <Col xs="auto"><h4 className="fw-bold m-0 text-white">TechClinic</h4></Col>
                    </Row>
                </Container>
            </div>

            {/* --- 5. CTA FOOTER --- */}
            <div className="py-5 text-center mt-5" style={{ background: 'linear-gradient(to top, rgba(34, 211, 238, 0.05), transparent)' }}>
                <Container>
                    <h2 className="display-5 fw-bold mb-4">Ready to simplify your healthcare?</h2>
                    <Link to="/register">
                        <Button size="lg" className="px-5 py-3 rounded-pill fw-bold border-0" 
                            style={{ background: 'white', color: 'black' }}>
                            Start Now - It's Free
                        </Button>
                    </Link>
                    <p className="mt-3 text-secondary small">No credit card required for patient accounts.</p>
                </Container>
            </div>

        </div>
    );
};

export default LandingPage;