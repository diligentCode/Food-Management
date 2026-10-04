import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MAJOR_CITIES_COORDINATES } from '../../services/dataService';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const initialRole = searchParams.get('role') || 'donor';
  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCityKey, setSelectedCityKey] = useState('jaipur');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(MAJOR_CITIES_COORDINATES.jaipur.lat);
  const [longitude, setLongitude] = useState(MAJOR_CITIES_COORDINATES.jaipur.lng);
  const [gpsStatus, setGpsStatus] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCityChange = (cityKey) => {
    setSelectedCityKey(cityKey);
    const cityData = MAJOR_CITIES_COORDINATES[cityKey];
    if (cityData) {
      setLatitude(cityData.lat);
      setLongitude(cityData.lng);
      setGpsStatus(`📍 Center coordinates selected for ${cityData.name}`);
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsStatus('Detecting live satellite/GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setLatitude(lat);
        setLongitude(lng);
        setGpsLoading(false);
        setGpsStatus(`✓ Exact GPS Captured: ${lat}, ${lng}`);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGpsLoading(false);
        setGpsStatus(`⚠️ Could not detect GPS (${err.message}). Using ${MAJOR_CITIES_COORDINATES[selectedCityKey]?.name || 'City'} coordinates.`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!organizationName || !email || !password) {
      setError('Please provide organization name, email, and password.');
      return;
    }

    try {
      setSubmitting(true);
      const chosenCity = MAJOR_CITIES_COORDINATES[selectedCityKey]?.name || 'Jaipur';
      const user = await register({
        name: name || organizationName,
        organizationName,
        email,
        phone,
        city: chosenCity,
        address: address ? `${address}, ${chosenCity}` : chosenCity,
        location: { lat: latitude, lng: longitude },
        role
      });

      if (user.role === 'donor') navigate('/donor');
      else navigate('/ngo');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: '#f8fafc' }}>
      <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '36px 30px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
            Join FoodConnect
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Choose your organization role to get started
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '4px', background: '#f1f5f9', borderRadius: '10px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => setRole('donor')}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: role === 'donor' ? 'var(--color-primary-dark)' : 'transparent',
              color: role === 'donor' ? '#ffffff' : 'var(--color-text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            🍲 Food Donor (Hotel/Caterer)
          </button>
          <button
            type="button"
            onClick={() => setRole('ngo')}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: role === 'ngo' ? 'var(--color-primary-dark)' : 'transparent',
              color: role === 'ngo' ? '#ffffff' : 'var(--color-text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            🤝 NGO / Food Bank
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '18px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '5px' }}>
              {role === 'donor' ? 'Hotel / Restaurant / Business Name' : 'NGO / Shelter / Foundation Name'}
            </label>
            <input
              type="text"
              required
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder={role === 'donor' ? 'e.g. Hotel Green Valley' : 'e.g. Hope Foundation'}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '5px' }}>
                Contact Person
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '5px' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98290 00000"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '5px' }}>
              Official Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@organization.org"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '5px' }}>
                Operational City *
              </label>
              <select
                value={selectedCityKey}
                onChange={(e) => handleCityChange(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.9rem', backgroundColor: '#ffffff' }}
              >
                {Object.entries(MAJOR_CITIES_COORDINATES).map(([key, city]) => (
                  <option key={key} value={key}>{city.name} ({city.state})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '5px' }}>
                GPS Pinning
              </label>
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={gpsLoading}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '10px 12px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {gpsLoading ? 'Detecting...' : '📍 Detect Live GPS'}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '5px' }}>
              Street Address & Landmark *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={role === 'donor' ? 'e.g. Tonk Road, Service Gate 2' : 'e.g. Sector 4, Community Kitchen Shelter'}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.9rem' }}
            />
            {gpsStatus && (
              <p style={{ fontSize: '0.75rem', color: gpsStatus.startsWith('✓') ? '#15803d' : '#b45309', marginTop: '4px', fontWeight: 600 }}>
                {gpsStatus}
              </p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '5px' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.9rem' }}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: '10px', width: '100%' }}>
            {submitting ? 'Creating Account...' : `Register as ${role === 'donor' ? 'Food Donor' : 'NGO Partner'}`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary-dark)', fontWeight: 700 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
