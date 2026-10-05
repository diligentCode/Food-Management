import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import AppNavbar from '../../components/layout/AppNavbar';
import { useAuth } from '../../context/AuthContext';
import { wasteService, foodService, getMunicipalContactForCity, ALL_INDIAN_CITIES } from '../../services/dataService';

export default function WasteManagementPage() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [donorListings, setDonorListings] = useState([]);
  const [selectedCity, setSelectedCity] = useState(currentUser?.city || 'Jaipur');
  const [submittingId, setSubmittingId] = useState(null);
  const [successTicket, setSuccessTicket] = useState(null);
  const [showManualForm, setShowManualForm] = useState(false);

  // Manual fallback form state (only for unlisted kitchen trimmings)
  const [manualFoodName, setManualFoodName] = useState('');
  const [manualQuantity, setManualQuantity] = useState('');
  const [manualReason, setManualReason] = useState('Kitchen vegetable trimmings & pre-cooking organic waste');

  const loadData = () => {
    if (currentUser) {
      setRequests(wasteService.getDonorRequests(currentUser.id));
      const listings = foodService.getDonorListings(currentUser.id);
      setDonorListings(listings);
    }
  };

  useEffect(() => {
    loadData();
    if (currentUser?.city) setSelectedCity(currentUser.city);
  }, [currentUser]);

  // Real official municipal contact for the user's city
  const municipalContact = getMunicipalContactForCity(selectedCity);

  // 1-Click: Turn existing listing into Municipal Waste Ticket (No form re-filling)
  const handleRequestForListing = (listing) => {
    try {
      setSubmittingId(listing.id);
      const isExpired = listing.status === 'expired';
      const reason = isExpired 
        ? 'Surplus expired past safe edible consumption window'
        : 'Leftover surplus marked for circular organic biomethanation/composting';

      const newTicket = wasteService.createWasteRequest({
        donorId: currentUser?.id,
        donorName: currentUser?.organizationName || currentUser?.name,
        foodListingId: listing.id,
        foodName: listing.foodName,
        quantity: `${listing.quantity} ${listing.unit}`,
        spoilageReason: reason,
        regionWard: `${selectedCity} Municipal Solid Waste Zone`,
        address: listing.pickupAddress || currentUser?.address || `${selectedCity} Service Gate`,
        preferredSlot: 'Next Scheduled Municipal Eco-Truck Run (10:00 AM - 01:00 PM)'
      });

      // Update listing status so it is no longer available for donation
      foodService.updateListing(listing.id, { status: 'waste_collection_requested' });

      setSuccessTicket(newTicket);
      loadData();
    } catch (err) {
      alert('Error scheduling municipal waste pickup: ' + err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  // Submit manual scrap form
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualFoodName || !manualQuantity) return;

    try {
      const newTicket = wasteService.createWasteRequest({
        donorId: currentUser?.id,
        donorName: currentUser?.organizationName || currentUser?.name,
        foodListingId: null,
        foodName: manualFoodName,
        quantity: `${manualQuantity} kg`,
        spoilageReason: manualReason,
        regionWard: `${selectedCity} Municipal Solid Waste Zone`,
        address: currentUser?.address || `${selectedCity} Kitchen Gate`,
        preferredSlot: 'Next Scheduled Municipal Eco-Truck Run (10:00 AM - 01:00 PM)'
      });

      setSuccessTicket(newTicket);
      setManualFoodName('');
      setManualQuantity('');
      setShowManualForm(false);
      loadData();
    } catch (err) {
      alert('Error scheduling request: ' + err.message);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <AppNavbar title="Municipal Waste & Composting Portal" />

        <div className="dashboard-body" style={{ maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>♻️</span>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>
                  Municipal Organic Waste & Composting
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', marginTop: '4px' }}>
                  Convert expired, spoiled, or non-consumable food into green biogas & agricultural compost via your city's official Municipal Corporation.
                </p>
              </div>
            </div>
          </div>

          {/* Success Banner */}
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
                <strong style={{ fontSize: '1.05rem', color: '#065f46' }}>
                  ✓ Municipal Collection Ticket Generated: {successTicket.ticketNumber}
                </strong>
                <div style={{ fontSize: '0.85rem', color: '#047857', marginTop: '4px' }}>
                  Food Batch: <strong>{successTicket.foodName}</strong> ({successTicket.quantity}) &bull; Scheduled: {successTicket.preferredSlot}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#0f766e', marginTop: '2px' }}>
                  Routing to: <strong>{successTicket.wasteDestination}</strong>
                </div>
              </div>
              <button onClick={() => setSuccessTicket(null)} className="btn btn-secondary btn-sm">
                Dismiss
              </button>
            </div>
          )}

          {/* SECTION 1: REAL OFFICIAL MUNICIPAL CORPORATION CONTACT CARD */}
          <div className="card" style={{ padding: '24px', marginBottom: '28px', borderLeft: '5px solid #10b981', backgroundColor: '#fcfdfd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
              <div>
                <span className="badge badge-success" style={{ marginBottom: '6px' }}>
                  🏛️ Verified Official Authority
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                  {municipalContact.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                  Department: <strong>{municipalContact.wasteDepartment}</strong>
                </p>
              </div>

              {/* City Switcher with 150+ Indian Municipal Regions */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>🏛️ Municipal Region:</span>
                  <input
                    type="text"
                    list="waste-municipal-cities-list"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    placeholder="Search city / municipality..."
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.86rem',
                      backgroundColor: '#ffffff',
                      fontWeight: 700,
                      width: '220px'
                    }}
                  />
                  <datalist id="waste-municipal-cities-list">
                    {ALL_INDIAN_CITIES.map((c, idx) => (
                      <option key={`waste-c-${idx}`} value={c.name}>
                        {c.name}, {c.state} (Municipal Zone)
                      </option>
                    ))}
                  </datalist>
                </div>

                {/* Popular city badges including Nagpur */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-end', maxWidth: '420px' }}>
                  {['Nagpur', 'Indore', 'Jaipur', 'Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Hyderabad', 'Ahmedabad', 'Kolkata'].map((quickCity) => (
                    <button
                      key={quickCity}
                      type="button"
                      onClick={() => setSelectedCity(quickCity)}
                      style={{
                        padding: '2px 8px',
                        fontSize: '0.7rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        background: selectedCity.toLowerCase() === quickCity.toLowerCase() ? 'var(--color-primary-dark)' : '#f8fafc',
                        color: selectedCity.toLowerCase() === quickCity.toLowerCase() ? '#ffffff' : '#475569',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      {quickCity}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Processing Facility Info */}
            <div style={{ background: '#f1f5f9', padding: '12px 16px', borderRadius: '8px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>🏭</span>
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Regional Bio-Methanation & Composting Plant:</strong>
                <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                  {municipalContact.centralFacility}
                </div>
              </div>
            </div>

            {/* Direct Real Contact Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <a
                href={`tel:${municipalContact.phoneClean || municipalContact.helpline}`}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
              >
                <span>📞</span> Call Municipal Helpline ({municipalContact.helpline})
              </a>

              <a
                href={`mailto:${municipalContact.email}?subject=FoodConnect Organic Surplus Food Waste Pickup Request - ${currentUser?.organizationName || 'Hotel'}&body=Dear ${municipalContact.name} Solid Waste Management Department,%0D%0A%0D%0AWe are registered with FoodConnect (${currentUser?.organizationName || 'Hotel'}) located at ${currentUser?.address || selectedCity}.%0D%0A%0D%0AWe request organic waste pickup for our surplus edible food batch that has exceeded its consumption window, to ensure 100% diversion from landfills to bio-methanation/composting.%0D%0A%0D%0APickup Location: ${currentUser?.address || selectedCity}%0D%0AContact Phone: ${currentUser?.phone || ''}%0D%0A%0D%0AThank you.`}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
              >
                <span>📧</span> Send Official Email ({municipalContact.email})
              </a>

              <a
                href={municipalContact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
              >
                <span>🌐</span> Official Portal ({municipalContact.website.replace('https://', '')})
              </a>
            </div>
          </div>

          {/* SECTION 2: 1-CLICK MUNICIPAL PICKUP FOR EXISTING LISTED FOOD ITEMS */}
          <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>
                  Your Listed Food Batches ({donorListings.length})
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                  No need to re-type details. 1-click schedule municipal waste collection for any expired or leftover posting using existing data:
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowManualForm(!showManualForm)}
                className="btn btn-secondary btn-sm"
              >
                {showManualForm ? '✕ Close Custom Form' : '➕ Log Unlisted Kitchen Scrap'}
              </button>
            </div>

            {/* Optional Unlisted Kitchen Scrap Drawer */}
            {showManualForm && (
              <form onSubmit={handleManualSubmit} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                  Log Unlisted Raw Kitchen Scrap (Peels, prep trims, plate waste)
                </strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Raw Vegetable Trimmings & Kitchen Peels"
                    value={manualFoodName}
                    onChange={(e) => setManualFoodName(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Weight in kg (e.g. 15)"
                    value={manualQuantity}
                    onChange={(e) => setManualQuantity(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>
                  Schedule Municipal Collection for Scrap &rarr;
                </button>
              </form>
            )}

            {donorListings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🍲</div>
                <strong style={{ color: '#0f172a' }}>No Food Listings Created Yet</strong>
                <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                  When you create food listings in "List Surplus Food", any batches that expire or require bio-waste diversion can be sent for municipal pickup directly from here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {donorListings.map((item) => {
                  const isWasteTicketed = item.status === 'waste_collection_requested';
                  const isExpired = item.status === 'expired';

                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: '1.5px solid',
                        borderColor: isWasteTicketed ? '#10b981' : isExpired ? '#fca5a5' : '#e2e8f0',
                        backgroundColor: isWasteTicketed ? '#f0fdf4' : isExpired ? '#fff5f5' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: isExpired ? '#fee2e2' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>
                          {isExpired ? '⚠️' : '🍲'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '0.98rem', color: '#0f172a' }}>{item.foodName}</strong>
                            <span style={{
                              fontSize: '0.72rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: 700,
                              backgroundColor: isWasteTicketed ? '#dcfce7' : isExpired ? '#fee2e2' : '#e2e8f0',
                              color: isWasteTicketed ? '#15803d' : isExpired ? '#b91c1c' : '#475569'
                            }}>
                              {isWasteTicketed ? 'WASTE PICKUP SCHEDULED' : isExpired ? 'EXPIRED' : item.status.toUpperCase()}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px' }}>
                            Quantity: <strong>{item.quantity} {item.unit}</strong> &bull; Category: {item.category} &bull; Pickup: {item.pickupAddress}
                          </div>
                        </div>
                      </div>

                      <div>
                        {isWasteTicketed ? (
                          <span style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 700 }}>
                            ✓ Municipal Truck Assigned
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRequestForListing(item)}
                            disabled={submittingId === item.id}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: '#0b462f', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <span>♻️</span>
                            <span>{submittingId === item.id ? 'Scheduling...' : 'Send to Municipal Waste Pickup'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 3: MUNICIPAL COLLECTION TICKETS HISTORY */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: '16px' }}>
              Your Municipal Collection Tickets ({requests.length})
            </h3>

            {requests.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', padding: '20px 0' }}>
                No waste collection requests filed yet. Use the 1-click buttons above to schedule municipal diversion for surplus batches.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                      <th style={{ padding: '10px' }}>Ticket No</th>
                      <th style={{ padding: '10px' }}>Food Waste Item</th>
                      <th style={{ padding: '10px' }}>Quantity</th>
                      <th style={{ padding: '10px' }}>Municipal Facility</th>
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
                        <td style={{ padding: '12px 10px', color: '#047857', fontSize: '0.8rem', fontWeight: 600 }}>
                          {req.wasteDestination}
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
