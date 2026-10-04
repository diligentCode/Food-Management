import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import AppNavbar from '../../components/layout/AppNavbar';
import FoodConnectMap from '../../components/common/FoodConnectMap';
import { useAuth } from '../../context/AuthContext';
import { foodService } from '../../services/dataService';

export default function NGOMapPage() {
  const { currentUser } = useAuth();
  const [listings, setListings] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);

  useEffect(() => {
    const available = foodService.getAvailableListings();
    setListings(available);
    if (available.length > 0) setSelectedFood(available[0]);
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <AppNavbar title="City Food Rescue Map" />

        <div className="dashboard-body">
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
              Nearby Surplus Food Map 🗺️
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
              Locate available surplus food in real time across the city and calculate pickup distances.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
            {/* Left Column: Listings Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                Available Locations ({listings.length})
              </h3>
              {listings.map((food) => (
                <div
                  key={food.id}
                  onClick={() => setSelectedFood(food)}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: selectedFood?.id === food.id ? '#ffffff' : '#f8fafc',
                    border: '2px solid',
                    borderColor: selectedFood?.id === food.id ? 'var(--color-primary-dark)' : 'var(--color-border)',
                    cursor: 'pointer'
                  }}
                >
                  <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{food.foodName}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                    🏨 {food.donorName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600, marginTop: '4px' }}>
                    📍 {food.pickupAddress}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Large Interactive Vector Map */}
            <div>
              {selectedFood && (
                <div className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                        Route to {selectedFood.foodName} ({selectedFood.quantity} {selectedFood.unit})
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        From {currentUser?.name || 'Hope Foundation'} to {selectedFood.donorName}
                      </p>
                    </div>
                    <span className="badge badge-success">
                      ● Active Listing
                    </span>
                  </div>

                  <FoodConnectMap
                    donorLocation={{
                      lat: selectedFood.latitude || 26.8520,
                      lng: selectedFood.longitude || 75.8050,
                      label: selectedFood.donorName,
                      address: selectedFood.pickupAddress
                    }}
                    ngoLocation={{
                      lat: currentUser?.location?.lat || 26.8920,
                      lng: currentUser?.location?.lng || 75.8250,
                      label: currentUser?.organizationName || currentUser?.name || 'NGO Partner',
                      address: currentUser?.address || 'NGO Headquarters'
                    }}
                    height="420px"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
