import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; 
import { Shield, Zap, Heart, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';
import './App.css'; 

/* ⚠️ IMPORTANT: 
   If your files are in a folder like './pages/', you MUST update these imports. 
   I am using the common assumption that all pages are in 'src'.
*/
import Login from './pages/Login';         
import Register from './pages/Register';   
import PatientDashboard from './pages/PatientDashboard'; 
import DoctorDashboard from './pages/DoctorDashboard';   
import ProviderDashboard from './pages/ProviderDashboard'; 

// --- LANDING PAGE CONTENT COMPONENT ---
function LandingPageContent() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* --- LOADING SCREEN --- */}
      {loading && (
        <div className="loader-container">
          <div className="loader-logo">InsureGo</div>
          <div className="loader-bar">
            <div className="loader-progress"></div>
          </div>
        </div>
      )}

      {/* --- NAVBAR --- */}
      <nav className="pro-navbar">
        <div className="nav-logo">
          <Shield style={{ color: 'var(--accent)' }} size={32} />
          <span>InsureGo</span>
        </div>
        
        <div className="nav-links">
          <a href="#">Products</a>
          <a href="#">Claims</a>
          <a href="#">About Us</a>
          
          {/* LOG IN BUTTON (Links to Login) */}
          <Link to="/login" className="btn-glow" style={{ padding: '8px 20px', fontSize: '0.9rem', textDecoration: 'none' }}>
            Log In
          </Link>

          {/* GET STARTED BUTTON (Links to Register) */}
          <Link to="/register" className="btn-glow" style={{ padding: '8px 20px', fontSize: '0.9rem', textDecoration: 'none' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="hero-section">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>

        <div className="hero-content">
          <div style={{ display:'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.1)', padding: '8px 20px', borderRadius: '30px', fontSize: '0.9rem', marginBottom: '30px', border: '1px solid rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
            <div style={{ background: '#2dd4bf', width: '20px', height: '20px', borderRadius: '50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', color:'#0f172a', fontWeight:'bold' }}>"</div>
            <span>"The best investment I made for my family." — Sarah J.</span>
          </div>
          
          <h1 className="hero-title">
            Insurance that actually <br />
            <span>keeps up with you.</span>
          </h1>
          
          <div className="hero-widget-container">
            <div className="growth-widget">
               <div className="widget-header">
                 <div>
                   <div className="widget-label">Total Insured Members</div>
                   <div className="widget-stat">124,500+</div>
                 </div>
                 <div className="trend-badge">
                   <TrendingUp size={16} />
                   +28% Growth
                 </div>
               </div>
               <div className="chart-container">
                 <div className="chart-bar" style={{ '--target-height': '40%', animationDelay: '0.1s' }}></div>
                 <div className="chart-bar" style={{ '--target-height': '65%', animationDelay: '0.2s' }}></div>
                 <div className="chart-bar" style={{ '--target-height': '55%', animationDelay: '0.3s' }}></div>
                 <div className="chart-bar" style={{ '--target-height': '80%', animationDelay: '0.4s' }}></div>
                 <div className="chart-bar active" style={{ '--target-height': '100%', animationDelay: '0.5s' }}></div>
               </div>
               <div className="chart-labels">
                 <span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
               </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.8 }}>
              "Peace of mind is just one click away."
            </p>
           
          </div>
        </div>
      </header>

      {/* --- FEATURES SECTION --- */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Zap size={30} /></div>
            <h3>Lightning Fast Claims</h3>
            <p style={{ color: 'var(--secondary)', lineHeight: '1.6' }}>AI-powered processing means most claims are settled in minutes.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Shield size={30} /></div>
            <h3>Bank-Grade Security</h3>
            <p style={{ color: 'var(--secondary)', lineHeight: '1.6' }}>Your sensitive data is protected by state-of-the-art 256-bit encryption.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Heart size={30} /></div>
            <h3>Tailored For You</h3>
            <p style={{ color: 'var(--secondary)', lineHeight: '1.6' }}>Customize your coverage boundaries to fit your exact lifestyle needs.</p>
          </div>
        </div>
      </section>

      {/* --- START JOURNEY SECTION --- */}
      <section className="start-journey-section">
        <div className="journey-container">
          <div className="journey-content">
            <span style={{ color: 'var(--accent-dark)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '10px', display: 'block' }}>Ready to switch?</span>
            <h2>Secure your future in <br/> <span style={{ color: 'var(--accent-dark)' }}>clicks, not paperwork.</span></h2>
            <p style={{ color: 'var(--secondary)', marginBottom: '30px', fontSize: '1.1rem', lineHeight: '1.6' }}>It takes less than 2 minutes to get covered.</p>
            <div>
              <Link to="/register" className="btn-glow" style={{ textDecoration: 'none' }}>
                Start Your Application <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          <div className="journey-visual">
            <div className="trust-card">
              <ShieldCheck size={40} style={{ color: 'var(--accent)', marginBottom: '15px' }} />
              <h3 style={{ margin: '0 0 10px 0' }}>100% Secure</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: '1.5' }}>Encrypted data and coverage backed by top-tier global partners.</p>
              <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent)' }}>Verified Partner</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="footer">
        <div className="footer-content">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Shield style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>InsureGo</span>
            </div>
            <p style={{ lineHeight: '1.6', fontSize: '0.9rem' }}>Insurance for the modern world.</p>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">File a Claim</a></li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms</a></li>
            </ul>
          </div>
        </div>
        <div style={{ textAlign: 'center', borderTop: '1px solid #334155', paddingTop: '30px', fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} InsureGo Inc.
        </div>
      </footer>

    </>
  );
}

// --- MAIN APP COMPONENT (The Router Container) ---
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPageContent />} />
        
        {/* PUBLIC PAGES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* ROLE-BASED DASHBOARDS */}
        <Route path="/user-dashboard" element={<PatientDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/provider-dashboard" element={<ProviderDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;