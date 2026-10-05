import React, { useState, useEffect } from 'react';
import { runQuantumAnnealingMatch, dispatchQuantumMatchNotifications } from '../../services/quantumService';
import { userService } from '../../services/dataService';

export default function QuantumMatchModal({ listing, isOpen, onClose }) {
  const [computing, setComputing] = useState(true);
  const [quantumResult, setQuantumResult] = useState(null);
  const [alertSent, setAlertSent] = useState(false);
  const [showMathDetails, setShowMathDetails] = useState(false);

  useEffect(() => {
    if (!isOpen || !listing) return;

    setComputing(true);
    setAlertSent(false);

    // Retrieve active recipient NGOs in the city/system
    const allUsers = userService.getUsers();
    let candidateNgos = allUsers.filter(u => u.role === 'ngo');

    // If only 1 or no NGOs registered yet, provide realistic regional NGO candidates for demonstration
    if (candidateNgos.length === 0) {
      candidateNgos = [
        {
          id: 'ngo_demo_1',
          name: 'Hope Foundation & Shelter',
          organizationName: 'Hope Foundation & Community Kitchen',
          city: listing.city || 'Nagpur',
          location: {
            lat: (listing.latitude || 21.1458) + 0.015,
            lng: (listing.longitude || 79.0882) + 0.012
          }
        },
        {
          id: 'ngo_demo_2',
          name: 'Annapurna Seva Trust',
          organizationName: 'Annapurna Seva Trust (Central Shelter)',
          city: listing.city || 'Nagpur',
          location: {
            lat: (listing.latitude || 21.1458) - 0.038,
            lng: (listing.longitude || 79.0882) - 0.025
          }
        },
        {
          id: 'ngo_demo_3',
          name: 'Robin Hood Food Relief',
          organizationName: 'Robin Hood Food Relief Mission',
          city: listing.city || 'Nagpur',
          location: {
            lat: (listing.latitude || 21.1458) + 0.082,
            lng: (listing.longitude || 79.0882) + 0.065
          }
        }
      ];
    }

    // Execute simulated quantum annealing with realistic convergence delay
    const timer = setTimeout(() => {
      const res = runQuantumAnnealingMatch({
        listing,
        ngos: candidateNgos
      });
      setQuantumResult(res);
      setComputing(false);
    }, 1100);

    return () => clearTimeout(timer);
  }, [isOpen, listing]);

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
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        border: '1.5px solid #1e293b',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.4), rgba(15, 23, 42, 0.8))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.6rem' }}>⚛️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#34d399', letterSpacing: '0.02em' }}>
                Quantum AI Match Optimizer
              </h3>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                Simulated Quantum Annealing (SQA) & Ising Hamiltonian QUBO Solver
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.4rem',
              cursor: 'pointer',
              lineHeight: 1
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
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#38bdf8' }}>
                Simulating Quantum Annealing Hamiltonian...
              </h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                Collapsing Qubit superposition states across {listing.foodName} distance, expiry urgency, and NGO capacities...
              </p>
              <div style={{
                margin: '20px auto 0 auto',
                maxWidth: '280px',
                height: '4px',
                backgroundColor: '#1e293b',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: '60%',
                  background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                  borderRadius: '2px',
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
                gap: '10px',
                background: '#1e293b',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid #334155'
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                    Ground State Energy
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', fontVariantNumeric: 'tabular-nums' }}>
                    {quantumResult.groundStateEnergy} eV
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                    Quantum Tunneling Rate
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>
                    Γ(t) → 0.00
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                    Transit Carbon Saved
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24' }}>
                    ~{quantumResult.carbonSavedKg} kg CO₂e
                  </div>
                </div>
              </div>

              {/* #1 Optimal Winner Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 78, 59, 0.35))',
                border: '2px solid #10b981',
                borderRadius: '16px',
                padding: '20px',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  background: '#10b981',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 12px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 10px rgba(16, 185, 129, 0.4)'
                }}>
                  #1 QUANTUM OPTIMAL WINNER
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                      🤝 {quantumResult.optimalNgo.ngo.organizationName || quantumResult.optimalNgo.ngo.name}
                    </h4>
                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span>📍 <strong>{quantumResult.optimalNgo.distanceKm} km</strong> transit distance</span>
                      <span>⏱️ ETA: ~<strong>{quantumResult.optimalNgo.etaMinutes} mins</strong></span>
                      <span>🏛️ {quantumResult.optimalNgo.ngo.city || listing.city}</span>
                    </div>
                  </div>

                  {/* Q-Score Badge */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '2.1rem',
                      fontWeight: 900,
                      color: '#34d399',
                      lineHeight: 1,
                      textShadow: '0 0 20px rgba(52, 211, 153, 0.4)'
                    }}>
                      {quantumResult.optimalNgo.qScore}%
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#a7f3d0', fontWeight: 700, textTransform: 'uppercase' }}>
                      Q-Match Probability
                    </span>
                  </div>
                </div>

                {/* Qubit State Vector Formula */}
                <div style={{
                  marginTop: '14px',
                  padding: '8px 12px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  borderRadius: '8px',
                  fontSize: '0.76rem',
                  color: '#94a3b8',
                  fontFamily: 'monospace',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Qubit State Vector:</span>
                  <code style={{ color: '#38bdf8', fontWeight: 700 }}>
                    {quantumResult.optimalNgo.qubitState}
                  </code>
                </div>

                {/* Action Alert Button */}
                <div style={{ marginTop: '16px' }}>
                  {alertSent ? (
                    <div style={{
                      padding: '10px 16px',
                      background: 'rgba(16, 185, 129, 0.25)',
                      border: '1px solid #10b981',
                      color: '#a7f3d0',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textAlign: 'center'
                    }}>
                      ✓ Priority High-Alert Successfully Dispatched to {quantumResult.optimalNgo.ngo.organizationName || quantumResult.optimalNgo.ngo.name}!
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendPriorityAlert}
                      style={{
                        width: '100%',
                        padding: '12px 18px',
                        background: 'linear-gradient(135deg, #059669, #10b981)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      🚀 Send Quantum Priority Alert to this NGO
                    </button>
                  )}
                </div>
              </div>

              {/* Runner Up Ranked NGOs */}
              {quantumResult.rankings.length > 1 && (
                <div>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Ranked Runner-Up Candidates (Quantum Hierarchy):
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {quantumResult.rankings.slice(1).map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#1e293b',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: '1px solid #334155'
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '0.88rem', color: '#f1f5f9' }}>
                            #{idx + 2} {item.ngo.organizationName || item.ngo.name}
                          </strong>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                            {item.distanceKm} km away &bull; ETA: ~{item.etaMinutes} mins
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '8px',
                            background: '#0f172a',
                            color: '#38bdf8',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            border: '1px solid #334155'
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
              <div>
                <button
                  type="button"
                  onClick={() => setShowMathDetails(!showMathDetails)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#38bdf8',
                    fontSize: '0.78rem',
                    fontWeight: 700,
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
                    marginTop: '10px',
                    padding: '14px',
                    background: '#0b1120',
                    borderRadius: '10px',
                    border: '1px solid #1e293b',
                    fontSize: '0.74rem',
                    color: '#94a3b8',
                    lineHeight: 1.5
                  }}>
                    <strong style={{ color: '#e2e8f0', display: 'block', marginBottom: '4px' }}>
                      Ising Spin Hamiltonian Formulation:
                    </strong>
                    <code>
                      H(σ) = ∑ h_i σ_i + ∑ J_ij σ_i σ_j - Γ(t) ∑ σ_x
                    </code>
                    <p style={{ margin: '8px 0 0 0' }}>
                      Transverse field decay schedule <code>Γ(t) = Γ_0 · cos(π/2 · t/T)</code> drives quantum tunneling through combinatorial energy barriers, converging multi-NGO routing into a global minimum energy ground state.
                    </p>

                    <div style={{ marginTop: '10px', borderTop: '1px solid #1e293b', paddingTop: '8px' }}>
                      <strong style={{ color: '#e2e8f0', display: 'block', marginBottom: '6px' }}>
                        Simulated Qubit Probabilities:
                      </strong>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px' }}>
                        {quantumResult.qubitStates.map((q, qIdx) => (
                          <div key={qIdx} style={{ background: '#1e293b', padding: '6px 8px', borderRadius: '6px', fontSize: '0.7rem' }}>
                            <span style={{ color: '#38bdf8' }}>Qubit q_{q.qubitIndex}</span>: {q.probability}% (|β|²={q.amplitude1})
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
              No eligible NGO nodes found in this operational sector.
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          justifyContent: 'flex-end',
          background: '#090d16'
        }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              padding: '8px 18px',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
