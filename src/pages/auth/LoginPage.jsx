import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAuthService } from '../../services/adminAuthService';

export default function LoginPage() {
  const { login, adminLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode: 'user' (Donor/NGO) | 'admin' (Boss Console)
  const initialMode = searchParams.get('mode') === 'admin' || searchParams.get('role') === 'admin' ? 'admin' : 'user';
  const [loginMode, setLoginMode] = useState(initialMode);

  // Common / User State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Admin Specific State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminOtp, setAdminOtp] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [otpSentMsg, setOtpSentMsg] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [lockout, setLockout] = useState({ isLocked: false, remainingSeconds: 0 });

  // Load configured Admin Email on mount
  useEffect(() => {
    const admin = adminAuthService.getAdminProfile();
    setAdminEmail(admin.email || 'anuditfamily1222@gmail.com');
  }, []);

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

  // OTP Countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Switch modes
  const handleSwitchMode = (newMode) => {
    setError('');
    setOtpSentMsg('');
    setLoginMode(newMode);
    setSearchParams(newMode === 'admin' ? { mode: 'admin' } : {});
  };

  // Dispatch real Email OTP via EmailJS
  const handleSendOTP = async () => {
    setError('');
    setOtpSentMsg('');

    if (!adminEmail) {
      setError('Please provide the Admin Email.');
      return;
    }

    if (!adminPassword) {
      setError('Please enter your Admin Password before requesting an OTP.');
      return;
    }

    try {
      setSendingOtp(true);
      const res = await adminAuthService.sendEmailOTP(adminEmail);
      setOtpCountdown(45); // 45 seconds before resend allowed

      if (res.emailDelivered) {
        setOtpSentMsg(`✓ Real Email OTP successfully dispatched to ${res.email}! Please check your Gmail inbox (and Spam folder).`);
      } else {
        setError(`Email Delivery Error: ${res.emailErrorMsg || 'Could not deliver email to ' + res.email}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to dispatch email OTP.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Submit User Login (Donor / NGO)
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      const user = await login(email, password);
      if (user.role === 'admin') {
        handleSwitchMode('admin');
      } else if (user.approvalStatus === 'pending' || !user.isApproved) {
        navigate('/pending-approval');
      } else if (user.role === 'donor') {
        navigate('/donor');
      } else if (user.role === 'ngo') {
        navigate('/ngo');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Admin Login (Boss Console)
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (lockout.isLocked) {
      setError(`Access Locked: Please wait ${lockout.remainingSeconds}s before retrying.`);
      return;
    }

    if (!adminEmail || !adminPassword || !adminOtp) {
      setError('Please enter Admin Email, Password, and the 6-Digit Email OTP.');
      return;
    }

    try {
      setSubmitting(true);
      await adminLogin(adminEmail, adminPassword, adminOtp);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Administrator authentication failed.');
      const status = adminAuthService.getLockoutStatus();
      setLockout(status);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: loginMode === 'admin'
        ? 'radial-gradient(ellipse at top, #0f172a 0%, #020617 100%)'
        : '#f8fafc',
      transition: 'background 0.3s ease'
    }}>
      <div className="card" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '36px 30px',
        backgroundColor: loginMode === 'admin' ? 'rgba(15, 23, 42, 0.95)' : '#ffffff',
        borderColor: loginMode === 'admin' ? 'rgba(16, 185, 129, 0.4)' : 'var(--color-border)',
        boxShadow: loginMode === 'admin'
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(16, 185, 129, 0.15)'
          : 'var(--shadow-md)',
        color: loginMode === 'admin' ? '#f8fafc' : 'var(--color-text-main)',
        transition: 'all 0.3s ease'
      }}>
        {/* Top Header Mode Toggle Buttons */}
        <div style={{
          display: 'flex',
          background: loginMode === 'admin' ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '26px'
        }}>
          <button
            type="button"
            onClick={() => handleSwitchMode('user')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '7px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: loginMode === 'user' ? '#ffffff' : 'transparent',
              color: loginMode === 'user' ? '#0f172a' : loginMode === 'admin' ? '#94a3b8' : '#64748b',
              boxShadow: loginMode === 'user' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            👥 User Login (Donor / NGO)
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('admin')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '7px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: loginMode === 'admin' ? 'linear-gradient(135deg, #0b462f 0%, #065f46 100%)' : 'transparent',
              color: loginMode === 'admin' ? '#10b981' : '#64748b',
              boxShadow: loginMode === 'admin' ? '0 2px 8px rgba(16, 185, 129, 0.2)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            🛡️ Admin Login
          </button>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* MODE A: REGULAR USER LOGIN (DONOR / NGO)                          */}
        {/* ----------------------------------------------------------------- */}
        {loginMode === 'user' ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--color-primary-dark)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                fontSize: '1.5rem',
                marginBottom: '12px'
              }}>
                🌱
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>
                Welcome Back
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
                Sign in to your Donor or NGO organization account
              </p>
            </div>

            {error && (
              <div style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #f87171',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '18px'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. hotel.greenvalley@example.com"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.9rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ marginTop: '8px', width: '100%', padding: '11px' }}
              >
                {submitting ? 'Signing in...' : 'Sign In as Donor / NGO'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                Create an Account
              </Link>
            </div>

            {/* Prominent Admin Switch Button */}
            <div style={{ marginTop: '22px', paddingTop: '18px', borderTop: '1px dashed var(--color-border)', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => handleSwitchMode('admin')}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '9px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>🛡️</span>
                <span>Platform Supervisor / Admin Login</span>
              </button>
            </div>
          </>
        ) : (
          /* ----------------------------------------------------------------- */
          /* MODE B: BOSS ADMIN LOGIN (EMAIL + HASHED PASSWORD + EMAIL OTP)    */
          /* ----------------------------------------------------------------- */
          <>
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #0b462f 0%, #065f46 100%)',
                border: '2px solid #10b981',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.7rem',
                marginBottom: '10px',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
              }}>
                🛡️
              </div>
              <div style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid #10b981',
                color: '#34d399',
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                marginBottom: '6px'
              }}>
                CENTRAL SUPERVISOR CONSOLE
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Platform Admin Access
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '4px' }}>
                Protected with Cryptographic Hash & Real Email OTP
              </p>
            </div>

            {/* Lockout Banner */}
            {lockout.isLocked && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '12px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                🔒 <strong>Console Locked:</strong> Too many failed attempts. Try again in <strong>{lockout.remainingSeconds}s</strong>.
              </div>
            )}

            {error && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                marginBottom: '16px'
              }}>
                {error}
              </div>
            )}

            {otpSentMsg && (
              <div style={{
                backgroundColor: otpSentMsg.startsWith('✓') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                border: `1px solid ${otpSentMsg.startsWith('✓') ? '#10b981' : '#f59e0b'}`,
                color: otpSentMsg.startsWith('✓') ? '#6ee7b7' : '#fcd34d',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                marginBottom: '14px',
                lineHeight: '1.4'
              }}>
                {otpSentMsg}
              </div>
            )}

            <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '5px' }}>
                  Admin Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="anuditfamily1222@gmail.com"
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '5px' }}>
                  Admin Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                    style={{
                      width: '100%',
                      padding: '9px 40px 9px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    {showAdminPass ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              {/* 6-Digit Email OTP Input & Send Button */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>
                    Email 2FA Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={sendingOtp || otpCountdown > 0}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: otpCountdown > 0 ? '#64748b' : '#34d399',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: otpCountdown > 0 ? 'not-allowed' : 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    {sendingOtp
                      ? 'Sending...'
                      : otpCountdown > 0
                      ? `Resend in ${otpCountdown}s`
                      : '📧 Send OTP to Email'}
                  </button>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  value={adminOtp}
                  onChange={(e) => setAdminOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP received in email"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#ffffff',
                    fontSize: '1.05rem',
                    letterSpacing: '0.15em',
                    fontWeight: 700,
                    textAlign: 'center',
                    outline: 'none'
                  }}
                />
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                  Click "Send OTP to Email" to receive the code at <strong>{adminEmail}</strong>.
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting || lockout.isLocked}
                style={{
                  marginTop: '10px',
                  width: '100%',
                  padding: '11px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: submitting || lockout.isLocked ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.2s ease'
                }}
              >
                {submitting ? 'Verifying Credentials...' : '🔓 Enter Supervisor Console'}
              </button>
            </form>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => handleSwitchMode('user')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>←</span> Switch to Donor / NGO Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
