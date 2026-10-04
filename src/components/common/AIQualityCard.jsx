import React from 'react';

export default function AIQualityCard({ score = 88, status = 'Good Quality' }) {
  const getBadgeColor = (val) => {
    if (val >= 85) return { bg: '#dcfce7', text: '#15803d', label: 'Good Quality' };
    if (val >= 70) return { bg: '#fef3c7', text: '#b45309', label: 'Moderate Quality' };
    return { bg: '#fee2e2', text: '#b91c1c', label: 'Needs Immediate Inspection' };
  };

  const badge = getBadgeColor(score);

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      border: '1px solid #cbd5e1',
      borderRadius: '14px',
      padding: '18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>✨</span>
          <strong style={{ fontSize: '0.92rem', color: '#0b462f' }}>
            AI-Assisted Quality Assessment
          </strong>
        </div>
        <span style={{
          backgroundColor: badge.bg,
          color: badge.text,
          fontSize: '0.78rem',
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: '9999px'
        }}>
          {status || badge.label}
        </span>
      </div>

      {/* Score Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0b462f', lineHeight: 1 }}>
          {score}<span style={{ fontSize: '0.9rem', color: '#64748b' }}>/100</span>
        </div>
        <div style={{ flex: 1, backgroundColor: '#e2e8f0', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{
            width: `${score}%`,
            height: '100%',
            backgroundColor: score >= 80 ? '#10b981' : '#f59e0b',
            borderRadius: '5px'
          }} />
        </div>
      </div>

      {/* Visual Checklist */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.75rem', color: '#475569' }}>
        <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          🌿 Fresh Appearance: <strong>High</strong>
        </div>
        <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          📦 Clean Container: <strong>Verified</strong>
        </div>
        <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          ⏱️ Prep Time: <strong>&lt; 4h Ago</strong>
        </div>
      </div>

      {/* Important Disclaimer as required by Section 17 */}
      <p style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', margin: 0, borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
        ⚠️ <strong>Note:</strong> Computer vision provides an estimated visual hygiene score and is not a biological food safety certificate. Receiving NGO must perform physical organoleptic inspection upon pickup.
      </p>
    </div>
  );
}
