import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import AppNavbar from '../../components/layout/AppNavbar';
import { useAuth } from '../../context/AuthContext';
import { wasteService, foodService } from '../../services/dataService';

export default function WasteManagementPage() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [expiredListings, setExpiredListings] = useState([]);
  
  // Form State
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [spoilageReason, setSpoilageReason] = useState('Expired past safe consumption window');
  const [regionWard, setRegionWard] = useState('Zone 1 - Central Urban Municipal Ward');
  const [address, setAddress] = useState(currentUser?.address || 'Hotel Kitchen Loading Dock');
  const [preferredSlot, setPreferredSlot] = useState('Morning Slot (08:00 AM - 11:00 AM)');
  const [linkedListingId, setLinkedListingId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successTicket, setSuccessTicket] = useState(null);

  const loadData = () => {
    if (currentUser) {
      setRequests(wasteService.getDonorRequests(currentUser.id));
      const donorListings = foodService.getDonorListings(currentUser.id);
      setExpiredListings(donorListings.filter(l => l.status === 'expired' || l.status === 'waste_collection_requested'));
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!foodName || !quantity) return;

    setSubmitting(true);
    try {
      const newTicket = wasteService.createWasteRequest({
        donorId: currentUser?.id,
        donorName: currentUser?.organizationName || currentUser?.name,
        foodListingId: linkedListingId || null,
        foodName,
        quantity: `${quantity} kg`,
        spoilageReason,
        regionWard,
        address,
        preferredSlot
      });

      setSuccessTicket(newTicket);
      setFoodName('');
      setQuantity('');
      setLinkedListingId('');
      loadData();
    } catch (err) {
      alert('Error creating waste collection request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectExpiredListing = (listing) => {
    setFoodName(listing.foodName);
    setQuantity(listing.quantity);
    setLinkedListingId(listing.id);
    setAddress(listing.pickupAddress);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <AppNavbar title="Municipal Waste & Composting Portal" />

        <div className="dashboard-body" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.8rem' }}>♻️</span>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>
                Municipal Waste & Composting Collection
              </h1>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
              Responsible circular disposal: Request Municipal Corporation organic waste collection for expired or non-consumable food to be converted into green biogas and agricultural compost.
            </p>
          </div>

          {/* Success Notification */}
          {successTicket && (
            <div style={{
              backgroundColor: '#ecfdf5',
              border: '1.5px solid #10b981',
              borderRadius: '12px',
              padding: '18px 24px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <strong style={{ fontSize: '1rem', color: '#065f46' }}>
                  ✓ Municipal Collection Scheduled Successfully!
                </strong>
                <div style={{ fontSize: '0.85rem', color: '#047857', marginTop: '4px' }}>
                  Ticket Number: <strong>{successTicket.ticketNumber}</strong> &bull; Scheduled Slot: {successTicket.preferredSlot}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#0f766e', marginTop: '2px' }}>
                  Destination: {successTicket.wasteDestination}
                </div>
              </div>
              <button onClick={() => setSuccessTicket(null)} className="btn btn-secondary btn-sm">
                Dismiss
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '28px', marginBottom: '32px' }}>
            {/* Left: Request Form */}
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: '16px' }}>
                Request Municipal Collection Ticket
              </h3>

              {expiredListings.length > 0 && (
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>
                    Quick Select From Your Expired Postings:
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {expiredListings.map(l => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => handleSelectExpiredListing(l)}
                        style={{
                          fontSize: '0.75rem',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: linkedListingId === l.id ? '#0b462f' : '#ffffff',
                          color: linkedListingId === l.id ? '#ffffff' : '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        {l.foodName} ({l.quantity} {l.unit})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                    Food / Organic Waste Item *
                  </label>
                  <input
                    type="text"
                    required
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="e.g. Expired Curry & Rice Batch"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                      Weight / Quantity (kg) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="e.g. 20"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                      Municipal Zone / Ward
                    </label>
                    <select
                      value={regionWard}
                      onChange={(e) => setRegionWard(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.88rem' }}
                    >
                      <option value="Zone 1 - Central Urban Ward">Zone 1 - Central Urban Ward</option>
                      <option value="Zone 2 - North Commercial Sector">Zone 2 - North Commercial Sector</option>
                      <option value="Zone 3 - South Industrial & Hotel Belt">Zone 3 - South Industrial & Hotel Belt</option>
                      <option value="Zone 4 - Western Suburban District">Zone 4 - Western Suburban District</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                    Reason for Municipal Disposal
                  </label>
                  <select
                    value={spoilageReason}
                    onChange={(e) => setSpoilageReason(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.88rem' }}
                  >
                    <option value="Expired past safe consumption window">Expired past safe consumption window</option>
                    <option value="Cold chain breakdown / Temp variance">Cold chain breakdown / Temp variance</option>
                    <option value="Packaging breach / Unsealed batch">Packaging breach / Unsealed batch</option>
                    <option value="Preparation surplus not collected">Preparation surplus not collected</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                    Pickup Location Address
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Hotel Service Gate, Loading Dock 2"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                    Preferred Municipal Truck Slot
                  </label>
                  <select
                    value={preferredSlot}
                    onChange={(e) => setPreferredSlot(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.88rem' }}
                  >
                    <option value="Morning Slot (08:00 AM - 11:00 AM)">Morning Slot (08:00 AM - 11:00 AM)</option>
                    <option value="Afternoon Slot (02:00 PM - 05:00 PM)">Afternoon Slot (02:00 PM - 05:00 PM)</option>
                    <option value="Night Eco-Run (10:00 PM - 01:00 AM)">Night Eco-Run (10:00 PM - 01:00 AM)</option>
                  </select>
                </div>

                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: '10px' }}>
                  {submitting ? 'Generating Ticket...' : '🚚 Submit Municipal Waste Request'}
                </button>
              </form>
            </div>

            {/* Right: Informational Guidelines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ background: '#f8fafc', padding: '24px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: '12px' }}>
                  🌱 Zero-Landfill Protocol
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: '#475569', padding: 0 }}>
                  <li style={{ display: 'flex', gap: '8px' }}>
                    <span>✅</span>
                    <span><strong>100% Diverted from Landfills:</strong> All collected organic waste is routed to regional composting or biomethanation plants.</span>
                  </li>
                  <li style={{ display: 'flex', gap: '8px' }}>
                    <span>✅</span>
                    <span><strong>Segregation:</strong> Ensure food waste is free from plastic cutlery, wraps, or aluminum foil prior to truck arrival.</span>
                  </li>
                  <li style={{ display: 'flex', gap: '8px' }}>
                    <span>✅</span>
                    <span><strong>Digital Proof:</strong> Each completed ticket provides a green certificate for your hotel's sustainability records.</span>
                  </li>
                </ul>
              </div>

              <div className="card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                  Municipal Contact Helpline
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                  Toll-Free Swachh Bharat Waste Helpline: <strong>1800-180-2026</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Submitted Tickets Table */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: '16px' }}>
              Your Waste Collection Tickets ({requests.length})
            </h3>

            {requests.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', padding: '24px 0' }}>
                No waste collection requests filed yet. All your surplus donations are currently active or edible.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                      <th style={{ padding: '10px' }}>Ticket No</th>
                      <th style={{ padding: '10px' }}>Food Waste</th>
                      <th style={{ padding: '10px' }}>Quantity</th>
                      <th style={{ padding: '10px' }}>Municipal Ward</th>
                      <th style={{ padding: '10px' }}>Pickup Slot</th>
                      <th style={{ padding: '10px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(req => (
                      <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                          {req.ticketNumber}
                        </td>
                        <td style={{ padding: '12px 10px', fontWeight: 600 }}>
                          {req.foodName}
                        </td>
                        <td style={{ padding: '12px 10px' }}>
                          {req.quantity}
                        </td>
                        <td style={{ padding: '12px 10px', color: '#64748b' }}>
                          {req.regionWard}
                        </td>
                        <td style={{ padding: '12px 10px', color: '#64748b' }}>
                          {req.preferredSlot}
                        </td>
                        <td style={{ padding: '12px 10px' }}>
                          <span className="badge badge-success" style={{ textTransform: 'uppercase' }}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
