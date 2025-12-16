import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Alert, Navbar } from 'react-bootstrap'; 
import { Shield, LogOut, FileText, Calendar, Clock, UserCheck, Search, Check, Upload, X, Loader, Users, BarChart, RefreshCw, Star, TrendingUp } from 'lucide-react'; 
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, Tooltip, Legend } from 'recharts'; 
import api from '../services/api'; 

// --- MOCK CHART DATA ---
const mockApptStatusData = [
    { name: 'Completed', value: 65, color: '#34d399' }, 
    { name: 'Confirmed', value: 20, color: '#3b82f6' }, 
    { name: 'Rescheduled', value: 10, color: '#facc15' }, 
    { name: 'Canceled', value: 5, color: '#f87171' }, 
];
const mockMonthlyVisits = [
    { name: 'Oct', Visits: 18 },
    { name: 'Nov', Visits: 24 },
    { name: 'Dec', Visits: 35 },
    { name: 'Jan', Visits: 29 },
];
const mockRatingData = [
    { rating: 5, count: 45, color: '#facc15' },
    { rating: 4, count: 12, color: '#34d399' },
    { rating: 3, count: 5, color: '#f97316' },
    { rating: 2, count: 2, color: '#ef4444' },
    { rating: 1, count: 1, color: '#dc2626' },
];

