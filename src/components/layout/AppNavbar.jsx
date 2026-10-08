import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/dataService';

export default function AppNavbar({ searchTerm, onSearchChange, title }) {
  const { currentUser, userRole, logout } = useAuth();
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
    const interval = setInterval(refreshNotifs, 3000);

    const handleUpdate = (e) => {
      if (!e.detail || e.detail.collection === 'notifications') {
        refreshNotifs();
      }
    };
    window.addEventListener('foodconnect_data_updated', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('foodconnect_data_updated', handleUpdate);
    };
  }, [currentUser]);

  const handleMarkSingleRead = (id) => {
    notificationService.markAsRead(id);
    refreshNotifs();
  };

  const handleMarkAllRead = () => {
    if (currentUser) {
      notificationService.markAllAsRead(currentUser.id);
      refreshNotifs();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="dashboard-topbar">
      {/* Left: Mobile Toggle + Search Bar or Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <button
          type="button"
          className="mobile-menu-toggle-btn"
          onClick={() => window.dispatchEvent(new CustomEvent('foodconnect_toggle_sidebar'))}
          aria-label="Open navigation menu"
          title="Open Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        {onSearchChange ? (
          <div className="topbar-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by food name, category, or location..."
              value={searchTerm || ''}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {title || 'FoodConnect'}
            </h2>
            <span className="badge badge-green" style={{ textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em', flexShrink: 0 }}>
              {userRole === 'donor' ? 'Donor' : userRole === 'ngo' ? 'NGO' : 'Admin'}
            </span>
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="topbar-actions">
        {/* Notifications Button & Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            className="topbar-notif-btn" 
            onClick={() => setShowNotifs(!showNotifs)}
            title="In-App Notifications"
          >
            🔔
            {unreadCount > 0 && <span className="notif-badge-pill">{unreadCount}</span>}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute',
              right: '-10px',
              top: '48px',
              width: 'min(340px, calc(100vw - 32px))',
              maxWidth: '92vw',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
              border: '1px solid var(--color-border)',
              padding: '16px',
              zIndex: 1000
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>Notifications ({unreadCount} unread)</strong>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead} 
                    style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.length === 0 ? (
                  <p style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'center', padding: '16px 0' }}>
                    No notifications yet.
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => handleMarkSingleRead(n.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: n.read ? '#ffffff' : '#f0fdf4',
                        border: '1px solid',
                        borderColor: n.read ? '#f1f5f9' : '#bbf7d0',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 700, color: '#0b462f' }}>{n.title}</span>
                        {!n.read && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>}
                      </div>
                      <div style={{ color: '#475569', fontSize: '0.78rem', lineHeight: 1.3 }}>{n.message}</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="topbar-user" style={{ cursor: 'default' }}>
            <div className="user-avatar-circle">
              {currentUser?.organizationName ? currentUser.organizationName.substring(0, 2).toUpperCase() : 'FC'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.1 }}>
              <span className="user-name-label" style={{ fontSize: '0.82rem' }}>
                {currentUser?.organizationName || currentUser?.name || 'Account'}
              </span>
              <span style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                {userRole}
              </span>
            </div>
          </div>

          <button 
            onClick={handleLogout} 
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem', padding: '6px 10px', color: '#dc2626' }}
            title="Sign out of FoodConnect"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
