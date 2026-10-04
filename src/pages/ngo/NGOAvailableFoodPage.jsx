import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import AppNavbar from '../../components/layout/AppNavbar';
import { useAuth } from '../../context/AuthContext';
import { foodService, donationService } from '../../services/dataService';

export default function NGOAvailableFoodPage() {
  const { currentUser } = useAuth();
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDiet, setSelectedDiet] = useState('all');
  const [selectedType, setSelectedType] = useState('all'); // all, free, paid

  const loadListings = () => {
    setListings(foodService.getAvailableListings());
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleAccept = (food) => {
    try {
      donationService.acceptDonation(food.id, currentUser || { id: 'user_ngo_1', name: 'Hope Foundation' });
      alert(`Success! You have accepted ${food.foodName}. Check 'My Distributions' to track.`);
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
                <option value="Vegetables">Vegetables</option>
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
                <option value="paid">Low-Cost Sale</option>
              </select>
            </div>
          </div>

          {/* Grid of Food Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filtered.length === 0 ? (
              <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                <h3>No available listings match your filters.</h3>
              </div>
            ) : (
              filtered.map((food) => (
                <div key={food.id} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '180px', position: 'relative', background: '#e2e8f0' }}>
                    <img
                      src={food.imageURL || '/images/1.jpg'}
                      alt={food.foodName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/images/1.jpg'; }}
                    />
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
                      {food.listingType === 'free' ? 'FREE' : `₹${food.price}`}
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
                      <span className="meta-pill pill-fresh">AI: {food.qualityScore || 88}/100</span>
                      <span className="meta-pill pill-expiry">⏰ {food.pickupDeadline}</span>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4, margin: '4px 0' }}>
                      {food.description}
                    </p>

                    <button
                      onClick={() => handleAccept(food)}
                      className="btn btn-primary"
                      style={{ marginTop: 'auto', width: '100%' }}
                    >
                      🤝 Accept Food Donation
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
