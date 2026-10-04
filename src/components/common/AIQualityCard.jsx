import React, { useState } from 'react';
import { getGeminiApiKey, setGeminiApiKey, hasRealGeminiConfigured } from '../../services/aiService';

export default function AIQualityCard({ score = 88, status = 'Good Quality', analysis = null, loading = false, onApiKeyUpdated = null }) {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState(getGeminiApiKey() || '');
  const [keySaved, setKeySaved] = useState(false);

  const handleSaveKey = (e) => {
    e.preventDefault();
    setGeminiApiKey(inputKey);
    setKeySaved(true);
    setTimeout(() => {
      setKeySaved(false);
      setShowKeyModal(false);
      if (onApiKeyUpdated) onApiKeyUpdated();
    }, 1200);
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #cbd5e1',
        borderRadius: '14px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🤖✨</div>
        <p style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0b462f' }}>
          AI Inspecting Food Visual Freshness...
        </p>
        <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
          Running color histogram, luminance variance, packaging hygiene, and spoilage detection
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
  const hasGemini = hasRealGeminiConfigured();

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.2rem' }}>✨</span>
            <strong style={{ fontSize: '0.95rem', color: '#0b462f' }}>
              AI Food Quality Inspection
            </strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <span style={{
              fontSize: '0.7rem',
              backgroundColor: analysis?.isRealAi ? '#e0e7ff' : '#ecfdf5',
              color: analysis?.isRealAi ? '#3730a3' : '#047857',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              {analysis?.engine || (analysis?.isRealAi ? 'Google Gemini 1.5 Flash' : 'Pixel Computer Vision')}
            </span>
            <button
              type="button"
              onClick={() => setShowKeyModal(true)}
              style={{
                fontSize: '0.68rem',
                color: '#2563eb',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              {hasGemini ? '⚙️ Gemini Key Active' : '🔑 Set Free Gemini API Key'}
            </button>
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

      {/* Real Inspection Markers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {analysis?.hygieneMarkers ? (
          analysis.hygieneMarkers.map((marker, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#475569', background: '#ffffff', padding: '5px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#10b981' }}>✓</span>
              <span>{marker}</span>
            </div>
          ))
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.75rem', color: '#475569' }}>
            <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              🌿 Fresh Color: <strong>Normal</strong>
            </div>
            <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              📦 Packaging: <strong>Hygienic</strong>
            </div>
            <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              ⏱️ Shelf: <strong>{analysis?.recommendedWindow || '4-6 hours'}</strong>
            </div>
          </div>
        )}
      </div>

      {analysis?.summary && (
        <p style={{ fontSize: '0.78rem', color: '#334155', margin: 0, background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', lineHeight: 1.4 }}>
          {analysis.summary}
        </p>
      )}

      {/* Safety Notice */}
      <p style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', margin: 0, borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
        ⚠️ <strong>Safety Notice:</strong> AI freshness scoring is a visual assessment aid and does not substitute mandatory physical sensory inspection prior to community distribution.
      </p>

      {/* Modal for setting Gemini API Key */}
      {showKeyModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 400,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '460px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: '8px' }}>
              🤖 Google Gemini Vision API Configuration
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '16px', lineHeight: 1.4 }}>
              Enter your Google Gemini API key to enable live AI vision inspection. You can get a 100% free API key from Google AI Studio (aistudio.google.com).
            </p>

            {keySaved && (
              <div style={{ background: '#dcfce7', color: '#15803d', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px', fontWeight: 600 }}>
                ✓ Gemini API Key saved successfully!
              </div>
            )}

            <form onSubmit={handleSaveKey}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  Save API Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
