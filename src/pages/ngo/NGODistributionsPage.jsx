import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import AppNavbar from '../../components/layout/AppNavbar';
import DonationTimeline from '../../components/common/DonationTimeline';
import FoodConnectMap from '../../components/common/FoodConnectMap';
import { useAuth } from '../../context/AuthContext';
import { donationService } from '../../services/dataService';

export default function NGODistributionsPage() {
  const { currentUser } = useAuth();
  const [donations, setDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const loadDonations = () => {
    if (currentUser) {
      const list = donationService.getUserDonations(currentUser.id, 'ngo');
      setDonations(list);
      if (list.length > 0 && !selectedDonation) {
        setSelectedDonation(list[0]);
      }
    }
  };

  useEffect(() => {
    loadDonations();
  }, [currentUser]);

  const handleAdvanceStatus = (nextStatus) => {
    if (!selectedDonation) return;
    const updated = donationService.updateStatus(selectedDonation.id, nextStatus);
    setSelectedDonation(updated);
    loadDonations();
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <AppNavbar title="My Distributions & Pickups" />

        <div className="dashboard-body">
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
              My Distributions & Pickups 📦
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
              Coordinate and mark each milestone of your surplus food collection and distribution.
            </p>
          </div>

          {donations.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <h3>No Accepted Donations Yet</h3>
              <p style={{ marginTop: '8px' }}>Explore the food feed and accept available meals to start distributions.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
              {/* Left Column: Accepted List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                  Active Distributions ({donations.length})
                </h3>
                {donations.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDonation(d)}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: selectedDonation?.id === d.id ? '#ffffff' : '#f8fafc',
                      border: '2px solid',
                      borderColor: selectedDonation?.id === d.id ? 'var(--color-primary-dark)' : 'var(--color-border)',
                      cursor: 'pointer',
                      boxShadow: selectedDonation?.id === d.id ? 'var(--shadow-sm)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{d.foodName}</strong>
                      <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
                        {d.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      🏨 Donor: <strong>{d.donorName}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                      Quantity: {d.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Timeline & Route Map */}
              {selectedDonation && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <DonationTimeline
                    currentStatus={selectedDonation.status}
                    canAdvance={true}
                    onAdvanceStatus={handleAdvanceStatus}
                  />

                  <div className="card">
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '14px' }}>
                      Pickup Navigation & Route
                    </h3>
                    <FoodConnectMap
                      donorLocation={{ lat: 26.8520, lng: 75.8050, label: selectedDonation.donorName }}
                      ngoLocation={{ lat: 26.8920, lng: 75.8250, label: currentUser?.name || 'Hope Foundation' }}
                      height="320px"
                    />
                    <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b' }}>
                      <span>📍 Address: <strong>{selectedDonation.pickupAddress}</strong></span>
                      <span>Target: Community Kitchen Distribution</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
