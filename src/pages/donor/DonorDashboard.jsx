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

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <AppNavbar title="Donor Dashboard" />

        <div className="dashboard-body">
          {/* Header Greeting & Top Impact Highlight (Matching Reference Image 1) */}
          <div className="dashboard-header-row">
            <div className="greeting-text">
              <h1>Welcome back, {currentUser?.name || 'Hotel Green Valley'}! 🍃</h1>
              <p>
                Your extra food can make a big difference. List surplus food and help those in need.
              </p>
            </div>

            {/* Total Food Donated Card */}
            <div className="impact-highlight-card">
              <div className="impact-highlight-info">
                <span className="impact-highlight-label">
                  <span>🍃</span> Total Food Donated
                </span>
                <span className="impact-highlight-val">2.6 Tons</span>
                <span className="impact-highlight-sub">This month</span>
              </div>
              <div className="impact-highlight-icon">
                🥗
              </div>
            </div>
          </div>

          {/* 4 Metrics Cards (Matching Reference Image 1) */}
          <div className="metrics-grid">
            <Link to="/donor/listings" className="metric-card">
              <div className="metric-icon-circle" style={{ backgroundColor: '#e6f4ea', color: '#126343' }}>
                🍴
              </div>
              <div className="metric-data">
                <div className="metric-number">{listings.length || 4}</div>
                <div className="metric-label">Active Listings</div>
              </div>
              <span className="metric-chevron">&gt;</span>
            </Link>

            <div className="metric-card">
              <div className="metric-icon-circle" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
                👥
              </div>
              <div className="metric-data">
                <div className="metric-number">3</div>
                <div className="metric-label">NGOs Reached</div>
              </div>
              <span className="metric-chevron">&gt;</span>
            </div>

            <Link to="/donor/tracking" className="metric-card">
              <div className="metric-icon-circle" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                💜
              </div>
              <div className="metric-data">
                <div className="metric-number">2.6 Tons</div>
                <div className="metric-label">Food Donated</div>
              </div>
              <span className="metric-chevron">&gt;</span>
            </Link>

            <div className="metric-card">
              <div className="metric-icon-circle" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
                🍃
              </div>
              <div className="metric-data">
                <div className="metric-number">1.2 Tons</div>
                <div className="metric-label">Food Saved</div>
              </div>
              <span className="metric-chevron">&gt;</span>
            </div>
          </div>

          {/* Recent Listings Section (Matching Reference Image 1) */}
          <div className="dashboard-card-container">
            <div className="card-header-row">
              <h2 className="card-header-title">Recent Listings</h2>
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
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                  <p>You haven't listed any surplus food yet.</p>
                  <Link to="/donor/add-food" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
                    Create Your First Listing
                  </Link>
                </div>
              ) : (
                listings.slice(0, 4).map((item) => (
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
                      </div>
                      <div className="listing-donor-name">
                        <span>🏨</span> {item.donorName || currentUser?.name || 'Hotel Green Valley'}
                      </div>
                      <div className="listing-meta-row">
                        <span className="meta-pill pill-muted">
                          🕒 Quantity: {item.quantity} {item.unit}
                        </span>
                        <span className="meta-pill pill-muted">
                          Prepared: {item.preparedAt}
                        </span>
                        <span className="meta-pill pill-fresh">
                          Fresh
                        </span>
                        <span className="meta-pill pill-muted">
                          2 hours old
                        </span>
                      </div>
                    </div>

                    <div className="listing-actions-col">
                      <span className="badge badge-success">
                        ● {item.status.toUpperCase()}
                      </span>
                      <Link to={`/donor/listings`} className="btn btn-primary btn-sm">
                        View Details &rarr;
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
