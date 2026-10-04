import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/dataService';

export default function AppNavbar({ searchTerm, onSearchChange, title }) {
  const { currentUser, userRole, loginAsDonor, loginAsNGO, loginAsAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifs = () => {
    if (!currentUser) return;
    const list = notificationService.getNotifications(currentUser.id);
    setNotifications(list);
    setUnreadCount(notificationService.getUnreadCount(currentUser.id));
  };

  useEffect(() => {
    refreshNotifs();
    const interval = setInterval(refreshNotifs, 4000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleMarkAllRead = () => {
    if (currentUser) {
      notificationService.markAllAsRead(currentUser.id);
      refreshNotifs();
    }
  };

  const handleRoleSwitch = (role) => {
    if (role === 'donor') {
      loginAsDonor();
      navigate('/donor');
    } else if (role === 'ngo') {
      loginAsNGO();
      navigate('/ngo');
    } else if (role === 'admin') {
      loginAsAdmin();
      navigate('/admin');
    }
  };

  return (
    <header className="dashboard-topbar">
      {/* Left: Search Bar or Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {onSearchChange ? (
          <div className="topbar-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by food, hotel, location, or donor..."
              value={searchTerm || ''}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        ) : (
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
            {title || 'FoodConnect Portal'}
          </h2>
        )}
      </div>

      {/* Right Actions */}
      <div className="topbar-actions">
        {/* Quick Demo Switcher */}
        <div className="role-switcher" title="Quick Role Switcher for MVP Testing">
          <button 
            className={`role-switcher-btn ${userRole === 'donor' ? 'active' : ''}`}
            onClick={() => handleRoleSwitch('donor')}
          >
            Donor Mode
          </button>
          <button 
            className={`role-switcher-btn ${userRole === 'ngo' ? 'active' : ''}`}
            onClick={() => handleRoleSwitch('ngo')}
          >
            NGO Mode
          </button>
          <button 
            className={`role-switcher-btn ${userRole === 'admin' ? 'active' : ''}`}
            onClick={() => handleRoleSwitch('admin')}
          >
            Admin
          </button>
        </div>

        {/* Language */}
        <div className="lang-selector">
          <span>🌐</span> English ⌵
        </div>

        {/* Notifications Button & Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            className="topbar-notif-btn" 
            onClick={() => setShowNotifs(!showNotifs)}
            title="View Notifications"
          >
            🔔
            {unreadCount > 0 && <span className="notif-badge-pill">{unreadCount}</span>}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '320px',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              border: '1px solid var(--color-border)',
              padding: '16px',
              zIndex: 200
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>In-App Notifications</strong>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead} 
                    style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.length === 0 ? (
                  <p style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'center', padding: '16px 0' }}>
                    No notifications yet.
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        backgroundColor: n.read ? '#ffffff' : '#f0fdf4',
                        border: '1px solid',
                        borderColor: n.read ? '#f1f5f9' : '#bbf7d0',
                        fontSize: '0.82rem'
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#0b462f', marginBottom: '2px' }}>{n.title}</div>
                      <div style={{ color: '#475569', fontSize: '0.78rem' }}>{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div className="topbar-user" onClick={logout} title="Click to Sign Out">
          <div className="user-avatar-circle">
            {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'FC'}
          </div>
          <span className="user-name-label">
            {currentUser?.name || 'Guest'}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>🚪</span>
        </div>
      </div>
    </header>
  );
}
