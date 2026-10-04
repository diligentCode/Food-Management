import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import AppNavbar from '../../components/layout/AppNavbar';
import { useAuth } from '../../context/AuthContext';
import { foodService } from '../../services/dataService';

export default function MyListingsPage() {
  const { currentUser } = useAuth();
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [editingItem, setEditingItem] = useState(null);

  const loadListings = () => {
    if (currentUser) {
      setListings(foodService.getDonorListings(currentUser.id));
    }
  };

  useEffect(() => {
    loadListings();
  }, [currentUser]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this surplus food listing?')) {
      foodService.deleteListing(id);
      loadListings();
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingItem) return;
    foodService.updateListing(editingItem.id, {
      foodName: editingItem.foodName,
      quantity: Number(editingItem.quantity),
      pickupDeadline: editingItem.pickupDeadline
    });
    setEditingItem(null);
    loadListings();
  };

  const filteredListings = listings.filter((l) => {
    if (filter === 'all') return true;
    return l.status === filter;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <AppNavbar title="My Food Listings" />

        <div className="dashboard-body">
          <div className="card-header-row" style={{ marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                My Surplus Food Listings 📋
              </h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
                Manage all surplus meal postings, check real-time status, and coordinate pickups.
              </p>
            </div>
            <Link to="/donor/add-food" className="btn btn-primary">
              + Post New Surplus Food
            </Link>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            {['all', 'available', 'accepted', 'pickup_started', 'delivered'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: filter === st ? 'var(--color-primary-dark)' : 'var(--color-border)',
                  backgroundColor: filter === st ? 'var(--color-primary-dark)' : '#ffffff',
                  color: filter === st ? '#ffffff' : 'var(--color-text-muted)',
                  textTransform: 'capitalize'
                }}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Listings List */}
          <div className="listings-list">
            {filteredListings.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                <h3>No listings found matching '{filter}'</h3>
                <p style={{ marginTop: '8px' }}>Post surplus food to make it discoverable to local food banks.</p>
                <Link to="/donor/add-food" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>
                  Add Surplus Food
                </Link>
              </div>
            ) : (
              filteredListings.map((item) => (
                <div key={item.id} className="listing-row-card">
                  <div className="listing-thumb-wrap">
                    <img
                      src={item.imageURL || '/images/1.jpg'}
                      alt={item.foodName}
                      className="listing-thumb"
                      onError={(e) => { e.target.src = '/images/1.jpg'; }}
                    />
                  </div>

                  <div className="listing-info">
                    <div className="listing-info-top">
                      <h3 className="listing-food-name">{item.foodName}</h3>
                      <span className="badge badge-green" style={{ marginLeft: '8px' }}>
                        {item.category}
                      </span>
                      {item.listingType === 'free' ? (
                        <span className="badge badge-success">FREE</span>
                      ) : (
                        <span className="badge badge-warning">₹{item.price}</span>
                      )}
                    </div>
                    <div className="listing-donor-name">
                      <span>📍 Pickup:</span> {item.pickupAddress}
                    </div>
                    <div className="listing-meta-row">
                      <span className="meta-pill pill-muted">
                        ⚖️ Quantity: {item.quantity} {item.unit}
                      </span>
                      <span className="meta-pill pill-muted">
                        ⏰ Deadline: {item.pickupDeadline}
                      </span>
                      <span className="meta-pill pill-fresh">
                        AI Score: {item.qualityScore || 88}/100
                      </span>
                    </div>
                  </div>

                  <div className="listing-actions-col">
                    <span className="badge badge-success">
                      ● {item.status.toUpperCase()}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button
                        onClick={() => setEditingItem(item)}
                        className="btn btn-secondary btn-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#dc2626' }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Edit Modal */}
          {editingItem && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 300,
              padding: '20px'
            }}>
              <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '28px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: '16px' }}>
                  Edit Surplus Listing
                </h3>
                <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Food Name</label>
                    <input
                      type="text"
                      value={editingItem.foodName}
                      onChange={(e) => setEditingItem({ ...editingItem, foodName: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Quantity ({editingItem.unit})</label>
                    <input
                      type="number"
                      value={editingItem.quantity}
                      onChange={(e) => setEditingItem({ ...editingItem, quantity: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Pickup Deadline</label>
                    <input
                      type="text"
                      value={editingItem.pickupDeadline}
                      onChange={(e) => setEditingItem({ ...editingItem, pickupDeadline: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                    <button type="button" onClick={() => setEditingItem(null)} className="btn btn-secondary btn-sm">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
