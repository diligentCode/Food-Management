import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import AppNavbar from '../../components/layout/AppNavbar';
import DonationTimeline from '../../components/common/DonationTimeline';
import FoodConnectMap from '../../components/common/FoodConnectMap';
import { useAuth } from '../../context/AuthContext';
import { donationService } from '../../services/dataService';

export default function DonorTrackingPage() {
  const { currentUser } = useAuth();
  const [donations, setDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const loadDonations = () => {
    if (currentUser) {
      const list = donationService.getUserDonations(currentUser.id, 'donor');
      setDonations(list);
      if (list.length > 0) {
        if (!selectedDonation || !list.some(d => d.id === selectedDonation.id)) {
          setSelectedDonation(list[0]);
        } else {
          const refreshed = list.find(d => d.id === selectedDonation.id);
          if (refreshed) setSelectedDonation(refreshed);
        }
      } else {
        setSelectedDonation(null);
      }
    }
  };

  useEffect(() => {
    loadDonations();
    window.addEventListener('foodconnect_data_updated', loadDonations);
    const interval = setInterval(loadDonations, 3000);
    return () => {
      window.removeEventListener('foodconnect_data_updated', loadDonations);
      clearInterval(interval);
    };
  }, [currentUser]);

  const handleDeleteOrder = (donation) => {
    if (!donation) return;
    const isPickedUp = donation.otpVerified || donation.status === 'picked_up' || donation.status === 'delivered';
    const confirmMsg = isPickedUp
      ? `Are you sure you want to remove ${donation.foodName} from your tracking list? (The receiver NGO will still retain it to complete distribution).`
      : `Are you sure you want to cancel and delete the order for ${donation.foodName}? Since OTP has not been verified yet, this order will be completely cancelled and disappear from tracking on both sides.`;

    if (window.confirm(confirmMsg)) {
      donationService.deleteDonation(donation.id);
      setSelectedDonation(null);
      loadDonations();
    }
  };

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
        <AppNavbar title="Donation Tracking" />

        <div className="dashboard-body">
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
              Live Donation Tracking 🚚
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
              Track the step-by-step progress of your accepted food donations from pickup to distribution.
            </p>
          </div>

          {donations.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <h3>No Active Donations Yet</h3>
              <p style={{ marginTop: '8px' }}>When an NGO accepts your food listing, live tracking will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
              {/* Left Column: Active Donations List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
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
                      🤝 Accepted by: <strong>{d.ngoName}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                      Quantity: {d.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Timeline & Map */}
              {selectedDonation && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Order Header & Cancel/Delete Action */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#ffffff',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>
                        {selectedDonation.foodName} ({selectedDonation.quantity})
                      </h2>
                      <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px' }}>
                        Assigned to: <strong>{selectedDonation.ngoName}</strong> &bull; Pickup: {selectedDonation.pickupAddress}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(selectedDonation)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        color: '#dc2626',
                        borderColor: '#fca5a5',
                        background: '#fff5f5',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}
                    >
                      {selectedDonation.otpVerified || selectedDonation.status === 'picked_up' || selectedDonation.status === 'delivered'
                        ? '🗑️ Remove from Tracking'
                        : '✕ Cancel & Delete Order (Before Pickup)'}
                    </button>
                  </div>

                  {/* Status Timeline (Read-only for Donor - NGO manages dispatch) */}
                  <DonationTimeline
                    currentStatus={selectedDonation.status}
                    canAdvance={false}
                  />

                  {/* Kitchen Handover Security PIN Card */}
                  {selectedDonation.status === 'accepted' || selectedDonation.status === 'pickup_started' ? (
                    <div style={{
                      background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
                      color: '#ffffff',
                      borderRadius: '16px',
                      padding: '24px 28px',
                      boxShadow: '0 10px 25px rgba(6, 78, 59, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '18px'
                    }}>
                      <div style={{ maxWidth: '420px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '1.5rem' }}>🔐</span>
                          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                            Kitchen Handover Security PIN
                          </h3>
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', opacity: 0.92, lineHeight: 1.4 }}>
                          When the NGO collection team arrives at your kitchen dispatch gate, ask them for proof of collection and share this 4-digit PIN to authorize pickup.
                        </p>
                      </div>

                      <div style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(8px)',
                        border: '2px dashed rgba(255, 255, 255, 0.55)',
                        borderRadius: '14px',
                        padding: '14px 30px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.85, fontWeight: 700 }}>
                          HANDOVER OTP
                        </div>
                        <div style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '8px', fontFamily: 'monospace' }}>
                          {selectedDonation.handoverOtp || '----'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      backgroundColor: '#f0fdf4',
                      border: '1.5px solid #86efac',
                      borderRadius: '14px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      color: '#15803d'
                    }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#22c55e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 800 }}>
                        ✓
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.98rem' }}>Handover Successfully Verified via OTP</strong>
                        <div style={{ fontSize: '0.84rem', color: '#166534', marginTop: '2px' }}>
                          Surplus food was verified and collected by <strong>{selectedDonation.ngoName}</strong>. Distribution is underway!
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Visual Map Component */}
                  <div className="card">
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '14px' }}>
                      Pickup & Delivery Route Map
                    </h3>
                    <FoodConnectMap
                      donorLocation={{
                        lat: selectedDonation.pickupLatitude || selectedDonation.latitude || 26.8520,
                        lng: selectedDonation.pickupLongitude || selectedDonation.longitude || 75.8050,
                        label: selectedDonation.donorName,
                        address: selectedDonation.pickupAddress
                      }}
                      ngoLocation={{
                        lat: selectedDonation.dropLatitude || 26.8920,
                        lng: selectedDonation.dropLongitude || 75.8250,
                        label: selectedDonation.ngoName,
                        address: selectedDonation.dropAddress || 'NGO Distribution Center'
                      }}
                      height="320px"
                    />
                    <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '0.82rem', color: '#64748b' }}>
                      <span>📍 Pickup Point: <strong>{selectedDonation.pickupAddress}</strong></span>
                      <span>Target Recipient: <strong>{selectedDonation.ngoName}</strong> ({selectedDonation.dropAddress || 'NGO Facility'})</span>
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
