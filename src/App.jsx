import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';

// Simple placeholder page for auth routes during Phase 0
function AuthPlaceholder({ title, description }) {
  return (
    <div className="container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px' }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '40px 32px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 20px auto' }}>
          🌱
        </div>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary-dark)', marginBottom: '8px' }}>{title}</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.5' }}>
          {description}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/login" 
            element={
              <AuthPlaceholder 
                title="FoodConnect Login" 
                description="Authentication module is configured next in Phase 2. You will be able to log in as a Donor or NGO."
              />
            } 
          />
          <Route 
            path="/register" 
            element={
              <AuthPlaceholder 
                title="Create an Account" 
                description="Registration module is configured in Phase 2 with full Donor and NGO role selection."
              />
            } 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
