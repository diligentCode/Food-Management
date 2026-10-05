import React from 'react';

export default function AIQualityCard({ score = 75, status = 'Good Quality', analysis = null, loading = false }) {
  if (loading) {
    return (
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1.5px solid #cbd5e1',
        borderRadius: '14px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '8px', animation: 'pulse 1.5s infinite' }}>🤖✨</div>
        <p style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0b462f', margin: '0 0 4px 0' }}>
          Strict AI Vision Inspecting Food Quality...
        </p>
        <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
          Checking visual freshness, container hygiene, illumination, and detecting non-food artifacts (0-90% scale)
        </span>
      </div>
    );
  }

  const isFood = analysis ? analysis.isFood !== false : true;

  const getBadge = (val, foodOk) => {
    if (!foodOk || val < 30) return { bg: '#fee2e2', text: '#b91c1c', border: '#f87171', label: 'Rejected - Non-Food' };
    if (val < 50) return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5', label: 'Substandard / Poor Lighting' };
    if (val < 65) return { bg: '#fef3c7', text: '#b45309', border: '#fde68a', label: 'Fair Quality (Inspect)' };
    if (val < 78) return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd', label: 'Acceptable Quality' };
    return { bg: '#dcfce7', text: '#15803d', border: '#86efac', label: 'Good Quality (Optimal)' };
  };

  const badge = getBadge(score, isFood);
  const normalizedBarWidth = Math.min(100, Math.max(5, Math.round((score / 90) * 100)));

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      border: `1.5px solid ${score < 40 ? '#f87171' : '#cbd5e1'}`,
      borderRadius: '14px',
      padding: '18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.2rem' }}>✨</span>
            <strong style={{ fontSize: '0.95rem', color: '#0b462f' }}>
              Strict AI Quality Inspection
            </strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <span style={{
              fontSize: '0.7rem',
              backgroundColor: '#ecfdf5',
              color: '#047857',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid #a7f3d0'
            }}>
              {analysis?.engine || 'Google Gemini Multimodal Vision AI'}
            </span>
          </div>
        </div>

        <span style={{
          backgroundColor: badge.bg,
          color: badge.text,
          border: `1px solid ${badge.border}`,
          fontSize: '0.78rem',
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: '9999px'
        }}>
          {status || badge.label}
        </span>
      </div>

      {/* Strict Score Bar (0 to 90% scale) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ fontSize: '1.9rem', fontWeight: 900, color: score < 40 ? '#b91c1c' : '#0b462f', lineHeight: 1 }}>
          {score}<span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>/90%</span>
        </div>
        <div style={{ flex: 1, backgroundColor: '#e2e8f0', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{
            width: `${normalizedBarWidth}%`,
            height: '100%',
            backgroundColor: score >= 78 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444',
            borderRadius: '5px',
            transition: 'width 0.4s ease'
          }} />
        </div>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
          {analysis?.freshnessGrade || (score >= 78 ? 'Grade A' : score >= 60 ? 'Grade B' : 'Grade C')}
        </span>
      </div>

      {/* Critical Rejection Warning Banner */}
      {(!isFood || score < 40) && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1.5px solid #f87171',
          borderRadius: '8px',
          padding: '10px 12px',
          fontSize: '0.78rem',
          color: '#991b1b',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px'
        }}>
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>⚠️</span>
          <div>
            <strong>Strict AI Quality Alert:</strong> {analysis?.summary || 'The photo does not clearly show edible food, or the lighting/contrast is too dull to verify freshness. Please upload a clear photo under bright kitchen lighting.'}
          </div>
        </div>
      )}

      {/* Inspection Markers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {analysis?.hygieneMarkers ? (
          analysis.hygieneMarkers.map((marker, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#475569', background: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ color: score < 40 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
                {score < 40 ? '✕' : '✓'}
              </span>
              <span>{marker}</span>
            </div>
          ))
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.75rem', color: '#475569' }}>
            <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              🌿 Fresh Color: <strong>{score >= 70 ? 'Optimal' : 'Dull'}</strong>
            </div>
            <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              📦 Packaging: <strong>Hygienic</strong>
            </div>
            <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              ⏱️ Shelf: <strong>{analysis?.recommendedWindow || '4-5 hours'}</strong>
            </div>
          </div>
        )}
      </div>

      {analysis?.summary && isFood && score >= 40 && (
        <p style={{ fontSize: '0.78rem', color: '#334155', margin: 0, background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', lineHeight: 1.4 }}>
          {analysis.summary}
        </p>
      )}

      {/* Safety Notice */}
      <p style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', margin: 0, borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
        ⚠️ <strong>Strict Safety Protocol:</strong> Scoring range is calibrated strictly from 0 to 90% max. Substandard, dark, or non-food items are blocked from community dispatch.
      </p>
    </div>
  );
}
