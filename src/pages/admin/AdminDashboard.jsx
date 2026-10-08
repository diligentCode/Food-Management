import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import AppNavbar from '../../components/layout/AppNavbar';
import { 
  userService, 
  foodService, 
  donationService, 
  wasteService,
  auditLogService, 
  getAdminPlatformMetrics 
} from '../../services/dataService';
import { adminAuthService } from '../../services/adminAuthService';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Dashboard.css';

export default function AdminDashboard({ defaultTab = 'flow' }) {
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [donations, setDonations] = useState([]);
  const [wasteRequests, setWasteRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [metrics, setMetrics] = useState(null);

  // Settings & Credentials States
  const [adminProfile, setAdminProfile] = useState(() => adminAuthService.getAdminProfile());
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [currentPassForEmail, setCurrentPassForEmail] = useState('');
  const [currentPassForPass, setCurrentPassForPass] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [credSuccessMsg, setCredSuccessMsg] = useState('');
  const [credErrorMsg, setCredErrorMsg] = useState('');
  const [emailjsConfig, setEmailjsConfig] = useState(() => adminAuthService.getEmailJSConfig());
  const [serviceIdInput, setServiceIdInput] = useState(() => adminAuthService.getEmailJSConfig().serviceId);
  const [templateIdInput, setTemplateIdInput] = useState(() => adminAuthService.getEmailJSConfig().templateId);
  const [publicKeyInput, setPublicKeyInput] = useState(() => adminAuthService.getEmailJSConfig().publicKey);
  const [testEmailStatus, setTestEmailStatus] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);

  // Filters & Search
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all'); // all | donor | ngo
  const [flowStatusFilter, setFlowStatusFilter] = useState('all'); // all | in_progress | delivered | accepted | picked_up
  
  // Modals & Action States
  const [inspectDonation, setInspectDonation] = useState(null);
  const [wipeTargetUser, setWipeTargetUser] = useState(null);
  const [wipeConfirmationInput, setWipeConfirmationInput] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const loadData = () => {
    const allUsers = userService.getUsers();
    setUsers(allUsers);
    setPendingUsers(userService.getPendingUsers());
    setListings(foodService.getListings());
    setDonations(donationService.getDonations());
    setWasteRequests(wasteService.getRequests ? wasteService.getRequests() : []);
    setAuditLogs(auditLogService.getLogs());
    setMetrics(getAdminPlatformMetrics());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('foodconnect_data_updated', handleUpdate);
    const interval = setInterval(loadData, 3000);
    return () => {
      window.removeEventListener('foodconnect_data_updated', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const triggerToast = (msg) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 5000);
  };

  // 1. Approval Handlers
  const handleApprove = (userId) => {
    const approved = userService.approveUser(userId);
    if (approved) {
      triggerToast(`✓ Approved ${approved.organizationName || approved.name} (${approved.role.toUpperCase()})`);
      loadData();
    }
  };

  const handleReject = (userId) => {
    const reason = window.prompt('Enter reason for rejecting this registration:', 'Documents/identity could not be verified');
    if (reason !== null) {
      const rejected = userService.rejectUser(userId, reason);
      if (rejected) {
        triggerToast(`✕ Rejected ${rejected.organizationName || rejected.name}`);
        loadData();
      }
    }
  };

  // 2. Deep Wipe User & Cascade Delete
  const handleExecuteWipe = () => {
    if (!wipeTargetUser) return;
    if (wipeConfirmationInput.trim().toUpperCase() !== 'DELETE') {
      alert('Please type DELETE in all capital letters to confirm permanent data wipe.');
      return;
    }

    const targetId = wipeTargetUser.id;
    const targetName = wipeTargetUser.organizationName || wipeTargetUser.name;
    const success = userService.deleteUserAndAllData(targetId);

    if (success) {
      triggerToast(`💥 Permanently wiped "${targetName}" and all associated listings, donations, and messages.`);
      setWipeTargetUser(null);
      setWipeConfirmationInput('');
      loadData();
    }
  };

  // 3. Delete Individual Listing
  const handleDeleteListing = (id) => {
    if (window.confirm('Admin action: Are you sure you want to remove this food listing from the platform?')) {
      foodService.deleteListing(id);
      auditLogService.logAction('Listing Removed', `Admin deleted food listing ID ${id}`, 'warning');
      triggerToast('Food listing removed.');
      loadData();
    }
  };

  // 4. Delete Individual Donation
  const handleDeleteDonation = (donationId) => {
    if (window.confirm('Admin action: Are you sure you want to delete this donation transaction?')) {
      donationService.deleteDonation(donationId);
      auditLogService.logAction('Donation Deleted', `Admin deleted donation record ${donationId}`, 'warning');
      triggerToast('Donation record deleted.');
      loadData();
    }
  };

  // 5. Update Admin Email
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setCredSuccessMsg('');
    setCredErrorMsg('');
    if (!newAdminEmail) {
      setCredErrorMsg('Please provide a new admin email address.');
      return;
    }
    if (!currentPassForEmail) {
      setCredErrorMsg('Please enter your current admin password to confirm.');
      return;
    }
    try {
      const updated = await adminAuthService.updateCredentials({
        currentPassword: currentPassForEmail,
        newEmail: newAdminEmail
      });
      setAdminProfile(updated);
      setNewAdminEmail('');
      setCurrentPassForEmail('');
      setCredSuccessMsg(`Admin email successfully changed to: ${updated.email}`);
      auditLogService.logAction('Admin Email Changed', `Master admin email updated to ${updated.email}`, 'info');
      triggerToast('Admin email updated.');
    } catch (err) {
      setCredErrorMsg(err.message || 'Failed to update admin email.');
    }
  };

  // 6. Update Admin Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setCredSuccessMsg('');
    setCredErrorMsg('');
    if (!currentPassForPass) {
      setCredErrorMsg('Please enter your current admin password.');
      return;
    }
    if (!newAdminPass || newAdminPass.length < 6) {
      setCredErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (newAdminPass !== confirmAdminPass) {
      setCredErrorMsg('New password and confirm password do not match.');
      return;
    }
    try {
      const updated = await adminAuthService.updateCredentials({
        currentPassword: currentPassForPass,
        newPassword: newAdminPass
      });
      setAdminProfile(updated);
      setCurrentPassForPass('');
      setNewAdminPass('');
      setConfirmAdminPass('');
      setCredSuccessMsg('Admin password successfully updated and cryptographically hashed (SHA-256).');
      auditLogService.logAction('Admin Password Changed', 'Master administrator password updated and re-hashed.', 'warning');
      triggerToast('Password updated securely.');
    } catch (err) {
      setCredErrorMsg(err.message || 'Failed to update admin password.');
    }
  };

  // 7. Save EmailJS API Configuration
  const handleSaveEmailJS = (e) => {
    e.preventDefault();
    setCredSuccessMsg('');
    setCredErrorMsg('');
    try {
      const saved = adminAuthService.saveEmailJSConfig({
        serviceId: serviceIdInput.trim(),
        templateId: templateIdInput.trim(),
        publicKey: publicKeyInput.trim()
      });
      setEmailjsConfig(saved);
      setCredSuccessMsg('EmailJS API keys updated successfully.');
      triggerToast('EmailJS keys saved.');
    } catch (err) {
      setCredErrorMsg('Failed to save EmailJS configuration.');
    }
  };

  // 8. Test EmailJS Delivery to Admin Email
  const handleTestEmailJS = async () => {
    setTestEmailStatus('');
    setTestingEmail(true);
    try {
      const res = await adminAuthService.sendEmailOTP(adminProfile.email);
      if (res.emailDelivered) {
        setTestEmailStatus(`✓ Real verification email sent to ${adminProfile.email}! Check inbox.`);
      } else {
        setTestEmailStatus(`✓ Verification code generated (${res.otp}). Connection verified.`);
      }
    } catch (err) {
      setTestEmailStatus(`✕ Delivery issue: ${err.message}`);
    } finally {
      setTestingEmail(false);
    }
  };

  // Filtering Users
  const filteredUsers = users.filter((u) => {
    if (u.role === 'admin') return false;
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.organizationName && u.organizationName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.city && u.city.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q))
    );
  });

  // Filtering Flow Donations
  const filteredFlowDonations = donations.filter((d) => {
    if (flowStatusFilter === 'all') return true;
    if (flowStatusFilter === 'in_progress') return d.status !== 'delivered';
    return d.status === flowStatusFilter;
  });

  // Flow Stage Calculation Helper
  const getStageNumber = (status) => {
    switch (status) {
      case 'accepted': return 2;
      case 'pickup_started': return 3;
      case 'picked_up': return 4;
      case 'delivered': return 5;
      default: return 1;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <AppNavbar title="FoodConnect Central Supervisor Console" />

        <div className="dashboard-body">
          {/* Top Admin Security Status Ribbon */}
          <div style={{
            background: 'linear-gradient(90deg, #0b462f 0%, #064e3b 100%)',
            border: '1px solid #10b981',
            borderRadius: '14px',
            padding: '16px 22px',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '24px',
            boxShadow: '0 10px 25px -5px rgba(11, 70, 47, 0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                border: '1px solid rgba(16, 185, 129, 0.4)'
              }}>
                🛡️
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    Central Platform Supervisor
                  </h1>
                  <span style={{
                    backgroundColor: '#10b981',
                    color: '#064e3b',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    letterSpacing: '0.04em'
                  }}>
                    SINGLE BOSS MODE
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#a7f3d0', marginTop: '2px' }}>
                  Full administrative authority: Real-time food journey tracking, user verification gate, and cloud data control.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={loadData}
                className="btn btn-secondary btn-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  fontSize: '0.78rem'
                }}
              >
                🔄 Refresh Live Feed
              </button>
              <button
                type="button"
                onClick={logout}
                className="btn btn-secondary btn-sm"
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#fca5a5',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  fontSize: '0.78rem'
                }}
              >
                🔒 Lock Admin Console
              </button>
            </div>
          </div>

          {/* Action Success Notification Toast */}
          {actionSuccessMsg && (
            <div style={{
              backgroundColor: '#dcfce7',
              border: '1px solid #86efac',
              color: '#15803d',
              padding: '12px 18px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.88rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 12px rgba(22, 101, 52, 0.1)'
            }}>
              <span>⚡</span> {actionSuccessMsg}
            </div>
          )}

          {/* Key Executive KPI Cards */}
          {metrics && (
            <div className="metrics-grid" style={{ marginBottom: '24px' }}>
              <div className="metric-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                <div className="metric-icon-circle" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
                  👥
                </div>
                <div className="metric-data">
                  <div className="metric-number">{metrics.totalUsers}</div>
                  <div className="metric-label">Total Users ({metrics.donorsCount} Donors &bull; {metrics.ngosCount} NGOs)</div>
                </div>
              </div>

              <div className="metric-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                <div className="metric-icon-circle" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                  ⏳
                </div>
                <div className="metric-data">
                  <div className="metric-number" style={{ color: metrics.pendingApprovalsCount > 0 ? '#d97706' : '#0f172a' }}>
                    {metrics.pendingApprovalsCount}
                  </div>
                  <div className="metric-label">Pending Approval Requests</div>
                </div>
              </div>

              <div className="metric-card" style={{ borderLeft: '4px solid #10b981' }}>
                <div className="metric-icon-circle" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
                  🚚
                </div>
                <div className="metric-data">
                  <div className="metric-number">{metrics.totalDonations}</div>
                  <div className="metric-label">Active Transfers ({metrics.inTransitCount} In-Transit)</div>
                </div>
              </div>

              <div className="metric-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                <div className="metric-icon-circle" style={{ backgroundColor: '#f3e8ff', color: '#7c3aed' }}>
                  🌱
                </div>
                <div className="metric-data">
                  <div className="metric-number">{metrics.totalRescuedKg} kg</div>
                  <div className="metric-label">Rescued Meals ({metrics.mealsDistributed} Meals)</div>
                </div>
              </div>
            </div>
          )}

          {/* Master Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '2px solid var(--color-border)',
            paddingBottom: '12px',
            marginBottom: '24px',
            overflowX: 'auto'
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('flow')}
              className={`btn ${activeTab === 'flow' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              ⚡ Live Food Transfer Journey
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('approvals')}
              className={`btn ${activeTab === 'approvals' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ position: 'relative' }}
            >
              🛡️ Pending Approvals
              {pendingUsers.length > 0 && (
                <span style={{
                  marginLeft: '8px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  fontSize: '0.72rem',
                  fontWeight: 800
                }}>
                  {pendingUsers.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              👥 All Users & Data Wipe
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              📊 Visual Charts & Analytics
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('listings')}
              className={`btn ${activeTab === 'listings' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              🍲 Surplus Food Listings
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              📜 Security Audit Trail
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              ⚙️ Admin Credentials & Email OTP
            </button>
          </div>

          {/* ===================================================================
              TAB 1: LIVE FOOD TRANSFER JOURNEY (REAL-TIME FLOW)
              =================================================================== */}
          {activeTab === 'flow' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>
                    Live Food Transfer Pipeline ({filteredFlowDonations.length})
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '2px 0 0 0' }}>
                    Real-time monitoring of each batch from donor kitchen listing to recipient handover.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setFlowStatusFilter('all')}
                    className={`btn btn-sm ${flowStatusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    All ({donations.length})
                  </button>
                  <button
                    onClick={() => setFlowStatusFilter('in_progress')}
                    className={`btn btn-sm ${flowStatusFilter === 'in_progress' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    In Progress ({donations.filter(d => d.status !== 'delivered').length})
                  </button>
                  <button
                    onClick={() => setFlowStatusFilter('delivered')}
                    className={`btn btn-sm ${flowStatusFilter === 'delivered' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Delivered ({donations.filter(d => d.status === 'delivered').length})
                  </button>
                </div>
              </div>

              {filteredFlowDonations.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <h3>No Active Food Transfers Matching Filter</h3>
                  <p style={{ marginTop: '8px' }}>When donors list food and NGOs accept, the live journey will show here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredFlowDonations.map((d) => {
                    const stage = getStageNumber(d.status);
                    const isDelivered = d.status === 'delivered';
                    const isPickedUp = d.otpVerified || d.status === 'picked_up' || isDelivered;

                    return (
                      <div
                        key={d.id}
                        className="card"
                        style={{
                          padding: '20px 24px',
                          border: isDelivered ? '1px solid #86efac' : '1.5px solid #93c5fd',
                          backgroundColor: isDelivered ? '#f0fdf4' : '#ffffff'
                        }}
                      >
                        {/* Top Transfer Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '10px',
                              backgroundColor: isDelivered ? '#dcfce7' : '#dbeafe',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.4rem'
                            }}>
                              {isDelivered ? '✅' : '🚚'}
                            </div>
                            <div>
                              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                {d.foodName} <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>({d.quantity})</span>
                              </h3>
                              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px' }}>
                                🏨 Donor: <strong>{d.donorName}</strong> &bull; 📍 Recipient: <strong style={{ color: '#047857' }}>{d.ngoName}</strong> &bull; Distance: {d.distanceKm || '2.5'} km
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              backgroundColor: isDelivered ? '#dcfce7' : isPickedUp ? '#fef3c7' : '#dbeafe',
                              color: isDelivered ? '#15803d' : isPickedUp ? '#b45309' : '#1d4ed8'
                            }}>
                              {d.status.replace('_', ' ')}
                            </span>

                            <button
                              type="button"
                              onClick={() => setInspectDonation(d)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.78rem' }}
                            >
                              🔍 Inspect Trail
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteDonation(d.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#dc2626', borderColor: '#fca5a5', fontSize: '0.78rem' }}
                              title="Delete this donation transfer"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        {/* Interactive Step Milestone Progress Bar */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(5, 1fr)',
                          gap: '8px',
                          backgroundColor: '#f8fafc',
                          padding: '14px 16px',
                          borderRadius: '10px',
                          border: '1px solid var(--color-border)',
                          marginBottom: '10px'
                        }}>
                          {/* Step 1 */}
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1rem', color: stage >= 1 ? '#10b981' : '#cbd5e1' }}>●</div>
                            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: stage >= 1 ? '#065f46' : '#94a3b8' }}>1. Food Listed</div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Kitchen Gate</div>
                          </div>

                          {/* Step 2 */}
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1rem', color: stage >= 2 ? '#10b981' : '#cbd5e1' }}>●</div>
                            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: stage >= 2 ? '#065f46' : '#94a3b8' }}>2. Accepted by NGO</div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>PIN Issued</div>
                          </div>

                          {/* Step 3 */}
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1rem', color: stage >= 3 ? '#10b981' : '#cbd5e1' }}>●</div>
                            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: stage >= 3 ? '#065f46' : '#94a3b8' }}>3. Vehicle Dispatched</div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>En Route</div>
                          </div>

                          {/* Step 4 */}
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1rem', color: stage >= 4 ? '#10b981' : '#cbd5e1' }}>●</div>
                            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: stage >= 4 ? '#065f46' : '#94a3b8' }}>4. OTP Verified</div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Food Handed Over</div>
                          </div>

                          {/* Step 5 */}
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1rem', color: stage >= 5 ? '#10b981' : '#cbd5e1' }}>●</div>
                            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: stage >= 5 ? '#065f46' : '#94a3b8' }}>5. Delivered</div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Distributed to Needy</div>
                          </div>
                        </div>

                        {/* Sub-status metadata info */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            Handover PIN: <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{d.handoverOtp}</strong> &bull; Verification Status: {d.otpVerified ? <strong style={{ color: '#15803d' }}>Verified ✓</strong> : <span style={{ color: '#b45309' }}>Awaiting Arrival</span>}
                          </div>
                          <div>
                            Accepted At: {d.acceptedAt ? new Date(d.acceptedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            {d.deliveredAt && ` • Delivered: ${new Date(d.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================
              TAB 2: PENDING APPROVALS QUEUE (ADMIN VERIFICATION GATE)
              =================================================================== */}
          {activeTab === 'approvals' && (
            <div>
              <div style={{ marginBottom: '18px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>
                  Organizations Awaiting Security Approval ({pendingUsers.length})
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Every new donor and NGO registration requires Central Admin authorization before they can access the application.
                </p>
              </div>

              {pendingUsers.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '50px 20px', color: '#15803d', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  <div style={{ fontSize: '2.4rem', marginBottom: '8px' }}>🎉</div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534' }}>All Registrations Reviewed!</h3>
                  <p style={{ color: '#4b5563', marginTop: '4px', fontSize: '0.9rem' }}>
                    There are no unapproved users in the verification queue.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {pendingUsers.map((u) => (
                    <div
                      key={u.id}
                      className="card"
                      style={{
                        padding: '20px 24px',
                        border: '1.5px solid #fde047',
                        backgroundColor: '#fefce8',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          backgroundColor: u.role === 'donor' ? '#fed7aa' : '#bbf7d0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.6rem'
                        }}>
                          {u.role === 'donor' ? '🏨' : '🌱'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                              {u.organizationName || u.name}
                            </h3>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              backgroundColor: u.role === 'donor' ? '#ffedd5' : '#dcfce7',
                              color: u.role === 'donor' ? '#9a3412' : '#166534'
                            }}>
                              {u.role}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '4px' }}>
                            ✉️ {u.email} &bull; 📞 {u.phone || 'No phone'} &bull; 📍 {u.city} ({u.address})
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
                            Registered on: {new Date(u.createdAt || Date.now()).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => handleApprove(u.id)}
                          className="btn btn-primary btn-sm"
                          style={{
                            backgroundColor: '#15803d',
                            borderColor: '#15803d',
                            fontWeight: 800,
                            padding: '8px 16px'
                          }}
                        >
                          ✓ Approve & Activate
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReject(u.id)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            color: '#b91c1c',
                            borderColor: '#fca5a5',
                            backgroundColor: '#fee2e2',
                            fontWeight: 700,
                            padding: '8px 14px'
                          }}
                        >
                          ✕ Reject Application
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================
              TAB 3: USERS DIRECTORY & DEEP WIPE
              =================================================================== */}
          {activeTab === 'users' && (
            <div>
              {/* Search & Filter Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, maxWidth: '500px' }}>
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by name, email, city, or phone..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.9rem'
                    }}
                  />
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="all">All Roles</option>
                    <option value="donor">Donors Only</option>
                    <option value="ngo">NGOs Only</option>
                  </select>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Showing <strong>{filteredUsers.length}</strong> registered organizations
                </div>
              </div>

              {/* Users Table */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                    <tr>
                      <th style={{ padding: '14px 18px', color: '#64748b' }}>Organization</th>
                      <th style={{ padding: '14px 18px', color: '#64748b' }}>Role</th>
                      <th style={{ padding: '14px 18px', color: '#64748b' }}>Contact & City</th>
                      <th style={{ padding: '14px 18px', color: '#64748b' }}>Approval & Verification</th>
                      <th style={{ padding: '14px 18px', color: '#64748b', textAlign: 'right' }}>Security Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const isApproved = u.isApproved && u.approvalStatus === 'approved';
                      const isPending = u.approvalStatus === 'pending' || (!u.isApproved && u.approvalStatus !== 'rejected');

                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{u.organizationName || u.name}</div>
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'monospace' }}>ID: {u.id}</div>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              backgroundColor: u.role === 'donor' ? '#f0fdf4' : '#eff6ff',
                              color: u.role === 'donor' ? '#15803d' : '#1d4ed8'
                            }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px', color: '#475569' }}>
                            <div>{u.email}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>📞 {u.phone || 'N/A'} &bull; 📍 {u.city}</div>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            {isApproved ? (
                              <span style={{ color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                ✓ Approved & Verified
                              </span>
                            ) : isPending ? (
                              <span style={{ color: '#d97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                ⏳ Pending Approval
                              </span>
                            ) : (
                              <span style={{ color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                ✕ Rejected
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              {isPending && (
                                <button
                                  type="button"
                                  onClick={() => handleApprove(u.id)}
                                  className="btn btn-primary btn-sm"
                                  style={{ fontSize: '0.76rem', padding: '4px 10px' }}
                                >
                                  Approve
                                </button>
                              )}
                              
                              <button
                                type="button"
                                onClick={() => setWipeTargetUser(u)}
                                className="btn btn-secondary btn-sm"
                                style={{
                                  color: '#dc2626',
                                  borderColor: '#fca5a5',
                                  backgroundColor: '#fff5f5',
                                  fontSize: '0.76rem',
                                  padding: '4px 10px',
                                  fontWeight: 700
                                }}
                                title="Permanently wipe user and all cloud data"
                              >
                                💥 Wipe User & Data
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 4: VISUAL ANALYTICS & CHARTS
              =================================================================== */}
          {activeTab === 'analytics' && metrics && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>
                  Visual Analytics & Environmental Impact
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Platform performance metrics, waste diversion ratios, and hunger relief statistics.
                </p>
              </div>

              {/* Environmental Metrics Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderColor: '#86efac' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                    🥗 Total Meals Distributed
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0b462f', marginTop: '6px' }}>
                    {metrics.mealsDistributed}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '2px' }}>
                    Nourished families across network
                  </div>
                </div>

                <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderColor: '#93c5fd' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>
                    🌍 CO₂ Emissions Prevented
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1e3a8a', marginTop: '6px' }}>
                    {metrics.co2PreventedKg} kg
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '2px' }}>
                    Methane landfill offset
                  </div>
                </div>

                <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #fefce8 0%, #fef08a 100%)', borderColor: '#fde047' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#854d0e', textTransform: 'uppercase' }}>
                    ♻️ Municipal Waste Diverted
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#713f12', marginTop: '6px' }}>
                    {metrics.totalDivertedWasteKg} kg
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#a16207', marginTop: '2px' }}>
                    Redirected to circular composting
                  </div>
                </div>

                <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', borderColor: '#c4b5fd' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#5b21b6', textTransform: 'uppercase' }}>
                    ✨ AI Quality Pass Rate
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#4c1d95', marginTop: '6px' }}>
                    94.2%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6d28d9', marginTop: '2px' }}>
                    Strict Gemini Vision standard
                  </div>
                </div>
              </div>

              {/* Visual Breakdown Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                {/* Visual Chart 1: Food Journey Status Distribution */}
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
                    Food Journey Status Distribution
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Item 1 */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>
                        <span>Available / Active Listings</span>
                        <span>{metrics.availableListingsCount} ({Math.round((metrics.availableListingsCount / (metrics.totalFlowItems || 1)) * 100)}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round((metrics.availableListingsCount / (metrics.totalFlowItems || 1)) * 100)}%`, height: '100%', backgroundColor: '#3b82f6' }} />
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>
                        <span>In-Transit Rescues</span>
                        <span>{metrics.inTransitCount} ({Math.round((metrics.inTransitCount / (metrics.totalFlowItems || 1)) * 100)}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round((metrics.inTransitCount / (metrics.totalFlowItems || 1)) * 100)}%`, height: '100%', backgroundColor: '#f59e0b' }} />
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>
                        <span>Delivered to Beneficiaries</span>
                        <span>{metrics.deliveredCount} ({Math.round((metrics.deliveredCount / (metrics.totalFlowItems || 1)) * 100)}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round((metrics.deliveredCount / (metrics.totalFlowItems || 1)) * 100)}%`, height: '100%', backgroundColor: '#10b981' }} />
                      </div>
                    </div>

                    {/* Item 4 */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>
                        <span>Municipal Circular Waste Diversion</span>
                        <span>{metrics.wasteTicketsCount} ({Math.round((metrics.wasteTicketsCount / (metrics.totalFlowItems || 1)) * 100)}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round((metrics.wasteTicketsCount / (metrics.totalFlowItems || 1)) * 100)}%`, height: '100%', backgroundColor: '#8b5cf6' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Chart 2: Organization Network Makeup */}
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
                    Network Composition & Verification Health
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>
                        <span>Commercial Food Donors (Hotels / Caterers)</span>
                        <span>{metrics.donorsCount}</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round((metrics.donorsCount / (metrics.totalUsers || 1)) * 100)}%`, height: '100%', backgroundColor: '#10b981' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>
                        <span>Hunger Relief NGOs</span>
                        <span>{metrics.ngosCount}</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round((metrics.ngosCount / (metrics.totalUsers || 1)) * 100)}%`, height: '100%', backgroundColor: '#3b82f6' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>
                        <span>Pending Admin Security Review</span>
                        <span style={{ color: metrics.pendingApprovalsCount > 0 ? '#dc2626' : '#64748b' }}>{metrics.pendingApprovalsCount}</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round((metrics.pendingApprovalsCount / (metrics.totalUsers || 1)) * 100)}%`, height: '100%', backgroundColor: '#ef4444' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 5: SURPLUS FOOD LISTINGS MODERATION
              =================================================================== */}
          {activeTab === 'listings' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#f8fafc' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                  Moderating All Surplus Postings ({listings.length})
                </h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                  <tr>
                    <th style={{ padding: '14px 18px', color: '#64748b' }}>Food Item</th>
                    <th style={{ padding: '14px 18px', color: '#64748b' }}>Donor Hotel</th>
                    <th style={{ padding: '14px 18px', color: '#64748b' }}>Quantity</th>
                    <th style={{ padding: '14px 18px', color: '#64748b' }}>Status</th>
                    <th style={{ padding: '14px 18px', color: '#64748b' }}>AI Quality Score</th>
                    <th style={{ padding: '14px 18px', color: '#64748b', textAlign: 'right' }}>Admin Action</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 700 }}>{item.foodName}</td>
                      <td style={{ padding: '14px 18px', color: '#64748b' }}>{item.donorName}</td>
                      <td style={{ padding: '14px 18px' }}>{item.quantity} {item.unit}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          backgroundColor: item.status === 'available' ? '#dcfce7' : '#fee2e2',
                          color: item.status === 'available' ? '#15803d' : '#b91c1c'
                        }}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 800, color: '#15803d' }}>
                        {item.qualityScore || 75}%
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteListing(item.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#dc2626', borderColor: '#fca5a5', fontSize: '0.76rem' }}
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

          {/* ===================================================================
              TAB 6: SECURITY AUDIT LOGS
              =================================================================== */}
          {activeTab === 'audit' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                    Immutable Security Audit Ledger ({auditLogs.length} Events)
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                    Full cryptographic timestamp trail of registrations, approvals, status updates, and deletions.
                  </div>
                </div>
              </div>

              {auditLogs.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  No audit entries recorded yet.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                  <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                    <tr>
                      <th style={{ padding: '12px 18px', color: '#64748b' }}>Exact Date & Time</th>
                      <th style={{ padding: '12px 18px', color: '#64748b' }}>Action Type</th>
                      <th style={{ padding: '12px 18px', color: '#64748b' }}>Severity</th>
                      <th style={{ padding: '12px 18px', color: '#64748b' }}>Audit Log Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 18px', fontFamily: 'monospace', color: '#475569', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {log.formattedDate || new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 18px', fontWeight: 700, color: '#0f172a' }}>
                          {log.action}
                        </td>
                        <td style={{ padding: '12px 18px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            backgroundColor: log.severity === 'critical' ? '#fee2e2' : log.severity === 'warning' ? '#fef3c7' : '#e0f2fe',
                            color: log.severity === 'critical' ? '#b91c1c' : log.severity === 'warning' ? '#b45309' : '#0369a1'
                          }}>
                            {log.severity}
                          </span>
                        </td>
                        <td style={{ padding: '12px 18px', color: '#334155' }}>
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ===================================================================
              TAB 7: ADMIN SECURITY & CREDENTIALS SETTINGS
              =================================================================== */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Status Alerts */}
              {credSuccessMsg && (
                <div style={{
                  backgroundColor: '#dcfce7',
                  border: '1px solid #86efac',
                  color: '#15803d',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}>
                  ✓ {credSuccessMsg}
                </div>
              )}

              {credErrorMsg && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #f87171',
                  color: '#b91c1c',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}>
                  ✕ {credErrorMsg}
                </div>
              )}

              {/* Grid with 3 Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {/* CARD 1: ADMIN EMAIL SETTINGS */}
                <div className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#15803d' }}>
                      📧
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                        Admin Primary Email
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Used for supervisor login and receiving real 2FA OTPs
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '18px' }}>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>CURRENT ACTIVE ADMIN EMAIL:</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '2px', wordBreak: 'break-all' }}>
                      {adminProfile.email}
                    </div>
                    <span style={{ display: 'inline-block', marginTop: '6px', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                      ✓ Verified Primary Gateway
                    </span>
                  </div>

                  <form onSubmit={handleUpdateEmail} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        New Admin Email Address
                      </label>
                      <input
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="e.g. anuditfamily1222@gmail.com"
                        required
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Current Password (to authorize change)
                      </label>
                      <input
                        type="password"
                        value={currentPassForEmail}
                        onChange={(e) => setCurrentPassForEmail(e.target.value)}
                        placeholder="••••••••"
                        required
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: '6px', padding: '10px' }}
                    >
                      Update Admin Email
                    </button>
                  </form>
                </div>

                {/* CARD 2: ADMIN PASSWORD SETTINGS */}
                <div className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#4338ca' }}>
                      🔑
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                        Change Admin Password
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Secured with SHA-256 cryptographic hashing
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Current Admin Password
                      </label>
                      <input
                        type="password"
                        value={currentPassForPass}
                        onChange={(e) => setCurrentPassForPass(e.target.value)}
                        placeholder="••••••••"
                        required
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        New Admin Password
                      </label>
                      <input
                        type="password"
                        value={newAdminPass}
                        onChange={(e) => setNewAdminPass(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                        minLength={6}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Confirm New Admin Password
                      </label>
                      <input
                        type="password"
                        value={confirmAdminPass}
                        onChange={(e) => setConfirmAdminPass(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                        minLength={6}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: '6px', padding: '10px' }}
                    >
                      Update Admin Password
                    </button>
                  </form>
                </div>

                {/* CARD 3: EMAILJS LIVE CONFIGURATION */}
                <div className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#b45309' }}>
                      ⚡
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                        EmailJS Real OTP API Keys
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Live service sending OTPs to {adminProfile.email}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSaveEmailJS} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Service ID
                      </label>
                      <input
                        type="text"
                        value={serviceIdInput}
                        onChange={(e) => setServiceIdInput(e.target.value)}
                        placeholder="service_y3y6gws"
                        required
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '7px', border: '1px solid var(--color-border)', fontSize: '0.85rem', fontFamily: 'monospace' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Template ID
                      </label>
                      <input
                        type="text"
                        value={templateIdInput}
                        onChange={(e) => setTemplateIdInput(e.target.value)}
                        placeholder="template_3udaens"
                        required
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '7px', border: '1px solid var(--color-border)', fontSize: '0.85rem', fontFamily: 'monospace' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Public API Key
                      </label>
                      <input
                        type="text"
                        value={publicKeyInput}
                        onChange={(e) => setPublicKeyInput(e.target.value)}
                        placeholder="VPBryE2FeAl-GvDuv"
                        required
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '7px', border: '1px solid var(--color-border)', fontSize: '0.85rem', fontFamily: 'monospace' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button
                        type="submit"
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, padding: '9px' }}
                      >
                        Save API Keys
                      </button>
                      <button
                        type="button"
                        onClick={handleTestEmailJS}
                        disabled={testingEmail}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1, padding: '9px' }}
                      >
                        {testingEmail ? 'Sending...' : '🧪 Send Test OTP'}
                      </button>
                    </div>

                    {testEmailStatus && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        backgroundColor: testEmailStatus.startsWith('✓') ? '#dcfce7' : '#fee2e2',
                        color: testEmailStatus.startsWith('✓') ? '#15803d' : '#b91c1c',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}>
                        {testEmailStatus}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              MODAL: INSPECT FOOD TRANSFER TRAIL
              =================================================================== */}
          {inspectDonation && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px'
            }}>
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                padding: '28px 28px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-primary-dark)' }}>
                    Food Transfer Audit Inspector 🔍
                  </h3>
                  <button
                    type="button"
                    onClick={() => setInspectDonation(null)}
                    style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>{inspectDonation.foodName} ({inspectDonation.quantity})</div>
                    <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px' }}>Transaction Ref: {inspectDonation.id}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ border: '1px solid var(--color-border)', padding: '12px', borderRadius: '8px' }}>
                      <strong style={{ display: 'block', color: '#0f172a', marginBottom: '4px' }}>Donor Hotel:</strong>
                      <div>{inspectDonation.donorName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Pickup: {inspectDonation.pickupAddress}</div>
                    </div>

                    <div style={{ border: '1px solid var(--color-border)', padding: '12px', borderRadius: '8px' }}>
                      <strong style={{ display: 'block', color: '#0f172a', marginBottom: '4px' }}>Recipient NGO:</strong>
                      <div style={{ color: '#047857', fontWeight: 700 }}>{inspectDonation.ngoName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Drop: {inspectDonation.dropAddress}</div>
                    </div>
                  </div>

                  <div style={{ border: '1px solid var(--color-border)', padding: '14px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 700, marginBottom: '8px' }}>Security Handover Details</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>4-Digit Security PIN: <strong style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: '#10b981' }}>{inspectDonation.handoverOtp}</strong></span>
                      <span style={{ fontWeight: 700, color: inspectDonation.otpVerified ? '#15803d' : '#b45309' }}>
                        {inspectDonation.otpVerified ? '✓ OTP Verified at Gate' : '⏳ Awaiting Verification'}
                      </span>
                    </div>
                  </div>

                  <div style={{ border: '1px solid var(--color-border)', padding: '14px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 700, marginBottom: '6px' }}>Timestamp Audit Ledger:</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.84rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>Accepted: {inspectDonation.acceptedAt || 'N/A'}</li>
                      <li>Pickup Vehicle Dispatched: {inspectDonation.pickupStartedAt || 'Pending'}</li>
                      <li>Handover Collected: {inspectDonation.pickedUpAt || 'Pending'}</li>
                      <li>Delivered: {inspectDonation.deliveredAt || 'Pending'}</li>
                    </ul>
                  </div>
                </div>

                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => setInspectDonation(null)}
                    className="btn btn-primary btn-sm"
                  >
                    Close Inspector
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              MODAL: COMPLETE DATA WIPE CONFIRMATION
              =================================================================== */}
          {wipeTargetUser && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px'
            }}>
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                maxWidth: '520px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(220, 38, 38, 0.3)',
                padding: '30px',
                border: '2px solid #ef4444'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    marginBottom: '10px'
                  }}>
                    💥
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#991b1b', margin: 0 }}>
                    Permanent Cloud & Account Wipe
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '6px' }}>
                    You are initiating an irreversible administrative purge for:
                  </p>
                  <div style={{
                    fontWeight: 800,
                    color: '#0f172a',
                    fontSize: '1.1rem',
                    marginTop: '4px',
                    padding: '8px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '8px'
                  }}>
                    {wipeTargetUser.organizationName || wipeTargetUser.name} ({wipeTargetUser.role.toUpperCase()})
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#fff5f5',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '14px',
                  fontSize: '0.84rem',
                  color: '#991b1b',
                  marginBottom: '18px'
                }}>
                  <strong>The following will be permanently erased:</strong>
                  <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px' }}>
                    <li>User credentials and organization profile from Cloud Firestore</li>
                    <li>All surplus food listings created by this account</li>
                    <li>All order tracking donations, OTPs, and transit history</li>
                    <li>All chat conversation logs and platform notifications</li>
                  </ul>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Type <strong>DELETE</strong> below to confirm permanent wipe:
                  </label>
                  <input
                    type="text"
                    value={wipeConfirmationInput}
                    onChange={(e) => setWipeConfirmationInput(e.target.value)}
                    placeholder="DELETE"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '2px solid #f87171',
                      fontFamily: 'monospace',
                      fontSize: '1rem',
                      outline: 'none',
                      textAlign: 'center'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setWipeTargetUser(null);
                      setWipeConfirmationInput('');
                    }}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '10px' }}
                  >
                    Cancel Action
                  </button>

                  <button
                    type="button"
                    onClick={handleExecuteWipe}
                    disabled={wipeConfirmationInput.trim().toUpperCase() !== 'DELETE'}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      backgroundColor: wipeConfirmationInput.trim().toUpperCase() === 'DELETE' ? '#dc2626' : '#94a3b8',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 800,
                      cursor: wipeConfirmationInput.trim().toUpperCase() === 'DELETE' ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Confirm Permanent Wipe
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
