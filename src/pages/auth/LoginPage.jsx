import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
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
        navigate('/admin/login');
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

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: '#f8fafc' }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '36px 30px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-primary-dark)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontSize: '1.5rem', marginBottom: '12px' }}>
            🌱
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Sign in to access your FoodConnect dashboard
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '18px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. hotel.greenvalley@example.com"
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
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.9rem' }}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: '8px', width: '100%' }}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-primary-dark)', fontWeight: 700 }}>
            Create an Account
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--color-border)' }}>
          <Link to="/admin/login" style={{ fontSize: '0.78rem', color: '#64748b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span>🛡️</span> Central Security Operator Gateway
          </Link>
        </div>
      </div>
    </div>
  );
}
