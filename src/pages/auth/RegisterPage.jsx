import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ALL_INDIAN_CITIES, getCityCoordinates } from '../../services/dataService';
import MapLocationPicker from '../../components/common/MapLocationPicker';

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
  const [cityName, setCityName] = useState('Jaipur');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(26.9124);
  const [longitude, setLongitude] = useState(75.7873);
  const [gpsStatus, setGpsStatus] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCityChange = (newCityName) => {
    setCityName(newCityName);
    const coords = getCityCoordinates(newCityName);
    if (coords) {
      setLatitude(coords.lat);
      setLongitude(coords.lng);
      setGpsStatus(`📍 Center coordinates selected for ${coords.name}`);
    }
  };

  const handleMapLocationSelect = ({ lat, lng, address: suggestedAddr }) => {
    setLatitude(lat);
    setLongitude(lng);
    if (suggestedAddr && (!address || address.trim().length === 0)) {
      setAddress(suggestedAddr);
    }
    setGpsStatus(`✓ Pinned on Map: Lat ${lat}, Lng ${lng}`);
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
      const chosenCity = cityName.trim() || 'Jaipur';
      const user = await register({
        name: name || organizationName,
        organizationName,
        email,
        phone,
        city: chosenCity,
        address: address ? `${address}, ${chosenCity}` : chosenCity,
        location: { lat: latitude, lng: longitude },
        role,
        password
      });

      // All new registrations require Central Admin approval before portal access
      navigate('/pending-approval');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: '#f8fafc' }}>
      <div className="card" style={{ maxWidth: '640px', width: '100%', padding: '36px 30px' }}>
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
              {role === 'donor' ? 'Hotel / Restaurant / Business Name' : 'NGO / Shelter / Foundation Name'} *
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
              Official Email Address *
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

          {/* City Selection with 150+ Indian Cities & Autocomplete */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)', margin: 0 }}>
                Operational City (All India Supported) *
              </label>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                150+ Cities & Districts
              </span>
            </div>
            <input
              type="text"
              required
              list="all-indian-cities-list"
              value={cityName}
              onChange={(e) => handleCityChange(e.target.value)}
              placeholder="Type or select your city (e.g. Jaipur, Pune, Indore...)"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.9rem' }}
            />
            <datalist id="all-indian-cities-list">
              {ALL_INDIAN_CITIES.map((c, idx) => (
                <option key={`${c.name}-${idx}`} value={c.name}>
                  {c.name}, {c.state}
                </option>
              ))}
            </datalist>

            {/* Quick city badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              {['Nagpur', 'Indore', 'Jaipur', 'Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Pune', 'Ahmedabad', 'Kolkata', 'Lucknow'].map((quickCity) => (
                <button
                  key={quickCity}
                  type="button"
                  onClick={() => handleCityChange(quickCity)}
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    background: cityName.toLowerCase() === quickCity.toLowerCase() ? 'var(--color-primary-dark)' : '#f8fafc',
                    color: cityName.toLowerCase() === quickCity.toLowerCase() ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {quickCity}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '5px' }}>
              Street Address & Facility Landmark *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={role === 'donor' ? 'e.g. Tonk Road, Service Gate 2' : 'e.g. Sector 4, Community Kitchen Shelter'}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.9rem' }}
            />
          </div>

          {/* Dynamic Interactive Leaflet Map Location Picker */}
          <div style={{ marginTop: '2px' }}>
            <MapLocationPicker
              initialLat={latitude}
              initialLng={longitude}
              initialAddress={address}
              label={role === 'donor' ? '🏨 Donor Headquarters' : '🤝 NGO Headquarters'}
              color={role === 'donor' ? '#0b462f' : '#1e40af'}
              symbol={role === 'donor' ? '🏨' : '🤝'}
              height="260px"
              onLocationSelect={handleMapLocationSelect}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '5px' }}>
              Password *
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
