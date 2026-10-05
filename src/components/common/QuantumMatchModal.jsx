import React, { useState, useEffect } from 'react';
import { runQuantumAnnealingMatch, dispatchQuantumMatchNotifications, getCandidateNgos } from '../../services/quantumService';
import { userService } from '../../services/dataService';

export default function QuantumMatchModal({ listing, isOpen, onClose, initialResult = null }) {
  const [computing, setComputing] = useState(!initialResult);
  const [quantumResult, setQuantumResult] = useState(initialResult);
  const [alertSent, setAlertSent] = useState(false);
  const [showMathDetails, setShowMathDetails] = useState(false);

  useEffect(() => {
    if (!isOpen || !listing) return;

    if (initialResult) {
      setQuantumResult(initialResult);
      setComputing(false);
      setAlertSent(true); // Alert was already sent automatically upon listing creation
      return;
    }

    setComputing(true);
    setAlertSent(false);

    // Retrieve candidate recipient NGOs
    const allUsers = userService.getUsers();
    const candidateNgos = getCandidateNgos(listing, allUsers);

    // Execute simulated quantum annealing with realistic convergence delay
    const timer = setTimeout(() => {
      const res = runQuantumAnnealingMatch({
        listing,
        ngos: candidateNgos
      });
      setQuantumResult(res);
      setComputing(false);
    }, 750);

    return () => clearTimeout(timer);
  }, [isOpen, listing, initialResult]);

  if (!isOpen || !listing) return null;

  const handleSendPriorityAlert = () => {
    if (!quantumResult || !listing) return;
    dispatchQuantumMatchNotifications(listing, quantumResult);
    setAlertSent(true);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        color: '#1e293b',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(11, 70, 47, 0.25)',
        border: '1.5px solid #a7f3d0',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header - FoodConnect Deep Forest Green */}
        <div style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0b462f 0%, #064e3b 100%)',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem'
            }}>
              ⚛️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  Quantum AI Match Optimizer
                </h3>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  background: '#10b981',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  SQA Active
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#a7f3d0' }}>
                Simulated Quantum Annealing & Ising Hamiltonian QUBO Solver
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              fontSize: '1.2rem',
              cursor: 'pointer',
              lineHeight: 1,
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {computing ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '16px',
                animation: 'spin 3s linear infinite',
                display: 'inline-block'
              }}>
                ⚛️
              </div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                Simulating Quantum Annealing Hamiltonian...
              </h4>
              <p style={{ fontSize: '0.86rem', color: '#64748b', maxWidth: '440px', margin: '0 auto' }}>
                Evaluating combinatorial superposition states across distance latency, expiry urgency, and recipient capacities for <strong>{listing.foodName}</strong>...
              </p>
              <div style={{
                margin: '20px auto 0 auto',
                maxWidth: '280px',
                height: '6px',
                backgroundColor: '#e2e8f0',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: '70%',
                  background: 'linear-gradient(90deg, #10b981, #0b462f)',
                  borderRadius: '3px',
                  animation: 'pulse 1s infinite'
                }} />
              </div>
            </div>
          ) : quantumResult && quantumResult.optimalNgo ? (
            <>
              {/* Ground State Quantum Specs Ribbon */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                background: '#f0fdf4',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1.5px solid #bbf7d0'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#047857', textTransform: 'uppercase', fontWeight: 800 }}>
                    Ground State Energy
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#065f46', fontVariantNumeric: 'tabular-nums' }}>
                    {quantumResult.groundStateEnergy} eV
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#047857', textTransform: 'uppercase', fontWeight: 800 }}>
                    Transverse Field Decay
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0284c7' }}>
                    Γ(t) → 0.00
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#047857', textTransform: 'uppercase', fontWeight: 800 }}>
                    Transit Carbon Saved
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#b45309' }}>
                    ~{quantumResult.carbonSavedKg} kg CO₂e
                  </div>
                </div>
              </div>

              {/* #1 Optimal Winner Card */}
              <div style={{
                background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
                border: '2px solid #10b981',
                borderRadius: '16px',
                padding: '22px',
                position: 'relative',
                boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.15)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  background: '#10b981',
                  color: '#ffffff',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '3px 12px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                }}>
                  🌟 #1 QUANTUM OPTIMAL PICK
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', fontWeight: 800, color: '#0b462f' }}>
                      🤝 {quantumResult.optimalNgo.ngo.organizationName || quantumResult.optimalNgo.ngo.name}
                    </h4>
                    <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                      <span>📍 <strong>{quantumResult.optimalNgo.distanceKm} km</strong> transit distance</span>
                      <span>⏱️ ETA: ~<strong>{quantumResult.optimalNgo.etaMinutes} mins</strong></span>
                      <span>🏛️ {quantumResult.optimalNgo.ngo.city || listing.city || 'Local Municipal Zone'}</span>
                    </div>
                  </div>

                  {/* Q-Score Badge */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '2.4rem',
                      fontWeight: 900,
                      color: '#059669',
                      lineHeight: 1
                    }}>
                      {quantumResult.optimalNgo.qScore}%
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 800, textTransform: 'uppercase' }}>
                      Quantum Optimal Match
                    </span>
                  </div>
                </div>

                {/* Qubit State Vector Formula */}
                <div style={{
                  marginTop: '16px',
                  padding: '10px 14px',
                  background: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #bbf7d0',
                  fontSize: '0.78rem',
                  color: '#475569',
                  fontFamily: 'monospace',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  <span style={{ fontWeight: 700, color: '#334155' }}>Collapsed Qubit State Vector:</span>
                  <code style={{ color: '#047857', fontWeight: 800, fontSize: '0.82rem' }}>
                    {quantumResult.optimalNgo.qubitState}
                  </code>
                </div>

                {/* Action Alert Button */}
                <div style={{ marginTop: '16px' }}>
                  {alertSent ? (
                    <div style={{
                      padding: '12px 18px',
                      background: '#dcfce7',
                      border: '1.5px solid #10b981',
                      color: '#065f46',
                      borderRadius: '10px',
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      <span>✓</span>
                      <span>Priority High-Alert Dispatched to {quantumResult.optimalNgo.ngo.organizationName || quantumResult.optimalNgo.ngo.name}!</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendPriorityAlert}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '12px 18px',
                        background: 'linear-gradient(135deg, #0b462f, #15803d)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)'
                      }}
                    >
                      🚀 Send Priority Quantum Alert to this NGO
                    </button>
                  )}
                </div>
              </div>

              {/* Runner Up Ranked NGOs */}
              {quantumResult.rankings.length > 1 && (
                <div>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 800 }}>
                    Ranked Runner-Up Candidates (Quantum Hierarchy):
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {quantumResult.rankings.slice(1).map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#f8fafc',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                            #{idx + 2} {item.ngo.organizationName || item.ngo.name}
                          </strong>
                          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                            {item.distanceKm} km away &bull; ETA: ~{item.etaMinutes} mins &bull; {item.qubitState}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            background: '#ecfdf5',
                            color: '#047857',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            border: '1px solid #a7f3d0'
                          }}>
                            {item.qScore}% Q-Match
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scientific Theory & Qubit Matrix Accordion */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowMathDetails(!showMathDetails)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#0b462f',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: 0
                  }}
                >
                  <span>{showMathDetails ? '▼ Hide' : '▶ Show'} Quantum Hamiltonian Math & Qubit Matrix</span>
                </button>

                {showMathDetails && (
                  <div style={{
                    marginTop: '12px',
                    padding: '16px',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.78rem',
                    color: '#475569',
                    lineHeight: 1.6
                  }}>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                      Ising Spin Hamiltonian Formulation:
                    </strong>
                    <div style={{
                      background: '#ffffff',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontFamily: 'monospace',
                      color: '#0b462f',
                      fontWeight: 700
                    }}>
                      H(σ) = ∑ h_i σ_i + ∑ J_ij σ_i σ_j - Γ(t) ∑ σ_x
                    </div>
                    <p style={{ margin: '8px 0 0 0' }}>
                      Simulated transverse field decay <code>Γ(t) = Γ_0 · cos(π/2 · t/T)</code> drives quantum tunneling through combinatorial energy barriers, rapidly finding the optimal NGO redistribution node with minimal transit latency and carbon footprint.
                    </p>

                    <div style={{ marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                      <strong style={{ color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                        Simulated Qubit Superposition States:
                      </strong>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                        {quantumResult.qubitStates.map((q, qIdx) => (
                          <div key={qIdx} style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.74rem' }}>
                            <span style={{ color: '#047857', fontWeight: 800 }}>Qubit q_{q.qubitIndex}</span>: {q.probability}% (|β|²={q.amplitude1})
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
              No eligible NGO candidate nodes found for this listing.
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          background: '#f8fafc',
          borderRadius: '0 0 16px 16px'
        }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '8px 20px',
              fontWeight: 700
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
