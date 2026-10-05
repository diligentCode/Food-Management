import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom SVG Pin Icon creator (never breaks or requires external image files)
const createPinIcon = (label = 'Your Location', color = '#0b462f', symbol = '📍') => {
  return L.divIcon({
    className: 'fc-map-pin',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
        pointer-events: auto;
        cursor: grab;
      ">
        <div style="
          background: ${color};
          color: #ffffff;
          padding: 5px 10px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 11px;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: inherit;
        ">
          <span>${symbol}</span>
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

export default function MapLocationPicker({
  initialLat = 26.9124,
  initialLng = 75.7873,
  initialAddress = '',
  label = 'Selected Location',
  color = '#0b462f',
  symbol = '📍',
  height = '340px',
  onLocationSelect
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [statusText, setStatusText] = useState('Click anywhere on the map or drag the pin to set your exact location.');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Avoid double initialization
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: true
    });

    // High quality OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Draggable Marker
    const marker = L.marker([initialLat, initialLng], {
      icon: createPinIcon(label, color, symbol),
      draggable: true
    }).addTo(map);

    marker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      updateCoordinates(pos.lat, pos.lng);
    });

    // Click anywhere on map to move pin
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      updateCoordinates(lat, lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center when initial coordinates change from outside (e.g. city selector)
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      if (Math.abs(currentLat - initialLat) > 0.001 || Math.abs(currentLng - initialLng) > 0.001) {
        mapInstanceRef.current.setView([initialLat, initialLng], 14);
        markerRef.current.setLatLng([initialLat, initialLng]);
        setCurrentLat(initialLat);
        setCurrentLng(initialLng);
      }
    }
  }, [initialLat, initialLng]);

  const updateCoordinates = (lat, lng, suggestedAddress = '') => {
    const roundLat = Number(lat.toFixed(5));
    const roundLng = Number(lng.toFixed(5));
    setCurrentLat(roundLat);
    setCurrentLng(roundLng);
    setStatusText(`✓ Pinned: Lat ${roundLat}, Lng ${roundLng}`);

    if (onLocationSelect) {
      onLocationSelect({
        lat: roundLat,
        lng: roundLng,
        address: suggestedAddress
      });
    }

    // Optional reverse geocode to get street name
    if (!suggestedAddress) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${roundLat}&lon=${roundLng}&zoom=18&addressdetails=1`, {
        headers: { 'Accept-Language': 'en' }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.display_name) {
            const shortName = data.display_name.split(',').slice(0, 3).join(',').trim();
            setStatusText(`✓ Selected: ${shortName}`);
            if (onLocationSelect) {
              onLocationSelect({
                lat: roundLat,
                lng: roundLng,
                address: shortName
              });
            }
          }
        })
        .catch(() => {});
    }
  };

  // Live Location Search via OpenStreetMap
  const handleSearch = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in&limit=5`, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        setSearchResults(data);
      } else {
        setStatusText(`No results found for "${searchQuery}". You can pan and click on the map directly.`);
      }
    } catch (err) {
      console.warn('Location search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
      markerRef.current.setLatLng([lat, lng]);
    }
    const shortAddress = result.display_name.split(',').slice(0, 3).join(',').trim();
    updateCoordinates(lat, lng, shortAddress);
    setSearchResults([]);
    setSearchQuery('');
  };

  // Device GPS Location
  const handleLiveGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setStatusText('Acquiring live satellite GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
          markerRef.current.setLatLng([lat, lng]);
        }
        updateCoordinates(lat, lng);
        setGpsLoading(false);
      },
      (err) => {
        console.warn('GPS error:', err);
        setGpsLoading(false);
        setStatusText(`⚠️ GPS unavailable (${err.message}). Click on the map to pin manually.`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const googleMapsVerifyUrl = `https://www.google.com/maps?q=${currentLat},${currentLng}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {/* Search & Actions Bar */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', flex: 1, minWidth: '220px', gap: '6px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleSearch(e);
              }
            }}
            placeholder="Search locality, street, or landmark..."
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              fontSize: '0.85rem'
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSearch(e);
            }}
            disabled={searching}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.82rem', padding: '8px 12px' }}
          >
            {searching ? 'Searching...' : '🔍 Search'}
          </button>
        </div>

        <button
          type="button"
          onClick={handleLiveGPS}
          disabled={gpsLoading}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.82rem', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
          title="Auto-detect current GPS location"
        >
          <span>📍</span>
          <span>{gpsLoading ? 'Locating...' : 'Use Live GPS'}</span>
        </button>

        <a
          href={googleMapsVerifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.82rem', padding: '8px 12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
          title="Verify in Google Maps"
        >
          <span>🗺️</span> Google Maps
        </a>
      </div>

      {/* Instant Search Results Dropdown */}
      {searchResults.length > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
          maxHeight: '180px',
          overflowY: 'auto',
          zIndex: 1000
        }}>
          {searchResults.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectSearchResult(item)}
              style={{
                padding: '8px 12px',
                fontSize: '0.8rem',
                borderBottom: '1px solid #f1f5f9',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <strong>📍 {item.display_name.split(',')[0]}</strong>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {item.display_name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Map Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: height,
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
          boxShadow: 'inset 0 0 4px rgba(0,0,0,0.05)',
          position: 'relative'
        }}
      />

      {/* Live Coordinates & Status Helper */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
        <span style={{ fontWeight: 600, color: statusText.startsWith('✓') ? '#15803d' : '#475569' }}>
          {statusText}
        </span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          Coordinates: <strong>{currentLat}, {currentLng}</strong>
        </span>
      </div>
    </div>
  );
}
