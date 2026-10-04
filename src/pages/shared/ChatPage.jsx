import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import AppNavbar from '../../components/layout/AppNavbar';
import { useAuth } from '../../context/AuthContext';
import { messageService } from '../../services/dataService';

export default function ChatPage() {
  const { currentUser, userRole } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const conversationId = 'conv_donor1_ngo1';

  const partnerName = userRole === 'donor' ? 'Hope Foundation (NGO)' : 'Hotel Green Valley (Donor)';
  const partnerRole = userRole === 'donor' ? 'Recipient NGO' : 'Food Donor';

  const loadMessages = () => {
    const list = messageService.getMessages(conversationId);
    setMessages(list);
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    messageService.sendMessage({
      conversationId,
      senderId: currentUser?.id || 'user_demo',
      senderName: currentUser?.name || (userRole === 'donor' ? 'Hotel Green Valley' : 'Hope Foundation'),
      receiverId: userRole === 'donor' ? 'user_ngo_1' : 'user_donor_1',
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
        <AppNavbar title="Chat & Coordination" />

        <div className="dashboard-body" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
              Direct Chat & Coordination 💬
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
              Coordinate pickup timing, entry gate instructions, and special packaging details in real time.
            </p>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden', height: '620px', display: 'grid', gridTemplateColumns: '280px 1fr' }}>
            {/* Conversations List Left Column */}
            <div style={{ borderRight: '1px solid var(--color-border)', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                Conversations
              </div>
              <div style={{
                padding: '16px',
                backgroundColor: '#ffffff',
                borderLeft: '4px solid var(--color-primary-dark)',
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                    {userRole === 'donor' ? 'HF' : 'HG'}
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{partnerName}</strong>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{partnerRole}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '8px', fontWeight: 600 }}>
                  ● Active Coordination
                </div>
              </div>
            </div>

            {/* Chat Area Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Chat Header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <strong style={{ fontSize: '1rem', color: '#0b462f' }}>{partnerName}</strong>
                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                    Online
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Channel: <strong>Surplus Food Pickup Coordination</strong>
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
                  onClick={() => sendQuickReply("Food is packed in hygienic containers and ready!")}
                  style={{ fontSize: '0.75rem', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '9999px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  "Food is packed and ready"
                </button>
                <button
                  type="button"
                  onClick={() => sendQuickReply("Our volunteer van will arrive in 15 minutes.")}
                  style={{ fontSize: '0.75rem', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '9999px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  "Van arriving in 15 mins"
                </button>
                <button
                  type="button"
                  onClick={() => sendQuickReply("Thank you so much for this wonderful contribution!")}
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
                  placeholder="Type a coordination message..."
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
