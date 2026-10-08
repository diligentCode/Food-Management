import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PendingApprovalPage() {
  const { currentUser, logout, checkApprovalStatus } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Live polling: automatically redirect if admin approves the account
  useEffect(() => {
    const interval = setInterval(() => {
      const refreshed = checkApprovalStatus();
      if (refreshed?.isApproved && refreshed?.approvalStatus === 'approved') {
        if (refreshed.role === 'donor') navigate('/donor');
        else if (refreshed.role === 'ngo') navigate('/ngo');
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleManualCheck = () => {
    setChecking(true);
    setStatusMessage('');
    setTimeout(() => {
      const refreshed = checkApprovalStatus();
      setChecking(false);
      if (refreshed?.isApproved && refreshed?.approvalStatus === 'approved') {
        setStatusMessage('✓ Approved! Redirecting to your dashboard...');
        setTimeout(() => {
          if (refreshed.role === 'donor') navigate('/donor');
          else if (refreshed.role === 'ngo') navigate('/ngo');
        }, 1000);
      } else if (refreshed?.approvalStatus === 'rejected') {
        setStatusMessage(`✕ Application was not approved: ${refreshed.rejectionReason || 'Contact support'}`);
      } else {
        setStatusMessage('⏳ Still under review. Platform administrator has been notified.');
      }
    }, 600);
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const isRejected = currentUser?.approvalStatus === 'rejected';

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: '#f8fafc'
    }}>
      <div className="card" style={{ maxWidth: '580px', width: '100%', padding: '40px 32px', textAlign: 'center' }}>
        {/* Animated Status Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: isRejected ? '#fee2e2' : '#fef3c7',
          color: isRejected ? '#dc2626' : '#d97706',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.4rem',
          marginBottom: '20px',
          boxShadow: isRejected ? '0 0 24px rgba(239, 68, 68, 0.2)' : '0 0 24px rgba(245, 158, 11, 0.2)'
        }}>
          {isRejected ? '⚠️' : '🛡️'}
        </div>

        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: '20px',
          backgroundColor: isRejected ? '#fee2e2' : '#fef3c7',
          color: isRejected ? '#991b1b' : '#92400e',
          fontSize: '0.78rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '10px'
        }}>
          {isRejected ? 'Application Rejected' : 'Awaiting Central Admin Approval'}
        </span>

        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: '0 0 10px 0' }}>
          {isRejected ? 'Registration Not Approved' : 'Verification Under Review'}
        </h1>

        <p style={{ color: '#64748b', fontSize: '0.94rem', lineHeight: '1.6', margin: '0 0 24px 0' }}>
          {isRejected ? (
            currentUser?.rejectionReason || 'Your organization credentials could not be verified by platform administrators.'
          ) : (
            <>
              Thank you for registering <strong>{currentUser?.organizationName || currentUser?.name}</strong>.
              To safeguard vulnerable communities and eliminate fake food postings, our Central Security Administrator verifies every organization before granting portal access.
            </>
          )}
        </p>

        {/* User Registration Details Summary */}
        <div style={{
          textAlign: 'left',
          background: '#f8fafc',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '18px 20px',
          marginBottom: '24px',
          fontSize: '0.88rem'
        }}>
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '8px', fontSize: '0.9rem' }}>
            Submitted Profile Summary
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: '#475569' }}>
            <div>Role: <strong style={{ textTransform: 'uppercase', color: '#0f172a' }}>{currentUser?.role}</strong></div>
            <div>City: <strong style={{ color: '#0f172a' }}>{currentUser?.city}</strong></div>
            <div>Email: <strong style={{ color: '#0f172a' }}>{currentUser?.email}</strong></div>
            <div>Phone: <strong style={{ color: '#0f172a' }}>{currentUser?.phone || 'N/A'}</strong></div>
          </div>
          <div style={{ marginTop: '8px', color: '#64748b', fontSize: '0.8rem' }}>
            Registered Address: {currentUser?.address || 'N/A'}
          </div>
        </div>

        {/* Live Notification to Admin Info Box */}
        {!isRejected && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '24px',
            fontSize: '0.82rem',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>🔔</span>
            <div style={{ textAlign: 'left' }}>
              <strong>Admin Alert Dispatched:</strong> The platform supervisor has received your registration in their real-time approval queue.
            </div>
          </div>
        )}

        {statusMessage && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.86rem',
            fontWeight: 600,
            marginBottom: '18px',
            backgroundColor: statusMessage.startsWith('✓') ? '#dcfce7' : '#fee2e2',
            color: statusMessage.startsWith('✓') ? '#15803d' : '#b91c1c'
          }}>
            {statusMessage}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {!isRejected && (
            <button
              type="button"
              onClick={handleManualCheck}
              disabled={checking}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              {checking ? 'Refreshing Platform Status...' : '🔄 Check Approval Status Now'}
            </button>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '10px', fontSize: '0.86rem' }}
          >
            Sign Out & Return Home
          </button>
        </div>
      </div>
    </div>
  );
}
