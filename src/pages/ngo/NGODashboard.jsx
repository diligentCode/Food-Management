import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import AppNavbar from '../../components/layout/AppNavbar';
import AIQualityCard from '../../components/common/AIQualityCard';
import FoodConnectMap from '../../components/common/FoodConnectMap';
import QuantumMatchModal from '../../components/common/QuantumMatchModal';
import { useAuth } from '../../context/AuthContext';
import { foodService, donationService, isListingExpired, calculateDistanceKm } from '../../services/dataService';
import '../../styles/Dashboard.css';

export default function NGODashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'in_progress' | 'completed'
  const [searchTerm, setSearchTerm] = useState('');
  const [availableListings, setAvailableListings] = useState([]);
  const [acceptedDonations, setAcceptedDonations] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);
  const [quantumModalItem, setQuantumModalItem] = useState(null);
  const [paymentOption, setPaymentOption] = useState('pickup_cash'); // 'pickup_cash' | 'direct_upi'
  const [successMessage, setSuccessMessage] = useState('');

  const loadData = () => {
    setAvailableListings(foodService.getAvailableListings());
    if (currentUser) {
      setAcceptedDonations(donationService.getUserDonations(currentUser.id, 'ngo'));
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('foodconnect_data_updated', handleUpdate);
    const interval = setInterval(loadData, 3000);
    return () => {
      window.removeEventListener('foodconnect_data_updated', handleUpdate);
      clearInterval(interval);
    };
  }, [currentUser]);

  // Handle Accept Donation with optional payment
  const handleAcceptFood = async (food) => {
    if (isListingExpired(food)) {
      alert('This food listing has expired and cannot be accepted.');
      loadData();
      return;
    }

    try {
      setAcceptingId(food.id);
      const isPaid = food.listingType === 'paid';
      const paymentDetails = isPaid ? {
        method: paymentOption,
        status: paymentOption === 'direct_upi' ? 'completed' : 'pending',
        transactionRef: paymentOption === 'direct_upi' ? `UPI-2026-${Math.floor(100000 + Math.random() * 900000)}` : null,
        amount: Number(food.price) * Number(food.quantity)
      } : null;

      donationService.acceptDonation(
        food.id,
        currentUser || { id: 'user_ngo_demo', organizationName: 'Verified NGO Partner' },
        paymentDetails
      );

      setSuccessMessage(`Success! You have accepted ${food.foodName} from ${food.donorName}.${isPaid ? ` Payment: ${paymentOption === 'direct_upi' ? 'Settled via Instant UPI' : 'Pay on Collection'}.` : ''}`);
      setSelectedFood(null);
      loadData();
      setTimeout(() => setSuccessMessage(''), 6000);
    } catch (err) {
      alert(err.message || 'Could not accept donation.');
    } finally {
      setAcceptingId(null);
    }
  };

  const filteredListings = availableListings.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.foodName.toLowerCase().includes(term) ||
      item.donorName.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      item.pickupAddress.toLowerCase().includes(term)
    );
  });

  const inProgressDonations = acceptedDonations.filter(d => d.status !== 'delivered');
  const completedDonations = acceptedDonations.filter(d => d.status === 'delivered');

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <AppNavbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          title="NGO Food Notifications"
        />

        <div className="dashboard-body">
          {/* Header Greeting & Real-Time Impact */}
          <div className="dashboard-header-row">
            <div className="greeting-text">
              <h1>Welcome back, {currentUser?.organizationName || currentUser?.name || 'NGO Partner'}! 💚</h1>
              <p>
                Discover surplus food postings in your zone. Connect instantly with donors to rescue wholesome meals.
              </p>
            </div>

            {/* Live Impact Card */}
            <div className="impact-highlight-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <div className="impact-highlight-info">
                <span className="impact-highlight-label" style={{ color: '#15803d' }}>
                  <span>🌱</span> Your Live Rescue Impact
                </span>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'baseline', marginTop: '6px' }}>
                  <div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0b462f' }}>
                      {acceptedDonations.length}
                    </span>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Active Donations</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0b462f' }}>
                      {completedDonations.length}
                    </span>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Completed Rescues</div>
                  </div>
                </div>
              </div>
              <div className="impact-highlight-icon">
                🪴
              </div>
            </div>
          </div>

          {/* Success Notification Banner */}
          {successMessage && (
            <div style={{
              backgroundColor: '#dcfce7',
              border: '1px solid #86efac',
              color: '#15803d',
              padding: '14px 20px',
              borderRadius: '12px',
              fontWeight: 600,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>🎉 {successMessage}</span>
              <button onClick={() => setSuccessMessage('')} style={{ color: '#15803d', fontWeight: 700 }}>✕</button>
            </div>
          )}

          {/* TWO-COLUMN SPLIT LAYOUT (Matching Reference Image 2) */}
          <div className="ngo-split-layout">
            {/* Left Main Column: Tabs & Food Listings */}
            <div>
              {/* Tabs Bar */}
              <div className="ngo-tabs-bar">
                <button
                  className={`ngo-tab-btn ${activeTab === 'new' ? 'active' : ''}`}
                  onClick={() => setActiveTab('new')}
                >
                  <span>🔔</span> New Food Notifications
                  <span className="tab-count-badge">{availableListings.length}</span>
                </button>

                <button
                  className={`ngo-tab-btn ${activeTab === 'in_progress' ? 'active' : ''}`}
                  onClick={() => setActiveTab('in_progress')}
                >
                  <span>🚚</span> Accepted (In Progress)
                  <span className="tab-count-badge">{inProgressDonations.length}</span>
                </button>

                <button
                  className={`ngo-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('completed')}
                >
                  <span>✅</span> Completed Rescues
                  <span className="tab-count-badge">{completedDonations.length}</span>
                </button>
              </div>

              {/* Tab 1: New Available Food Listings */}
              {activeTab === 'new' && (
                <div className="listings-list">
                  {filteredListings.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🍲</div>
                      <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>No Available Food Listings Currently</h3>
                      <p style={{ marginTop: '8px', maxWidth: '420px', margin: '8px auto 0 auto', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        There are no active food donations listed in this zone right now. When hotels and restaurants publish fresh surplus, notifications will appear here instantly!
                      </p>
                    </div>
                  ) : (
                    filteredListings.map((item) => {
                      const expired = isListingExpired(item);
                      const distanceKm = calculateDistanceKm(
                        item.latitude,
                        item.longitude,
                        currentUser?.location?.lat || 26.8920,
                        currentUser?.location?.lng || 75.8250
                      );

                      return (
                        <div key={item.id} className="listing-row-card">
                          <div className="listing-thumb-wrap">
                            <span className="listing-new-tag">New</span>
                            {item.imageURL ? (
                              <img
                                src={item.imageURL}
                                alt={item.foodName}
                                className="listing-thumb"
                              />
                            ) : (
                              <div className="listing-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', fontSize: '1.8rem' }}>
                                🍲
                              </div>
                            )}
                          </div>

                          <div className="listing-info">
                            <div className="listing-info-top">
                              <h3 className="listing-food-name">{item.foodName}</h3>
                              {item.listingType === 'paid' ? (
                                <span className="badge badge-warning" style={{ fontWeight: 800 }}>
                                  PAID &bull; ₹{item.price}/{item.unit}
                                </span>
                              ) : (
                                <span className="badge badge-success" style={{ fontWeight: 800 }}>
                                  100% FREE
                                </span>
                              )}
                            </div>

                            <div className="listing-donor-name">
                              <span>🏨</span> {item.donorName} &bull; 📍 {distanceKm} km away
                            </div>

                            <div className="listing-meta-row">
                              <span className="meta-pill pill-muted">
                                ⚖️ Quantity: {item.quantity} {item.unit}
                              </span>
                              <span className="meta-pill pill-muted">
                                Prepared: {item.preparedAt}
                              </span>
                              <span className="meta-pill pill-fresh">
                                ✨ AI Score: {item.qualityScore || 75}%
                              </span>
                              <button
                                type="button"
                                onClick={() => setQuantumModalItem(item)}
                                style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
                                title="View Quantum Match Analysis"
                              >
                                <span className="meta-pill" style={{ background: '#0f172a', color: '#38bdf8', border: '1px solid #1e293b', fontWeight: 700 }}>
                                  ⚛️ Q-Match: 95%
                                </span>
                              </button>
                            </div>
                          </div>

                          <div className="listing-actions-col">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {expired ? (
                                <span className="meta-pill pill-expiry">
                                  ⚠️ Expired
                                </span>
                              ) : (
                                <span className="meta-pill pill-expiry">
                                  ⏰ {item.pickupDeadline}
                                </span>
                              )}
                              <span className="meta-pill pill-category">
                                {item.category}
                              </span>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                onClick={() => setQuantumModalItem(item)}
                                className="btn btn-secondary btn-sm"
                                style={{ background: '#0f172a', color: '#38bdf8', border: '1px solid #1e293b', fontSize: '0.74rem' }}
                                title="View Quantum Match Analysis"
                              >
                                ⚛️ Quantum
                              </button>
                              <button
                                onClick={() => handleAcceptFood(item)}
                                disabled={acceptingId === item.id || expired}
                                className="btn btn-primary btn-sm"
                                style={{ minWidth: '85px', opacity: expired ? 0.5 : 1 }}
                              >
                                {acceptingId === item.id ? 'Accepting...' : '✓ Accept'}
                              </button>
                              <button
                                onClick={() => setSelectedFood(item)}
                                className="btn btn-secondary btn-sm"
                              >
                                View Details &rarr;
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Tab 2: Accepted / In Progress */}
              {activeTab === 'in_progress' && (
                <div className="listings-list">
                  {inProgressDonations.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
                      <h3>No Ongoing Distributions</h3>
                      <p style={{ marginTop: '6px' }}>Click "Accept" on any available food listing to start a collection.</p>
                    </div>
                  ) : (
                    inProgressDonations.map((d) => (
                      <div key={d.id} className="listing-row-card">
                        <div className="listing-thumb-wrap">
                          {d.imageURL ? (
                            <img src={d.imageURL} alt={d.foodName} className="listing-thumb" />
                          ) : (
                            <div className="listing-thumb flex-center" style={{ background: '#e2e8f0', fontSize: '1.6rem' }}>🍲</div>
                          )}
                        </div>
                        <div className="listing-info">
                          <h3 className="listing-food-name">{d.foodName}</h3>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0' }}>
                            🏨 Donor: <strong>{d.donorName}</strong> &bull; Quantity: {d.quantity}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>
                            Status: {d.status.replace('_', ' ').toUpperCase()}
                            {d.paymentMethod && ` (${d.paymentMethod === 'direct_upi' ? 'Paid via UPI' : 'Pay on Collection'})`}
                          </div>
                        </div>
                        <div className="listing-actions-col">
                          <Link to="/ngo/requests" className="btn btn-primary btn-sm">
                            Track Pickup &rarr;
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 3: Completed Distributions */}
              {activeTab === 'completed' && (
                <div className="card" style={{ padding: '30px', textAlign: 'center', color: '#0b462f' }}>
                  <span style={{ fontSize: '2.5rem' }}>🏆</span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '8px' }}>
                    {completedDonations.length} Completed Food Rescues
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                    Every completed rescue ensures meals nourish families instead of emitting methane in landfills.
                  </p>
                </div>
              )}
            </div>

            {/* Right Side Panel */}
            <div className="ngo-side-panel">
              {/* Profile Card */}
              <div className="side-panel-card">
                <div className="side-card-header">
                  <h3>Your NGO Profile</h3>
                  <Link to="/ngo/profile" style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>
                    Edit
                  </Link>
                </div>

                <div className="side-ngo-profile-header">
                  <div className="ngo-profile-icon">
                    🌱
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0b462f' }}>
                      {currentUser?.organizationName || currentUser?.name || 'NGO Partner'} ✓
                    </h4>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Verified Recipient Partner</span>
                  </div>
                </div>

                <div className="side-info-list">
                  <div className="side-info-item">
                    <span>📍</span> {currentUser?.address || 'City Center, India'}
                  </div>
                  <div className="side-info-item">
                    <span>📞</span> {currentUser?.phone || '+91 98765 00000'}
                  </div>
                  <div className="side-info-item">
                    <span>✉️</span> {currentUser?.email || 'contact@ngo.org'}
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <div className="sidebar-verified-tag" style={{ width: '100%', justifyContent: 'center', padding: '6px' }}>
                    ✓ Verified Recipient NGO
                  </div>
                </div>
              </div>

              {/* Food Distribution Stats */}
              <div className="side-panel-card">
                <div className="side-card-header">
                  <h3>Food Distribution Stats</h3>
                </div>
                <div className="side-stat-grid">
                  <div className="side-stat-box">
                    <h4>{acceptedDonations.length}</h4>
                    <p>Total Accepted</p>
                  </div>
                  <div className="side-stat-box">
                    <h4>{inProgressDonations.length}</h4>
                    <p>In Progress</p>
                  </div>
                  <div className="side-stat-box">
                    <h4>{completedDonations.length}</h4>
                    <p>Delivered</p>
                  </div>
                  <div className="side-stat-box">
                    <h4>{completedDonations.length * 35 || 0}+</h4>
                    <p>People Fed</p>
                  </div>
                </div>
              </div>

              {/* Motivation Card */}
              <div style={{ background: '#e6f4ea', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>🌱</span>
                <p style={{ fontSize: '0.8rem', color: '#0b462f', fontWeight: 600, margin: 0 }}>
                  Small actions make a big difference. Together we end hunger.
                </p>
              </div>
            </div>
          </div>

          {/* FOOD DETAILS & PAYMENT MODAL */}
          {selectedFood && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 350,
              padding: '20px'
            }}>
              <div className="card" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <span className="badge badge-green">
                        {selectedFood.category} &bull; {selectedFood.foodType}
                      </span>
                      {selectedFood.listingType === 'paid' ? (
                        <span className="badge badge-warning">
                          PAID: ₹{selectedFood.price}/{selectedFood.unit}
                        </span>
                      ) : (
                        <span className="badge badge-success">
                          100% FREE DONATION
                        </span>
                      )}
                    </div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                      {selectedFood.foodName}
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                      Donor: <strong>{selectedFood.donorName}</strong>
                    </p>
                  </div>
                  <button onClick={() => setSelectedFood(null)} style={{ fontSize: '1.4rem', color: '#94a3b8' }}>
                    ✕
                  </button>
                </div>

                {selectedFood.imageURL && (
                  <div style={{ width: '100%', height: '220px', borderRadius: '12px', overflow: 'hidden', marginBottom: '18px' }}>
                    <img
                      src={selectedFood.imageURL}
                      alt={selectedFood.foodName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '18px' }}>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Quantity</div>
                    <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{selectedFood.quantity} {selectedFood.unit}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Prepared Time</div>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{selectedFood.preparedAt}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Pickup Deadline</div>
                    <strong style={{ fontSize: '0.95rem', color: '#b91c1c' }}>{selectedFood.pickupDeadline}</strong>
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '4px' }}>Description</h4>
                  <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                    {selectedFood.description}
                  </p>
                </div>

                {/* AI Quality Section */}
                <div style={{ marginBottom: '18px' }}>
                  <AIQualityCard
                    score={selectedFood.qualityScore || 88}
                    status={selectedFood.qualityStatus}
                    analysis={selectedFood.qualityAnalysis}
                  />
                </div>

                {/* Pickup Location Map Preview */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>
                    📍 Pickup Location & Navigation
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '8px' }}>
                    {selectedFood.pickupAddress}
                  </div>
                  <FoodConnectMap
                    donorLocation={{ lat: selectedFood.latitude || 26.8520, lng: selectedFood.longitude || 75.8050, label: selectedFood.donorName }}
                    ngoLocation={{ lat: currentUser?.location?.lat || 26.8920, lng: currentUser?.location?.lng || 75.8250, label: currentUser?.organizationName || 'NGO Partner' }}
                    height="200px"
                  />
                </div>

                {/* PAID LISTING SETTLEMENT WORKFLOW (User Requirement 4) */}
                {selectedFood.listingType === 'paid' && (
                  <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#92400e' }}>
                        💳 Subsidized Food Settlement
                      </strong>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#b45309' }}>
                        Total: ₹{(Number(selectedFood.price) * Number(selectedFood.quantity)).toLocaleString()}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#78350f', margin: '0 0 12px 0' }}>
                      Choose your preferred payment method for this subsidized listing:
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px',
                        background: '#ffffff',
                        borderRadius: '8px',
                        border: '1.5px solid',
                        borderColor: paymentOption === 'pickup_cash' ? '#b45309' : '#e2e8f0',
                        cursor: 'pointer',
                        fontSize: '0.82rem'
                      }}>
                        <input
                          type="radio"
                          name="paymentOption"
                          checked={paymentOption === 'pickup_cash'}
                          onChange={() => setPaymentOption('pickup_cash')}
                        />
                        <span>💵 Pay at Pickup (Cash / UPI)</span>
                      </label>

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px',
                        background: '#ffffff',
                        borderRadius: '8px',
                        border: '1.5px solid',
                        borderColor: paymentOption === 'direct_upi' ? '#b45309' : '#e2e8f0',
                        cursor: 'pointer',
                        fontSize: '0.82rem'
                      }}>
                        <input
                          type="radio"
                          name="paymentOption"
                          checked={paymentOption === 'direct_upi'}
                          onChange={() => setPaymentOption('direct_upi')}
                        />
                        <span>📲 Direct UPI Instant Pay</span>
                      </label>
                    </div>

                    {paymentOption === 'direct_upi' && (
                      <div style={{ marginTop: '10px', background: '#fef3c7', padding: '10px', borderRadius: '6px', fontSize: '0.78rem', color: '#92400e' }}>
                        Donor UPI ID: <strong>{selectedFood.donorName.toLowerCase().replace(/[^a-z]/g, '')}@upi</strong> &bull; Simulated transaction authorization will be generated on acceptance.
                      </div>
                    )}
                  </div>
                )}

                {/* Modal Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <button onClick={() => setSelectedFood(null)} className="btn btn-secondary">
                    Close
                  </button>
                  <button
                    onClick={() => handleAcceptFood(selectedFood)}
                    className="btn btn-primary"
                    style={{ minWidth: '160px' }}
                  >
                    {selectedFood.listingType === 'paid' ? '🤝 Confirm & Settle' : '🤝 Accept Donation'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quantum Match Modal */}
          <QuantumMatchModal
            listing={quantumModalItem}
            isOpen={Boolean(quantumModalItem)}
            onClose={() => setQuantumModalItem(null)}
          />
        </div>
      </div>
    </div>
  );
}
