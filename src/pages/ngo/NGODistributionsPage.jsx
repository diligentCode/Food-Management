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

  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');

  const loadDonations = () => {
    if (currentUser) {
      const list = donationService.getUserDonations(currentUser.id, 'ngo');
      setDonations(list);
      if (list.length > 0) {
        if (!selectedDonation || !list.some(d => d.id === selectedDonation.id)) {
          setSelectedDonation(list[0]);
        } else {
          const refreshed = list.find(d => d.id === selectedDonation.id);
          setSelectedDonation(refreshed || list[0]);
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

  const handleAdvanceStatus = (nextStatus) => {
    if (!selectedDonation) return;
    setOtpError('');
    setOtpSuccess('');
    const updated = donationService.updateStatus(selectedDonation.id, nextStatus);
    setSelectedDonation(updated);
    loadDonations();
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!selectedDonation) return;
    setOtpError('');
    setOtpSuccess('');

    try {
      const updated = donationService.verifyOtpAndPickup(selectedDonation.id, enteredOtp);
      setSelectedDonation(updated);
      setOtpSuccess('✓ Handover PIN verified! Food marked as picked up.');
      setEnteredOtp('');
      loadDonations();
    } catch (err) {
      setOtpError(err.message || 'Invalid Handover PIN.');
    }
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
                    canAdvance={false}
                  />

                  {/* Dispatch Workflow & Handover Security Action Box */}
                  {selectedDonation.status === 'accepted' && (
                    <div className="card" style={{ padding: '22px 24px', border: '1.5px solid #cbd5e1', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                        <div>
                          <span className="badge badge-green" style={{ marginBottom: '6px' }}>Stage 1 of 3</span>
                          <h4 style={{ margin: '4px 0 0 0', fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                            Ready to Depart for Pickup?
                          </h4>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                            Notify <strong>{selectedDonation.donorName}</strong> that your volunteer or vehicle is en route to their kitchen gate.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAdvanceStatus('pickup_started')}
                          className="btn btn-primary"
                          style={{ padding: '12px 20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <span>🚚</span> Start Pickup Journey
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedDonation.status === 'pickup_started' && (
                    <div className="card" style={{
                      padding: '24px',
                      background: '#f0f9ff',
                      border: '2px solid #0284c7',
                      borderRadius: '16px',
                      boxShadow: '0 8px 24px rgba(2, 132, 199, 0.12)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1.5rem' }}>🔐</span>
                        <div>
                          <span className="badge badge-blue" style={{ marginBottom: '2px' }}>Stage 2 of 3 • Mandatory Verification</span>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0369a1' }}>
                            Physical Handover Security Verification
                          </h4>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: '#334155', margin: '6px 0 16px 0', lineHeight: 1.45 }}>
                        Arrived at <strong>{selectedDonation.donorName}</strong> ({selectedDonation.pickupAddress})? Inspect the packaging, ask the kitchen dispatch manager for their <strong>4-digit Handover PIN</strong>, and enter it below to confirm collection:
                      </p>

                      {otpError && (
                        <div style={{ backgroundColor: '#fee2e2', border: '1.5px solid #f87171', color: '#b91c1c', padding: '12px 16px', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '16px', fontWeight: 600 }}>
                          {otpError}
                        </div>
                      )}

                      {otpSuccess && (
                        <div style={{ backgroundColor: '#dcfce7', border: '1.5px solid #86efac', color: '#15803d', padding: '12px 16px', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '16px', fontWeight: 600 }}>
                          {otpSuccess}
                        </div>
                      )}

                      <form onSubmit={handleVerifyOtp} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                          type="text"
                          maxLength="4"
                          required
                          value={enteredOtp}
                          onChange={(e) => {
                            setEnteredOtp(e.target.value.replace(/\D/g, ''));
                            setOtpError('');
                          }}
                          placeholder="4-Digit PIN"
                          style={{
                            width: '160px',
                            padding: '12px 16px',
                            borderRadius: '10px',
                            border: '2px solid #38bdf8',
                            fontSize: '1.4rem',
                            fontWeight: 800,
                            letterSpacing: '8px',
                            textAlign: 'center',
                            outline: 'none',
                            fontFamily: 'monospace',
                            backgroundColor: '#ffffff'
                          }}
                        />
                        <button
                          type="submit"
                          className="btn btn-primary"
                          style={{ padding: '12px 22px', fontWeight: 800, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <span>🔐</span> Verify PIN & Confirm Collection
                        </button>
                      </form>
                    </div>
                  )}

                  {selectedDonation.status === 'picked_up' && (
                    <div className="card" style={{ padding: '22px 24px', border: '1.5px solid #86efac', background: '#f0fdf4' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span className="badge badge-success">✓ Handover Verified</span>
                            <span style={{ fontSize: '0.8rem', color: '#166534' }}>Food in Transit</span>
                          </div>
                          <h4 style={{ margin: '4px 0 0 0', fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                            Stage 3 of 3: Deliver to Beneficiaries
                          </h4>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#475569' }}>
                            Delivering to shelter / community kitchen: <strong>{selectedDonation.dropAddress}</strong>.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAdvanceStatus('delivered')}
                          className="btn btn-success"
                          style={{ padding: '12px 22px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <span>✅</span> Mark as Delivered to Beneficiaries
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedDonation.status === 'delivered' && (
                    <div style={{
                      backgroundColor: '#f0fdf4',
                      border: '1.5px solid #86efac',
                      borderRadius: '16px',
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      color: '#15803d'
                    }}>
                      <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#22c55e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
                        ✓
                      </div>
                      <div>
                        <strong style={{ fontSize: '1.05rem' }}>Donation Successfully Completed & Distributed!</strong>
                        <div style={{ fontSize: '0.86rem', color: '#166534', marginTop: '3px' }}>
                          All milestones completed. {selectedDonation.quantity} reached people in need safely.
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="card">
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '14px' }}>
                      Pickup Navigation & Route
                    </h3>
                    <FoodConnectMap
                      donorLocation={{
                        lat: selectedDonation.pickupLatitude || selectedDonation.latitude || 26.8520,
                        lng: selectedDonation.pickupLongitude || selectedDonation.longitude || 75.8050,
                        label: selectedDonation.donorName,
                        address: selectedDonation.pickupAddress
                      }}
                      ngoLocation={{
                        lat: selectedDonation.dropLatitude || currentUser?.location?.lat || 26.8920,
                        lng: selectedDonation.dropLongitude || currentUser?.location?.lng || 75.8250,
                        label: currentUser?.organizationName || currentUser?.name || 'NGO Center',
                        address: selectedDonation.dropAddress || currentUser?.address || 'Community Kitchen Distribution'
                      }}
                      height="320px"
                    />
                    <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '0.82rem', color: '#64748b' }}>
                      <span>📍 Pickup Point: <strong>{selectedDonation.pickupAddress}</strong></span>
                      <span>Target: <strong>{currentUser?.organizationName || 'NGO Kitchen Distribution'}</strong></span>
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
