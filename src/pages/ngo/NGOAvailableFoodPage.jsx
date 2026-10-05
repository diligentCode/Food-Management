import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import AppNavbar from '../../components/layout/AppNavbar';
import { useAuth } from '../../context/AuthContext';
import { foodService, donationService, userService, isListingExpired } from '../../services/dataService';
import { isUserOptimalNgo } from '../../services/quantumService';
import QuantumMatchModal from '../../components/common/QuantumMatchModal';

export default function NGOAvailableFoodPage() {
  const { currentUser } = useAuth();
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDiet, setSelectedDiet] = useState('all');
  const [selectedType, setSelectedType] = useState('all'); // all, free, paid
  const [acceptingItem, setAcceptingItem] = useState(null);
  const [paymentOption, setPaymentOption] = useState('pickup_cash');
  const [quantumModalItem, setQuantumModalItem] = useState(null);

  const allUsers = userService.getUsers();

  const loadListings = () => {
    setListings(foodService.getAvailableListings());
  };

  useEffect(() => {
    loadListings();
    const handleUpdate = () => loadListings();
    window.addEventListener('foodconnect_data_updated', handleUpdate);
    const timer = setInterval(loadListings, 2500);
    return () => {
      window.removeEventListener('foodconnect_data_updated', handleUpdate);
      clearInterval(timer);
    };
  }, []);

  const handleConfirmAccept = () => {
    if (!acceptingItem) return;
    try {
      const isPaid = acceptingItem.listingType === 'paid';
      const paymentDetails = isPaid ? {
        method: paymentOption,
        status: paymentOption === 'direct_upi' ? 'completed' : 'pending',
        transactionRef: paymentOption === 'direct_upi' ? `UPI-2026-${Math.floor(100000 + Math.random() * 900000)}` : null,
        amount: Number(acceptingItem.price) * Number(acceptingItem.quantity)
      } : null;

      donationService.acceptDonation(
        acceptingItem.id,
        currentUser || { id: 'user_ngo_demo', organizationName: 'Verified NGO' },
        paymentDetails
      );

      alert(`Success! You have accepted ${acceptingItem.foodName}. Track the collection in 'My Distributions'.`);
      setAcceptingItem(null);
      loadListings();
    } catch (err) {
      alert(err.message || 'Error accepting food.');
    }
  };

  const filtered = listings.filter((item) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match = item.foodName.toLowerCase().includes(term) || item.donorName.toLowerCase().includes(term);
      if (!match) return false;
    }
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedDiet !== 'all' && item.foodType !== selectedDiet) return false;
    if (selectedType !== 'all' && item.listingType !== selectedType) return false;
    return true;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <AppNavbar title="Available Food Listings" />

        <div className="dashboard-body">
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
              Explore Available Surplus Food 🍲
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
              Find nutritious surplus food listed by hotels and restaurants in your area.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <input
                type="text"
                placeholder="Search food or hotel name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.88rem' }}
              >
                <option value="all">All Categories</option>
                <option value="Rice">Rice</option>
                <option value="Curry">Curry</option>
                <option value="Bread">Bread / Roti</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Meals">Full Meals</option>
                <option value="Desserts">Desserts</option>
              </select>
            </div>

            <div>
              <select
                value={selectedDiet}
                onChange={(e) => setSelectedDiet(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.88rem' }}
              >
                <option value="all">All Dietary Types</option>
                <option value="Vegetarian">🌱 Vegetarian</option>
                <option value="Non-Vegetarian">🍗 Non-Vegetarian</option>
              </select>
            </div>

            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.88rem' }}
              >
                <option value="all">Free & Low-Cost</option>
                <option value="free">100% Free Only</option>
                <option value="paid">Low-Cost / Subsidized</option>
              </select>
            </div>
          </div>

          {/* Grid of Food Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filtered.length === 0 ? (
              <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🍲</div>
                <h3 style={{ color: '#0f172a', fontWeight: 800 }}>No Surplus Food Listings Match Filters</h3>
                <p style={{ marginTop: '6px' }}>Try resetting filters or check back shortly for new donor contributions.</p>
              </div>
            ) : (
              filtered.map((food) => {
                const expired = isListingExpired(food);
                const isTopPick = isUserOptimalNgo(food, currentUser, allUsers);
                const qScore = food.quantumScore || 96;

                return (
                  <div
                    key={food.id}
                    className="card"
                    style={{
                      padding: '0',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      border: isTopPick ? '2.5px solid #10b981' : '1px solid var(--color-border)',
                      boxShadow: isTopPick ? '0 10px 25px -5px rgba(16, 185, 129, 0.25)' : undefined,
                      position: 'relative'
                    }}
                  >
                    {/* 🌟 Top Callout Banner if current NGO is the #1 Quantum Best Match */}
                    {isTopPick && (
                      <div style={{
                        background: 'linear-gradient(90deg, #0b462f 0%, #15803d 100%)',
                        color: '#ffffff',
                        padding: '8px 14px',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        letterSpacing: '0.02em'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>🌟</span>
                          <span>YOU ARE THE #1 BEST MATCH (Quantum Pick)</span>
                        </span>
                        <span style={{
                          background: '#10b981',
                          color: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}>
                          {qScore}% Optimal
                        </span>
                      </div>
                    )}

                    <div style={{ height: '180px', position: 'relative', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {food.imageURL ? (
                        <img
                          src={food.imageURL}
                          alt={food.foodName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ fontSize: '3rem' }}>🍲</div>
                      )}

                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: food.listingType === 'free' ? '#15803d' : '#b45309',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '9999px'
                      }}>
                        {food.listingType === 'free' ? 'FREE' : `₹${food.price}/${food.unit}`}
                      </span>
                    </div>

                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                          {food.foodName}
                        </h3>
                        <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
                          {food.category}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        🏨 {food.donorName}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.78rem' }}>
                        <span className="meta-pill pill-muted">⚖️ {food.quantity} {food.unit}</span>
                        <span className="meta-pill pill-fresh">✨ AI: {food.qualityScore || 75}%</span>
                        
                        {/* Quantum Match Pill */}
                        <button
                          type="button"
                          onClick={() => setQuantumModalItem(food)}
                          style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
                          title="View Quantum Match Analysis"
                        >
                          {isTopPick ? (
                            <span className="meta-pill" style={{ background: '#ecfdf5', color: '#047857', border: '1.5px solid #10b981', fontWeight: 800 }}>
                              🌟 Best Pick ({qScore}%)
                            </span>
                          ) : (
                            <span className="meta-pill" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontWeight: 700 }}>
                              ⚛️ Q-Match: {food.quantumScore || 85}%
                            </span>
                          )}
                        </button>

                        {expired ? (
                          <span className="meta-pill pill-expiry">⚠️ Expired</span>
                        ) : (
                          <span className="meta-pill pill-expiry">⏰ {food.pickupDeadline}</span>
                        )}
                      </div>

                      <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4, margin: '4px 0' }}>
                        {food.description}
                      </p>

                      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setQuantumModalItem(food)}
                          className="btn btn-secondary btn-sm"
                          style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontSize: '0.76rem', fontWeight: 700 }}
                        >
                          ⚛️ View Quantum Routing
                        </button>
                        <button
                          onClick={() => setAcceptingItem(food)}
                          disabled={expired}
                          className="btn btn-primary"
                          style={{
                            width: '100%',
                            opacity: expired ? 0.5 : 1,
                            background: isTopPick ? 'linear-gradient(135deg, #0b462f, #15803d)' : undefined,
                            fontWeight: isTopPick ? 800 : undefined
                          }}
                        >
                          {expired ? 'Expired' : isTopPick ? '🌟 Priority Accept (Best Pick)' : food.listingType === 'paid' ? '🤝 Accept & Settle (Paid)' : '🤝 Accept Food Donation'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Accept / Payment Modal */}
          {acceptingItem && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 350,
              padding: '20px'
            }}>
              <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '28px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: '8px' }}>
                  Confirm Food Acceptance
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '16px' }}>
                  You are accepting <strong>{acceptingItem.foodName}</strong> ({acceptingItem.quantity} {acceptingItem.unit}) from {acceptingItem.donorName}.
                </p>

                {acceptingItem.listingType === 'paid' ? (
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ color: '#92400e', fontSize: '0.88rem' }}>Subsidized Amount:</strong>
                      <span style={{ fontWeight: 800, color: '#b45309' }}>
                        ₹{(Number(acceptingItem.price) * Number(acceptingItem.quantity)).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="payOpt"
                          checked={paymentOption === 'pickup_cash'}
                          onChange={() => setPaymentOption('pickup_cash')}
                        />
                        <span>Pay on Pickup (Cash / QR at kitchen)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="payOpt"
                          checked={paymentOption === 'direct_upi'}
                          onChange={() => setPaymentOption('direct_upi')}
                        />
                        <span>Instant Direct UPI Settlement</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', color: '#15803d', fontWeight: 600 }}>
                    ✓ 100% Free Humanitarian Donation (₹0 Cost)
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button onClick={() => setAcceptingItem(null)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button onClick={handleConfirmAccept} className="btn btn-primary btn-sm">
                    Confirm & Accept
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
