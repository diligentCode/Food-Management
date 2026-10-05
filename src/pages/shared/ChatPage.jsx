import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import AppNavbar from '../../components/layout/AppNavbar';
import { useAuth } from '../../context/AuthContext';
import { messageService, userService, donationService } from '../../services/dataService';

export default function ChatPage() {
  const { currentUser, userRole } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);

  // Load contacts based on role and active donations
  const loadContacts = () => {
    if (!currentUser) return;
    const targetRole = userRole === 'donor' ? 'ngo' : 'donor';
    const allUsers = userService.getUsers().filter(u => u.role === targetRole && u.id !== currentUser.id);

    // Also look at existing donations to see active partners
    const donations = donationService.getUserDonations(currentUser.id, userRole);
    const partnerIds = new Set();
    donations.forEach(d => {
      if (userRole === 'donor' && d.ngoId) partnerIds.add(d.ngoId);
      if (userRole === 'ngo' && d.donorId) partnerIds.add(d.donorId);
    });

    // Create contacts list
    let list = allUsers.map(u => ({
      ...u,
      hasActiveDonation: partnerIds.has(u.id),
      displayName: u.organizationName || u.name,
      roleLabel: u.role === 'donor' ? 'Food Donor' : 'Verified Recipient NGO'
    }));

    // If no registered opposite-role users yet, provide a dedicated coordination channel
    if (list.length === 0) {
      list = [{
        id: userRole === 'donor' ? 'partner_ngo_support' : 'partner_donor_support',
        displayName: userRole === 'donor' ? 'Hope Foundation (NGO Partner)' : 'Hotel Grand Green (Donor Partner)',
        roleLabel: userRole === 'donor' ? 'Recipient NGO Coordinator' : 'Food Donor Kitchen Dispatch',
        hasActiveDonation: true,
        city: currentUser.city || 'Jaipur'
      }];
    }

    setContacts(list);
    if (!selectedContact && list.length > 0) {
      setSelectedContact(list[0]);
    }
  };

  const getConversationId = (u1, u2) => {
    if (!u1 || !u2) return 'conv_general';
    return [u1, u2].sort().join('_');
  };

  const currentConvId = selectedContact && currentUser 
    ? getConversationId(currentUser.id, selectedContact.id)
    : 'conv_general';

  const loadMessages = () => {
    if (!currentUser || !selectedContact) return;
    const list = messageService.getMessages(currentConvId);
    setMessages(list);
    // Mark as read when viewing
    messageService.markRead(currentConvId, currentUser.id);
  };

  useEffect(() => {
    loadContacts();
  }, [currentUser, userRole]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 2500);

    const handleDataUpdate = (e) => {
      if (!e.detail || e.detail.collection === 'messages') {
        loadMessages();
      }
      if (!e.detail || e.detail.collection === 'users' || e.detail.collection === 'donations') {
        loadContacts();
      }
    };
    window.addEventListener('foodconnect_data_updated', handleDataUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('foodconnect_data_updated', handleDataUpdate);
    };
  }, [selectedContact, currentUser]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentUser || !selectedContact) return;

    messageService.sendMessage({
      conversationId: currentConvId,
      senderId: currentUser.id,
      senderName: currentUser.organizationName || currentUser.name,
      receiverId: selectedContact.id,
      message: inputMessage.trim()
    });

    setInputMessage('');
    loadMessages();
  };

  const sendQuickReply = (text) => {
    setInputMessage(text);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <AppNavbar title="Chat & Live Coordination" />

        <div className="dashboard-body" style={{ maxWidth: '1040px', margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>
              Live Coordination Chat 💬
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', marginTop: '4px' }}>
              Real-time messaging between Food Donors and Recipient NGOs for pickup timing, delivery gates, and containers.
            </p>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden', height: '620px', display: 'grid', gridTemplateColumns: '290px 1fr' }}>
            {/* Conversations List Left Column */}
            <div style={{ borderRight: '1px solid var(--color-border)', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', fontWeight: 800, color: 'var(--color-primary-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Active Channels</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{contacts.length}</span>
              </div>

              <div style={{ overflowY: 'auto', flex: 1 }}>
                {contacts.map((c) => {
                  const isSelected = selectedContact?.id === c.id;
                  const convId = getConversationId(currentUser?.id, c.id);
                  const unread = messageService.getMessages(convId).filter(m => m.receiverId === currentUser?.id && !m.read).length;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedContact(c)}
                      style={{
                        padding: '14px 16px',
                        backgroundColor: isSelected ? '#ffffff' : 'transparent',
                        borderLeft: isSelected ? '4px solid var(--color-primary-dark)' : '4px solid transparent',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: isSelected ? '#0b462f' : '#dcfce7',
                          color: isSelected ? '#ffffff' : '#15803d',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          flexShrink: 0
                        }}>
                          {c.displayName ? c.displayName.substring(0, 2).toUpperCase() : 'FC'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '0.9rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                              {c.displayName}
                            </strong>
                            {unread > 0 && (
                              <span style={{ backgroundColor: '#10b981', color: '#fff', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>
                                {unread}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {c.roleLabel}
                          </div>
                        </div>
                      </div>
                      {c.hasActiveDonation && (
                        <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '6px', fontWeight: 600 }}>
                          ● Active Donation Partner
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat Area Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Chat Header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
                  <div>
                    <strong style={{ fontSize: '1rem', color: '#0b462f', display: 'block' }}>
                      {selectedContact?.displayName || 'Direct Coordination Channel'}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {selectedContact?.roleLabel} &bull; {selectedContact?.city || 'Regional Center'}
                    </span>
                  </div>
                </div>
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                  Live Channel
                </span>
              </div>

              {/* Messages Feed */}
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', background: '#f8fafc' }}>
                {messages.length === 0 ? (
                  <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b', padding: '40px 20px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>💬</div>
                    <strong style={{ color: '#0f172a' }}>No Messages Exchanged Yet</strong>
                    <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                      Send a message below or tap a quick reply to coordinate pickup times, gate entry, and packaging.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMine = m.senderId === currentUser?.id;

                    return (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: isMine ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMine ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '2px' }}>
                          {m.senderName}
                        </div>
                        <div
                          style={{
                            backgroundColor: isMine ? 'var(--color-primary-dark)' : '#ffffff',
                            color: isMine ? '#ffffff' : '#0f172a',
                            padding: '12px 16px',
                            borderRadius: isMine ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                            fontSize: '0.92rem',
                            lineHeight: 1.4,
                            boxShadow: 'var(--shadow-sm)',
                            border: isMine ? 'none' : '1px solid var(--color-border)'
                          }}
                        >
                          {m.message}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Suggestion Pills */}
              <div style={{ padding: '8px 16px', background: '#ffffff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px', overflowX: 'auto' }}>
                <button
                  type="button"
                  onClick={() => sendQuickReply("Food is packed in hygienic containers and ready for collection!")}
                  style={{ fontSize: '0.75rem', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '9999px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  "Food is packed and ready"
                </button>
                <button
                  type="button"
                  onClick={() => sendQuickReply("Our volunteer transport van will arrive in 15 minutes.")}
                  style={{ fontSize: '0.75rem', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '9999px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  "Van arriving in 15 mins"
                </button>
                <button
                  type="button"
                  onClick={() => sendQuickReply("Please come to Service Gate 2 (Rear Loading Bay).")}
                  style={{ fontSize: '0.75rem', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '9999px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  "Gate 2 Loading Bay"
                </button>
                <button
                  type="button"
                  onClick={() => sendQuickReply("Thank you so much for this wonderful contribution to our shelter!")}
                  style={{ fontSize: '0.75rem', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '9999px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  "Thank you!"
                </button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSend} style={{ padding: '16px', background: '#ffffff', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Message ${selectedContact?.displayName || 'partner'}...`}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.92rem' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
                  Send &rarr;
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
