import React from 'react';

export default function AIQualityCard({ score = 88, status = 'Good Quality', analysis = null, loading = false }) {
  if (loading) {
    return (
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #cbd5e1',
        borderRadius: '14px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>✨</div>
        <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0b462f' }}>
          AI Analyzing Food Image Quality & Freshness...
        </p>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Checking visual markers, coloration, packaging, and safe distribution window
        </span>
      </div>
    );
  }

  const getBadgeColor = (val) => {
    if (val >= 85) return { bg: '#dcfce7', text: '#15803d', label: 'Good Quality' };
    if (val >= 70) return { bg: '#fef3c7', text: '#b45309', label: 'Moderate Quality' };
    return { bg: '#fee2e2', text: '#b91c1c', label: 'Needs Inspection' };
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
          <div>
            <strong style={{ fontSize: '0.92rem', color: '#0b462f' }}>
              AI Food Quality Assessment
            </strong>
            {analysis?.isRealAi && (
              <span style={{ marginLeft: '6px', fontSize: '0.68rem', background: '#e0e7ff', color: '#3730a3', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                Gemini Vision Verified
              </span>
            )}
          </div>
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
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
          {analysis?.freshnessGrade || (score >= 90 ? 'Grade A' : 'Grade B')}
        </span>
      </div>

      {/* Visual Checklist */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.75rem', color: '#475569' }}>
        <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          🌿 Fresh Color: <strong>Normal</strong>
        </div>
        <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          📦 Packaging: <strong>Hygienic</strong>
        </div>
        <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          ⏱️ Shelf Window: <strong>{analysis?.recommendedWindow || '4-6 hours'}</strong>
        </div>
      </div>

      {analysis?.summary && (
        <p style={{ fontSize: '0.78rem', color: '#334155', margin: 0, background: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          {analysis.summary}
        </p>
      )}

      {/* Important Disclaimer as required by Section 17 */}
      <p style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', margin: 0, borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
        ⚠️ <strong>Notice:</strong> This is an AI-assisted visual assessment estimate and does not replace professional laboratory or sensory safety testing. Recipient NGO must conduct physical organoleptic inspection prior to meal distribution.
      </p>
    </div>
  );
}
