import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Tile provider definitions (Google Maps high-fidelity roadmap & satellite hybrid + OSM)
const MAP_LAYERS = {
  roadmap: {
    name: 'Google Maps',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps'
  },
  satellite: {
    name: 'Satellite',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps Satellite'
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }
};

// Custom SVG Pin Icon creator
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
          padding: 5px 11px;
          border-radius: 16px;
          font-weight: 700;
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

// Haversine distance calculator in kilometers
function getDistKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Coordinate & Google Maps URL Parser
function parseCoordinatesOrUrl(input) {
  if (!input || typeof input !== 'string') return null;
  const str = input.trim();

  // 1. Coordinates with comma or space (e.g. 21.1458, 79.0882)
  const simpleMatch = str.match(/([-+]?\d{1,2}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)/);
  if (simpleMatch) {
    const lat = parseFloat(simpleMatch[1]);
    const lng = parseFloat(simpleMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // 2. Google Maps URL with @lat,lng
  const urlMatch = str.match(/@([-+]?\d{1,2}\.\d+),([-+]?\d{1,3}\.\d+)/);
  if (urlMatch) {
    return { lat: parseFloat(urlMatch[1]), lng: parseFloat(urlMatch[2]) };
  }

  // 3. Google Maps URL query q=lat,lng
  const qMatch = str.match(/[?&]q=([-+]?\d{1,2}\.\d+),([-+]?\d{1,3}\.\d+)/);
  if (qMatch) {
    return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  }

  return null;
}

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
  const tileLayerRef = useRef(null);

  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [activeLayer, setActiveLayer] = useState('roadmap');
  const [statusText, setStatusText] = useState('Google Maps active. Click anywhere or drag the pin to set your exact location.');

  // Initialize Leaflet Map with Google Maps Roadmap Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      zoomControl: true
    });

    // Default to Google Maps Roadmap
    const initialConfig = MAP_LAYERS.roadmap;
    const tileLayer = L.tileLayer(initialConfig.url, {
      subdomains: initialConfig.subdomains,
      attribution: initialConfig.attribution,
      maxZoom: initialConfig.maxZoom
    }).addTo(map);

    tileLayerRef.current = tileLayer;

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

  // Update center when initial coordinates change from outside (e.g. city switcher)
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      if (Math.abs(currentLat - initialLat) > 0.001 || Math.abs(currentLng - initialLng) > 0.001) {
        mapInstanceRef.current.setView([initialLat, initialLng], 15);
        markerRef.current.setLatLng([initialLat, initialLng]);
        setCurrentLat(initialLat);
        setCurrentLng(initialLng);
      }
    }
  }, [initialLat, initialLng]);

  // Handle layer switching (Google Roadmap vs Google Satellite vs OSM)
  const switchLayer = (layerKey) => {
    if (!mapInstanceRef.current || !MAP_LAYERS[layerKey]) return;
    setActiveLayer(layerKey);

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const cfg = MAP_LAYERS[layerKey];
    const newTileLayer = L.tileLayer(cfg.url, {
      subdomains: cfg.subdomains,
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTileLayer;
  };

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

    // Reverse geocode to get human-readable street/locality name
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

  // Smart Search: Coordinates Parser + Proximity-Ranked POI Geocoding
  const handleSearch = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }
    const query = searchQuery.trim();
    if (!query) return;

    // 1. Direct coordinate or Google Maps link detection
    const parsedCoords = parseCoordinatesOrUrl(query);
    if (parsedCoords) {
      const { lat, lng } = parsedCoords;
      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
        markerRef.current.setLatLng([lat, lng]);
      }
      updateCoordinates(lat, lng);
      setStatusText(`✓ Jumped directly to coordinates (${lat}, ${lng}) from link/input!`);
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setSearchResults([]);

    try {
      const candidates = [];

      // A. Nominatim with proximity viewbox (favors current city/area within ~50km)
      const viewboxParam = `viewbox=${currentLng - 0.5},${currentLat + 0.5},${currentLng + 0.5},${currentLat - 0.5}&bounded=0`;
      const nominatimPromise = fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&${viewboxParam}&limit=8`,
        { headers: { 'Accept-Language': 'en' } }
      ).then(res => res.json()).catch(() => []);

      // B. Photon (Komoot) with proximity decay coordinates
      const photonPromise = fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${currentLat}&lon=${currentLng}&limit=8`
      ).then(res => res.json()).catch(() => ({ features: [] }));

      const [nomResults, photonData] = await Promise.all([nominatimPromise, photonPromise]);

      // Process Nominatim results
      if (Array.isArray(nomResults)) {
        nomResults.forEach(item => {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const distKm = getDistKm(currentLat, currentLng, lat, lng);
          const title = item.display_name.split(',')[0];
          candidates.push({
            title,
            fullName: item.display_name,
            lat,
            lng,
            distKm,
            source: 'OSM'
          });
        });
      }

      // Process Photon POI results
      if (photonData && Array.isArray(photonData.features)) {
        photonData.features.forEach(f => {
          if (!f.geometry || !f.geometry.coordinates) return;
          const [lng, lat] = f.geometry.coordinates;
          const distKm = getDistKm(currentLat, currentLng, lat, lng);
          const p = f.properties || {};
          const title = p.name || query;
          const parts = [p.name, p.street, p.city, p.state].filter(Boolean);
          const fullName = parts.join(', ');

          candidates.push({
            title,
            fullName: fullName || title,
            lat,
            lng,
            distKm,
            source: 'Photon'
          });
        });
      }

      // Deduplicate results within 200m
      const unique = [];
      candidates.forEach(cand => {
        const isDuplicate = unique.some(u => getDistKm(u.lat, u.lng, cand.lat, cand.lng) < 0.2);
        if (!isDuplicate) {
          unique.push(cand);
        }
      });

      // SORT CLOSEST FIRST (Proximity ranking)
      unique.sort((a, b) => a.distKm - b.distKm);

      if (unique.length > 0) {
        setSearchResults(unique.slice(0, 6));
      } else {
        setStatusText(`No direct match for "${query}". Try copying coordinates from Google Maps, or drag the pin directly.`);
      }
    } catch (err) {
      console.warn('Location search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    const lat = result.lat;
    const lng = result.lng;
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
      markerRef.current.setLatLng([lat, lng]);
    }
    const shortAddress = result.fullName.split(',').slice(0, 3).join(',').trim();
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

  const googleMapsSearchUrl = searchQuery.trim()
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`
    : `https://www.google.com/maps?q=${currentLat},${currentLng}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {/* Search & Actions Bar (NO <form> to prevent outer form reload) */}
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
            placeholder="Search restaurant, building, or paste Google Maps coords..."
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1.5px solid var(--color-border)',
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
            style={{ fontSize: '0.82rem', padding: '8px 12px', fontWeight: 600 }}
          >
            {searching ? 'Searching...' : '🔍 Search'}
          </button>
        </div>

        {/* Live GPS Button */}
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

        {/* Open in Google Maps Search Helper */}
        <a
          href={googleMapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.82rem', padding: '8px 12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
          title="Find your exact restaurant or building on Google Maps in a new tab"
        >
          <span>🗺️</span> Open Google Maps ↗
        </a>
      </div>

      {/* Helpful Quick Tip */}
      <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span>💡</span>
        <span>
          <strong>Pro-tip:</strong> You can paste exact coordinates (e.g. <code>21.1458, 79.0882</code>) or a Google Maps share link directly into the search box!
        </span>
      </div>

      {/* Instant Proximity-Sorted Search Results Dropdown */}
      {searchResults.length > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1.5px solid #cbd5e1',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          maxHeight: '220px',
          overflowY: 'auto',
          zIndex: 1000
        }}>
          <div style={{ padding: '6px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>
            Closest Matches (Ranked by proximity to map center):
          </div>
          {searchResults.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectSearchResult(item)}
              style={{
                padding: '9px 12px',
                fontSize: '0.8rem',
                borderBottom: '1px solid #f1f5f9',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <div style={{ flex: 1 }}>
                <strong style={{ color: '#0f172a' }}>📍 {item.title}</strong>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  {item.fullName}
                </div>
              </div>
              <span style={{
                fontSize: '0.7rem',
                padding: '3px 7px',
                borderRadius: '10px',
                background: item.distKm < 25 ? '#dcfce7' : '#f1f5f9',
                color: item.distKm < 25 ? '#15803d' : '#64748b',
                fontWeight: 700,
                whiteSpace: 'nowrap'
              }}>
                {item.distKm < 25 ? `🎯 ${item.distKm} km (Nearby)` : `${item.distKm} km`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Map Container with Layer Switcher */}
      <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid var(--color-border)', boxShadow: 'inset 0 0 4px rgba(0,0,0,0.05)' }}>
        {/* Layer Switcher Controls Floating Overlay */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 500,
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(6px)',
          borderRadius: '8px',
          padding: '3px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
          border: '1px solid #cbd5e1',
          gap: '2px'
        }}>
          <button
            type="button"
            onClick={() => switchLayer('roadmap')}
            style={{
              padding: '4px 8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              background: activeLayer === 'roadmap' ? 'var(--color-primary-dark)' : 'transparent',
              color: activeLayer === 'roadmap' ? '#ffffff' : '#334155',
              cursor: 'pointer'
            }}
            title="Google Maps Roadmap (Shows all shops, restaurants & buildings)"
          >
            🗺️ Google Maps
          </button>
          <button
            type="button"
            onClick={() => switchLayer('satellite')}
            style={{
              padding: '4px 8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              background: activeLayer === 'satellite' ? 'var(--color-primary-dark)' : 'transparent',
              color: activeLayer === 'satellite' ? '#ffffff' : '#334155',
              cursor: 'pointer'
            }}
            title="Satellite Photography with Street Labels"
          >
            🛰️ Satellite
          </button>
          <button
            type="button"
            onClick={() => switchLayer('osm')}
            style={{
              padding: '4px 8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              background: activeLayer === 'osm' ? 'var(--color-primary-dark)' : 'transparent',
              color: activeLayer === 'osm' ? '#ffffff' : '#334155',
              cursor: 'pointer'
            }}
            title="OpenStreetMap Standard"
          >
            🌍 OSM
          </button>
        </div>

        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: height
          }}
        />
      </div>

      {/* Live Coordinates & Status Helper */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
        <span style={{ fontWeight: 600, color: statusText.startsWith('✓') ? '#15803d' : '#475569' }}>
          {statusText}
        </span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          Selected Coordinates: <strong>{currentLat}, {currentLng}</strong>
        </span>
      </div>
    </div>
  );
}
