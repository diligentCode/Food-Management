import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import AppNavbar from '../../components/layout/AppNavbar';
import { useAuth } from '../../context/AuthContext';
import { MAJOR_CITIES_COORDINATES } from '../../services/dataService';

export default function ProfilePage() {
  const { currentUser, userRole, updateProfile } = useAuth();

  const [organizationName, setOrganizationName] = useState(currentUser?.organizationName || '');
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || 'Jaipur');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [lat, setLat] = useState(currentUser?.location?.lat || 26.9124);
  const [lng, setLng] = useState(currentUser?.location?.lng || 75.7873);
  const [gpsStatus, setGpsStatus] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleCitySelect = (cityName) => {
    setCity(cityName);
    // Find matching city coordinates
    const match = Object.values(MAJOR_CITIES_COORDINATES).find(c => c.name.toLowerCase() === cityName.toLowerCase());
    if (match) {
      setLat(match.lat);
      setLng(match.lng);
      setGpsStatus(`📍 Center coordinates applied for ${cityName}`);
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsStatus('Acquiring live satellite GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = Number(pos.coords.latitude.toFixed(5));
        const newLng = Number(pos.coords.longitude.toFixed(5));
        setLat(newLat);
        setLng(newLng);
        setGpsLoading(false);
        setGpsStatus(`✓ Live GPS Updated: Lat ${newLat}, Lng ${newLng}`);
      },
      (err) => {
        console.warn('GPS error:', err);
        setGpsLoading(false);
        setGpsStatus(`⚠️ Geolocation error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      organizationName,
      name,
      phone,
      city,
      address,
      location: { lat, lng }
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <AppNavbar title="Organization Profile" />

        <div className="dashboard-body" style={{ maxWidth: '720px', margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
              Organization Profile 🏢
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
              Manage your verified organization credentials and contact information.
            </p>
          </div>

          {savedMessage && (
            <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '18px', fontWeight: 600 }}>
              ✓ Profile information saved successfully!
            </div>
          )}

          <div className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-primary-dark)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 800 }}>
                {organizationName ? organizationName.substring(0, 2).toUpperCase() : 'FC'}
              </div>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                  {organizationName || 'Organization Name'}
                </h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                  <span className="badge badge-green" style={{ textTransform: 'uppercase' }}>
                    Role: {userRole}
                  </span>
                  {currentUser?.isVerified && (
                    <span className="badge badge-success">
                      ✓ Verified Organization
                    </span>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Official Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Registered Email Address (Permanent)
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || ''}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#f1f5f9', color: '#64748b' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Operational City
                  </label>
                  <select
                    value={city}
                    onChange={(e) => handleCitySelect(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#ffffff' }}
                  >
                    {Object.values(MAJOR_CITIES_COORDINATES).map((c) => (
                      <option key={c.name} value={c.name}>{c.name} ({c.state})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Live GPS Recalibration
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    disabled={gpsLoading}
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '10px 14px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    {gpsLoading ? 'Detecting GPS...' : '📍 Calibrate My Live GPS'}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Pickup Address / Headquarters Street Landmark
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Tonk Road, Service Bay Gate 2"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Active Coordinates: <strong>{lat}, {lng}</strong>
                  </span>
                  {gpsStatus && (
                    <span style={{ fontSize: '0.75rem', color: gpsStatus.startsWith('✓') ? '#15803d' : '#b45309', fontWeight: 600 }}>
                      {gpsStatus}
                    </span>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', alignSelf: 'flex-start' }}>
                Save Profile Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
