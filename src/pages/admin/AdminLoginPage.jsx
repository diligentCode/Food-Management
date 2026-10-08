import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAuthService, MASTER_ADMIN_CONFIG } from '../../services/adminAuthService';

export default function AdminLoginPage() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState(location.state?.securityAlert || '');
  const [submitting, setSubmitting] = useState(false);
  const [lockout, setLockout] = useState({ isLocked: false, remainingSeconds: 0 });

  // Update lockout countdown
  useEffect(() => {
    const updateLockout = () => {
      const status = adminAuthService.getLockoutStatus();
      setLockout(status);
    };

    updateLockout();
    const timer = setInterval(updateLockout, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (lockout.isLocked) {
      setError(`Access Locked: Please wait ${lockout.remainingSeconds} seconds before re-attempting.`);
      return;
    }

    try {
      setSubmitting(true);
      await adminLogin(email, password, securityPin);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Administrative authentication failed.');
      const status = adminAuthService.getLockoutStatus();
      setLockout(status);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrefillAdmin = () => {
    setEmail(MASTER_ADMIN_CONFIG.email);
    setPassword(MASTER_ADMIN_CONFIG.password);
    setSecurityPin(MASTER_ADMIN_CONFIG.securityPin);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'radial-gradient(ellipse at top, #0f172a 0%, #020617 100%)',
      color: '#f8fafc'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(16, 185, 129, 0.1)',
        borderRadius: '16px',
        padding: '38px 32px'
      }}>
        {/* Header Badge */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0b462f 0%, #065f46 100%)',
            border: '2px solid #10b981',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            marginBottom: '14px',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
          }}>
            🛡️
          </div>

          <div style={{
            display: 'inline-block',
            padding: '3px 10px',
            borderRadius: '20px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            Security Level 4 &bull; Boss Gateway
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            Central Administration
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '6px' }}>
            Strict single-operator console. Authenticate with Master credentials & 2FA PIN.
          </p>
        </div>

        {/* Lockout Warning */}
        {lockout.isLocked && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.86rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '1.3rem' }}>🔒</span>
            <div>
              <strong>Console Temporarily Locked</strong>
              <div style={{ fontSize: '0.78rem', marginTop: '2px' }}>
                Brute-force protection active. Re-enabling in: <strong>{lockout.remainingSeconds}s</strong>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && !lockout.isLocked && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '11px 14px',
            borderRadius: '10px',
            fontSize: '0.84rem',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Master Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@foodconnect.org"
              disabled={lockout.isLocked}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid #334155',
                color: '#ffffff',
                outline: 'none',
                fontSize: '0.92rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Master Security Passcode
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={lockout.isLocked}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid #334155',
                color: '#ffffff',
                outline: 'none',
                fontSize: '0.92rem'
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Master 2FA PIN (6 Digits)
              </label>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '0.74rem', cursor: 'pointer', fontWeight: 600 }}
              >
                {showPin ? 'Hide PIN' : 'Show PIN'}
              </button>
            </div>
            <input
              type={showPin ? 'text' : 'password'}
              maxLength={6}
              value={securityPin}
              onChange={(e) => setSecurityPin(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="749201"
              disabled={lockout.isLocked}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid #334155',
                color: '#34d399',
                fontFamily: 'monospace',
                fontSize: '1.2rem',
                letterSpacing: '0.3em',
                textAlign: 'center',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || lockout.isLocked}
            style={{
              marginTop: '10px',
              width: '100%',
              padding: '13px',
              borderRadius: '10px',
              background: lockout.isLocked
                ? '#475569'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: lockout.isLocked ? 'not-allowed' : 'pointer',
              boxShadow: lockout.isLocked ? 'none' : '0 10px 20px -5px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            {submitting ? 'Verifying Hardware Credentials...' : 'Unlock Admin Central Console ⚡'}
          </button>
        </form>

        {/* Demo Assistant Fill Button */}
        <div style={{
          marginTop: '20px',
          padding: '12px',
          borderRadius: '10px',
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px dashed #334155',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: '8px' }}>
            🔑 Master Admin Credentials Quick-Fill (Single Boss Operator)
          </div>
          <button
            type="button"
            onClick={handlePrefillAdmin}
            style={{
              background: 'transparent',
              border: '1px solid #10b981',
              color: '#34d399',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Fill Master Operator Credentials
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.82rem', color: '#64748b' }}>
          Not an administrator?{' '}
          <Link to="/login" style={{ color: '#10b981', fontWeight: 700 }}>
            Return to User Login
          </Link>
        </div>
      </div>
    </div>
  );
}
