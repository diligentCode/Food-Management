import React from 'react';
import { calculateDistanceKm } from '../../services/dataService';

export default function FoodConnectMap({
  donorLocation = { lat: 26.8520, lng: 75.8050, label: 'Hotel Green Valley' },
  ngoLocation = { lat: 26.8920, lng: 75.8250, label: 'Hope Foundation' },
  pickupLocation = { lat: 26.8520, lng: 75.8050, label: 'Tonk Road Kitchen' },
  height = '320px',
  showRoute = true
}) {
  const distanceKm = calculateDistanceKm(
    donorLocation.lat,
    donorLocation.lng,
    ngoLocation.lat,
    ngoLocation.lng
  );

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${ngoLocation.lat},${ngoLocation.lng}&destination=${donorLocation.lat},${donorLocation.lng}`;

  return (
    <div style={{
      width: '100%',
      height: height,
      borderRadius: '16px',
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: '#e5e7eb',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Visual Vector Map Canvas */}
      <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="none" style={{ display: 'block', background: '#f1f5f9' }}>
        {/* Background Grid & Roads Pattern */}
        <defs>
          <pattern id="roadGrid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#e2e8f0" strokeWidth="2" />
          </pattern>
        </defs>
        <rect width="800" height="400" fill="url(#roadGrid)" />

        {/* Decorative City River / Green Parks */}
        <path d="M 0 320 Q 250 280 450 350 T 800 300 L 800 400 L 0 400 Z" fill="#dcfce7" opacity="0.6" />
        <path d="M 120 40 Q 280 120 500 60 T 800 100" fill="none" stroke="#cbd5e1" strokeWidth="12" />
        <path d="M 400 0 Q 380 200 420 400" fill="none" stroke="#cbd5e1" strokeWidth="16" />

        {/* Dynamic Route Line */}
        {showRoute && (
          <path
            d="M 240 220 C 320 200, 480 260, 560 140"
            fill="none"
            stroke="#10b981"
            strokeWidth="5"
            strokeDasharray="8 6"
          />
        )}

        {/* Donor Marker */}
        <g transform="translate(240, 220)">
          <circle r="22" fill="#0b462f" />
          <circle r="30" fill="#0b462f" opacity="0.2" />
          <text textAnchor="middle" dy="6" fill="#ffffff" fontSize="14" fontWeight="bold">🏨</text>
          <rect x="-60" y="26" width="120" height="24" rx="6" fill="#0b462f" />
          <text textAnchor="middle" x="0" y="42" fill="#ffffff" fontSize="10" fontWeight="bold">
            {donorLocation.label || 'Donor Pickup'}
          </text>
        </g>

        {/* NGO Marker */}
        <g transform="translate(560, 140)">
          <circle r="22" fill="#15803d" />
          <circle r="30" fill="#15803d" opacity="0.2" />
          <text textAnchor="middle" dy="6" fill="#ffffff" fontSize="14" fontWeight="bold">🤝</text>
          <rect x="-60" y="26" width="120" height="24" rx="6" fill="#15803d" />
          <text textAnchor="middle" x="0" y="42" fill="#ffffff" fontSize="10" fontWeight="bold">
            {ngoLocation.label || 'NGO Headquarters'}
          </text>
        </g>
      </svg>

      {/* Floating Info Overlay Badge */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        padding: '8px 14px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: '1px solid var(--color-border)'
      }}>
        <span style={{ fontSize: '1.2rem' }}>📍</span>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
            Approx. {distanceKm} km away
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Estimated travel: ~12-15 mins
          </div>
        </div>
      </div>

      {/* External Map Action */}
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          background: 'var(--color-primary-dark)',
          color: '#ffffff',
          padding: '8px 14px',
          borderRadius: '8px',
          fontSize: '0.78rem',
          fontWeight: 700,
          textDecoration: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <span>🗺️</span> Open in Google Maps
      </a>
    </div>
  );
}
