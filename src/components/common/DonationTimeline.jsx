import React from 'react';

const STAGES = [
  { key: 'available', label: 'Food Posted', icon: '📝', desc: 'Surplus food listed on platform' },
  { key: 'accepted', label: 'Accepted', icon: '🤝', desc: 'NGO confirmed acceptance' },
  { key: 'pickup_started', label: 'Pickup Started', icon: '🚚', desc: 'Volunteer on the way' },
  { key: 'picked_up', label: 'Picked Up', icon: '📦', desc: 'Food collected from donor' },
  { key: 'delivered', label: 'Delivered', icon: '✅', desc: 'Delivered to beneficiaries' }
];

export default function DonationTimeline({ currentStatus = 'accepted', timestamps = {}, onAdvanceStatus, canAdvance = false }) {
  const getStageIndex = (status) => {
    switch (status) {
      case 'available': return 0;
      case 'accepted': return 1;
      case 'pickup_started': return 2;
      case 'picked_up': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  const currentIndex = getStageIndex(currentStatus);

  const getNextStatus = () => {
    if (currentIndex === 1) return 'pickup_started';
    if (currentIndex === 2) return 'picked_up';
    if (currentIndex === 3) return 'delivered';
    return null;
  };

  const nextStatus = getNextStatus();

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
          Donation Tracking Lifecycle
        </h3>
        <span style={{
          backgroundColor: '#dcfce7',
          color: '#15803d',
          padding: '4px 12px',
          borderRadius: '9999px',
          fontSize: '0.82rem',
          fontWeight: 700
        }}>
          Current: {currentStatus.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {/* Timeline Steps */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STAGES.length}, 1fr)`, gap: '12px', position: 'relative' }}>
        {STAGES.map((stage, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={stage.key} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Circle Badge */}
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: isDone ? '#0b462f' : '#f1f5f9',
                color: isDone ? '#ffffff' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                border: isCurrent ? '3px solid #10b981' : 'none',
                boxShadow: isCurrent ? '0 0 0 4px rgba(16, 185, 129, 0.2)' : 'none',
                transition: 'all 0.2s ease',
                marginBottom: '10px'
              }}>
                {isDone ? stage.icon : '⚪'}
              </div>

              {/* Title & Desc */}
              <div style={{
                fontSize: '0.85rem',
                fontWeight: isDone ? 700 : 500,
                color: isDone ? '#0f172a' : '#94a3b8',
                marginBottom: '4px'
              }}>
                {stage.label}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.2 }}>
                {stage.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Advance Status Button for Testing/Operation */}
      {canAdvance && nextStatus && onAdvanceStatus && (
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Update to next stage:</span>
          <button
            onClick={() => onAdvanceStatus(nextStatus)}
            className="btn btn-primary btn-sm"
            style={{ textTransform: 'capitalize' }}
          >
            Advance to "{nextStatus.replace('_', ' ')}" →
          </button>
        </div>
      )}
    </div>
  );
}
