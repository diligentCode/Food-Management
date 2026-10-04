import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/dataService';
import { isCloudFirebaseActive, getStoredFirebaseConfig, saveStoredFirebaseConfig } from '../../services/firebase';
import { getGeminiApiKey, setGeminiApiKey, hasRealGeminiConfigured } from '../../services/aiService';

export default function AppNavbar({ searchTerm, onSearchChange, title }) {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Settings / Cloud connection modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [fbApiKey, setFbApiKey] = useState(getStoredFirebaseConfig().apiKey || '');
  const [fbProjectId, setFbProjectId] = useState(getStoredFirebaseConfig().projectId || '');
  const [fbAuthDomain, setFbAuthDomain] = useState(getStoredFirebaseConfig().authDomain || '');
  const [geminiKey, setGeminiKeyState] = useState(getGeminiApiKey() || '');
  const [settingsSaved, setSettingsSaved] = useState(false);

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

  const handleSaveSettings = (e) => {
    e.preventDefault();
    saveStoredFirebaseConfig({
      apiKey: fbApiKey.trim(),
      projectId: fbProjectId.trim(),
      authDomain: fbAuthDomain.trim() || `${fbProjectId.trim()}.firebaseapp.com`
    });
    setGeminiApiKey(geminiKey.trim());
    setSettingsSaved(true);
    setTimeout(() => {
      setSettingsSaved(false);
      setShowSettingsModal(false);
    }, 1200);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCloudActive = isCloudFirebaseActive();
  const hasGemini = hasRealGeminiConfigured();

  return (
    <header className="dashboard-topbar">
      {/* Left: Search Bar or Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>
              {title || 'FoodConnect'}
            </h2>
            <span className="badge badge-green" style={{ textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
              {userRole === 'donor' ? 'Donor Portal' : userRole === 'ngo' ? 'NGO Portal' : 'Admin'}
            </span>
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="topbar-actions">
        {/* Cloud & AI Sync Pill */}
        <button
          type="button"
          onClick={() => setShowSettingsModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.74rem',
            padding: '5px 10px',
            borderRadius: '9999px',
            border: '1px solid',
            borderColor: isCloudActive ? '#86efac' : '#cbd5e1',
            backgroundColor: isCloudActive ? '#f0fdf4' : '#f8fafc',
            color: isCloudActive ? '#15803d' : '#64748b',
            cursor: 'pointer',
            fontWeight: 700
          }}
          title="Cloud Database & AI Vision Status"
        >
          <span style={{ fontSize: '0.75rem' }}>{isCloudActive ? '🟢' : '💾'}</span>
          <span>{isCloudActive ? 'Cloud Firestore Sync' : 'Local Storage Mode'}</span>
        </button>

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
              right: 0,
              top: '48px',
              width: '340px',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              border: '1px solid var(--color-border)',
              padding: '16px',
              zIndex: 200
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

      {/* Cloud & AI Configuration Modal */}
      {showSettingsModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 500,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>
                  ☁️ Multi-Device Cloud & AI Settings
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                  Connect Cloud Firestore for real multi-device sync and Google Gemini Vision for live AI inspection.
                </p>
              </div>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#94a3b8', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            {settingsSaved && (
              <div style={{ background: '#dcfce7', color: '#15803d', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
                ✓ Settings saved! Reloading to apply cloud connections...
              </div>
            )}

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>Firebase Cloud Firestore (Multi-Device Sync)</span>
                <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '4px 0 10px 0' }}>
                  Enables real-time chat, live food listings, and notifications across different computers and mobile phones.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '2px' }}>Firebase API Key</label>
                    <input
                      type="text"
                      value={fbApiKey}
                      onChange={(e) => setFbApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '2px' }}>Firebase Project ID</label>
                    <input
                      type="text"
                      value={fbProjectId}
                      onChange={(e) => setFbProjectId(e.target.value)}
                      placeholder="foodconnect-production"
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>Google Gemini Vision API (Multimodal AI)</span>
                <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '4px 0 10px 0' }}>
                  Free from Google AI Studio (aistudio.google.com). If empty, real HTML5 Canvas computer vision is used.
                </p>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '2px' }}>Gemini API Key</label>
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKeyState(e.target.value)}
                    placeholder="AIzaSy..."
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  Save & Apply Config
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