const ButtonTeal = ({ children, onClick, disabled, className = '', type = 'button' }) => (
    <button
        type={type} 
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${disabled ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-primary text-white hover:bg-blue-600'} ${className}`}
        style={{ background: disabled ? '#94a3b8' : 'var(--primary)', color: 'white' }} 
    >
        {children}
    </button>
);

const SidebarButton = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`text-start w-100 py-3 d-flex align-items-center gap-3 fw-bold border-0 ${active ? 'bg-primary text-white' : 'bg-light text-secondary hover:bg-gray-100'}`}
        style={{borderRadius: '10px', transition: 'background-color 0.2s', paddingLeft: '1rem', paddingRight: '1rem'}}
    >
        <Icon size={20} style={{color: active ? 'white' : 'var(--accent)'}}/>
        {label}
    </button>
);

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const storedDoctorId = localStorage.getItem('userId');
    const storedDoctorName = localStorage.getItem('userName') || "Doctor";
    
    // --- STATE MANAGEMENT ---
    const [activeModule, setActiveModule] = useState('schedule'); 
    const [loading, setLoading] = useState(true); 
    const [appointments, setAppointments] = useState([]);
    
    // Claim Processing State
    const [policyNo, setPolicyNo] = useState('');
    const [verifiedPatient, setVerifiedPatient] = useState(null);
    const [insuranceProviderName, setInsuranceProviderName] = useState(null); // <-- NEW: Store Provider Name
    const [billData, setBillData] = useState({ amount: '', description: '', diagnosisCode: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [claimMsg, setClaimMsg] = useState({ text: '', type: '' });

    // --- LOAD DATA ---
    useEffect(() => {
        if (!storedDoctorId) { navigate('/login'); return; }
        loadSchedule();
    }, [storedDoctorId, navigate]);
    
    // --- NEW: Function to handle sidebar click and optionally pass policyNo ---
    const handleSidebarClick = (module, policyId = '') => {
        setActiveModule(module);
        if (module === 'claimProcessor') {
            setPolicyNo(policyId);
            setVerifiedPatient(null);
            setInsuranceProviderName(null); // Clear provider name when changing module
            setClaimMsg({ text: '', type: '' }); 
        }
    };

    const loadSchedule = async () => {
        setLoading(true);
        try {
            const apptRes = await api.getDoctorSchedule(storedDoctorId); 
            setAppointments(apptRes.data);
        } catch (e) { 
            console.error("Dashboard Load Error (API Call Failed):", e); 
            setClaimMsg({ text: '❌ Failed to load schedule. Check backend services and JWT token.', type: 'danger' });
            setAppointments([]);
        }
        setLoading(false);
    };

    // --- HANDLERS (CRITICAL FIXES APPLIED HERE) ---
    const handleVerify = async () => {
        setLoading(true); setClaimMsg({ text: '', type: '' });
        try {
            const res = await api.verifyPolicy(policyNo); 
            const policyDetails = res.data; 
            
            setVerifiedPatient(policyDetails);
            // --- FIX 1: SAVE THE PROVIDER NAME FROM THE POLICY RESPONSE ---
            // Assuming the field is named 'insuranceProviderName' or 'companyName' in the Policy Service response
            setInsuranceProviderName(policyDetails.insuranceProviderName || policyDetails.companyName); 
            // -----------------------------------------------------------------
            setClaimMsg({ text: '✅ Policy Verified: Ready to process claim.', type: 'success' });
        } catch (e) { 
            console.error("Policy Verification Failed on Backend:", e);
            setInsuranceProviderName(null); 
            setVerifiedPatient(null); 
            setClaimMsg({ text: '❌ Policy Not Found or Expired. Check API Gateway/Service.', type: 'danger' }); 
        }
        setLoading(false);
    };

    // --- FIX 2: Updated handleSubmitClaim to send insuranceProviderName ---
    const handleSubmitClaim = async (e) => {
        e.preventDefault(); 
        if (!verifiedPatient) { alert("Please verify the patient policy first."); return; }
        if (!insuranceProviderName) { alert("Cannot submit: Insurance Provider name is missing."); return; } // Safety check
        
        setLoading(true);
        setClaimMsg({ text: 'Sending claim for automated validation...', type: 'warning' });

        try {
            const payload = {
                policyNo: policyNo, 
                totalBillAmount: parseFloat(billData.amount),
                treatmentDescription: billData.description,
                diagnosisCode: billData.diagnosisCode,
                // --- FIX 2B: INCLUDE THE INSURANCE PROVIDER NAME IN THE PAYLOAD ---
                insuranceProvider: insuranceProviderName, 
                // ------------------------------------------------------------------
            };

            await api.submitClaim(payload); 
            
            // Simulating success feedback based on backend logic
            setClaimMsg({ text: `Claim for Policy ${policyNo} submitted to Rule Engine!`, type: 'success' });
            
            // Reset form states
            setPolicyNo(''); setVerifiedPatient(null); setInsuranceProviderName(null); setBillData({ amount: '', description: '' }); 
            
        } catch (e) { 
            console.error("Claim Submission Error:", e);
            setClaimMsg({ text: 'Error Submitting Claim. Check Gateway/Service.', type: 'danger' }); 
        }
        setLoading(false);
    };

    const handleCompleteAppt = async (id) => {
        if(!window.confirm("Mark appointment as Completed?")) return;
        await api.updateAppointmentStatus(id, "COMPLETED");
        loadSchedule(); 
    };

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    const getStatusBadge = (status) => {
        const base = "px-3 py-1 rounded-full text-xs font-bold ";
        if (status === 'COMPLETED') return <span className={base + "bg-green-500 text-white"}>COMPLETED</span>;
        if (status === 'CONFIRMED') return <span className={base + "bg-blue-500 text-white"}>CONFIRMED</span>;
        if (status === 'RESCHEDULED') return <span className={base + "bg-yellow-500 text-slate-800"}>RESCHEDULED</span>;
        return <span className={base + "bg-gray-500 text-white"}>NEW</span>;
    };
    
    // --- CONTENT RENDERERS ---

    const renderSchedule = () => (
        <>
            <h4 className="mb-4 text-primary fw-bold d-flex justify-content-between">
                <div><Calendar size={20} className="inline mr-2" />Today's Appointments</div>
                <ButtonTeal onClick={loadSchedule} className="d-flex align-items-center gap-1">
                    <RefreshCw size={16} /> Refresh
                </ButtonTeal>
            </h4>
            {loading ? (
                <div className="text-center py-5">
                    <Loader size={40} className="animate-spin text-primary" /> 
                    <p className="mt-3 text-secondary">Loading schedule...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {appointments.length === 0 && <Alert variant="info" className="shadow-sm">No appointments scheduled for today.</Alert>}
                    
                    {appointments.map(appt => (
                        <div key={appt.appointmentId} className="p-4 rounded-xl bg-white shadow-lg border-l-4" style={{ borderColor: appt.status === 'COMPLETED' ? 'var(--accent)' : 'var(--primary)' }}>
                            <div className="d-flex justify-content-between items-center mb-2">
                                {/* NOTE: Patient Name will be displayed here, fetched via Visit Service */}
                                <h5 className="font-bold text-lg" style={{ color: 'var(--primary)' }}>{appt.patientName || 'Patient Name Missing'}</h5>
                                {getStatusBadge(appt.status)}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-1">
                                <FileText size={14} className="inline mr-1" /> Policy: <strong>{appt.insurancePolicyId || 'N/A'}</strong>
                            </p>
                            
                            <p className="text-sm text-gray-600 mb-1">
                                <Clock size={14} className="inline mr-1" /> {appt.appointmentTime} on {appt.appointmentDate}
                            </p>
                            
                            <p className="text-sm italic mb-3">Reason: {appt.ailmentReason}</p>
                            
                            <div className="d-flex justify-content-end gap-2">
                                <ButtonTeal 
                                    onClick={() => handleSidebarClick('claimProcessor', appt.insurancePolicyId)}
                                    disabled={!appt.insurancePolicyId || appt.insurancePolicyId === 'SELF-PAY'}
                                    className="bg-secondary text-white hover:bg-gray-600"
                                    style={{ background: 'var(--secondary)' }}
                                >
                                    <FileText size={16} /> Claim
                                </ButtonTeal>
                                
                                {appt.status !== 'COMPLETED' && (
                                    <ButtonTeal onClick={() => handleCompleteAppt(appt.appointmentId)}>
                                        Mark as Complete
                                    </ButtonTeal>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );

    const renderClaimProcessor = () => (
        <>
            <h4 className="mb-4 text-primary fw-bold"><FileText size={20} className="inline mr-2" />Digital Claim Submission Console</h4>
            
            <div className="p-4 rounded-2xl shadow-md" style={{ background: 'var(--bg-light)' }}>
                
                {/* ALERT/MESSAGE AREA */}
                {claimMsg.text && (
                    <div className={`p-3 mb-4 rounded-lg font-medium ${claimMsg.type === 'danger' ? 'bg-red-100 text-red-700 border border-red-300' : claimMsg.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-blue-100 text-blue-700 border border-blue-300'}`} role="alert">
                        {claimMsg.type === 'success' ? <Check size={18} className="inline mr-2" /> : claimMsg.type === 'danger' ? <X size={18} className="inline mr-2" /> : null}
                        {claimMsg.text}
                    </div>
                )}

                {/* STEP 1: VERIFY POLICY */}
                <div className="mb-5 pb-4 border-bottom">
                    <h5 className="font-bold mb-3" style={{ color: 'var(--primary)' }}>1. Verify Patient Policy</h5>
                    <div className="d-flex gap-3">
                        <input
                            type="text"
                            placeholder="Enter Policy ID / Card Number"
                            value={policyNo}
                            onChange={e => setPolicyNo(e.target.value)}
                            className="form-control p-3 flex-grow"
                            disabled={loading || verifiedPatient}
                        />
                        <ButtonTeal onClick={handleVerify} disabled={loading || verifiedPatient}>
                            <Search size={16} className="inline mr-1" /> Search
                        </ButtonTeal>
                    </div>
                    {verifiedPatient && (
                        <div className="mt-3 p-3 rounded-lg border border-success bg-white text-success d-flex items-center gap-2">
                            <UserCheck size={20} />
                            <span>Policy **{verifiedPatient.policyNumber}** is **ACTIVE** for **{verifiedPatient.patientName}** (Provider: {insuranceProviderName || 'N/A'}).</span>
                        </div>
                    )}
                    
                    {!verifiedPatient && policyNo && (
                        <Alert variant="warning" className="mt-3 small">
                            Policy ID `{policyNo}` loaded. Click Search to verify with the Insurance Service.
                        </Alert>
                    )}

                </div>

                {/* STEP 2: SUBMIT CLAIM DETAILS */}
                <form onSubmit={handleSubmitClaim}>
                    <h5 className="font-bold mb-3" style={{ color: 'var(--primary)' }}>2. Submit Medical Details</h5>

                    <Row className="g-3 mb-4">
                        <Col md={6}>
                            <label className="form-label small font-weight-bold mb-1">Total Bill Amount ($)</label>
                            <input 
                                type="number" 
                                required 
                                value={billData.amount} 
                                onChange={e => setBillData({...billData, amount: e.target.value})} 
                                className="form-control p-3"
                                disabled={!verifiedPatient || loading}
                            />
                        </Col>
                        <Col md={6}>
                            <label className="form-label small font-weight-bold mb-1">Diagnosis Code (e.g., ICD-10)</label>
                            <input 
                                type="text" 
                                value={billData.diagnosisCode} 
                                onChange={e => setBillData({...billData, diagnosisCode: e.target.value})} 
                                className="form-control p-3"
                                placeholder="G44.1, S06.0, etc."
                                disabled={!verifiedPatient || loading}
                            />
                        </Col>
                    </Row>
                    
                    <div className="mb-4">
                        <label className="form-label small font-weight-bold mb-1">Treatment Description / Notes</label>
                        <textarea
                            rows="3"
                            required 
                            value={billData.description} 
                            onChange={e => setBillData({...billData, description: e.target.value})} 
                            className="form-control p-3 resize-none"
                            disabled={!verifiedPatient || loading}
                        />
                    </div>

                    {/* FINAL SUBMIT */}
                    <ButtonTeal type="submit" className="w-100 py-3 text-lg" disabled={!verifiedPatient || loading}>
                        {loading ? "Processing..." : "Submit Claim for Validation"}
                    </ButtonTeal>
                </form>
            </div>
        </>
    );
    
    // --- ANALYTICS RENDERER (Unchanged) ---
    const renderAnalytics = () => (
        <>
            <h4 className="mb-4 text-primary fw-bold"><BarChart size={20} className="inline mr-2" />Practice Analytics & Reviews</h4>
            
            <Row className="g-4 mb-4">
                <Col md={6}>
                    <Card className="shadow-sm p-3 h-100" style={{borderRadius: '12px'}}>
                        <Card.Title className="fw-bold text-dark fs-6 mb-2">Monthly Patient Visits</Card.Title>
                        <div style={{ width: '100%', height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart data={mockMonthlyVisits} margin={{ top: 10, right: 10, left: -5, bottom: 5 }}>
                                    <XAxis dataKey="name" stroke="#64748b" />
                                    <Tooltip />
                                    <Legend iconSize={10} verticalAlign="top"/>
                                    <Bar dataKey="Visits" fill="#3b82f6" />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="shadow-sm p-3 h-100" style={{borderRadius: '12px'}}>
                        <Card.Title className="fw-bold text-dark fs-6 mb-2">Review Distribution</Card.Title>
                        <div style={{ width: '100%', height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart data={mockRatingData} margin={{ top: 10, right: 10, left: -5, bottom: 5 }}>
                                    <XAxis dataKey="rating" stroke="#64748b" label={{ value: 'Stars', position: 'bottom', offset: 0, fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="count">
                                        {mockRatingData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                <Col md={12}>
                    <Card className="shadow-sm p-3 h-100" style={{borderRadius: '12px'}}>
                        <Card.Title className="fw-bold text-dark fs-6 mb-2">Appointment Status Overview</Card.Title>
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                                    <Pie
                                        data={mockApptStatusData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="40%" 
                                        cy="50%"
                                        outerRadius={80} 
                                        fill="#8884d8"
                                        label
                                    >
                                        {mockApptStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Alert variant="secondary" className="mt-4 small">
                These charts currently use mock data. Integrate `api.getDoctorStats(doctorId)` to display real-time metrics.
            </Alert>
        </>
    );

    
    // Function to decide which content to display
    const renderContent = () => {
        if (loading && activeModule === 'schedule') return (
            <div className="text-center py-5">
                <Loader size={40} className="animate-spin text-primary" /> 
                <p className="mt-3 text-secondary">Loading schedule...</p>
            </div>
        );
        
        switch (activeModule) {
            case 'schedule':
                return renderSchedule();
            case 'claimProcessor':
                return renderClaimProcessor();
            case 'analytics':
                return renderAnalytics(); 
            default:
                return renderSchedule();
        }
    };

    // --- MAIN RENDER ---
    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-light)' }}>
            
            {/* --- NAVBAR --- */}
            <Navbar className="shadow-sm px-4 justify-content-between sticky-top" style={{background: 'var(--primary)'}}>
                <Navbar.Brand className="text-white fw-bold">
                    <Shield size={24} className="me-2" style={{color: 'var(--accent)'}}/>
                    InsureGo Doctor Console
                </Navbar.Brand>
                <div className="d-flex gap-3 align-items-center">
                    <span className="text-white-50">Hello, **Dr. {storedDoctorName}**</span>
                    <ButtonTeal onClick={handleLogout} className="flex items-center gap-1 bg-white" style={{color: 'var(--primary)'}}>
                        <LogOut size={16} /> Logout
                    </ButtonTeal>
                </div>
            </Navbar>

            <Container fluid className="py-4" style={{minHeight: 'calc(100vh - 56px)'}}>
                <Row>
                    {/* --- SIDEBAR --- */}
                    <Col lg={3}>
                        <Card className="shadow-lg border-0" style={{borderRadius: '16px'}}>
                            <Card.Header className="fw-bold text-center border-0 py-3" style={{background: 'var(--bg-light)'}}>
                                Doctor Navigation
                            </Card.Header>
                            <div className="d-grid gap-2 p-3">
                                <SidebarButton 
                                    icon={Calendar} 
                                    label="My Schedule" 
                                    active={activeModule === 'schedule'}
                                    onClick={() => handleSidebarClick('schedule')}
                                />
                                <SidebarButton 
                                    icon={FileText} 
                                    label="Claim Processor" 
                                    active={activeModule === 'claimProcessor'}
                                    onClick={() => handleSidebarClick('claimProcessor')}
                                />
                                <SidebarButton 
                                    icon={BarChart} 
                                    label="Practice Analytics" 
                                    active={activeModule === 'analytics'}
                                    onClick={() => handleSidebarClick('analytics')}
                                />
                            </div>
                        </Card>
                    </Col>

                    {/* --- MAIN CONTENT AREA --- */}
                    <Col lg={9}>
                        <Card className="shadow-lg border-0 p-4" style={{borderRadius: '16px'}}>
                            <Card.Body>
                                {renderContent()}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default DoctorDashboard;