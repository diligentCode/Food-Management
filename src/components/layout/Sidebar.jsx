import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { currentUser, userRole, logout } = useAuth();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <Link to="/" className="sidebar-logo">
        <div className="brand-icon" style={{ width: '36px', height: '36px', background: '#10b981' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#0b462f"/>
          </svg>
        </div>
        <div className="sidebar-logo-text">
          <h3>FoodConnect</h3>
          <p>Share Food, Share Hope</p>
        </div>
      </Link>

      {/* User Card if NGO (Matching Reference Image 2) */}
      {userRole === 'ngo' && (
        <div className="sidebar-user-card">
          <div className="sidebar-user-avatar" style={{ background: '#126343', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff' }}>
            🤝
          </div>
          <div className="sidebar-user-info">
            <h4>{currentUser?.name || 'Hope Foundation'} ✓</h4>
            <span>NGO / Receiver</span>
            <div className="sidebar-verified-tag">
              ✓ Verified NGO
            </div>
          </div>
        </div>
      )}

      {/* Nav List */}
      <ul className="sidebar-nav">
        {userRole === 'donor' && (
          <>
            <li className="sidebar-item">
              <NavLink to="/donor" end className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="sidebar-item-icon">🏠</span>
                <span>Home</span>
              </NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/donor/add-food" className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="sidebar-item-icon">➕</span>
                <span>List Surplus Food</span>
              </NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/donor/listings" className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="sidebar-item-icon">📋</span>
                <span>My Listings</span>
              </NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/donor/tracking" className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="sidebar-item-icon">🚚</span>
                <span>Donation Tracking</span>
              </NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/donor/waste-management" className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="sidebar-item-icon">♻️</span>
                <span>Waste Management</span>
              </NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/donor/messages" className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="sidebar-item-icon">💬</span>
                <span>Chat & Messages</span>
                <span className="sidebar-badge">2</span>
              </NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/donor/profile" className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="sidebar-item-icon">👤</span>
                <span>Profile</span>
              </NavLink>
            </li>
          </>
        )}

        {userRole === 'ngo' && (
          <>
            <li className="sidebar-item">
              <NavLink to="/ngo" end className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="sidebar-item-icon">🔔</span>
                <span>Food Notifications</span>
                <span className="sidebar-badge">5</span>
              </NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/ngo/available" className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="sidebar-item-icon">🍲</span>
                <span>Available Listings</span>
              </NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/ngo/requests" className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="sidebar-item-icon">📦</span>
                <span>My Distributions</span>
              </NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/ngo/map" className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="sidebar-item-icon">🗺️</span>
                <span>Map View</span>
              </NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/ngo/messages" className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="sidebar-item-icon">💬</span>
                <span>Chat & Messages</span>
                <span className="sidebar-badge">2</span>
              </NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/ngo/profile" className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="sidebar-item-icon">🏢</span>
                <span>NGO Profile</span>
              </NavLink>
            </li>
          </>
        )}

        {userRole === 'admin' && (
          <>
            <li className="sidebar-item">
              <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="sidebar-item-icon">📊</span>
                <span>Admin Overview</span>
              </NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="sidebar-item-icon">👥</span>
                <span>Manage Users</span>
              </NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/admin/listings" className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="sidebar-item-icon">🍲</span>
                <span>Food Listings</span>
              </NavLink>
            </li>
            <li className="sidebar-item">
              <NavLink to="/admin/donations" className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="sidebar-item-icon">📦</span>
                <span>All Donations</span>
              </NavLink>
            </li>
          </>
        )}

        <li className="sidebar-item" style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
          <button onClick={logout} style={{ color: '#fca5a5' }}>
            <span className="sidebar-item-icon">🚪</span>
            <span>Sign Out</span>
          </button>
        </li>
      </ul>

      {/* Encouragement Card at bottom */}
      <div className="sidebar-motivation">
        <span className="sidebar-motivation-icon">🍃</span>
        <p>Together, we can reduce food waste and fight hunger.</p>
      </div>
    </aside>
  );
}
