import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import AppNavbar from '../../components/layout/AppNavbar';
import { useAuth } from '../../context/AuthContext';
import { foodService, donationService } from '../../services/dataService';
import '../../styles/Dashboard.css';

export default function DonorDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [activeDonations, setActiveDonations] = useState([]);

  useEffect(() => {
    if (currentUser) {
      setListings(foodService.getDonorListings(currentUser.id));
      setActiveDonations(donationService.getUserDonations(currentUser.id, 'donor'));
    }
  }, [currentUser]);

  const activeListingsCount = listings.filter(l => l.status === 'available').length;
  const totalKg = listings.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
  const totalTons = (totalKg / 1000).toFixed(2);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <AppNavbar title="Donor Dashboard" />

        <div className="dashboard-body">
          {/* Header Greeting & Top Impact Highlight */}
          <div className="dashboard-header-row">
            <div className="greeting-text">
              <h1>Welcome back, {currentUser?.organizationName || currentUser?.name || 'Food Donor'}! 🍃</h1>
              <p>
                Every extra meal makes a difference. Post surplus edible food so local charities and verified NGOs can distribute it immediately.
              </p>
            </div>

            {/* Total Food Donated Card */}
            <div className="impact-highlight-card">
              <div className="impact-highlight-info">
                <span className="impact-highlight-label">
                  <span>🍃</span> Total Food Listed
                </span>
                <span className="impact-highlight-val">{totalKg} kg</span>
                <span className="impact-highlight-sub">{totalTons} Tons diverted from waste</span>
              </div>
              <div className="impact-highlight-icon">
                🥗
              </div>
            </div>
          </div>

          {/* 4 Metrics Cards */}
          <div className="metrics-grid">
            <Link to="/donor/listings" className="metric-card">
              <div className="metric-icon-circle" style={{ backgroundColor: '#e6f4ea', color: '#126343' }}>
                🍴
              </div>
              <div className="metric-data">
                <div className="metric-number">{activeListingsCount}</div>
                <div className="metric-label">Active Listings</div>
              </div>
              <span className="metric-chevron">&gt;</span>
            </Link>

            <Link to="/donor/tracking" className="metric-card">
              <div className="metric-icon-circle" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
                👥
              </div>
              <div className="metric-data">
                <div className="metric-number">{activeDonations.length}</div>
                <div className="metric-label">Accepted Donations</div>
              </div>
              <span className="metric-chevron">&gt;</span>
            </Link>

            <Link to="/donor/waste-management" className="metric-card">
              <div className="metric-icon-circle" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                ♻️
              </div>
              <div className="metric-data">
                <div className="metric-number">Municipal</div>
                <div className="metric-label">Waste Composting</div>
              </div>
              <span className="metric-chevron">&gt;</span>
            </Link>

            <Link to="/donor/add-food" className="metric-card">
              <div className="metric-icon-circle" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
                ➕
              </div>
              <div className="metric-data">
                <div className="metric-number">New</div>
                <div className="metric-label">List Surplus Food</div>
              </div>
              <span className="metric-chevron">&gt;</span>
            </Link>
          </div>

          {/* Recent Listings Section */}
          <div className="dashboard-card-container">
            <div className="card-header-row">
              <h2 className="card-header-title">Recent Surplus Postings</h2>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Link to="/donor/add-food" className="btn btn-primary btn-sm">
                  + Add Surplus Food
                </Link>
                <Link to="/donor/listings" className="btn btn-secondary btn-sm">
                  View All &rarr;
                </Link>
              </div>
            </div>

            <div className="listings-list">
              {listings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🍲</div>
                  <h3 style={{ color: '#0f172a', fontWeight: 800 }}>No Surplus Food Listed Yet</h3>
                  <p style={{ marginTop: '8px', maxWidth: '440px', margin: '8px auto 0 auto', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    Your surplus kitchen meals can feed dozens of community members. Click below to publish your first surplus food batch in under a minute!
                  </p>
                  <Link to="/donor/add-food" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>
                    + Publish Your First Food Listing
                  </Link>
                </div>
              ) : (
                listings.slice(0, 5).map((item) => (
                  <div key={item.id} className="listing-row-card">
                    <div className="listing-thumb-wrap">
                      {item.imageURL ? (
                        <img
                          src={item.imageURL}
                          alt={item.foodName}
                          className="listing-thumb"
                        />
                      ) : (
                        <div className="listing-thumb flex-center" style={{ background: '#e2e8f0', fontSize: '1.8rem' }}>
                          🍲
                        </div>
                      )}
                    </div>

                    <div className="listing-info">
                      <div className="listing-info-top">
                        <h3 className="listing-food-name">{item.foodName}</h3>
                        {item.listingType === 'paid' ? (
                          <span className="badge badge-warning">
                            PAID: ₹{item.price}/{item.unit}
                          </span>
                        ) : (
                          <span className="badge badge-success">
                            100% FREE
                          </span>
                        )}
                      </div>
                      <div className="listing-donor-name">
                        <span>🏨</span> {item.donorName || currentUser?.organizationName}
                      </div>
                      <div className="listing-meta-row">
                        <span className="meta-pill pill-muted">
                          🕒 Quantity: {item.quantity} {item.unit}
                        </span>
                        <span className="meta-pill pill-muted">
                          ⏰ {item.pickupDeadline}
                        </span>
                        <span className="meta-pill pill-fresh">
                          AI Freshness: {item.qualityScore || 88}/100
                        </span>
                      </div>
                    </div>

                    <div className="listing-actions-col">
                      <span className={`badge ${item.status === 'expired' ? 'badge-warning' : 'badge-success'}`}>
                        ● {item.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <Link to="/donor/listings" className="btn btn-primary btn-sm">
                        Manage Listing &rarr;
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
