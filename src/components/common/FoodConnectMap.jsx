import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { calculateDistanceKm } from '../../services/dataService';

// Custom SVG Pin Icon for route maps
const createMapPin = (symbol, label, color) => {
  return L.divIcon({
    className: 'fc-route-pin',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
      ">
        <div style="
          background: ${color};
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 800;
          font-size: 11px;
          white-space: nowrap;
          box-shadow: 0 4px 14px rgba(0,0,0,0.35);
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: inherit;
        ">
          <span style="font-size: 13px;">${symbol}</span>
          <span>${label}</span>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${color};
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

export default function FoodConnectMap({
  donorLocation = { lat: 26.8520, lng: 75.8050, label: 'Hotel Green Valley', address: 'Tonk Road' },
  ngoLocation = { lat: 26.8920, lng: 75.8250, label: 'Hope Foundation', address: 'Distribution Center' },
  pickupLocation = null,
  height = '340px',
  showRoute = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const donorLat = donorLocation?.lat || 26.8520;
  const donorLng = donorLocation?.lng || 75.8050;
  const ngoLat = ngoLocation?.lat || 26.8920;
  const ngoLng = ngoLocation?.lng || 75.8250;

  const distanceKm = calculateDistanceKm(donorLat, donorLng, ngoLat, ngoLng);
  const estMinutes = Math.max(5, Math.round(distanceKm * 2.5));
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${donorLat},${donorLng}&destination=${ngoLat},${ngoLng}`;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const bounds = L.latLngBounds([
      [donorLat, donorLng],
      [ngoLat, ngoLng]
    ]);

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false
    });

    // Street tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Donor Marker (Hotel / Food Source)
    const donorMarker = L.marker([donorLat, donorLng], {
      icon: createMapPin('🏨', donorLocation.label || 'Food Donor Pickup', '#0b462f')
    }).addTo(map);

    donorMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px;">
        <strong>🏨 ${donorLocation.label || 'Food Donor'}</strong>
        <p style="margin: 4px 0 0 0; color: #475569;">${donorLocation.address || 'Pickup Point'}</p>
      </div>
    `);

    // NGO Marker (Recipient / Food Bank)
    const ngoMarker = L.marker([ngoLat, ngoLng], {
      icon: createMapPin('🤝', ngoLocation.label || 'Recipient NGO', '#15803d')
    }).addTo(map);

    ngoMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px;">
        <strong>🤝 ${ngoLocation.label || 'Recipient NGO'}</strong>
        <p style="margin: 4px 0 0 0; color: #475569;">${ngoLocation.address || 'Distribution Center'}</p>
      </div>
    `);

    // Route Polyline (Green dashed line connecting donor and NGO)
    if (showRoute) {
      const routeLine = L.polyline(
        [
          [donorLat, donorLng],
          [ngoLat, ngoLng]
        ],
        {
          color: '#10b981',
          weight: 5,
          opacity: 0.85,
          dashArray: '8, 8'
        }
      ).addTo(map);
    }

    // Fit bounds with comfortable padding so both markers and labels are visible
    map.fitBounds(bounds, { padding: [60, 60] });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [donorLat, donorLng, ngoLat, ngoLng]);

  return (
    <div style={{
      width: '100%',
      height: height,
      borderRadius: '16px',
      overflow: 'hidden',
      position: 'relative',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Real Interactive Leaflet Map */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Info Overlay Badge */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        padding: '8px 14px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: '1px solid var(--color-border)',
        zIndex: 500
      }}>
        <span style={{ fontSize: '1.2rem' }}>📍</span>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
            Approx. {distanceKm} km transit distance
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Estimated vehicle transit: ~{estMinutes} mins
          </div>
        </div>
      </div>

      {/* Direct Google Maps Directions Navigation Button */}
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
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          zIndex: 500
        }}
      >
        <span>🗺️</span> Open in Google Maps
      </a>
    </div>
  );
}
