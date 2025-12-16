import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button, Modal, Table, Navbar, Form, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { DollarSign, FileText, Check, X, Clock, TrendingUp, Shield, LogOut, Plus, Search } from 'lucide-react'; 
import api from '../services/api'; 

// --- CONFIGURATION ---
const REVIEW_THRESHOLD = 500.00; // Claims above this amount require manual review

// --- CUSTOM SIDEBAR BUTTON COMPONENT (Defined OUTSIDE main component) ---
// Note: This component must be defined outside or receive 'activeModule' as a prop
const SidebarButton = ({ icon: Icon, label, active, onClick, count }) => (
    <Button
        variant={active ? 'primary' : 'light'}
        onClick={onClick}
        className={`text-start w-100 py-3 d-flex align-items-center justify-content-between gap-3 fw-bold ${active ? 'text-white' : 'text-secondary'}`}
        style={{borderRadius: '10px'}}
    >
        <div className="d-flex align-items-center gap-3">
            <Icon size={20} style={{color: active ? 'white' : 'var(--accent)'}}/>
            {label}
        </div>
        {/* Note: Accessing activeModule directly is incorrect if this is outside, but using the 'active' prop is correct. */}
        {count > 0 && (
            <Badge bg="danger" className="ms-auto rounded-pill">{count}</Badge>
        )}
    </Button>
);


