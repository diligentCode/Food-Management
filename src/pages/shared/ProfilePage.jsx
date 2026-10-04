import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import AppNavbar from '../../components/layout/AppNavbar';
import { useAuth } from '../../context/AuthContext';
import { ALL_INDIAN_CITIES, getCityCoordinates } from '../../services/dataService';
import MapLocationPicker from '../../components/common/MapLocationPicker';

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
  const [savedMessage, setSavedMessage] = useState(false);

  const handleCitySelect = (cityName) => {
    setCity(cityName);
    const coords = getCityCoordinates(cityName);
    if (coords) {
      setLat(coords.lat);
      setLng(coords.lng);
      setGpsStatus(`📍 Center coordinates applied for ${coords.name}`);
    }
  };

  const handleMapLocationSelect = ({ lat: newLat, lng: newLng, address: suggestedAddr }) => {
    setLat(newLat);
    setLng(newLng);
    if (suggestedAddr && (!address || address.trim().length === 0)) {
      setAddress(suggestedAddr);
    }
    setGpsStatus(`✓ Pinned on Map: Lat ${newLat}, Lng ${newLng}`);
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

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>
                    Operational City (All India Supported) *
                  </label>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    150+ Indian Cities & Municipalities
                  </span>
                </div>
                <input
                  type="text"
                  required
                  list="profile-indian-cities-list"
                  value={city}
                  onChange={(e) => handleCitySelect(e.target.value)}
                  placeholder="Type or select city (e.g. Jaipur, Bengaluru, Lucknow...)"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
                <datalist id="profile-indian-cities-list">
                  {ALL_INDIAN_CITIES.map((c, idx) => (
                    <option key={`prof-${c.name}-${idx}`} value={c.name}>
                      {c.name}, {c.state}
                    </option>
                  ))}
                </datalist>

                {/* Popular city badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {['Jaipur', 'Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Pune', 'Ahmedabad', 'Kolkata', 'Lucknow'].map((quickCity) => (
                    <button
                      key={quickCity}
                      type="button"
                      onClick={() => handleCitySelect(quickCity)}
                      style={{
                        padding: '2px 8px',
                        fontSize: '0.72rem',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        background: city.toLowerCase() === quickCity.toLowerCase() ? 'var(--color-primary-dark)' : '#f8fafc',
                        color: city.toLowerCase() === quickCity.toLowerCase() ? '#ffffff' : '#475569',
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
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Pickup Address / Headquarters Street Landmark *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Tonk Road, Service Bay Gate 2"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
              </div>

              {/* Dynamic Interactive Leaflet Map Location Picker */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Pin Headquarters / Loading Dock Location on Map
                </label>
                <MapLocationPicker
                  initialLat={lat}
                  initialLng={lng}
                  initialAddress={address}
                  label={userRole === 'donor' ? '🏨 Donor Headquarters' : '🤝 NGO Operations Base'}
                  color={userRole === 'donor' ? '#0b462f' : '#1e40af'}
                  symbol={userRole === 'donor' ? '🏨' : '🤝'}
                  height="280px"
                  onLocationSelect={handleMapLocationSelect}
                />
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
