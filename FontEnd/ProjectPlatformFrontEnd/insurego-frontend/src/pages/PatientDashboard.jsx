import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button, Modal, Table, Navbar, Form } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
// Lucide icons for visual consistency with the new UI
import { Calendar, Upload, RefreshCw, BarChart2, Shield, LogOut, FileText, X, Check, Search, DollarSign, Edit, Clock, User, TrendingUp } from 'lucide-react'; 
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts'; 
import api from '../services/api'; 

// --- MOCK CHART DATA (Replace with actual API calls later) ---
const mockClaimsData = [
    { name: 'Approved', value: 85, color: '#2dd4bf' }, // Teal
    { name: 'Pending', value: 10, color: '#facc15' }, // Yellow
    { name: 'Rejected', value: 5, color: '#ef4444' }, // Red
];
const mockAppointmentsData = [
    { name: 'Attended', count: 12, color: '#3b82f6' }, // Blue
    { name: 'Missed', count: 2, color: '#f43f5e' },   // Rose
    { name: 'Canceled', count: 3, color: '#94a3b8' },  // Slate
];

const PatientDashboard = () => {
    const navigate = useNavigate();
    const storedId = localStorage.getItem('userId');
    const storedName = localStorage.getItem('userName'); // CRITICAL: Retrieving name here
    const currentUserId = storedId ? parseInt(storedId) : null;

    // --- STATE MANAGEMENT ---
    const [activeModule, setActiveModule] = useState('policies'); 
    const [loading, setLoading] = useState(true);
    
    // Data States
    const [policies, setPolicies] = useState([]);
    const [claims, setClaims] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]); 
    
    // Modal & Form States
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [showApptModal, setShowApptModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [selectedApptId, setSelectedApptId] = useState(null);
    const [modalMode, setModalMode] = useState('BOOK'); 
    const [apptForm, setApptForm] = useState({ doctorId: '', date: '', time: '', reason: '' });
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '', doctorId: '', doctorName: '' });
    
    // Upload/Manual Form State
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadProvider, setUploadProvider] = useState('');
    const [manualPolicyNumber, setManualPolicyNumber] = useState(''); 
    const [manualProvider, setManualProvider] = useState(''); 

    // --- LOAD DATA ---
    useEffect(() => {
        if (!currentUserId) { navigate('/login'); return; }
        loadData();
    }, [currentUserId, navigate]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [pRes, cRes, aRes, dRes] = await Promise.all([
                api.getPolicies(),
                api.getMyClaims(currentUserId),
                api.getMyAppointments(currentUserId),
                api.getDoctors()
            ]);
            setPolicies(pRes.data);
            setClaims(cRes.data);
            setAppointments(aRes.data);
            setDoctors(dRes.data); 
        } catch (e) { 
            console.error(e); 
            setPolicies([]); setClaims([]); setAppointments([]); setDoctors([]);
        }
        setLoading(false);
    };

    // ... (Policy & Claim Logic remains unchanged) ...
    const getDaysRemaining = (expiryDateStr) => {
        if (!expiryDateStr) return 0;
        const today = new Date();
        const expiry = new Date(expiryDateStr);
        const diffTime = expiry - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    };

    const handleRenew = async (policyNo) => {
        if(!window.confirm("Renew this policy for 1 year? (Cost: $500)")) return;
        try {
            await api.renewPolicy(policyNo);
            alert("Success! Policy extended for 1 year.");
            loadData(); 
        } catch (e) {
            alert("Renewal failed.");
        }
    };

    const handleInitiateClaim = async () => {
        try {
            const payload = {
                userId: currentUserId,
                policyNo: selectedPolicy.policyNumber,
                insuranceProvider: selectedPolicy.provider, 
                status: "OPEN"
            };
            await api.initiateClaim(payload);
            setShowClaimModal(false);
            alert(`Claim Initiated for ${selectedPolicy.provider}! Please visit your doctor.`);
            loadData();
        } catch (e) {
            console.error(e);
            alert("Failed to initiate claim.");
        }
    };

    const handleSubmitUploadCard = async (e) => {
        e.preventDefault();
        if (!uploadFile) {
            alert("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('userId', currentUserId);

        try {
            // Note: This API call needs to be created in api.js and routed to Document Service
            // await api.uploadNewPolicyCard(formData); 
            
            // Simulating success
            alert(`Policy card submitted. Data extraction and validation is running...`);
            
            setUploadFile(null);
            loadData(); 
            setActiveModule('policies');
        } catch (e) {
            alert("Failed to upload policy document.");
        }
    };

    const handleSubmitManualEntry = async (e) => {
        e.preventDefault();
        if (!manualPolicyNumber || !manualProvider) {
            alert("Please enter both the Policy Number and the Provider Name.");
            return;
        }

        try {
            const payload = {
                policyNumber: manualPolicyNumber,
                provider: manualProvider,
                userId: currentUserId
            };
            
            // Note: This API call needs to be created in api.js and routed to Policy Service
            // await api.submitManualPolicy(payload);

            // Simulating success
            alert(`Manual Policy entry (${manualPolicyNumber}) submitted for validation.`);
            
            setManualPolicyNumber('');
            setManualProvider('');
            
            loadData(); 
            setActiveModule('policies');
        } catch (e) {
            alert("Failed to submit manual policy entry.");
        }
    };

    // --- APPOINTMENT & REVIEW LOGIC (FIX APPLIED HERE) ---
    const openBookingModal = () => {
        setModalMode('BOOK');
        setApptForm({ doctorId: '', date: '', time: '', reason: '' });
        setShowApptModal(true);
    };

    const openRescheduleModal = (appt) => {
        setModalMode('RESCHEDULE');
        setSelectedApptId(appt.appointmentId);
        setApptForm({ 
            doctorId: appt.doctorID, // Pre-select existing doctor
            date: appt.appointmentDate, 
            time: appt.appointmentTime ? appt.appointmentTime.substring(0, 5) : '', 
            reason: appt.ailmentReason 
        });
        setShowApptModal(true);
    };

    // *** CRITICAL FIX: Ensure patientName is sent in ALL appointment payloads ***
    const handleApptSubmit = async (e) => {
        e.preventDefault();
        try {
            const selectedDoc = doctors.find(d => d.id === parseInt(apptForm.doctorId));
            if (!selectedDoc) { alert("Please select a valid doctor."); return; }

            const basePayload = {
                patientId: currentUserId,
                // FIX: This ensures the patient's name is sent from the frontend 
                // for both new booking and reschedule operations.
                patientName: storedName || "User", 
                doctorID: selectedDoc.id,     
                doctorName: selectedDoc.name, 
                appointmentDate: apptForm.date,           
                appointmentTime: apptForm.time + ":00",   
                ailmentReason: apptForm.reason,          
                ailmentType: "General",                   
            };
            
            if (modalMode === 'BOOK') {
                const bookingPayload = {
                    ...basePayload,
                    status: "CONFIRMED"
                };
                await api.bookAppointment(bookingPayload);
                alert(`Appointment Booked with ${selectedDoc.name}!`);
                
            } else { // RESCHEDULE mode
                const reschedulePayload = {
                    ...basePayload,
                    appointmentId: selectedApptId, // Must include ID for update endpoint
                    status: "RESCHEDULED"
                };
                // NOTE: The backend /reschedule/{id} endpoint expects the full updated object
                await api.rescheduleAppointment(selectedApptId, reschedulePayload);
                alert(`Appointment Rescheduled Successfully!`);
            }

            setShowApptModal(false);
            loadData(); 
        } catch (error) {
            console.error(`Appointment submission failed in ${modalMode} mode:`, error);
            alert(`Failed to ${modalMode === 'BOOK' ? 'book' : 'reschedule'} appointment. Check network or server status.`);
        }
    };
    
    // ... (Review Logic and Logout remains unchanged) ...
    const openReviewModal = (appt) => {
        setReviewData({ rating: 5, comment: '', doctorId: appt.doctorID, doctorName: appt.doctorName });
        setShowReviewModal(true);
    };

    const submitReview = async () => {
        try {
            const payload = {
                ...reviewData,
                patientId: currentUserId,
                patientName: storedName
            };
            await api.submitReview(payload);
            alert("Review Submitted! Thank you.");
            setShowReviewModal(false);
        } catch (e) {
            alert("Failed to submit review.");
        }
    };

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    // ... (Renderers remain unchanged) ...
    // --- CHART CONTENT RENDERERS ---
    
    const renderAnalytics = () => {
        const primaryPolicy = policies[0]; // Focus on the first policy
        
        return (
            <>
                <h4 className="mb-4 text-primary fw-bold">My Health & Financial Overview</h4>
                <Row className="mb-4">
                    {/* CARD 1: EXPIRY DATE (Policy Expiry Visual) */}
                    <Col md={4} className="mb-3">
                        <Card className="shadow-sm h-100 p-3 text-center" style={{borderRadius: '12px', borderLeft: primaryPolicy && getDaysRemaining(primaryPolicy.expiryDate) < 60 ? '4px solid #ef4444' : '4px solid var(--accent)'}}>
                            <Shield size={28} className="mx-auto" style={{color: 'var(--primary)'}} />
                            <Card.Title className="mt-2 fw-bold text-dark fs-5">Policy Status</Card.Title>
                            {primaryPolicy ? (
                                <>
                                    <p className="mb-1 small text-muted">{primaryPolicy.provider} ({primaryPolicy.policyNumber})</p>
                                    <p className="fs-6 fw-bold" style={{color: getDaysRemaining(primaryPolicy.expiryDate) < 60 ? '#ef4444' : 'var(--accent)'}}>
                                        Expires in: {getDaysRemaining(primaryPolicy.expiryDate)} Days
                                    </p>
                                </>
                            ) : (
                                <p className="text-danger fw-bold">No Active Policy Found</p>
                            )}
                        </Card>
                    </Col>
                    
                    {/* CARD 2: APPOINTMENT ATTENDANCE (Bar Chart) */}
                    <Col md={4} className="mb-3">
                        <Card className="shadow-sm h-100 p-3" style={{borderRadius: '12px'}}>
                            <Card.Title className="fw-bold text-dark fs-5 mb-0 d-flex justify-content-between">
                                Appointment Attendance
                                <User size={20} style={{color: 'var(--primary)'}} />
                            </Card.Title>
                            <div style={{ width: '100%', height: 120 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={mockAppointmentsData}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}}/>
                                        <Tooltip />
                                        <Bar dataKey="count">
                                            {mockAppointmentsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>

                    {/* CARD 3: CLAIMS APPROVAL RATE (Pie Chart) */}
                    <Col md={4} className="mb-3">
                        <Card className="shadow-sm h-100 p-3" style={{borderRadius: '12px'}}>
                            <Card.Title className="fw-bold text-dark fs-5 mb-0 d-flex justify-content-between">
                                Claim Approval Rate
                                <TrendingUp size={20} style={{color: 'var(--primary)'}} />
                            </Card.Title>
                            <div style={{ width: '100%', height: 120 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={mockClaimsData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={30}
                                            outerRadius={50}
                                            paddingAngle={1}
                                            dataKey="value"
                                            labelLine={false}
                                        >
                                            {mockClaimsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>
                </Row>
                <Alert variant="secondary" className="small">
                    **Note:** These charts use mock data. Connect these visualizations to your respective Microservices (VISIT, CLAIM, POLICY) to display real-time patient data.
                </Alert>
            </>
        );
    };

    const renderPolicies = () => (
        <>
            <h4 className="mb-4 text-primary fw-bold">My Policies & Renewal Status</h4>
            <Row>
                {policies.length === 0 ? <Alert variant="info">No active policies found. Please use the "Upload Card" or "Manual Entry" module to register one.</Alert> : (
                    policies.map(p => {
                        const daysLeft = getDaysRemaining(p.expiryDate);
                        const isExpiring = daysLeft < 30 && daysLeft > 0;
                        const isExpired = daysLeft <= 0;

                        return (
                            <Col md={6} key={p.id} className="mb-4">
                                <Card className={`shadow-sm h-100 ${isExpired ? 'border-danger border-2' : ''}`} style={{borderRadius: '12px'}}>
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5 className="fw-bold text-dark">{p.provider}</h5>
                                            {isExpired ? <Badge bg="danger">EXPIRED</Badge> : 
                                            isExpiring ? <Badge bg="warning" text="dark">EXPIRING ({daysLeft} days)</Badge> : 
                                            <Badge bg="success">ACTIVE</Badge>}
                                        </div>
                                        <p className="text-muted mb-2 small">Policy ID: {p.policyNumber}</p>
                                        <p className="small">Expires: <strong>{p.expiryDate}</strong></p>

                                        <div className="d-flex gap-2 mt-3 pt-3 border-top">
                                            {/* File Claim Button */}
                                            {!isExpired && (
                                                <Button variant="outline-primary" size="sm" className="w-100" onClick={() => { setSelectedPolicy(p); setShowClaimModal(true); }}>
                                                    <FileText size={16} className="me-1"/> File Claim
                                                </Button>
                                            )}
                                            {/* Renew Button (Maps to Renew Card in sidebar) */}
                                            {(isExpiring || isExpired) && (
                                                <Button variant="success" size="sm" className="w-100" onClick={() => handleRenew(p.policyNumber)}>
                                                    <RefreshCw size={16} className="me-1"/> Renew Policy
                                                </Button>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })
                )}
            </Row>
        </>
    );

    const renderAppointments = () => (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-primary fw-bold">My Appointments</h4>
                <Button variant="success" onClick={openBookingModal}>+ Book New</Button>
            </div>
            
            <Row>
                {appointments.length === 0 ? <Alert variant="light" className="border">No upcoming appointments.</Alert> : (
                    appointments.map((appt) => (
                        <Col md={6} key={appt.appointmentId} className="mb-4">
                            <Card className="shadow-sm h-100" style={{borderRadius: '12px', borderLeft: appt.status === 'COMPLETED' ? '4px solid #2dd4bf' : '4px solid #3b82f6'}}>
                                <Card.Body>
                                    <div className="d-flex justify-content-between mb-2">
                                        {/* Name will show correctly now due to backend fixes */}
                                        <h5 className="fw-bold text-dark">{appt.doctorName}</h5>
                                        <Badge bg={appt.status === 'COMPLETED' ? 'success' : 'info'}>{appt.status || 'CONFIRMED'}</Badge>
                                    </div>
                                    <h6 className="text-muted mb-3 small">
                                        {appt.appointmentDate} at {appt.appointmentTime}
                                    </h6>
                                    <Card.Text className="text-muted small">
                                        Reason: {appt.ailmentReason || 'General Checkup'}
                                    </Card.Text>
                                    
                                    <div className="d-flex gap-2 mt-3 pt-3 border-top">
                                        {appt.status !== 'COMPLETED' && (
                                            <Button variant="outline-warning" size="sm" className="w-100" onClick={() => openRescheduleModal(appt)}>
                                                Reschedule
                                            </Button>
                                        )}
                                        {appt.status === 'COMPLETED' && (
                                            <Button variant="outline-primary" size="sm" className="w-100" onClick={() => openReviewModal(appt)}>
                                                Rate Doctor
                                            </Button>
                                        )}
                                    </div>

                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>
        </>
    );

    const renderClaims = () => (
        <>
            <h4 className="mb-4 text-primary fw-bold">My Claims History</h4>
            <Table hover responsive className="bg-white shadow-sm" style={{borderRadius: '12px', overflow: 'hidden'}}>
                <thead className="bg-light">
                    <tr>
                        <th>Date</th>
                        <th>Provider</th>
                        <th>Policy</th>
                        <th>Status</th>
                        <th>Total Bill</th>
                        <th>Insure Pays</th>
                    </tr>
                </thead>
                <tbody>
                    {claims.map(c => (
                        <tr key={c.claimId}>
                            <td>{c.dateFiled}</td>
                            <td>{c.insuranceProvider || '-'}</td>
                            <td>{c.policyNo}</td>
                            <td><Badge bg={c.status === 'APPROVED' ? 'success' : c.status==='OPEN' ? 'info' : 'warning'}>{c.status}</Badge></td>
                            <td>${c.totalBillAmount || 0}</td>
                            <td className="text-success fw-bold">${c.insurancePays || 0}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );
    
    // --- RENDERER FOR UPLOAD CARD (File Only) ---
    const renderUploadCard = () => (
        <>
            <h4 className="mb-4 text-primary fw-bold">Upload Policy Card (OCR Scan)</h4>
            <Card className="shadow-sm p-4" style={{borderRadius: '12px'}}>
                <Alert variant="info">
                    Upload your physical card image or PDF. We will use OCR technology to extract the policy number and expiry date automatically.
                </Alert>
                <Form onSubmit={handleSubmitUploadCard}>
                    <Form.Group controlId="formFile" className="mb-4">
                        <Form.Label>Upload Card Image/PDF</Form.Label>
                        <Form.Control 
                            type="file" 
                            required 
                            onChange={(e) => setUploadFile(e.target.files[0])}
                        />
                    </Form.Group>
                    
                    <Button variant="primary" type="submit" className="w-100 d-flex align-items-center justify-content-center gap-2">
                        <Upload size={20}/> Upload & Scan Policy
                    </Button>
                </Form>
            </Card>
        </>
    );

    // --- RENDERER FOR MANUAL ENTRY (Manual Fields Only) ---
    const renderManualEntry = () => (
        <>
            <h4 className="mb-4 text-primary fw-bold">Manual Policy Entry</h4>
            <Card className="shadow-sm p-4" style={{borderRadius: '12px'}}>
                <Alert variant="warning">
                    Please ensure all details are correct. Manual entries may take longer for verification.
                </Alert>
                <Form onSubmit={handleSubmitManualEntry}>
                    
                    {/* 1. Policy Number Field */}
                    <Form.Group className="mb-3">
                        <Form.Label>Policy Number</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Enter the full policy number (e.g., ABC12345)" 
                            required 
                            value={manualPolicyNumber}
                            onChange={(e) => setManualPolicyNumber(e.target.value)}
                        />
                    </Form.Group>

                    {/* 2. Provider Name */}
                    <Form.Group className="mb-3">
                        <Form.Label>Insurance Provider Name</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="e.g., Blue Cross, LIC" 
                            required 
                            value={manualProvider}
                            onChange={(e) => setManualProvider(e.target.value)}
                        />
                    </Form.Group>
                    
                    <Button variant="primary" type="submit" className="w-100 d-flex align-items-center justify-content-center gap-2">
                        <Edit size={20}/> Submit Manual Entry
                    </Button>
                </Form>
            </Card>
        </>
    );

    // Function to decide which content to display
    const renderContent = () => {
        if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /> <p className="mt-2">Loading Dashboard Data...</p></div>;
        
        switch (activeModule) {
            case 'policies':
                return renderPolicies();
            case 'appointments':
                return renderAppointments();
            case 'claims':
                return renderClaims();
            case 'upload':
                return renderUploadCard();
            case 'manual': 
                return renderManualEntry();
            case 'analytics': // NEW CASE
                return renderAnalytics();
            default:
                return renderPolicies();
        }
    };

    // --- MAIN RENDER ---
    return (
        <>
            <Navbar className="shadow-sm px-4 justify-content-between" style={{background: 'var(--primary)'}}>
                <Navbar.Brand className="text-white fw-bold">
                    <Shield size={24} className="me-2" style={{color: 'var(--accent)'}}/>
                    InsureGo Patient Portal
                </Navbar.Brand>
                <div className="d-flex gap-3 align-items-center">
                    <span className="text-white-50">Hello, {storedName}</span>
                    <Button size="sm" variant="outline-light" onClick={handleLogout}>
                        <LogOut size={16} className="me-1"/> Logout
                    </Button>
                </div>
            </Navbar>

            <Container fluid className="py-4" style={{minHeight: 'calc(100vh - 56px)'}}>
                <Row>
                    {/* --- SIDEBAR (Sibeberts) --- */}
                    <Col lg={3}>
                        <Card className="shadow-lg border-0" style={{borderRadius: '16px'}}>
                            <Card.Header className="fw-bold text-center border-0 py-3" style={{background: 'var(--bg-light)'}}>
                                Patient Navigation
                            </Card.Header>
                            <div className="d-grid gap-2 p-3">
                                <SidebarButton 
                                    icon={BarChart2} 
                                    label="My Policies / Renew" 
                                    active={activeModule === 'policies'}
                                    onClick={() => setActiveModule('policies')}
                                />
                                <SidebarButton 
                                    icon={Calendar} 
                                    label="My Appointments" 
                                    active={activeModule === 'appointments'}
                                    onClick={() => setActiveModule('appointments')}
                                />
                                <SidebarButton 
                                    icon={FileText} 
                                    label="Track Claims" 
                                    active={activeModule === 'claims'}
                                    onClick={() => setActiveModule('claims')}
                                />
                                <SidebarButton 
                                    icon={TrendingUp} // Changed icon to represent charts
                                    label="My Analytics" 
                                    active={activeModule === 'analytics'}
                                    onClick={() => setActiveModule('analytics')}
                                />
                                <hr className="my-2"/> 
                                <SidebarButton 
                                    icon={Upload} 
                                    label="Upload Card (OCR)" 
                                    active={activeModule === 'upload'}
                                    onClick={() => setActiveModule('upload')}
                                />
                                <SidebarButton 
                                    icon={Edit}
                                    label="Manual Entry" 
                                    active={activeModule === 'manual'}
                                    onClick={() => setActiveModule('manual')}
                                />
                            </div>
                        </Card>
                    </Col>

                    {/* --- MAIN CONTENT AREA (Content Area) --- */}
                    <Col lg={9}>
                        <Card className="shadow-lg border-0 p-4" style={{borderRadius: '16px'}}>
                            <Card.Body>
                                {renderContent()}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* --- MODALS (KEEPING Original Modal Logic) --- */}
            {/* MODAL 1: INITIATE CLAIM */}
            <Modal show={showClaimModal} onHide={() => setShowClaimModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Initiate Claim</Modal.Title></Modal.Header>
                <Modal.Body>
                    <p>You are about to open a claim for Policy: <strong>{selectedPolicy?.policyNumber}</strong></p>
                    <p>Provider: <strong>{selectedPolicy?.provider}</strong></p>
                    <Alert variant="warning" className="small">
                        Status will be "OPEN". Please visit your doctor and provide this policy number so they can upload the bill.
                    </Alert>
                    <Button variant="primary" className="w-100" onClick={handleInitiateClaim}>Confirm & Initiate</Button>
                </Modal.Body>
            </Modal>

            {/* MODAL 2: BOOK / RESCHEDULE APPOINTMENT */}
            <Modal show={showApptModal} onHide={() => setShowApptModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{modalMode === 'BOOK' ? 'Book Appointment' : 'Reschedule Appointment'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleApptSubmit}>
                        {/* --- VISUAL CONFIRMATION FIX --- */}
                        <Form.Group className="mb-3">
                            <Form.Label>Booking Name (From Profile)</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={storedName || "User"} // Display the name from localStorage
                                readOnly 
                                disabled 
                                style={{ backgroundColor: '#f5f5f5', color: 'var(--primary)', fontWeight: 'bold' }}
                            />
                        </Form.Group>
                        {/* ----------------------------------- */}
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Select Doctor</Form.Label>
                            <Form.Select 
                                value={apptForm.doctorId}
                                onChange={e => setApptForm({...apptForm, doctorId: e.target.value})} 
                                required
                            >
                                <option value="">-- Choose a Specialist --</option>
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>
                                        {doc.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Date</Form.Label>
                                    <Form.Control type="date" required
                                        value={apptForm.date}
                                        onChange={e => setApptForm({...apptForm, date: e.target.value})} />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Time</Form.Label>
                                    <Form.Control type="time" required
                                        value={apptForm.time}
                                        onChange={e => setApptForm({...apptForm, time: e.target.value})} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Reason</Form.Label>
                            <Form.Control as="textarea" rows={2} placeholder="Brief reason for visit..."
                                value={apptForm.reason}
                                onChange={e => setApptForm({...apptForm, reason: e.target.value})} />
                        </Form.Group>
                        <Button variant={modalMode === 'BOOK' ? 'primary' : 'warning'} type="submit" className="w-100">
                            {modalMode === 'BOOK' ? 'Confirm Booking' : 'Confirm Reschedule'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* MODAL 3: REVIEW MODAL */}
            <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Rate Dr. {reviewData.doctorName}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <div className="d-flex gap-2 justify-content-center mb-3">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Button 
                                key={star} 
                                variant={reviewData.rating >= star ? "warning" : "outline-secondary"}
                                onClick={() => setReviewData({...reviewData, rating: star})}
                                size="sm"
                            >
                                ★
                            </Button>
                        ))}
                    </div>
                    <Form.Group className="mb-3">
                        <Form.Control 
                            as="textarea" rows={3} 
                            placeholder="How was your experience?"
                            value={reviewData.comment}
                            onChange={e => setReviewData({...reviewData, comment: e.target.value})}
                        />
                    </Form.Group>
                    <Button variant="primary" className="w-100" onClick={submitReview}>Submit Review</Button>
                </Modal.Body>
            </Modal>
        </>
    );
};

// --- CUSTOM SIDEBAR BUTTON COMPONENT ---
const SidebarButton = ({ icon: Icon, label, active, onClick }) => (
    <Button
        variant={active ? 'primary' : 'light'}
        onClick={onClick}
        className={`text-start w-100 py-3 d-flex align-items-center gap-3 fw-bold ${active ? 'text-white' : 'text-secondary'}`}
        style={{borderRadius: '10px'}}
    >
        <Icon size={20} style={{color: active ? 'white' : 'var(--accent)'}}/>
        {label}
    </Button>
);

export default PatientDashboard;