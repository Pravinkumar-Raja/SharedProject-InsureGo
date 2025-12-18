import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Alert, Navbar, Table, Badge, Spinner, Button, Form } from 'react-bootstrap'; 
import { Shield, LogOut, FileText, Calendar, Clock, Search, BarChart2, Star, TrendingUp, Users, DollarSign, Activity, RefreshCw, CheckCircle, Clock as PendingIcon, Download, FileCheck } from 'lucide-react'; 
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'; 
import api from '../services/api'; 
import { jsPDF } from 'jspdf';

// List of providers to check for claims
const VALID_PROVIDERS = ["LIC", "Star", "Bajaj", "HDFC ERGO", "Medicare", "General"];

const SidebarButton = ({ icon: Icon, label, active, onClick }) => (
    <Button variant={active ? 'primary' : 'light'} onClick={onClick} className={`text-start w-100 py-3 d-flex align-items-center gap-3 fw-bold border-0 ${active ? 'text-white' : 'text-secondary'}`} style={{borderRadius: '10px'}}><Icon size={20} style={{color: active ? 'white' : 'var(--accent)'}}/>{label}</Button>
);

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const storedDoctorId = localStorage.getItem('userId');
    const storedDoctorName = localStorage.getItem('userName') || "Doctor";
    
    const [activeModule, setActiveModule] = useState('schedule'); 
    const [loading, setLoading] = useState(true); 
    const [appointments, setAppointments] = useState([]);
    const [attendedPatients, setAttendedPatients] = useState([]); 
    const [mySubmittedClaims, setMySubmittedClaims] = useState([]); 
    const [reviews, setReviews] = useState([]); 
    const [chartData, setChartData] = useState([]); 
    const [stats, setStats] = useState({ revenue: 0, patientsSeen: 0, pendingApps: 0, rating: 0 });
    const [policyNo, setPolicyNo] = useState('');
    const [verifiedPatient, setVerifiedPatient] = useState(null);
    const [insuranceProviderName, setInsuranceProviderName] = useState(null); 
    const [billData, setBillData] = useState({ amount: '', description: '', diagnosisCode: '' });
    const [claimMsg, setClaimMsg] = useState({ text: '', type: '' });

    useEffect(() => { if (!storedDoctorId) { navigate('/login'); return; } loadData(); }, [storedDoctorId, navigate]);

    const bgStyle = { backgroundColor: '#f8fafc', backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px', minHeight: '100vh', paddingBottom: '2rem' };
    const glassStyle = { background: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' };

    const loadData = async () => {
        setLoading(true);
        let allAppts = [];

        // 1. Fetch Schedule
        try {
            const apptRes = await api.getDoctorSchedule(storedDoctorId); 
            allAppts = apptRes.data || []; 
            setAppointments(allAppts);
            const attended = allAppts.filter(a => a.status === 'COMPLETED'); 
            const pending = allAppts.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING'); 
            const cancelled = allAppts.filter(a => a.status === 'CANCELLED'); 
            setAttendedPatients(attended);
            setChartData([ { name: 'Attended', value: attended.length, color: '#10b981' }, { name: 'Pending', value: pending.length, color: '#f59e0b' }, { name: 'Cancelled', value: cancelled.length, color: '#ef4444' } ]);
        } catch (e) { console.error("Error loading schedule:", e); }

        // 2. Fetch Claims (And Filter by NAME to be safe)
        try {
            const claimPromises = VALID_PROVIDERS.map(provider => 
                api.getAllProviderClaims(provider).then(res => res.data || []).catch(() => [])
            );
            
            const results = await Promise.all(claimPromises);
            const allClaims = results.flat();

            // 🟢 ROBUST FILTER: Check ID OR Name
            const myClaims = allClaims.filter(c => {
                const idMatch = String(c.doctorID || c.doctorId) === String(storedDoctorId);
                // 🟢 NEW: Match by Name (Case Insensitive)
                const nameMatch = c.doctorName && c.doctorName.toLowerCase().trim() === storedDoctorName.toLowerCase().trim();
                
                return idMatch || nameMatch;
            });
            
            // Deduplicate by Claim ID
            const uniqueClaims = Array.from(new Set(myClaims.map(c => c.claimId)))
                .map(id => myClaims.find(c => c.claimId === id));

            // Sort newest first
            uniqueClaims.sort((a, b) => new Date(b.dateFiled || 0) - new Date(a.dateFiled || 0));
            setMySubmittedClaims(uniqueClaims); 
            
            // Update Revenue Stat
            const approvedRevenue = uniqueClaims
                .filter(c => c.status === 'APPROVED')
                .reduce((sum, c) => sum + (parseFloat(c.totalBillAmount) || 0), 0);
            
            setStats(prev => ({ ...prev, revenue: approvedRevenue }));

        } catch(e) { console.warn("Could not load claims history"); }

        try { 
            const statsRes = await api.getDoctorStats(storedDoctorId); 
            setReviews(statsRes.data.reviews || []); 
            setStats(prev => ({ ...prev, rating: statsRes.data.averageRating || 4.5 }));
        } catch(e) {}
        
        setStats(prev => ({ ...prev, patientsSeen: allAppts.filter(a => a.status === 'COMPLETED').length, pendingApps: allAppts.filter(a => ['CONFIRMED','PENDING'].includes(a.status)).length }));
        setLoading(false);
    };

    const handleVerify = async () => { 
        setLoading(true); 
        setClaimMsg({ text: '', type: '' }); 
        try { 
            const res = await api.verifyPolicy(policyNo); 
            const policyDetails = res.data; 
            setVerifiedPatient(policyDetails); 
            const provider = policyDetails.insuranceProvider || policyDetails.insuranceProviderName || policyDetails.companyName || policyDetails.provider; 
            setInsuranceProviderName(provider); 
            if (provider) setClaimMsg({ text: '✅ Policy Verified.', type: 'success' }); 
        } catch (e) { 
            setInsuranceProviderName(null); 
            setVerifiedPatient(null); 
            setClaimMsg({ text: '❌ Policy Not Found.', type: 'danger' }); 
        } 
        setLoading(false); 
    };

    const downloadClaimPDF = (claimData) => { 
        const doc = new jsPDF(); 
        doc.setFillColor(41, 128, 185); doc.rect(0, 0, 210, 30, 'F'); doc.setTextColor(255, 255, 255); doc.setFontSize(20); doc.text("Medical Claim Document", 15, 20); 
        doc.setTextColor(0, 0, 0); doc.setFontSize(12); doc.text(`Date: ${claimData.dateFiled || new Date().toISOString().split('T')[0]}`, 15, 45); 
        doc.text(`Provider: ${claimData.insuranceProvider}`, 15, 55); doc.setFontSize(14); doc.text("Attending Physician:", 15, 70); 
        doc.setFontSize(12); doc.text(claimData.doctorName || storedDoctorName, 15, 80); doc.setFontSize(14); doc.text("Patient Details:", 110, 70); 
        doc.setFontSize(12); doc.text(claimData.patientName || "N/A", 110, 80); doc.text(`Policy No: ${claimData.policyNo}`, 110, 90); 
        doc.setDrawColor(200); doc.rect(15, 105, 180, 50); doc.text("Diagnosis Code:", 20, 115); doc.text(claimData.diagnosisCode || "N/A", 60, 115); 
        doc.text("Treatment:", 20, 125); doc.text(claimData.treatmentDescription || "N/A", 20, 135); doc.setFontSize(16); 
        doc.text("Total Bill Amount:", 120, 170); doc.setTextColor(192, 57, 43); doc.text(`$${claimData.totalBillAmount || claimData.amount}`, 170, 170); 
        doc.save(`Claim_${claimData.patientName}_${claimData.claimId}.pdf`); 
    };
    
    // 🟢 SUBMIT CLAIM (Sends Doctor ID & Name clearly)
    const handleSubmitClaim = async (e) => { 
        e.preventDefault(); 
        if (!verifiedPatient) { setClaimMsg({ text: 'Please Verify Policy first.', type: 'warning' }); return; }

        setLoading(true); 
        try { 
            const payload = { 
                policyNo: policyNo, 
                totalBillAmount: parseFloat(billData.amount), 
                treatmentDescription: billData.description, 
                diagnosisCode: billData.diagnosisCode, 
                insuranceProvider: insuranceProviderName, 
                patientName: verifiedPatient.patientName || verifiedPatient.name || "Patient", 
                
                // 🟢 KEY DATA FOR FILTERING LATER
                doctorID: parseInt(storedDoctorId), 
                doctorName: storedDoctorName,
                
                dateFiled: new Date().toISOString().split('T')[0]
            }; 
            
            await api.initiateClaim(payload); 
            
            setClaimMsg({ text: `Claim Submitted! View in "Claim Documents" tab.`, type: 'success' }); 
            setPolicyNo(''); setVerifiedPatient(null); setBillData({ amount: '', description: '', diagnosisCode: '' }); 
            
            // 🟢 FORCE RELOAD TO UPDATE DOCUMENTS LIST
            loadData(); 
        } catch (e) { 
            setClaimMsg({ text: 'Error Submitting Claim.', type: 'danger' }); 
        } 
        setLoading(false); 
    };

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    const renderSchedule = () => ( 
        <>
            <div className="d-flex justify-content-between mb-4"><h4 className="text-primary fw-bold">Today's Appointments</h4><Button size="sm" onClick={loadData}><RefreshCw size={16}/> Refresh</Button></div>
            {appointments.length === 0 ? <Alert variant="info">No appointments today.</Alert> : appointments.map(appt => (
                <Card key={appt.appointmentId || appt.id} className="mb-3 shadow-sm border-0">
                    <Card.Body>
                        <div className="d-flex justify-content-between"><div><h5 className="mb-1">{appt.patientName}</h5><Badge bg={appt.status==='COMPLETED'?'success': appt.status==='CONFIRMED'?'primary':'warning'}>{appt.status}</Badge></div></div>
                        <p className="text-muted small mb-2 mt-2"><Clock size={14}/> {appt.appointmentDate} | <FileText size={14}/> {appt.reason || "Checkup"}</p>
                        <div className="d-flex justify-content-end gap-2">
                            {appt.status !== 'COMPLETED' && (<Button size="sm" variant="outline-success" onClick={async () => { await api.updateAppointmentStatus(appt.appointmentId || appt.id, 'COMPLETED'); loadData(); }}>Mark Done</Button>)}
                            <Button size="sm" variant="secondary" onClick={() => { setActiveModule('claimProcessor'); setPolicyNo(appt.insurancePolicyId || ""); setVerifiedPatient(null); }}>Claim</Button>
                        </div>
                    </Card.Body>
                </Card>
            ))}
        </> 
    );

    const renderClaimProcessor = () => ( <><h4 className="mb-4 text-primary fw-bold">Claim Submission</h4><div className="p-4 rounded shadow-sm bg-white">{claimMsg.text && <Alert variant={claimMsg.type}>{claimMsg.text}</Alert>}<div className="mb-4 pb-4 border-bottom"><h6 className="fw-bold mb-3 text-primary">1. Verify Policy</h6><div className="d-flex gap-3"><Form.Control type="text" placeholder="Policy ID" value={policyNo} onChange={e => { setPolicyNo(e.target.value); setVerifiedPatient(null); }} disabled={loading} /><Button onClick={handleVerify} disabled={loading || !policyNo}><Search size={16}/> Verify</Button></div>{verifiedPatient && <div className="mt-3 text-success fw-bold">✓ Active: {verifiedPatient.patientName || verifiedPatient.name} ({insuranceProviderName})</div>}</div><Form onSubmit={handleSubmitClaim}><h6 className="fw-bold mb-3 text-primary">2. Medical Details</h6><Row className="mb-3"><Col><Form.Label>Total Bill ($)</Form.Label><Form.Control type="number" required value={billData.amount} onChange={e => setBillData({...billData, amount: e.target.value})} disabled={!verifiedPatient}/></Col><Col><Form.Label>Diagnosis Code</Form.Label><Form.Control type="text" value={billData.diagnosisCode} onChange={e => setBillData({...billData, diagnosisCode: e.target.value})} disabled={!verifiedPatient}/></Col></Row><Form.Group className="mb-3"><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={3} required value={billData.description} onChange={e => setBillData({...billData, description: e.target.value})} disabled={!verifiedPatient}/></Form.Group><div className="d-grid"><Button type="submit" size="lg" disabled={!verifiedPatient || loading} className="d-flex align-items-center justify-content-center gap-2"><FileText size={18}/> Submit Claim (Save Only)</Button></div></Form></div></> );
    
    // 🟢 DOCUMENT LIST (Now with Doctor Name Column!)
    const renderDocuments = () => (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4"><h4 className="text-primary fw-bold">Claim Documents</h4><Button size="sm" variant="outline-primary" onClick={loadData}><RefreshCw size={16}/> Refresh</Button></div>
            {mySubmittedClaims.length === 0 ? <Alert variant="info">No submitted claims found. Once you submit a claim, it will appear here.</Alert> : 
            <Table hover responsive className="bg-white rounded shadow-sm">
                <thead className="bg-light">
                    <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Doctor</th> {/* 🟢 Added this column */}
                        <th>Patient</th>
                        <th>Provider</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Document</th>
                    </tr>
                </thead>
                <tbody>
                    {mySubmittedClaims.map(claim => (
                        <tr key={claim.claimId}>
                            <td>{claim.claimId}</td>
                            <td>{claim.dateFiled}</td>
                            <td className="text-primary fw-bold">{claim.doctorName || storedDoctorName}</td> {/* 🟢 Added data */}
                            <td className="fw-bold">{claim.patientName}</td>
                            <td>{claim.insuranceProvider}</td>
                            <td>${claim.totalBillAmount || claim.amount}</td>
                            <td><Badge bg={claim.status === 'APPROVED' ? 'success' : claim.status === 'REJECTED' ? 'danger' : 'warning'}>{claim.status}</Badge></td>
                            <td><Button size="sm" variant="outline-primary" onClick={() => downloadClaimPDF(claim)} className="d-flex align-items-center gap-2"><Download size={14}/> PDF</Button></td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            }
        </>
    );

    const renderAnalytics = () => ( <><h4 className="mb-4 text-primary fw-bold">Practice Insights</h4><Row className="mb-4 g-3"><Col md={3}><Card className="shadow-sm border-0 h-100 text-center py-3"><Card.Body><DollarSign size={24} className="text-success mb-2"/><h4 className="fw-bold">${stats.revenue.toLocaleString()}</h4><p className="text-muted small mb-0">Revenue</p></Card.Body></Card></Col><Col md={3}><Card className="shadow-sm border-0 h-100 text-center py-3"><Card.Body><CheckCircle size={24} className="text-primary mb-2"/><h4 className="fw-bold">{stats.patientsSeen}</h4><p className="text-muted small mb-0">Attended</p></Card.Body></Card></Col><Col md={3}><Card className="shadow-sm border-0 h-100 text-center py-3"><Card.Body><PendingIcon size={24} className="text-warning mb-2"/><h4 className="fw-bold">{stats.pendingApps}</h4><p className="text-muted small mb-0">Pending</p></Card.Body></Card></Col><Col md={3}><Card className="shadow-sm border-0 h-100 text-center py-3"><Card.Body><Star size={24} className="text-warning mb-2" fill="currentColor"/><h4 className="fw-bold">{stats.rating > 0 ? stats.rating : "N/A"}</h4><p className="text-muted small mb-0">Rating</p></Card.Body></Card></Col></Row><Row><Col lg={7} className="mb-4"><Card className="shadow-sm border-0 h-100"><Card.Header className="bg-white fw-bold border-0 pt-3">✅ Attended Patients</Card.Header><Card.Body className="p-0"><Table hover responsive className="mb-0"><thead className="bg-light small"><tr><th>Name</th><th>Date</th><th>Service</th></tr></thead><tbody>{attendedPatients.slice(0, 5).map(p => (<tr key={p.appointmentId}><td className="fw-bold">{p.patientName}</td><td className="small">{p.appointmentDate}</td><td className="small text-muted">{p.ailmentReason || "General"}</td></tr>))}{attendedPatients.length === 0 && <tr><td colSpan="3" className="text-center py-3 text-muted">No completed visits yet.</td></tr>}</tbody></Table></Card.Body></Card></Col><Col lg={5} className="mb-4"><Card className="shadow-sm border-0 h-100"><Card.Header className="bg-white fw-bold border-0 pt-3">⭐ Patient Reviews</Card.Header><Card.Body className="p-0"><div style={{ maxHeight: '300px', overflowY: 'auto' }}>{reviews.length === 0 ? <div className="text-center py-4 text-muted small">No reviews submitted yet.</div> : reviews.map((review, idx) => (<div key={idx} className="p-3 border-bottom"><div className="d-flex justify-content-between"><span className="fw-bold small">{review.patientName || "Anonymous"}</span><div className="mb-1">{[...Array(5)].map((_, i) => (<Star key={i} size={12} className={i < review.rating ? "text-warning" : "text-muted"} fill={i < review.rating ? "currentColor" : "none"}/>))}</div></div><p className="small text-secondary mb-0 mt-1">"{review.comment}"</p></div>))}</div></Card.Body></Card></Col></Row><Row><Col md={12}><Card className="shadow-sm border-0 p-3"><h6 className="fw-bold mb-3">Doctor Popularity (Appointment Activity)</h6><div style={{ width: '100%', height: 300 }}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">{chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" height={36}/></PieChart></ResponsiveContainer></div></Card></Col></Row></>);

    const renderContent = () => { 
        if (loading && activeModule === 'schedule') return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>; 
        switch (activeModule) { 
            case 'schedule': return renderSchedule(); 
            case 'claimProcessor': return renderClaimProcessor(); 
            case 'documents': return renderDocuments(); 
            case 'analytics': return renderAnalytics(); 
            default: return renderSchedule(); 
        } 
    };

    return (
        <div style={bgStyle}>
            <Navbar className="shadow-sm px-4 justify-content-between" style={{background: '#ffffff', borderBottom: '1px solid #e0e0e0'}}>
                <Navbar.Brand className="text-white fw-bold"><Shield size={24} className="me-2" style={{color: '#0d6efd'}}/><span style={{color:'#333'}}>Doctor Console</span></Navbar.Brand>
                <div className="d-flex gap-3 align-items-center"><span style={{color:'#555'}}>Hello, {storedDoctorName}</span><Button size="sm" variant="outline-dark" onClick={handleLogout}><LogOut size={16}/> Logout</Button></div>
            </Navbar>
            <Container fluid className="py-4">
                <Row>
                    <Col lg={3}>
                        <Card className="border-0 h-100" style={glassStyle}>
                            <div className="d-grid gap-2 p-3">
                                <SidebarButton icon={Calendar} label="My Schedule" active={activeModule === 'schedule'} onClick={() => setActiveModule('schedule')}/>
                                <SidebarButton icon={FileText} label="Claim Processor" active={activeModule === 'claimProcessor'} onClick={() => setActiveModule('claimProcessor')}/>
                                <SidebarButton icon={FileCheck} label="Claim Documents" active={activeModule === 'documents'} onClick={() => setActiveModule('documents')}/>
                                <SidebarButton icon={BarChart2} label="Analytics & Reviews" active={activeModule === 'analytics'} onClick={() => setActiveModule('analytics')}/>
                            </div>
                        </Card>
                    </Col>
                    <Col lg={9}><Card className="border-0 p-4" style={glassStyle}><Card.Body>{renderContent()}</Card.Body></Card></Col>
                </Row>
            </Container>
        </div>
    );
};

export default DoctorDashboard;