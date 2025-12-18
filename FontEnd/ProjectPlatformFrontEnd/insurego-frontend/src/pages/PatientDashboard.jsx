import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button, Modal, Table, Navbar, Form, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Calendar, Upload, RefreshCw, BarChart2, Shield, ShieldPlus, LogOut, FileText, Search, Edit, TrendingUp, DollarSign, PlusCircle, Download, ShoppingCart, CheckCircle, Info, Trash2, Zap, AlertTriangle, Activity } from 'lucide-react'; 
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'; 
import api from '../services/api'; 
import Tesseract from 'tesseract.js';
import { jsPDF } from 'jspdf';

const VALID_PROVIDERS = ["LIC", "Star", "Bajaj"];

const PatientDashboard = () => {
    const navigate = useNavigate();
    const storedId = localStorage.getItem('userId');
    const storedName = localStorage.getItem('userName'); 
    const currentUserId = storedId ? parseInt(storedId) : null;

    const [activeModule, setActiveModule] = useState('policies'); 
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    
    // Data
    const [policies, setPolicies] = useState([]);      
    const [availablePlans, setAvailablePlans] = useState([]); 
    const [claims, setClaims] = useState([]); 
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]); 
    const [expiringPolicies, setExpiringPolicies] = useState([]); 
    
    // Bill View State
    const [showBillModal, setShowBillModal] = useState(false);
    const [selectedClaimBill, setSelectedClaimBill] = useState(null);

    // UI State
    const [ocrScanning, setOcrScanning] = useState(false);
    const [scannedData, setScannedData] = useState(null);
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [showApptModal, setShowApptModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showBuyModal, setShowBuyModal] = useState(false);
    
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [modalMode, setModalMode] = useState('BOOK'); 
    
    const [apptForm, setApptForm] = useState({ 
        doctorId: '', 
        date: '', 
        time: '', 
        reason: '', 
        appointmentType: 'General Checkup', 
        paymentMode: 'SELF-PAY', 
        policyId: '' 
    });
    
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '', doctorId: '', doctorName: '' });
    
    // Manual Entry Form State
    const [isEditingPolicy, setIsEditingPolicy] = useState(null); 
    const [manualPolicyNumber, setManualPolicyNumber] = useState(''); 
    const [manualProvider, setManualProvider] = useState(VALID_PROVIDERS[0]); 
    const [manualPolicyName, setManualPolicyName] = useState(''); 
    const [manualPatientName, setManualPatientName] = useState(storedName || ''); 
    const [manualStartDate, setManualStartDate] = useState('');
    const [manualExpiryDate, setManualExpiryDate] = useState('');

    useEffect(() => {
        if (!currentUserId) { navigate('/login'); return; }
        loadData();
    }, [currentUserId, navigate]);

    // --- 🎨 VISUAL STYLES ---
    const bgStyle = {
        background: 'radial-gradient(circle at 10% 20%, rgb(239, 246, 255) 0%, rgb(219, 228, 255) 90%)', 
        minHeight: '100vh',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        paddingBottom: '2rem'
    };

    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.85)', 
        backdropFilter: 'blur(12px)',             
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '16px',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)'
    };

    const loadData = async () => {
        setLoading(true);
        setErrorMsg('');
        
        try { 
            const allRes = await api.getAllPolicies(); 
            const allData = allRes.data || [];

            const myWallet = allData.filter(p => {
                const idMatch = (p.userId || p.user_id) == currentUserId;
                const nameMatch = p.patientName && storedName && 
                                  p.patientName.trim().toLowerCase() === storedName.trim().toLowerCase();
                return idMatch || nameMatch;
            });

            setPolicies(myWallet);

            const today = new Date();
            const expiring = myWallet.filter(p => {
                if(!p.expiryDate) return false;
                const exp = new Date(p.expiryDate);
                const diffTime = exp - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays > 0 && diffDays <= 60; 
            });
            setExpiringPolicies(expiring);

            try {
                const plansRes = await api.getMarketplacePlans();
                setAvailablePlans(plansRes.data);
            } catch (e) {
                setAvailablePlans(allData.filter(p => !p.userId && !p.user_id));
            }
            
            await api.getMyClaims(currentUserId).then(r => setClaims(r.data)).catch(e => setClaims([])); 
            await api.getMyAppointments(currentUserId).then(r => setAppointments(r.data)).catch(e => setAppointments([])); 
            await api.getDoctors().then(r => setDoctors(r.data)).catch(e => setDoctors([])); 

        } catch(e){ console.error(e); setErrorMsg("Could not load data."); }
        setLoading(false);
    };

    const handleViewBill = (claim) => { setSelectedClaimBill(claim); setShowBillModal(true); };
    const openReviewModal = (appt) => { setReviewData({ doctorId: appt.doctorID || appt.doctorId, doctorName: appt.doctorName, rating: 5, comment: '' }); setShowReviewModal(true); };
    const submitReview = async () => {
        if (!reviewData.comment) { alert("Please write a short comment."); return; }
        try { await api.submitReview({ doctorId: reviewData.doctorId, patientName: storedName, rating: reviewData.rating, comment: reviewData.comment, date: new Date().toISOString().split('T')[0] }); alert("Review Submitted! Thank you."); setShowReviewModal(false); } catch (e) { console.error(e); alert("Failed to submit review."); }
    };
    const handleRenew = async (policyNo) => { if(!window.confirm("Renew this policy for 1 year?")) return; try { await api.renewPolicy(policyNo); alert("Policy Renewed Successfully!"); loadData(); } catch(e){ alert("Renewal Failed."); } };
    const handleTopUp = async () => { if(window.prompt("Enter Top-up Amount:", "50000")) { alert("Success! Wallet coverage updated."); loadData(); } };
    const downloadPolicyCard = (policy) => { const doc = new jsPDF(); doc.setFillColor(63, 81, 181); doc.rect(10, 10, 190, 100, "F"); doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.text("InsureGo Health Card", 20, 30); doc.setFontSize(16); doc.text(`Provider: ${policy.insuranceProvider || policy.provider}`, 20, 50); doc.text(`Policy No: ${policy.policyNumber}`, 20, 60); doc.text(`Limit: $${policy.coverageAmount}`, 20, 70); doc.setFontSize(12); doc.text(`Patient: ${policy.patientName || storedName}`, 20, 90); doc.text(`Valid Until: ${policy.expiryDate}`, 120, 90); doc.save(`Policy_${policy.policyNumber}.pdf`); };
    const handleOpenBuyModal = (plan) => { setSelectedPlan(plan); setShowBuyModal(true); };
    const handleConfirmPurchase = async () => { if (!selectedPlan) return; try { await api.purchasePolicy({ userId: currentUserId, patientName: storedName, planId: selectedPlan.id }); alert(`🎉 Success! You purchased ${selectedPlan.policyName}.`); setShowBuyModal(false); loadData(); setActiveModule('policies'); } catch (e) { alert("Transaction Failed."); } };
    const handleOCRUpload = (e) => { const file = e.target.files[0]; if (!file) return; setOcrScanning(true); Tesseract.recognize(file, 'eng').then(({ data: { text } }) => { setScannedData(text); setOcrScanning(false); alert("Scan Complete!"); setActiveModule('manual'); }); };
    const handleSubmitManualEntry = async (e) => { e.preventDefault(); try { const payload = { userId: currentUserId, policyNumber: manualPolicyNumber, insuranceProvider: manualProvider, policyName: manualPolicyName, patientName: manualPatientName, registeredDate: manualStartDate, expiryDate: manualExpiryDate, coverageAmount: 500000 }; if (isEditingPolicy) { await api.updatePolicy(isEditingPolicy, payload); alert("Policy Updated!"); } else { await api.addPolicy(payload); alert("Policy Linked!"); } resetManualForm(); loadData(); } catch (e) { alert("Operation Failed."); } };
    const resetManualForm = () => { setIsEditingPolicy(null); setManualPolicyNumber(''); setManualPolicyName(''); setManualStartDate(''); setManualExpiryDate(''); };
    const handleEditPolicyClick = (policy) => { setIsEditingPolicy(policy.id); setManualPolicyNumber(policy.policyNumber); setManualProvider(policy.insuranceProvider || VALID_PROVIDERS[0]); setManualPolicyName(policy.policyName); setManualPatientName(policy.patientName); setManualStartDate(policy.issueDate); setManualExpiryDate(policy.expiryDate); window.scrollTo(0,0); };
    const handleDeletePolicyClick = async (id) => { if(!window.confirm("Unlink this policy?")) return; try { await api.deletePolicy(id); alert("Policy Removed"); loadData(); } catch(e) { alert("Failed"); } };
    const handleInitiateClaim = async () => { try { await api.initiateClaim({ userId: currentUserId, policyNo: selectedPolicy.policyNumber, insuranceProvider: selectedPolicy.insuranceProvider, status: "OPEN" }); setShowClaimModal(false); alert("Claim Initiated!"); loadData(); } catch (e) { alert("Failed."); } };

    const handleApptSubmit = async (e) => { 
        e.preventDefault(); 
        const selectedDoc = doctors.find(doc => String(doc.id) === String(apptForm.doctorId));
        const payload = {
            patientId: currentUserId,
            patientName: storedName,
            doctorID: parseInt(apptForm.doctorId),
            doctorName: selectedDoc ? selectedDoc.name : "Unknown",
            appointmentDate: apptForm.date,
            appointmentTime: apptForm.time,
            ailmentReason: apptForm.reason, 
            reason: apptForm.reason,        
            appointmentType: apptForm.appointmentType, 
            appointment_type: apptForm.appointmentType, 
            paymentMode: apptForm.paymentMode, 
            payment_mode: apptForm.paymentMode, 
            insurancePolicyId: apptForm.paymentMode === 'INSURANCE' ? apptForm.policyId : 'SELF-PAY',
            status: "CONFIRMED"
        };
        try {
            await api.bookAppointment(payload);
            alert("Success! Appointment booked.");
            setShowApptModal(false);
            setApptForm({ doctorId: '', date: '', time: '', reason: '', paymentMode: 'SELF-PAY', policyId: '', appointmentType: 'General Checkup' });
            loadData(); 
        } catch (err) {
            console.error(err);
            alert("Failed to book appointment.");
        }
    }; 

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    const renderPolicies = () => (
        <>
            <h4 className="mb-4 text-primary fw-bold">My Coverage Wallet</h4>
            {expiringPolicies.length > 0 && (<Alert variant="warning" className="d-flex align-items-center mb-4"><AlertTriangle size={24} className="me-3"/><div><strong>Action Required:</strong> {expiringPolicies.length} policy is expiring soon.<Button variant="link" className="p-0 ms-2" onClick={() => handleRenew(expiringPolicies[0].policyNumber)}>Renew Now</Button></div></Alert>)}
            <Row>
                {policies.length === 0 ? <Alert variant="info">No active policies found.</Alert> : policies.map(p => (
                    <Col md={6} key={p.id} className="mb-4">
                        <Card className="shadow-sm h-100 border-0" style={{borderRadius: '16px', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'}}>
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-center mb-2"><h5 className="fw-bold text-dark">{p.insuranceProvider || p.provider}</h5><Badge bg="success">ACTIVE</Badge></div>
                                <p className="text-primary fw-bold mb-1">{p.policyName}</p><p className="text-muted mb-3 small">ID: {p.policyNumber}</p>
                                <div className="bg-light p-2 rounded mb-3"><div className="d-flex justify-content-between small fw-bold text-secondary"><span>Coverage</span> <span className="text-success">${p.coverageAmount ? p.coverageAmount.toLocaleString() : '500,000'}</span></div>{p.premium && <div className="d-flex justify-content-between small fw-bold text-muted mt-1"><span>Premium</span> <span>${p.premium}/mo</span></div>}</div>
                                <div className="d-grid gap-2 mt-3 pt-3 border-top">
                                    <div className="d-flex gap-2"><Button variant="outline-primary" size="sm" className="flex-grow-1" onClick={() => handleRenew(p.policyNumber)}><RefreshCw size={14}/> Renew</Button><Button variant="outline-success" size="sm" className="flex-grow-1" onClick={handleTopUp}><Zap size={14}/> Top-up</Button></div>
                                    <div className="d-flex gap-2"><Button variant="outline-dark" size="sm" className="flex-grow-1" onClick={() => downloadPolicyCard(p)}><Download size={14}/> Card</Button><Button variant="primary" size="sm" className="flex-grow-1" onClick={() => { setSelectedPolicy(p); setShowClaimModal(true); }}>Claim</Button></div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </>
    );

    const renderClaims = () => (
        <>
            <h4 className="mb-4 text-primary fw-bold">My Claims & Hospital Bills</h4>
            <Table hover responsive className="bg-white shadow-sm" style={{borderRadius: '12px', overflow: 'hidden'}}>
                <thead className="bg-light"><tr><th>Date</th><th>Provider</th><th>Status</th><th>Bill Amount</th><th>Action</th></tr></thead>
                <tbody>
                    {claims.map(c => (
                        <tr key={c.claimId}><td>{c.dateFiled}</td><td className="fw-bold">{c.insuranceProvider}</td><td><Badge bg={c.status === 'APPROVED' ? 'success' : c.status==='OPEN' ? 'info' : 'warning'}>{c.status}</Badge></td><td>${c.totalBillAmount || 0}</td><td><Button variant="outline-primary" size="sm" onClick={() => handleViewBill(c)}><FileText size={14} className="me-1"/> View Bill</Button></td></tr>
                    ))}
                </tbody>
            </Table>
        </>
    );

    const renderManualEntry = () => ( 
        <Container>
            <Card className="shadow-sm p-4 mb-4" style={{borderRadius: '12px'}}>
                <div className="d-flex justify-content-between"><h4 className="mb-4 text-primary fw-bold">{isEditingPolicy ? "Edit Policy Details" : "Link Policy Details"}</h4>{isEditingPolicy && <Button size="sm" variant="outline-secondary" onClick={resetManualForm}>Cancel Edit</Button>}</div>
                {scannedData && <Alert variant="success">✨ Data auto-filled! Verify below.</Alert>}
                <Form onSubmit={handleSubmitManualEntry}>
                    <Row>
                        <Col md={6} className="mb-3"><Form.Label>Provider</Form.Label><Form.Select value={manualProvider} onChange={e=>setManualProvider(e.target.value)}>{VALID_PROVIDERS.map(p=><option key={p} value={p}>{p}</option>)}</Form.Select></Col>
                        <Col md={6} className="mb-3"><Form.Label>Plan Name</Form.Label><Form.Control value={manualPolicyName} onChange={e=>setManualPolicyName(e.target.value)} required placeholder="e.g. Gold Plan"/></Col>
                        <Col md={6} className="mb-3"><Form.Label>Policy Number</Form.Label><Form.Control value={manualPolicyNumber} onChange={e=>setManualPolicyNumber(e.target.value)} required/></Col>
                        <Col md={6} className="mb-3"><Form.Label>Patient Name</Form.Label><Form.Control value={manualPatientName} onChange={e=>setManualPatientName(e.target.value)} required/></Col>
                        <Col md={6} className="mb-3"><Form.Label>Start Date</Form.Label><Form.Control type="date" value={manualStartDate} onChange={e=>setManualStartDate(e.target.value)} required/></Col>
                        <Col md={6} className="mb-3"><Form.Label>Expiry Date</Form.Label><Form.Control type="date" value={manualExpiryDate} onChange={e=>setManualExpiryDate(e.target.value)} required/></Col>
                    </Row>
                    <Button type="submit" variant={isEditingPolicy ? "warning" : "primary"} className="w-100">{isEditingPolicy ? "Update Policy" : "Link Policy"}</Button>
                </Form>
            </Card>
            <h5 className="fw-bold text-secondary mb-3">Manage Linked Policies</h5>
            <Table hover responsive className="bg-white shadow-sm rounded">
                <thead><tr><th>Policy No</th><th>Name</th><th>Provider</th><th>Action</th></tr></thead>
                <tbody>
                    {policies.map(p => (
                        <tr key={p.id}><td>{p.policyNumber}</td><td>{p.policyName}</td><td><Badge bg="info">{p.insuranceProvider || "N/A"}</Badge></td><td><Button variant="link" size="sm" className="p-0 me-3" onClick={() => handleEditPolicyClick(p)}><Edit size={16} className="text-primary"/></Button><Button variant="link" size="sm" className="p-0" onClick={() => handleDeletePolicyClick(p.id)}><Trash2 size={16} className="text-danger"/></Button></td></tr>
                    ))}
                    {policies.length === 0 && <tr><td colSpan="4" className="text-center text-muted">No policies linked yet.</td></tr>}
                </tbody>
            </Table>
        </Container>
    );

    // 🟢 UPDATED MARKETPLACE: Shows Benefits & Coverage
    const renderMarketplace = () => (
        <>
            <h4 className="mb-4 text-primary fw-bold">Available Plans</h4>
            <Row>
                {availablePlans.map(plan => (
                    <Col md={4} key={plan.id} className="mb-4">
                        <Card className="shadow-sm h-100 border-0" style={{borderRadius: '16px', overflow: 'hidden'}}>
                            <div className="p-3 bg-primary text-white text-center">
                                <Shield size={32} className="mb-2"/>
                                <h5 className="fw-bold mb-0">{plan.policyName || plan.name}</h5>
                                <Badge bg="light" text="dark" className="mt-2">{plan.insuranceProvider || plan.provider}</Badge>
                            </div>
                            <Card.Body className="d-flex flex-column p-4">
                                <h2 className="text-center fw-bold text-success mb-3">${plan.premium || 500}<span className="fs-6 text-muted fw-normal">/mo</span></h2>
                                <div className="mb-3 text-center p-2 bg-light rounded">
                                    <span className="text-muted small fw-bold text-uppercase d-block mb-1">Coverage Limit</span>
                                    <span className="fw-bold fs-5">${plan.coverageAmount ? plan.coverageAmount.toLocaleString() : "500,000"}</span>
                                </div>
                                {plan.benefits && (
                                    <div className="mb-4">
                                        <p className="small text-muted fw-bold mb-2 text-uppercase">Key Benefits</p>
                                        <ul className="list-unstyled small mb-0">
                                            {plan.benefits.split(',').slice(0, 4).map((benefit, idx) => (
                                                <li key={idx} className="mb-2 d-flex align-items-start text-secondary">
                                                    <CheckCircle size={14} className="text-success me-2 mt-1 flex-shrink-0"/>
                                                    {benefit.trim()}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <Button variant="outline-primary" className="w-100 mt-auto fw-bold" onClick={() => handleOpenBuyModal(plan)}>
                                    <ShoppingCart size={18} className="me-2"/> Purchase Plan
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </>
    );

    const renderOCR = () => ( <Card className="shadow-sm p-4 text-center"><h4 className="fw-bold text-primary mb-3">Scan Policy Card (AI)</h4><div className="border border-2 border-dashed p-5 rounded bg-light mb-3"><Upload size={40} className="text-muted mb-3"/><h6>Upload your physical Insurance Card</h6><Form.Control type="file" accept="image/*" onChange={handleOCRUpload} disabled={ocrScanning}/></div>{ocrScanning && <ProgressBar animated now={ocrScanning ? 90 : 0} />}</Card> );
    const renderAppointments = () => ( <><div className="d-flex justify-content-between align-items-center mb-4"><h4 className="text-primary fw-bold">My Appointments</h4><Button variant="success" onClick={() => { setModalMode('BOOK'); setApptForm({ doctorId: '', date: '', time: '', reason: '', paymentMode: 'SELF-PAY', policyId: '' }); setShowApptModal(true); }}>+ Book New</Button></div><Row>{appointments.length === 0 ? <Alert variant="light" className="border">No upcoming appointments.</Alert> : appointments.map((appt) => (<Col md={6} key={appt.appointmentId} className="mb-4"><Card className="shadow-sm h-100" style={{borderRadius: '12px', borderLeft: appt.status === 'COMPLETED' ? '4px solid #2dd4bf' : '4px solid #3b82f6'}}><Card.Body><div className="d-flex justify-content-between mb-2"><h5 className="fw-bold text-dark">{appt.doctorName}</h5><Badge bg={appt.status === 'COMPLETED' ? 'success' : 'info'}>{appt.status || 'CONFIRMED'}</Badge></div><h6 className="text-muted mb-3 small">{appt.appointmentDate} at {appt.appointmentTime}</h6><div className="small text-muted mb-2"><strong>Reason:</strong> {appt.reason}</div><div className="d-flex gap-2 mt-3 pt-3 border-top">{appt.status === 'COMPLETED' ? (<Button variant="outline-warning" size="sm" className="w-100" onClick={() => openReviewModal(appt)}><div className="d-flex align-items-center justify-content-center gap-2"><CheckCircle size={16}/> Rate Doctor</div></Button>) : (<Button variant="outline-secondary" size="sm" className="w-100" disabled>Scheduled</Button>)}</div></Card.Body></Card></Col>))}</Row></> );

    const renderAnalytics = () => {
        const totalClaimsValue = claims.reduce((sum, c) => sum + (parseFloat(c.totalBillAmount) || 0), 0);
        const totalCovered = claims.reduce((sum, c) => sum + (parseFloat(c.insurancePays) || 0), 0);
        const patientPaid = totalClaimsValue - totalCovered;
        const financialData = claims.map(c => ({ name: c.dateFiled, Covered: parseFloat(c.insurancePays) || 0, YouPaid: (parseFloat(c.totalBillAmount) || 0) - (parseFloat(c.insurancePays) || 0) }));
        const statusCounts = [ { name: 'Approved', value: claims.filter(c => c.status === 'APPROVED').length, color: '#10b981' }, { name: 'Pending', value: claims.filter(c => ['PENDING', 'OPEN', 'PENDING_APPROVAL'].includes(c.status)).length, color: '#f59e0b' }, { name: 'Rejected', value: claims.filter(c => c.status === 'REJECTED').length, color: '#ef4444' } ].filter(d => d.value > 0);

        return (
            <>
                <h4 className="mb-4 text-primary fw-bold">Health & Financial Analytics</h4>
                <Row className="mb-4 g-3">
                    <Col md={4}><Card className="shadow-sm border-0 h-100 p-3" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 100%)', borderLeft: '5px solid #0ea5e9' }}><div className="d-flex align-items-center"><div className="p-3 rounded-circle bg-white shadow-sm me-3"><Activity size={24} className="text-primary"/></div><div><p className="text-muted small mb-0 text-uppercase fw-bold">Total Bill Value</p><h3 className="fw-bold text-dark mb-0">${totalClaimsValue.toLocaleString()}</h3></div></div></Card></Col>
                    <Col md={4}><Card className="shadow-sm border-0 h-100 p-3" style={{ background: 'linear-gradient(135deg, #dcfce7 0%, #ffffff 100%)', borderLeft: '5px solid #22c55e' }}><div className="d-flex align-items-center"><div className="p-3 rounded-circle bg-white shadow-sm me-3"><Shield size={24} className="text-success"/></div><div><p className="text-muted small mb-0 text-uppercase fw-bold">Insurance Covered</p><h3 className="fw-bold text-success mb-0">${totalCovered.toLocaleString()}</h3></div></div></Card></Col>
                    <Col md={4}><Card className="shadow-sm border-0 h-100 p-3" style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #ffffff 100%)', borderLeft: '5px solid #ef4444' }}><div className="d-flex align-items-center"><div className="p-3 rounded-circle bg-white shadow-sm me-3"><DollarSign size={24} className="text-danger"/></div><div><p className="text-muted small mb-0 text-uppercase fw-bold">Your Cost</p><h3 className="fw-bold text-danger mb-0">${patientPaid.toLocaleString()}</h3></div></div></Card></Col>
                </Row>
                <Row>
                    <Col lg={7} className="mb-4"><Card className="shadow-sm border-0 p-4 h-100"><h6 className="fw-bold mb-4">Coverage vs. Out-of-Pocket (Per Claim)</h6>{financialData.length > 0 ? (<ResponsiveContainer width="100%" height={300}><BarChart data={financialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{fontSize: 12}} /><YAxis /><Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/><Legend /><Bar dataKey="Covered" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} /><Bar dataKey="YouPaid" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>) : (<div className="text-center py-5 text-muted">No financial data available yet.</div>)}</Card></Col>
                    <Col lg={5} className="mb-4"><Card className="shadow-sm border-0 p-4 h-100"><h6 className="fw-bold mb-4">Claim Outcome Distribution</h6>{statusCounts.length > 0 ? (<div style={{ width: '100%', height: 300 }}><ResponsiveContainer><PieChart><Pie data={statusCounts} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{statusCounts.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" height={36}/></PieChart></ResponsiveContainer></div>) : (<div className="text-center py-5 text-muted">No claims filed yet.</div>)}</Card></Col>
                </Row>
            </>
        );
    };

    const renderContent = () => {
        if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
        switch (activeModule) {
            case 'policies': return renderPolicies();
            case 'marketplace': return renderMarketplace(); 
            case 'upload': return renderOCR(); 
            case 'manual': return renderManualEntry();
            case 'appointments': return renderAppointments();
            case 'claims': return renderClaims();
            case 'analytics': return renderAnalytics();
            default: return renderPolicies();
        }
    };

    return (
        <div style={bgStyle}>
            <Navbar className="shadow-sm px-4 justify-content-between" style={{background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)'}}>
                <Navbar.Brand className="text-primary fw-bold"><Shield size={24} className="me-2"/>InsureGo Patient</Navbar.Brand>
                <div className="d-flex gap-3 align-items-center"><span className="text-secondary fw-bold">Hello, {storedName}</span><Button size="sm" variant="outline-primary" onClick={handleLogout}><LogOut size={16}/> Logout</Button></div>
            </Navbar>
            <Container fluid className="py-4">
                {errorMsg && <Alert variant="danger" className="mb-4">{errorMsg}</Alert>}
                <Row>
                    <Col lg={3}>
                        <Card className="border-0 h-100" style={glassStyle}>
                            <div className="d-grid gap-2 p-3">
                                <Button variant={activeModule==='policies'?'primary':'light'} onClick={()=>setActiveModule('policies')} className="text-start py-3 fw-bold d-flex gap-2"><Shield size={20}/> My Wallet</Button>
                                <Button variant={activeModule==='marketplace'?'primary':'light'} onClick={()=>setActiveModule('marketplace')} className="text-start py-3 fw-bold d-flex gap-2"><ShoppingCart size={20}/> Buy Policy</Button>
                                <Button variant={activeModule==='upload'?'primary':'light'} onClick={()=>setActiveModule('upload')} className="text-start py-3 fw-bold d-flex gap-2"><Upload size={20}/> Scan Card (OCR)</Button>
                                <Button variant={activeModule==='manual'?'primary':'light'} onClick={()=>setActiveModule('manual')} className="text-start py-3 fw-bold d-flex gap-2"><Edit size={20}/> Link Manually</Button>
                                <hr className="my-1"/>
                                <Button variant={activeModule==='appointments'?'primary':'light'} onClick={()=>setActiveModule('appointments')} className="text-start py-3 fw-bold d-flex gap-2"><Calendar size={20}/> Appointments</Button>
                                <Button variant={activeModule==='claims'?'primary':'light'} onClick={()=>setActiveModule('claims')} className="text-start py-3 fw-bold d-flex gap-2"><FileText size={20}/> Claims</Button>
                                <Button variant={activeModule==='analytics'?'primary':'light'} onClick={()=>setActiveModule('analytics')} className="text-start py-3 fw-bold d-flex gap-2"><TrendingUp size={20}/> Analytics</Button>
                            </div>
                        </Card>
                    </Col>
                    <Col lg={9}><Card className="border-0 p-4 h-100" style={glassStyle}><Card.Body>{renderContent()}</Card.Body></Card></Col>
                </Row>
            </Container>
            
            <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Rate Dr. {reviewData.doctorName}</Modal.Title></Modal.Header>
                <Modal.Body><div className="text-center mb-3"><p className="text-muted small">How was your appointment?</p><div className="d-flex justify-content-center gap-2 mb-3">{[1, 2, 3, 4, 5].map(s => (<Button key={s} size="lg" variant="link" className="p-0 text-decoration-none" onClick={() => setReviewData({...reviewData, rating: s})}><span style={{ fontSize: '2rem', color: reviewData.rating >= s ? '#ffc107' : '#e4e5e9' }}>★</span></Button>))}</div></div><Form.Control as="textarea" rows={3} placeholder="Write a short review..." value={reviewData.comment} onChange={e => setReviewData({...reviewData, comment: e.target.value})} /><Button className="w-100 mt-3" onClick={submitReview}>Submit Review</Button></Modal.Body>
            </Modal>
            <Modal show={showClaimModal} onHide={()=>setShowClaimModal(false)}><Modal.Header closeButton><Modal.Title>Initiate Claim</Modal.Title></Modal.Header><Modal.Body><Button className="w-100" onClick={handleInitiateClaim}>Confirm</Button></Modal.Body></Modal>
            
            {/* 🟢 UPDATED: BOOKING MODAL */}
            <Modal show={showApptModal} onHide={() => setShowApptModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>{modalMode === 'BOOK' ? 'Book Appointment' : 'Reschedule'}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleApptSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Doctor</Form.Label>
                            <Form.Select value={apptForm.doctorId} onChange={e => setApptForm({...apptForm, doctorId: e.target.value})} required>
                                <option value="">-- Select --</option>
                                {doctors.map(doc => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Row>
                            <Col><Form.Control type="date" value={apptForm.date} onChange={e => setApptForm({...apptForm, date: e.target.value})} required /></Col>
                            <Col><Form.Control type="time" value={apptForm.time} onChange={e => setApptForm({...apptForm, time: e.target.value})} required /></Col>
                        </Row>
                        <Form.Group className="mt-3"><Form.Label>Visit Type</Form.Label><Form.Select value={apptForm.appointmentType} onChange={e => setApptForm({...apptForm, appointmentType: e.target.value})}><option value="General Checkup">General Checkup</option><option value="Follow-up">Follow-up</option><option value="Consultation">Consultation</option><option value="Emergency">Emergency</option></Form.Select></Form.Group>
                        <Form.Group className="mt-3"><Form.Label>Payment Method</Form.Label><Form.Select value={apptForm.paymentMode} onChange={e => setApptForm({...apptForm, paymentMode: e.target.value})}><option value="SELF-PAY">Self Pay (Cash/Card)</option><option value="INSURANCE">Insurance</option></Form.Select></Form.Group>
                        {apptForm.paymentMode === 'INSURANCE' && ( <Form.Group className="mt-3"><Form.Label>Select Policy</Form.Label><Form.Select value={apptForm.policyId} onChange={e => setApptForm({...apptForm, policyId: e.target.value})} required={apptForm.paymentMode === 'INSURANCE'}><option value="">-- Select Active Policy --</option>{policies.map(p => (<option key={p.policyNumber} value={p.policyNumber}>{p.insuranceProvider} - {p.policyName}</option>))}</Form.Select></Form.Group> )}
                        <Form.Control className="mt-3" as="textarea" placeholder="Reason for Visit..." value={apptForm.reason} onChange={e => setApptForm({...apptForm, reason: e.target.value})} />
                        <Button type="submit" className="w-100 mt-3">{modalMode === 'BOOK' ? 'Confirm' : 'Update'}</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* 🟢 NEW: Enhanced Buy Modal to show full details */}
            <Modal show={showBuyModal} onHide={() => setShowBuyModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>Review Policy Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedPlan && (
                        <div>
                            <h3 className="fw-bold text-dark mb-1">{selectedPlan.policyName || selectedPlan.name}</h3>
                            <Badge bg="info" className="mb-4">{selectedPlan.insuranceProvider || selectedPlan.provider}</Badge>
                            
                            <Row className="mb-4">
                                <Col md={6}>
                                    <div className="p-3 bg-light rounded h-100 border">
                                        <p className="text-muted small fw-bold text-uppercase mb-1">Monthly Premium</p>
                                        <h2 className="fw-bold text-success mb-0">${selectedPlan.premium}</h2>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="p-3 bg-light rounded h-100 border">
                                        <p className="text-muted small fw-bold text-uppercase mb-1">Total Coverage</p>
                                        <h2 className="fw-bold text-primary mb-0">${selectedPlan.coverageAmount?.toLocaleString()}</h2>
                                    </div>
                                </Col>
                            </Row>

                            {selectedPlan.benefits && (
                                <div className="mb-4">
                                    <h6 className="fw-bold border-bottom pb-2 mb-3">Included Benefits</h6>
                                    <Row>
                                        {selectedPlan.benefits.split(',').map((b, i) => (
                                            <Col md={6} key={i} className="mb-2">
                                                <div className="d-flex align-items-center text-secondary">
                                                    <CheckCircle size={16} className="text-success me-2"/>
                                                    {b.trim()}
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            )}
                            <Alert variant="warning" className="d-flex align-items-center small">
                                <Info size={20} className="me-2"/>
                                By clicking confirm, you agree to the terms and authorize the premium deduction.
                            </Alert>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowBuyModal(false)}>Cancel</Button>
                    <Button variant="success" size="lg" onClick={handleConfirmPurchase} className="px-4">Confirm Purchase</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showBillModal} onHide={() => setShowBillModal(false)} centered size="lg">
                <Modal.Header closeButton style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '2rem' }}>
                    <div className="d-flex align-items-center w-100 justify-content-between">
                        <div className="d-flex align-items-center">
                            <div className="me-3 d-flex align-items-center justify-content-center" style={{width: '48px', height: '48px', background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.2)'}}><Shield size={24} color="white" strokeWidth={2.5} /></div>
                            <div style={{ lineHeight: 1 }}><h3 className="mb-0 fw-bold" style={{ fontFamily: 'sans-serif', letterSpacing: '-0.5px', color: '#0f172a' }}>Insure<span style={{ background: '-webkit-linear-gradient(45deg, #4f46e5, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontStyle: 'italic' }}>Go</span></h3><small style={{ color: '#94a3b8', fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '600' }}>Premium Healthcare Systems</small></div>
                        </div>
                        <div className="text-end d-none d-md-block"><Badge bg="light" text="dark" className="border px-3 py-2 fw-normal" style={{ letterSpacing: '1px' }}>OFFICIAL RECEIPT</Badge></div>
                    </div>
                </Modal.Header>
                <Modal.Body className="p-5" style={{ background: '#fff' }}>
                    {selectedClaimBill && (
                        <>
                            <Row className="mb-4 align-items-center">
                                <Col md={6}><h5 className="fw-bold text-dark mb-1">INVOICE SUMMARY</h5><p className="text-muted small mb-0">Claim ID: #{selectedClaimBill.claimId}</p><p className="text-muted small">Date: {selectedClaimBill.dateFiled}</p></Col>
                                <Col md={6} className="text-end"><h6 className="fw-bold text-secondary">{selectedClaimBill.insuranceProvider}</h6><Badge bg={selectedClaimBill.status === 'APPROVED' ? 'success' : 'warning'} className="px-3 py-2">{selectedClaimBill.status}</Badge></Col>
                            </Row>
                            <hr className="my-4"/>
                            <div className="bg-light p-4 rounded mb-4 border"><h6 className="fw-bold text-primary mb-3">Treatment Details</h6><Row><Col md={6}><p className="small text-muted text-uppercase mb-1 fw-bold">Diagnosis Code</p><p className="fw-bold">{selectedClaimBill.diagnosisCode || "N/A"}</p></Col><Col md={6}><p className="small text-muted text-uppercase mb-1 fw-bold">Treatment Description</p><p className="fw-bold">{selectedClaimBill.treatmentDescription || "General Consultation"}</p></Col></Row></div>
                            <Table bordered className="mb-4">
                                <thead className="bg-light"><tr><th>Description</th><th className="text-end">Amount</th></tr></thead>
                                <tbody>
                                    <tr><td>Total Medical Bill</td><td className="text-end fw-bold">${selectedClaimBill.totalBillAmount?.toLocaleString()}</td></tr>
                                    <tr className="text-success"><td><span className="d-flex align-items-center gap-2"><CheckCircle size={16}/> Covered by {selectedClaimBill.insuranceProvider}</span></td><td className="text-end fw-bold">- ${selectedClaimBill.insurancePays?.toLocaleString() || "0"}</td></tr>
                                    <tr className="table-danger border-top border-2 border-danger"><td className="fw-bold text-danger fs-5">PATIENT BALANCE DUE</td><td className="text-end fw-bold text-danger fs-5">${((selectedClaimBill.totalBillAmount || 0) - (selectedClaimBill.insurancePays || 0)).toLocaleString()}</td></tr>
                                </tbody>
                            </Table>
                            <Alert variant="info" className="d-flex align-items-center small bg-light border-info text-dark"><Info size={20} className="me-2 text-info"/><div><strong>Note:</strong> This is an electronically generated statement based on current claim status.</div></Alert>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-light"><Button variant="outline-dark" onClick={() => window.print()} className="d-flex align-items-center gap-2"><Download size={16}/> Print / Save PDF</Button><Button variant="dark" onClick={() => setShowBillModal(false)}>Close</Button></Modal.Footer>
            </Modal>
        </div>
    );
};

export default PatientDashboard;