const ProviderDashboard = () => {
    const navigate = useNavigate();
    
    // CRITICAL: Retrieve Provider Name stored during login
    const storedProviderName = localStorage.getItem('providerName'); 
    
    // --- STATE MANAGEMENT ---
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({ totalClaims: 0, claimsToday: 0 });
    const [highValueClaims, setHighValueClaims] = useState([]);
    const [allClaimsHistory, setAllClaimsHistory] = useState([]); 
    const [activeModule, setActiveModule] = useState('review'); 
    
    // Policy Management State (P4)
    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const [newPolicyForm, setNewPolicyForm] = useState({ 
        policyName: '', 
        coverageAmount: '', 
        premium: '',
        provider: storedProviderName || ''
    });

    // Claim Action State (P3)
    const [showActionModal, setShowActionModal] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [actionNotes, setActionNotes] = useState('');
    const [actionStatus, setActionStatus] = useState(''); // 'APPROVED' or 'REJECTED'

    // --- DATA LOADING ---
    useEffect(() => {
        if (!storedProviderName) { 
            navigate('/login'); 
            return; 
        }
        loadDashboardData();
    }, [storedProviderName, navigate]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // P1: Fetch Metrics
            const metricsRes = await api.getProviderMetrics(storedProviderName); 
            setMetrics(metricsRes.data);
            
            // P2: Fetch High-Value Claims
            const claimsRes = await api.getHighValueClaims(storedProviderName);
            setHighValueClaims(claimsRes.data);

            // P5: Fetch ALL Claims History
            const historyRes = await api.getAllProviderClaims(storedProviderName);
            setAllClaimsHistory(historyRes.data);

        } catch (e) { 
            console.error("Failed to load provider dashboard data:", e); 
            alert("Error loading data. Check Claim Service connection.");
        }
        setLoading(false);
    };

    // --- LOGIC: POLICY MANAGEMENT (P4) ---
    const handlePolicySubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newPolicyForm,
                coverageAmount: parseFloat(newPolicyForm.coverageAmount),
                premium: parseFloat(newPolicyForm.premium)
            };
            
            await api.addPolicy(payload); 
            
            alert(`New Policy '${newPolicyForm.policyName}' added successfully!`);
            
            setNewPolicyForm({ 
                policyName: '', 
                coverageAmount: '', 
                premium: '',
                provider: storedProviderName || ''
            });
            setShowPolicyModal(false);
            
        } catch (e) {
            console.error("Failed to add policy:", e);
            alert("Failed to add policy. Check Policy Service connection.");
        }
    };
    
    // --- LOGIC: CLAIM ACTION (P3) ---
    const openActionModal = (claim, status) => {
        setSelectedClaim(claim);
        setActionStatus(status);
        setActionNotes('');
        setShowActionModal(true);
    };

    const handleSubmitClaimAction = async () => {
        if (!actionNotes) {
            alert("Please provide notes/reasoning before finalizing the action.");
            return;
        }
        
        try {
            await api.processClaimAction(
                selectedClaim.claimId, 
                actionStatus, 
                { 
                    notes: actionNotes,
                    reviewedBy: storedProviderName 
                }
            );
            
            alert(`Claim ${selectedClaim.claimId} ${actionStatus} successfully!`);
            setShowActionModal(false);
            loadDashboardData(); 

        } catch (e) {
            console.error("Failed to process claim action:", e);
            alert("Failed to process claim action. Check Claim Service connection.");
        }
    };

    const handleLogout = () => { 
        localStorage.clear(); 
        navigate('/login'); 
    };

    // =========================================================================
    // --- RENDERER HELPER FUNCTIONS (Placed here to ensure scope) ---
    // =========================================================================

    const renderHeaderMetrics = () => (
        <Row className="mb-4">
            {/* Metric 1: Total Claims Overall */}
            <Col md={4} className="mb-3">
                <Card className="shadow-sm h-100 border-0" style={{borderRadius: '12px', borderBottom: '4px solid var(--primary)'}}>
                    <Card.Body>
                        <DollarSign size={24} className="text-primary mb-2"/>
                        <p className="text-muted mb-0 small text-uppercase">Total Claims (Overall)</p>
                        <h3 className="fw-bold">{metrics.totalClaims}</h3>
                    </Card.Body>
                </Card>
            </Col>
            
            {/* Metric 2: Claims Today */}
            <Col md={4} className="mb-3">
                <Card className="shadow-sm h-100 border-0" style={{borderRadius: '12px', borderBottom: '4px solid var(--success)'}}>
                    <Card.Body>
                        <Clock size={24} className="text-success mb-2"/>
                        <p className="text-muted mb-0 small text-uppercase">Claims Filed Today</p>
                        <h3 className="fw-bold">{metrics.claimsToday}</h3>
                    </Card.Body>
                </Card>
            </Col>

            {/* Metric 3: Claims Needing Review */}
            <Col md={4} className="mb-3">
                <Card className="shadow-sm h-100 border-0" style={{borderRadius: '12px', borderBottom: '4px solid var(--warning)'}}>
                    <Card.Body>
                        <FileText size={24} className="text-warning mb-2"/>
                        <p className="text-muted mb-0 small text-uppercase">Awaiting Manual Review</p>
                        <h3 className="fw-bold text-danger">{highValueClaims.length}</h3>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );

    const renderClaimReview = () => (
        <>
            <h4 className="mb-4 text-primary fw-bold">Claims Requiring Manual Review ( &gt; ${REVIEW_THRESHOLD.toFixed(2)} )</h4>
            
            {highValueClaims.length === 0 ? (
                <Alert variant="success">🎉 No high-value claims currently require manual verification.</Alert>
            ) : (
                <Table hover responsive className="bg-white shadow-sm" style={{borderRadius: '12px', overflow: 'hidden'}}>
                    <thead className="bg-light">
                        <tr>
                            <th>Claim ID</th>
                            <th>Patient ID</th>
                            <th>Bill Amount</th>
                            <th>Doctor ID</th>
                            <th>Date Filed</th>
                            <th>Status</th>
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {highValueClaims.map(c => (
                            <tr key={c.claimId}>
                                <td>{c.claimId}</td>
                                <td>{c.userId}</td>
                                <td className="fw-bold text-danger">${c.totalBillAmount ? c.totalBillAmount.toFixed(2) : 'N/A'}</td>
                                <td>{c.doctorID}</td>
                                <td>{c.dateFiled}</td>
                                <td><Badge bg="warning">OPEN</Badge></td>
                                <td className="text-center">
                                    <Dropdown>
                                        <Dropdown.Toggle variant="secondary" size="sm" id={`dropdown-claim-${c.claimId}`}>
                                            Action
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => openActionModal(c, 'APPROVED')} className="text-success">
                                                <Check size={16} className="me-1"/> Approve
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => openActionModal(c, 'REJECTED')} className="text-danger">
                                                <X size={16} className="me-1"/> Reject
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </>
    );

    const renderClaimsHistory = () => (
        <>
            <h4 className="mb-4 text-primary fw-bold">Full Claims History and Audit Trail</h4>
            <Alert variant="info">
                Showing **{allClaimsHistory.length}** total claims processed for {storedProviderName}.
            </Alert>

            <Table hover responsive className="bg-white shadow-sm" style={{borderRadius: '12px', overflow: 'hidden'}}>
                <thead className="bg-light">
                    <tr>
                        <th>Claim ID</th>
                        <th>Patient ID</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Insurance Pays</th>
                        <th>Date Filed</th>
                    </tr>
                </thead>
                <tbody>
                    {allClaimsHistory
                        .sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled))
                        .map(c => (
                        <tr key={c.claimId}>
                            <td>{c.claimId}</td>
                            <td>{c.userId}</td>
                            <td className="fw-bold">${c.totalBillAmount ? c.totalBillAmount.toFixed(2) : 'N/A'}</td>
                            <td>
                                <Badge bg={
                                    c.status === 'APPROVED' ? 'success' : 
                                    c.status === 'REJECTED' ? 'danger' : 
                                    'warning'
                                }>
                                    {c.status}
                                </Badge>
                            </td>
                            <td>${c.insurancePays ? c.insurancePays.toFixed(2) : '0.00'}</td>
                            <td>{c.dateFiled}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );


    const renderPolicyManagement = () => (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-primary fw-bold">Policy & Plan Management</h4>
                <Button variant="success" onClick={() => setShowPolicyModal(true)}>
                    <Plus size={20} className="me-1"/> Add New Policy
                </Button>
            </div>
            <Alert variant="info">
                This module handles adding new policy plans (e.g., Bronze, Gold, specific product lines) that patients can subscribe to.
            </Alert>
            <h5 className="mt-4">Current Plans for {storedProviderName}</h5>
            <Table hover responsive className="bg-white shadow-sm">
                <thead>
                    <tr>
                        <th>Policy Name</th>
                        <th>Coverage</th>
                        <th>Premium</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Premium Health Plan</td>
                        <td>$1,000,000</td>
                        <td>$500/month</td>
                        <td><Button variant="outline-primary" size="sm">Edit</Button></td>
                    </tr>
                    <tr>
                        <td colSpan="4" className="text-center text-muted">... list more policies from API ...</td>
                    </tr>
                </tbody>
            </Table>
        </>
    );

    const renderContent = () => {
        if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /> <p className="mt-2">Loading Dashboard Data...</p></div>;
        
        switch (activeModule) {
            case 'review':
                return renderClaimReview();
            case 'policies':
                return renderPolicyManagement();
            case 'search': 
                return renderClaimsHistory();
            default:
                return renderClaimReview();
        }
    };

    // --- MAIN RENDER ---
    return (
        <>
            <Navbar className="shadow-sm px-4 justify-content-between" style={{background: 'var(--primary)'}}>
                <Navbar.Brand className="text-white fw-bold">
                    <Shield size={24} className="me-2" style={{color: 'var(--accent)'}}/>
                    {storedProviderName} Portal
                </Navbar.Brand>
                <div className="d-flex gap-3 align-items-center">
                    <span className="text-white-50">Hello, {storedProviderName}</span>
                    <Button size="sm" variant="outline-light" onClick={handleLogout}>
                        <LogOut size={16} className="me-1"/> Logout
                    </Button>
                </div>
            </Navbar>

            <Container fluid className="py-4" style={{minHeight: 'calc(100vh - 56px)'}}>
                {renderHeaderMetrics()} {/* P1: Metrics Cards - This call is now safe. */}

                <Row>
                    {/* --- SIDEBAR --- */}
                    <Col lg={3}>
                        <Card className="shadow-lg border-0" style={{borderRadius: '16px'}}>
                            <Card.Header className="fw-bold text-center border-0 py-3" style={{background: 'var(--bg-light)'}}>
                                Provider Tasks
                            </Card.Header>
                            <div className="d-grid gap-2 p-3">
                                <SidebarButton 
                                    icon={FileText} 
                                    label={`Claims Review (${highValueClaims.length})`}
                                    active={activeModule === 'review'}
                                    onClick={() => setActiveModule('review')}
                                    count={highValueClaims.length} 
                                />
                                <SidebarButton 
                                    icon={Shield} 
                                    label="Policy Management" 
                                    active={activeModule === 'policies'}
                                    onClick={() => setActiveModule('policies')}
                                />
                                <SidebarButton 
                                    icon={Search} 
                                    label="Claims History/Audit" 
                                    active={activeModule === 'search'}
                                    onClick={() => setActiveModule('search')}
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

            {/* --- MODAL 1: CLAIM ACTION (Approve/Reject) (P3) --- */}
            <Modal show={showActionModal} onHide={() => setShowActionModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{actionStatus} Claim {selectedClaim?.claimId}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant={actionStatus === 'APPROVED' ? 'success' : 'danger'}>
                        Finalizing Claim **{selectedClaim?.claimId}** for **${selectedClaim?.totalBillAmount?.toFixed(2) || 'N/A'}**.
                    </Alert>
                    
                    <h6 className="fw-bold">Claim Details Verified:</h6>
                    <ul className="small text-muted mb-3">
                        <li>Patient ID: {selectedClaim?.userId}</li>
                        <li>Doctor ID: {selectedClaim?.doctorID} (Verify legitimacy)</li>
                        <li>Treatment Code: [N/A - Data not available in current model]</li>
                    </ul>

                    <Form.Group className="mb-3">
                        <Form.Label>Notes/Reasoning for {actionStatus}</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            value={actionNotes}
                            onChange={(e) => setActionNotes(e.target.value)}
                            placeholder={`Enter detailed reason for ${actionStatus.toLowerCase()}...`}
                        />
                    </Form.Group>

                    <Button 
                        variant={actionStatus === 'APPROVED' ? 'success' : 'danger'} 
                        className="w-100 mt-3"
                        onClick={handleSubmitClaimAction}
                    >
                        Confirm {actionStatus}
                    </Button>
                </Modal.Body>
            </Modal>

            {/* --- MODAL 2: ADD NEW POLICY (P4) --- */}
            <Modal show={showPolicyModal} onHide={() => setShowPolicyModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Add New Policy Plan</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handlePolicySubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Provider</Form.Label>
                            <Form.Control type="text" value={newPolicyForm.provider} disabled />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Policy Name (e.g., Gold Plan)</Form.Label>
                            <Form.Control 
                                type="text" 
                                required 
                                value={newPolicyForm.policyName}
                                onChange={e => setNewPolicyForm({...newPolicyForm, policyName: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Max Coverage Amount ($)</Form.Label>
                            <Form.Control 
                                type="number" 
                                required 
                                value={newPolicyForm.coverageAmount}
                                onChange={e => setNewPolicyForm({...newPolicyForm, coverageAmount: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Monthly Premium ($)</Form.Label>
                            <Form.Control 
                                type="number" 
                                required 
                                value={newPolicyForm.premium}
                                onChange={e => setNewPolicyForm({...newPolicyForm, premium: e.target.value})}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">Add Policy</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default ProviderDashboard;