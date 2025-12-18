import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button, Modal, Table, Navbar, Form, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
    DollarSign, FileText, Check, Clock, Shield, LogOut, Plus, Search, 
    Users, Edit, Trash2, TrendingUp, Activity, PieChart as PieIcon, 
    Download, AlertCircle, BarChart2, FileCheck 
} from 'lucide-react'; 
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import api from '../services/api'; 

const REVIEW_THRESHOLD = 0; 

const SidebarButton = ({ icon: Icon, label, active, onClick, count }) => (
    <Button variant={active ? 'primary' : 'light'} onClick={onClick} className={`text-start w-100 py-3 d-flex align-items-center justify-content-between gap-3 fw-bold ${active ? 'text-white' : 'text-secondary'}`} style={{borderRadius: '10px'}}><div className="d-flex align-items-center gap-3"><Icon size={20} style={{color: active ? 'white' : 'var(--accent)'}}/>{label}</div>{count > 0 && <Badge bg="danger" className="ms-auto rounded-pill">{count}</Badge>}</Button>
);

// Metric Card Component
const MetricCard = ({ title, value, icon: Icon, color, subtext }) => (
    <Card className="h-100 p-3 border-0 shadow-sm" style={{ borderLeft: `5px solid ${color}`, background: '#fff' }}>
        <div className="d-flex justify-content-between align-items-start">
            <div>
                <p className="text-muted text-uppercase small fw-bold mb-1">{title}</p>
                <h2 className="fw-bold mb-0" style={{color: '#1e293b'}}>{value}</h2>
                {subtext && <p className="text-muted small mt-2 mb-0">{subtext}</p>}
            </div>
            <div className="p-3 rounded-circle" style={{background: `${color}20`}}>
                <Icon size={24} color={color} />
            </div>
        </div>
    </Card>
);

