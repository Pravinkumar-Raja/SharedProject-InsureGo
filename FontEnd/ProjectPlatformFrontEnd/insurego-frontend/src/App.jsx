import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; 
import { 
  ShieldCheck, Activity, Zap, TrendingUp, Users, CheckCircle, 
  HeartPulse, ArrowRight, Star, Bell, CreditCard, FileText 
} from 'lucide-react';
import './App.css'; 

/* Pages */
import Login from './pages/Login';         
import Register from './pages/Register';   
import PatientDashboard from './pages/PatientDashboard'; 
import DoctorDashboard from './pages/DoctorDashboard';   
import ProviderDashboard from './pages/ProviderDashboard'; 

function LandingPageContent() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-wrapper">
      <nav className={`glass-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="brand">
           <div className="logo-cube">
             <div className="cube-face front"></div>
             <div className="cube-face back"></div>
             <div className="cube-face right"></div>
             <div className="cube-face left"></div>
             <div className="cube-face top"></div>
             <div className="cube-face bottom"></div>
           </div>
           <span className="brand-text">InsureGo</span>
        </div>
        
        <div className="nav-links desktop-only">
           <a href="#features">Platform</a>
           <a href="#reviews">Success Stories</a>
           <a href="#claims">Claims</a>
        </div>

        <div className="nav-actions">
           <Link to="/login" className="link-login">Log In</Link>
           <Link to="/register" className="btn-glow-primary">Get Started</Link>
        </div>
      </nav>

      <header className="hero-3d">
        <div className="hero-text fade-in-up">
           <div className="status-pill">
              <span className="dot pulse"></span> V2.0 System Online
           </div>
           <h1>The Operating System for <br/><span className="gradient-text">Modern Healthcare.</span></h1>
           <p>InsureGo is the intelligent bridge between patients, providers, and payers.</p>
           
           <div className="cta-row">
              <Link to="/register" className="btn-primary-lg">Create Free Account <ArrowRight size={18} /></Link>
              <div className="rating-box">
                 <div className="stars">★★★★★</div>
                 <span>Trusted by 12,000+ members</span>
              </div>
           </div>
        </div>

        <div className="hero-visual-3d">
           <div className="layer-card chart-card floating-slow">
              <div className="card-header"><TrendingUp size={16} color="#0ea5e9"/><span>Claim Recovery</span></div>
              <div className="css-chart"><div className="bar active" style={{height: '100%'}}></div></div>
           </div>
           <div className="layer-card doctor-card floating-medium">
              <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Doctor" className="doctor-img"/>
           </div>
           <div className="layer-card success-card floating-fast">
              <div className="icon-circle-check"><CheckCircle size={24} color="white" /></div>
              <div className="success-text"><strong>Coverage Active</strong></div>
           </div>
        </div>
      </header>

      {/* Other landing sections... */}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPageContent />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Syncing route with Login logic */}
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/provider-dashboard" element={<ProviderDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;