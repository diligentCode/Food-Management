import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import AppNavbar from '../../components/layout/AppNavbar';
import AIQualityCard from '../../components/common/AIQualityCard';
import FoodConnectMap from '../../components/common/FoodConnectMap';
import { useAuth } from '../../context/AuthContext';
import { foodService, donationService } from '../../services/dataService';
import '../../styles/Dashboard.css';

export default function NGODashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('new'); // new | in_progress | completed
  const [searchTerm, setSearchTerm] = useState('');
  const [availableListings, setAvailableListings] = useState([]);
  const [acceptedDonations, setAcceptedDonations] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const loadData = () => {
    setAvailableListings(foodService.getAvailableListings());
    if (currentUser) {
      setAcceptedDonations(donationService.getUserDonations(currentUser.id, 'ngo'));
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Handle Accept Donation (Section 24)
  const handleAcceptFood = async (food) => {
    try {
      setAcceptingId(food.id);
      donationService.acceptDonation(food.id, currentUser || { id: 'user_ngo_1', name: 'Hope Foundation' });
      setSuccessMessage(`Success! You have accepted ${food.foodName} from ${food.donorName}.`);
      setSelectedFood(null);
      loadData();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      alert(err.message || 'Could not accept donation.');
    } finally {
      setAcceptingId(null);
    }
  };

  // Filter listings by search
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
          {/* Header Greeting & Your Impact (Matching Reference Image 2) */}
          <div className="dashboard-header-row">
            <div className="greeting-text">
              <h1>Welcome back, {currentUser?.name || 'Hope Foundation'}! 💚</h1>
              <p>
                New food donations are waiting for your acceptance. Help us reduce food waste and bring smiles to those in need.
              </p>
            </div>

            {/* Impact Box */}
            <div className="impact-highlight-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <div className="impact-highlight-info">
                <span className="impact-highlight-label" style={{ color: '#15803d' }}>
                  <span>🌱</span> Your Impact
                </span>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'baseline', marginTop: '6px' }}>
                  <div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0b462f' }}>125+</span>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Meals Distributed</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0b462f' }}>8.5 Tons</span>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Food Saved</div>
                  </div>
                </div>
              </div>
              <div className="impact-highlight-icon">
                🪴
              </div>
            </div>
          </div>

          {/* Success Banner */}
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
                  <span className="tab-count-badge">{acceptedDonations.filter(d => d.status !== 'delivered').length}</span>
                </button>

                <button
                  className={`ngo-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('completed')}
                >
                  <span>✅</span> Completed
                  <span className="tab-count-badge">{acceptedDonations.filter(d => d.status === 'delivered').length || 12}</span>
                </button>
              </div>

              {/* Tab 1: New Available Food Listings (Matching Reference Image 2) */}
              {activeTab === 'new' && (
                <div className="listings-list">
                  {filteredListings.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                      <h3>No new food listings at the moment.</h3>
                      <p style={{ marginTop: '8px' }}>You will receive notifications as soon as local donors list meals.</p>
                    </div>
                  ) : (
                    filteredListings.map((item, index) => {
                      const distances = ['2.4 km away', '3.1 km away', '4.8 km away', '5.2 km away', '6.7 km away'];
                      const expiryTexts = ['Expires in 4h 15m', 'Expires in 6h 20m', 'Expires in 7h 10m', 'Expires in 8h 45m', 'Expires in 9h 30m'];
                      const typePills = ['Hot meal', 'Cooked Meal', 'Cooked Meal', 'Fresh Produce', 'Dessert'];

                      return (
                        <div key={item.id} className="listing-row-card">
                          <div className="listing-thumb-wrap">
                            <span className="listing-new-tag">New</span>
                            <img
                              src={item.imageURL || `/images/${(index % 6) + 1}.jpg`}
                              alt={item.foodName}
                              className="listing-thumb"
                              onError={(e) => { e.target.src = '/images/1.jpg'; }}
                            />
                          </div>

                          <div className="listing-info">
                            <div className="listing-info-top">
                              <h3 className="listing-food-name">{item.foodName}</h3>
                            </div>
                            <div className="listing-donor-name">
                              <span>🏨</span> {item.donorName} &bull; 📍 {distances[index % distances.length]}
                            </div>
                            <div className="listing-meta-row">
                              <span className="meta-pill pill-muted">
                                ⚖️ Quantity: {item.quantity} {item.unit}
                              </span>
                              <span className="meta-pill pill-muted">
                                Prepared: {item.preparedAt}
                              </span>
                              <span className="meta-pill pill-fresh">
                                Fresh &bull; 2 hours old
                              </span>
                            </div>
                          </div>

                          <div className="listing-actions-col">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="meta-pill pill-expiry">
                                ⏰ {expiryTexts[index % expiryTexts.length]}
                              </span>
                              <span className="meta-pill pill-category">
                                {typePills[index % typePills.length]}
                              </span>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                              <button
                                onClick={() => handleAcceptFood(item)}
                                disabled={acceptingId === item.id}
                                className="btn btn-primary btn-sm"
                                style={{ minWidth: '85px' }}
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
                  {acceptedDonations.filter(d => d.status !== 'delivered').length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
                      <h3>No Ongoing Distributions</h3>
                      <p style={{ marginTop: '6px' }}>Click "Accept" on any available food listing to start a pickup.</p>
                    </div>
                  ) : (
                    acceptedDonations.filter(d => d.status !== 'delivered').map((d) => (
                      <div key={d.id} className="listing-row-card">
                        <img
                          src={d.imageURL || '/images/1.jpg'}
                          alt={d.foodName}
                          className="listing-thumb"
                          style={{ width: '80px', height: '80px' }}
                        />
                        <div className="listing-info">
                          <h3 className="listing-food-name">{d.foodName}</h3>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0' }}>
                            🏨 Donor: <strong>{d.donorName}</strong> &bull; Quantity: {d.quantity}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>
                            Status: {d.status.replace('_', ' ').toUpperCase()}
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
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '8px' }}>12 Completed Distributions</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                    Thank you, Hope Foundation! You have safely delivered over 8.5 tons of surplus food to community members in need.
                  </p>
                </div>
              )}
            </div>

            {/* Right Side Panel (Matching Reference Image 2 exactly!) */}
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
                      {currentUser?.name || 'Hope Foundation'} ✓
                    </h4>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Food for a Better Tomorrow</span>
                  </div>
                </div>

                <div className="side-info-list">
                  <div className="side-info-item">
                    <span>📍</span> {currentUser?.address || 'Jaipur, Rajasthan'}
                  </div>
                  <div className="side-info-item">
                    <span>📞</span> {currentUser?.phone || '+91 98765 43210'}
                  </div>
                  <div className="side-info-item">
                    <span>✉️</span> {currentUser?.email || 'hope.foundation@ngo.org'}
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <div className="sidebar-verified-tag" style={{ width: '100%', justifyContent: 'center', padding: '6px' }}>
                    ✓ Verified NGO
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
                    <h4>12</h4>
                    <p>Accepted Listings</p>
                  </div>
                  <div className="side-stat-box">
                    <h4>8</h4>
                    <p>Ongoing Distributions</p>
                  </div>
                  <div className="side-stat-box">
                    <h4>350+</h4>
                    <p>People Fed</p>
                  </div>
                  <div className="side-stat-box">
                    <h4>1.2 Tons</h4>
                    <p>Food Distributed</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="side-panel-card">
                <div className="side-card-header">
                  <h3>Recent Activity</h3>
                  <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>View All</span>
                </div>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="activity-dot">✓</span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>You accepted Veg Biryani</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>2 hours ago</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="activity-dot">✓</span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>You accepted Paneer Curry</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>4 hours ago</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="activity-dot">✓</span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>You completed distribution</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>1 day ago</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="activity-dot" style={{ background: '#dbeafe', color: '#1d4ed8' }}>🔔</span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>New food listing available</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>1 day ago</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Motivation Card */}
              <div style={{ background: '#e6f4ea', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>🌱</span>
                <p style={{ fontSize: '0.8rem', color: '#0b462f', fontWeight: 600, margin: 0 }}>
                  Small actions make a big difference.
                </p>
              </div>
            </div>
          </div>

          {/* FOOD DETAILS MODAL (Section 23) */}
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
                    <span className="badge badge-green" style={{ marginBottom: '6px' }}>
                      {selectedFood.category} &bull; {selectedFood.foodType}
                    </span>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                      {selectedFood.foodName}
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                      Offered by <strong>{selectedFood.donorName}</strong>
                    </p>
                  </div>
                  <button onClick={() => setSelectedFood(null)} style={{ fontSize: '1.4rem', color: '#94a3b8' }}>
                    ✕
                  </button>
                </div>

                <div style={{ width: '100%', height: '220px', borderRadius: '12px', overflow: 'hidden', marginBottom: '18px' }}>
                  <img
                    src={selectedFood.imageURL || '/images/1.jpg'}
                    alt={selectedFood.foodName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

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
                  <AIQualityCard score={selectedFood.qualityScore || 88} status={selectedFood.qualityStatus} />
                </div>

                {/* Pickup Location Map Preview */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>
                    📍 Pickup Location & Distance
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '8px' }}>
                    {selectedFood.pickupAddress}
                  </div>
                  <FoodConnectMap
                    donorLocation={{ lat: selectedFood.latitude || 26.8520, lng: selectedFood.longitude || 75.8050, label: selectedFood.donorName }}
                    ngoLocation={{ lat: 26.8920, lng: 75.8250, label: currentUser?.name || 'Hope Foundation' }}
                    height="200px"
                  />
                </div>

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
                    🤝 Accept Donation
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