const ProviderDashboard = () => {
    const navigate = useNavigate();
    const storedProviderName = localStorage.getItem('providerName') || "InsureGo Admin"; 
    
    const [loading, setLoading] = useState(true);
    const [allClaimsHistory, setAllClaimsHistory] = useState([]); 
    const [policyHolders, setPolicyHolders] = useState([]);
    const [createdPlans, setCreatedPlans] = useState([]); 
    const [activeModule, setActiveModule] = useState('review'); 
    
    // Analytics State
    const [analyticsData, setAnalyticsData] = useState({ 
        totalPayout: 0, approvalRate: 0, statusDistribution: [], timelineData: [],
        totalClaims: 0, pending: 0, approved: 0, rejected: 0
    });

    // Modals
    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState(null); 
    const [newPolicyForm, setNewPolicyForm] = useState({ policyName: '', coverageAmount: '', premium: '', benefits: '', provider: storedProviderName });
    
    // Action Modal State
    const [showActionModal, setShowActionModal] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [actionNotes, setActionNotes] = useState('');
    const [actionStatus, setActionStatus] = useState(''); 

    useEffect(() => { if (!storedProviderName) { navigate('/login'); return; } loadDashboardData(); }, [storedProviderName]);

    const bgStyle = { background: '#f3f4f6', minHeight: '100vh', paddingBottom: '2rem' };
    const glassStyle = { background: '#ffffff', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const cleanProviderName = storedProviderName.trim();
            const historyRes = await api.getAllProviderClaims(cleanProviderName); 
            const claims = historyRes.data || []; 
            claims.sort((a,b) => new Date(b.dateFiled) - new Date(a.dateFiled));
            setAllClaimsHistory(claims);

            // Fetch Policy Holders
            let customers = []; 
            try { 
                const allPoliciesRes = await api.getAllPolicies(); 
                customers = (allPoliciesRes.data || []).filter(p => (p.insuranceProvider || p.provider || "").trim().toUpperCase() === cleanProviderName.toUpperCase()); 
                setPolicyHolders(customers); 
            } catch (e) {}

            // Fetch Plans
            try { 
                const plansRes = await api.getMarketplacePlans(); 
                const myPlans = (plansRes.data || []).filter(p => (p.provider || p.insuranceProvider || "").trim().toUpperCase() === cleanProviderName.toUpperCase()); 
                setCreatedPlans(myPlans); 
            } catch(e) {}

            // Analytics Math
            const approved = claims.filter(c => c.status === 'APPROVED');
            const rejected = claims.filter(c => c.status === 'REJECTED');
            const pending = claims.filter(c => ['OPEN', 'PENDING', 'PENDING_APPROVAL'].includes(c.status));
            
            const totalPayout = approved.reduce((sum, c) => sum + (parseFloat(c.totalBillAmount || c.insurancePays) || 0), 0);
            
            const dist = [
                { name: 'Approved', value: approved.length, color: '#10b981' },
                { name: 'Rejected', value: rejected.length, color: '#ef4444' },
                { name: 'Pending', value: pending.length, color: '#f59e0b' }
            ].filter(d => d.value > 0);

            const volumeMap = {};
            claims.forEach(c => {
                const d = c.dateFiled || 'Unknown';
                if(!volumeMap[d]) volumeMap[d] = 0;
                volumeMap[d]++;
            });
            const timelineData = Object.keys(volumeMap).sort().slice(-7).map(date => ({ name: date, claims: volumeMap[date] }));

            setAnalyticsData({
                totalPayout, approvalRate: claims.length > 0 ? Math.round((approved.length / claims.length) * 100) : 0,
                statusDistribution: dist, timelineData,
                totalClaims: claims.length, pending: pending.length, approved: approved.length, rejected: rejected.length
            });

        } catch (e) { console.error("Load failed", e); }
        setLoading(false);
    };

    const derivedHighValueClaims = allClaimsHistory.filter(c => { 
        const status = (c.status || '').toUpperCase(); 
        return ['OPEN', 'PENDING', 'PENDING_APPROVAL', 'SUBMITTED'].includes(status); 
    });

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };
    
    // Policy Management
    const resetPolicyForm = () => { setEditingPlanId(null); setNewPolicyForm({ policyName: '', coverageAmount: '', premium: '', benefits: '', provider: storedProviderName }); setShowPolicyModal(false); };
    const handlePolicySubmit = async (e) => { 
        e.preventDefault(); 
        try { 
            const payload = { ...newPolicyForm, coverageAmount: parseFloat(newPolicyForm.coverageAmount), premium: parseFloat(newPolicyForm.premium) }; 
            if (editingPlanId) { await api.updateMarketplacePlan(editingPlanId, payload); alert(`Plan Updated!`); } 
            else { await api.addMarketplacePlan(payload); alert(`Plan Created!`); } 
            loadDashboardData(); resetPolicyForm(); 
        } catch (e) { alert("Failed."); } 
    };
    const handleEditPlan = (plan) => { setEditingPlanId(plan.id); setNewPolicyForm({ policyName: plan.policyName, coverageAmount: plan.coverageAmount, premium: plan.premium, benefits: plan.benefits, provider: storedProviderName }); setShowPolicyModal(true); };
    const handleDeletePlan = async (id) => { if(!window.confirm("Delete?")) return; try { await api.deleteMarketplacePlan(id); loadDashboardData(); } catch (e) { alert("Failed."); } };

    // Claim Action Submit
    const handleSubmitClaimAction = async () => { 
        try { 
            await api.processClaimAction(selectedClaim.claimId, actionStatus, { notes: actionNotes, reviewedBy: storedProviderName }); 
            alert(`Claim ${actionStatus}!`); setShowActionModal(false); loadDashboardData(); 
        } catch (e) { alert("Processing failed."); } 
    };

    // OPEN DOCUMENT MODAL
    const openReviewModal = (claim) => {
        setSelectedClaim(claim);
        setActionStatus(''); // Reset status
        setActionNotes('');
        setShowActionModal(true);
    };

    const renderAnalytics = () => (
        <div className="animate__animated animate__fadeIn">
            <h3 className="fw-bold text-dark mb-4">Dashboard Overview</h3>
            <Row className="g-4 mb-4">
                <Col md={3}><MetricCard title="Total Payout" value={`$${analyticsData.totalPayout.toLocaleString()}`} icon={DollarSign} color="#10b981" subtext="Disbursed this month" /></Col>
                <Col md={3}><MetricCard title="Pending Actions" value={analyticsData.pending} icon={AlertCircle} color="#f59e0b" subtext="Requires attention" /></Col>
                <Col md={3}><MetricCard title="Claims Processed" value={analyticsData.totalClaims} icon={FileText} color="#3b82f6" subtext={`${analyticsData.approved} Approved / ${analyticsData.rejected} Rejected`} /></Col>
                <Col md={3}><MetricCard title="Approval Rate" value={`${analyticsData.approvalRate}%`} icon={Activity} color="#8b5cf6" subtext="Efficiency Metric" /></Col>
            </Row>
            <Row className="g-4">
                <Col lg={8}>
                    <Card style={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} className="p-4 h-100 bg-white">
                        <h5 className="fw-bold mb-0">Claim Volume Trends</h5>
                        <div style={{ height: '350px', width: '100%' }}>
                            <ResponsiveContainer>
                                <AreaChart data={analyticsData.timelineData}>
                                    <defs><linearGradient id="colorClaims" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Area type="monotone" dataKey="claims" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorClaims)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card style={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} className="p-4 h-100 bg-white">
                        <h5 className="fw-bold mb-4">Claim Status</h5>
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={analyticsData.statusDistribution} innerRadius={60} outerRadius={80} dataKey="value">
                                        {analyticsData.statusDistribution.map((e,i)=><Cell key={i} fill={e.color}/>)}
                                    </Pie>
                                    <Tooltip /><Legend verticalAlign="bottom" height={36} iconType="circle"/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );

    const renderContent = () => {
        if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
        switch (activeModule) {
            case 'review': return (
                <>
                <h4 className="mb-4 text-primary fw-bold">Claims Queue</h4>
                {derivedHighValueClaims.length === 0 ? <Alert variant="success">No pending claims.</Alert> : (
                <Table hover responsive className="bg-white rounded shadow-sm">
                    <thead className="bg-light"><tr><th>ID</th><th>Patient</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>{derivedHighValueClaims.map(c => (
                        <tr key={c.claimId}><td>{c.claimId}</td><td>{c.patientName}</td><td className="fw-bold">${c.totalBillAmount}</td><td><Badge bg="warning">{c.status}</Badge></td>
                        <td><Button size="sm" variant="outline-primary" onClick={() => openReviewModal(c)}>Review Details</Button></td></tr>
                    ))}</tbody>
                </Table>
                )}
                </>
            );
            case 'holders': return ( <Table hover className="bg-white rounded"><thead><tr><th>Patient</th><th>Status</th></tr></thead><tbody>{policyHolders.map(p=><tr key={p.id}><td>{p.patientName}</td><td><Badge bg="success">ACTIVE</Badge></td></tr>)}</tbody></Table> ); 
            case 'policies': return (
                <>
                <div className="d-flex justify-content-between align-items-center mb-4"><h4 className="text-primary fw-bold">Marketplace Plans</h4><Button variant="success" onClick={() => { resetPolicyForm(); setShowPolicyModal(true); }}><Plus size={20}/> Add New Plan</Button></div><Table hover responsive className="bg-white shadow-sm"><thead><tr><th>Name</th><th>Coverage</th><th>Premium</th><th>Action</th></tr></thead><tbody>{createdPlans.map((plan, i) => (<tr key={i}><td>{plan.policyName}</td><td>${plan.coverageAmount?.toLocaleString()}</td><td className="text-success fw-bold">${plan.premium}</td><td><Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEditPlan(plan)}><Edit size={16}/></Button><Button variant="outline-danger" size="sm" onClick={() => handleDeletePlan(plan.id)}><Trash2 size={16}/></Button></td></tr>))}</tbody></Table>
                </>
            );
            case 'analytics': return renderAnalytics();
            case 'search': return (
                <Table hover responsive className="bg-white rounded">
                    <thead><tr><th>ID</th><th>Patient</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>{allClaimsHistory.map(c => (<tr key={c.claimId}><td>{c.claimId}</td><td>{c.patientName}</td><td className="fw-bold">${c.totalBillAmount}</td><td><Badge bg={c.status==='APPROVED'?'success': c.status==='REJECTED'?'danger':'warning'}>{c.status}</Badge></td><td>{c.dateFiled}</td></tr>))}</tbody>
                </Table>
            );
            default: return <div>Select a module</div>;
        }
    };

    return (
        <div style={bgStyle}>
            <Navbar className="px-4 bg-white border-bottom shadow-sm justify-content-between">
                <Navbar.Brand className="fw-bold text-primary"><Shield size={24} className="me-2"/>Provider Console</Navbar.Brand>
                <div className="d-flex align-items-center gap-3"><span>{storedProviderName}</span><Button size="sm" variant="outline-dark" onClick={handleLogout}><LogOut size={16}/> Logout</Button></div>
            </Navbar>
            <Container fluid className="py-4">
                <Row>
                    <Col lg={3}><Card className="border-0 shadow-sm p-3" style={{...glassStyle, height: '85vh'}}>
                        <div className="text-muted small fw-bold mb-3 px-3">MENU</div>
                        <SidebarButton icon={PieIcon} label="Analytics" active={activeModule==='analytics'} onClick={()=>setActiveModule('analytics')}/>
                        <SidebarButton icon={FileText} label="Review Queue" active={activeModule==='review'} onClick={()=>setActiveModule('review')} count={derivedHighValueClaims.length}/>
                        <SidebarButton icon={Shield} label="Plan Manager" active={activeModule==='policies'} onClick={()=>setActiveModule('policies')}/>
                        <SidebarButton icon={Users} label="Policy Holders" active={activeModule==='holders'} onClick={()=>setActiveModule('holders')}/>
                        <SidebarButton icon={Search} label="Search History" active={activeModule==='search'} onClick={()=>setActiveModule('search')}/>
                    </Card></Col>
                    <Col lg={9}><Card className="border-0 p-4" style={glassStyle}><Card.Body>{renderContent()}</Card.Body></Card></Col>
                </Row>
            </Container>
            
            {/* Detailed Claim Review Modal */}
            <Modal show={showActionModal} onHide={() => setShowActionModal(false)} size="lg" centered>
                <Modal.Header closeButton style={{background: '#f8f9fa'}}>
                    <Modal.Title className="fw-bold text-primary"><FileCheck size={24} className="me-2"/>Claim Review Document</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedClaim && (
                        <div className="mb-4 p-3 bg-light rounded border">
                            <Row className="mb-2">
                                <Col sm={4} className="text-muted small fw-bold text-uppercase">Patient</Col>
                                <Col sm={8} className="fw-bold">{selectedClaim.patientName}</Col>
                            </Row>
                            <Row className="mb-2">
                                <Col sm={4} className="text-muted small fw-bold text-uppercase">Policy No</Col>
                                <Col sm={8}>{selectedClaim.policyNo || selectedClaim.policyNumber}</Col>
                            </Row>
                            <Row className="mb-2">
                                <Col sm={4} className="text-muted small fw-bold text-uppercase">Doctor</Col>
                                <Col sm={8}>{selectedClaim.doctorName || "N/A"}</Col>
                            </Row>
                            <hr/>
                            <Row className="mb-2">
                                <Col sm={4} className="text-muted small fw-bold text-uppercase">Diagnosis</Col>
                                <Col sm={8}>{selectedClaim.diagnosisCode || "N/A"}</Col>
                            </Row>
                            <Row className="mb-2">
                                <Col sm={4} className="text-muted small fw-bold text-uppercase">Treatment</Col>
                                <Col sm={8}>{selectedClaim.treatmentDescription || "General Care"}</Col>
                            </Row>
                            <hr/>
                            <Row className="align-items-center">
                                <Col sm={4} className="text-muted small fw-bold text-uppercase">Total Bill Amount</Col>
                                <Col sm={8} className="text-danger fs-4 fw-bold">${selectedClaim.totalBillAmount?.toLocaleString()}</Col>
                            </Row>
                        </div>
                    )}
                    
                    <Form.Group>
                        <Form.Label className="fw-bold">Administrator Notes</Form.Label>
                        <Form.Control as="textarea" rows={3} placeholder="Reason for approval/rejection..." value={actionNotes} onChange={e=>setActionNotes(e.target.value)}/>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <Button variant="outline-secondary" onClick={() => setShowActionModal(false)}>Cancel</Button>
                    <div className="d-flex gap-2">
                        <Button variant="danger" onClick={() => { setActionStatus('REJECTED'); handleSubmitClaimAction(); }}>Reject Claim</Button>
                        <Button variant="success" onClick={() => { setActionStatus('APPROVED'); handleSubmitClaimAction(); }}>Approve Claim</Button>
                    </div>
                </Modal.Footer>
            </Modal>

            {/* 🟢 FIXED: Policy Modal with Benefits Field Restored */}
            <Modal show={showPolicyModal} onHide={resetPolicyForm} centered>
                <Modal.Header closeButton><Modal.Title>{editingPlanId ? "Edit Plan" : "New Plan"}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handlePolicySubmit}>
                        <Form.Group className="mb-3"><Form.Label>Name</Form.Label><Form.Control type="text" required value={newPolicyForm.policyName} onChange={e => setNewPolicyForm({...newPolicyForm, policyName: e.target.value})}/></Form.Group>
                        <Row>
                            <Col><Form.Control type="number" placeholder="Coverage" required value={newPolicyForm.coverageAmount} onChange={e => setNewPolicyForm({...newPolicyForm, coverageAmount: e.target.value})}/></Col>
                            <Col><Form.Control type="number" placeholder="Premium" required value={newPolicyForm.premium} onChange={e => setNewPolicyForm({...newPolicyForm, premium: e.target.value})}/></Col>
                        </Row>
                        {/* 🟢 ADDED: Missing Benefits Field */}
                        <Form.Group className="mt-3">
                            <Form.Label>Benefits (comma separated)</Form.Label>
                            <Form.Control as="textarea" rows={2} placeholder="e.g. Dental, Vision, No Copay" value={newPolicyForm.benefits} onChange={e => setNewPolicyForm({...newPolicyForm, benefits: e.target.value})} />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100 mt-3">Save Plan</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ProviderDashboard;