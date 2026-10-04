import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import AppNavbar from '../../components/layout/AppNavbar';
import { userService, foodService, donationService } from '../../services/dataService';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // users | listings | donations

  const loadData = () => {
    setUsers(userService.getUsers());
    setListings(foodService.getListings());
    setDonations(donationService.getDonations());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleVerify = (userId) => {
    userService.toggleVerify(userId);
    loadData();
  };

  const handleDeleteListing = (id) => {
    if (window.confirm('Admin action: Are you sure you want to remove this food listing?')) {
      foodService.deleteListing(id);
      loadData();
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <AppNavbar title="FoodConnect Central Admin" />

        <div className="dashboard-body">
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
              Central Platform Administration 🛡️
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
              Verify organizations, moderate surplus food listings, and monitor network safety.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="metrics-grid" style={{ marginBottom: '28px' }}>
            <div className="metric-card">
              <div className="metric-icon-circle" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
                👥
              </div>
              <div className="metric-data">
                <div className="metric-number">{users.length}</div>
                <div className="metric-label">Registered Organizations</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-circle" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
                🍲
              </div>
              <div className="metric-data">
                <div className="metric-number">{listings.length}</div>
                <div className="metric-label">Surplus Listings</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-circle" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                🚚
              </div>
              <div className="metric-data">
                <div className="metric-number">{donations.length}</div>
                <div className="metric-label">Donation Records</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-circle" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                ✅
              </div>
              <div className="metric-data">
                <div className="metric-number">{users.filter(u => u.isVerified).length}</div>
                <div className="metric-label">Verified Organizations</div>
              </div>
            </div>
          </div>

          {/* Admin Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              onClick={() => setActiveTab('users')}
              className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              👥 Manage Users & Verification
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              className={`btn ${activeTab === 'listings' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              🍲 Moderate Food Listings
            </button>
            <button
              onClick={() => setActiveTab('donations')}
              className={`btn ${activeTab === 'donations' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              📦 All Donations Workflow
            </button>
          </div>

          {/* Tab 1: Users Table */}
          {activeTab === 'users' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                  <tr>
                    <th style={{ padding: '14px 18px', color: '#64748b' }}>Organization</th>
                    <th style={{ padding: '14px 18px', color: '#64748b' }}>Role</th>
                    <th style={{ padding: '14px 18px', color: '#64748b' }}>Contact</th>
                    <th style={{ padding: '14px 18px', color: '#64748b' }}>Location</th>
                    <th style={{ padding: '14px 18px', color: '#64748b' }}>Verification Status</th>
                    <th style={{ padding: '14px 18px', color: '#64748b' }}>Admin Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                        {u.organizationName || u.name}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span className={`badge ${u.role === 'donor' ? 'badge-green' : 'badge-warning'}`} style={{ textTransform: 'uppercase' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#64748b' }}>
                        {u.email}<br />{u.phone}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#64748b' }}>
                        {u.address}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {u.isVerified ? (
                          <span style={{ color: '#15803d', fontWeight: 700 }}>✓ Verified</span>
                        ) : (
                          <span style={{ color: '#b45309', fontWeight: 600 }}>Pending Review</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <button
                          onClick={() => handleToggleVerify(u.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.78rem' }}
                        >
                          {u.isVerified ? 'Revoke Verification' : '✓ Approve & Verify'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Listings Table */}
          {activeTab === 'listings' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                  <tr>
                    <th style={{ padding: '14px 18px', color: '#64748b' }}>Food Item</th>
                    <th style={{ padding: '14px 18px', color: '#64748b' }}>Donor Hotel</th>
                    <th style={{ padding: '14px 18px', color: '#64748b' }}>Quantity</th>
                    <th style={{ padding: '14px 18px', color: '#64748b' }}>Status</th>
                    <th style={{ padding: '14px 18px', color: '#64748b' }}>AI Score</th>
                    <th style={{ padding: '14px 18px', color: '#64748b' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 700 }}>
                        {item.foodName}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#64748b' }}>
                        {item.donorName}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {item.quantity} {item.unit}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span className="badge badge-green" style={{ textTransform: 'uppercase' }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#15803d' }}>
                        {item.qualityScore || 88}/100
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <button
                          onClick={() => handleDeleteListing(item.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#dc2626', fontSize: '0.78rem' }}
                        >
                          Remove Listing
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Donations Table */}
          {activeTab === 'donations' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                  <tr>
                    <th style={{ padding: '14px 18px', color: '#64748b' }}>Donation Item</th>
                    <th style={{ padding: '14px 18px', color: '#64748b' }}>Donor Hotel</th>
                    <th style={{ padding: '14px 18px', color: '#64748b' }}>Recipient NGO</th>
                    <th style={{ padding: '14px 18px', color: '#64748b' }}>Quantity</th>
                    <th style={{ padding: '14px 18px', color: '#64748b' }}>Current Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 700 }}>
                        {d.foodName}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#64748b' }}>
                        {d.donorName}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#126343', fontWeight: 600 }}>
                        {d.ngoName}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {d.quantity}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span className="badge badge-success" style={{ textTransform: 'uppercase' }}>
                          {d.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
