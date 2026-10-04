import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import AppNavbar from '../../components/layout/AppNavbar';
import AIQualityCard from '../../components/common/AIQualityCard';
import MapLocationPicker from '../../components/common/MapLocationPicker';
import { useAuth } from '../../context/AuthContext';
import { foodService } from '../../services/dataService';
import { analyzeFoodImage } from '../../services/aiService';

export default function AddFoodPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState('Rice');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [foodType, setFoodType] = useState('Vegetarian');
  const [preparedAt, setPreparedAt] = useState('Today, 11:30 AM');
  const [expiryHours, setExpiryHours] = useState('6');
  const [pickupAddress, setPickupAddress] = useState(currentUser?.address || 'Hotel Kitchen Dispatch Gate');
  const [pickupLat, setPickupLat] = useState(currentUser?.location?.lat || 26.8520);
  const [pickupLng, setPickupLng] = useState(currentUser?.location?.lng || 75.8050);
  const [gpsPinStatus, setGpsPinStatus] = useState('');
  const [listingType, setListingType] = useState('free'); // 'free' | 'paid'
  const [price, setPrice] = useState(40);
  const [imageURL, setImageURL] = useState('');
  const [aiScore, setAiScore] = useState(88);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleMapLocationSelect = ({ lat, lng, address: suggestedAddr }) => {
    setPickupLat(lat);
    setPickupLng(lng);
    if (suggestedAddr && (!pickupAddress || pickupAddress.trim().length === 0)) {
      setPickupAddress(suggestedAddr);
    }
    setGpsPinStatus(`✓ Exact Location Pinned: Lat ${lat}, Lng ${lng}`);
  };

  // Run AI Analysis whenever image or category changes
  const runAiAnalysis = async (imgData, cat, name) => {
    setAnalyzingAi(true);
    try {
      const result = await analyzeFoodImage({
        imageDataUrl: imgData,
        category: cat,
        foodName: name || 'Surplus Meal'
      });
      setAiScore(result.score);
      setAiAnalysis(result);
    } catch (err) {
      console.warn('AI analysis error:', err);
    } finally {
      setAnalyzingAi(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        setImageURL(dataUrl);
        runAiAnalysis(dataUrl, category, foodName);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!foodName.trim()) {
      setError('Food item name is required.');
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setError('Please specify a positive food quantity.');
      return;
    }
    if (listingType === 'paid' && (isNaN(price) || Number(price) <= 0)) {
      setError('Please specify a valid subsidized price greater than ₹0.');
      return;
    }

    try {
      setSubmitting(true);
      const hours = Number(expiryHours) || 6;
      const expiresAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();
      const pickupDeadline = `Within ${hours} hours (before ${new Date(Date.now() + hours * 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;

      foodService.createListing({
        donorId: currentUser?.id,
        donorName: currentUser?.organizationName || currentUser?.name,
        foodName: foodName.trim(),
        category,
        description: description || `Freshly prepared ${foodType.toLowerCase()} ${foodName}.`,
        quantity: Number(quantity),
        unit,
        foodType,
        preparedAt,
        pickupDeadline,
        expiresAt,
        imageURL: imageURL || '',
        pickupAddress,
        latitude: pickupLat,
        longitude: pickupLng,
        city: currentUser?.city || 'Jaipur',
        listingType,
        price: listingType === 'paid' ? Number(price) : 0,
        qualityScore: aiScore,
        qualityStatus: aiScore >= 85 ? 'Good Quality' : 'Moderate Quality',
        qualityAnalysis: aiAnalysis
      });

      navigate('/donor/listings');
    } catch (err) {
      setError(err.message || 'Failed to create listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <AppNavbar title="List Surplus Food" />

        <div className="dashboard-body" style={{ maxWidth: '980px', margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
              Add Surplus Food Listing 🍲
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
              Publish edible surplus food with photos and AI freshness scoring for verified NGOs to collect.
            </p>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
            {/* Left Column: Form Details */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Food Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g. Steamed Rice, Dal Makhani & Roti"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.92rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Food Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      runAiAnalysis(imageURL, e.target.value, foodName);
                    }}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.92rem' }}
                  >
                    <option value="Rice">Rice</option>
                    <option value="Bread">Bread / Roti</option>
                    <option value="Vegetables">Vegetables / Salad</option>
                    <option value="Curry">Curry / Dal</option>
                    <option value="Meals">Full Meals / Thali</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Desserts">Desserts / Sweets</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Food Dietary Type
                  </label>
                  <select
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.92rem' }}
                  >
                    <option value="Vegetarian">🌱 Vegetarian</option>
                    <option value="Non-Vegetarian">🍗 Non-Vegetarian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 20"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.92rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.92rem' }}
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="meals">Meals (plates)</option>
                    <option value="packs">Boxes / Packets</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Preparation Time
                  </label>
                  <input
                    type="text"
                    value={preparedAt}
                    onChange={(e) => setPreparedAt(e.target.value)}
                    placeholder="e.g. Today, 11:30 AM"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.92rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Available Shelf Life *
                  </label>
                  <select
                    value={expiryHours}
                    onChange={(e) => setExpiryHours(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.92rem' }}
                  >
                    <option value="2">Available for 2 Hours</option>
                    <option value="4">Available for 4 Hours</option>
                    <option value="6">Available for 6 Hours (Recommended)</option>
                    <option value="8">Available for 8 Hours</option>
                    <option value="12">Available for 12 Hours</option>
                    <option value="24">Available for 24 Hours</option>
                  </select>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>
                    Pickup Address & Loading Gate Landmark *
                  </label>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Interactive Map Pinning
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="e.g. Hotel Service Gate, Loading Bay 1"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.92rem', marginBottom: '8px' }}
                />
                
                {/* Visual Map Pinning for kitchen loading bay */}
                <MapLocationPicker
                  initialLat={pickupLat}
                  initialLng={pickupLng}
                  initialAddress={pickupAddress}
                  label="🏨 Kitchen Loading Gate"
                  color="#0b462f"
                  symbol="🏨"
                  height="220px"
                  onLocationSelect={handleMapLocationSelect}
                />
              </div>

              {/* Free vs Paid Low-Cost Listing (Section 18 & User Requirement 4) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
                  Listing Type & Pricing *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1.5px solid',
                    borderColor: listingType === 'free' ? 'var(--color-primary-dark)' : 'var(--color-border)',
                    background: listingType === 'free' ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="listingType"
                      checked={listingType === 'free'}
                      onChange={() => setListingType('free')}
                    />
                    <div>
                      <strong style={{ fontSize: '0.88rem' }}>100% Free Donation</strong>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>₹0 cost to recipient NGO</div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1.5px solid',
                    borderColor: listingType === 'paid' ? 'var(--color-primary-dark)' : 'var(--color-border)',
                    background: listingType === 'paid' ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="listingType"
                      checked={listingType === 'paid'}
                      onChange={() => setListingType('paid')}
                    />
                    <div>
                      <strong style={{ fontSize: '0.88rem' }}>Low-Cost / Subsidized Sale</strong>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Nominal subsidized rate</div>
                    </div>
                  </label>
                </div>

                {listingType === 'paid' && (
                  <div style={{ marginTop: '12px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                          Subsidized Price per {unit} (₹ INR) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="e.g. 40"
                          style={{ width: '160px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                        />
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '16px' }}>
                        Total settlement value: <strong>₹{(Number(price || 0) * Number(quantity || 0)).toLocaleString()}</strong>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '8px 0 0 0' }}>
                      NGOs can settle this nominal fee at pickup or via direct UPI on collection.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Packaging & Handover Instructions
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Packed in sanitized stainless vessels. Please bring clean containers for decanting."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.92rem' }}
                />
              </div>

              <button type="submit" disabled={submitting} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '6px' }}>
                {submitting ? 'Publishing Food Listing...' : '🚀 Publish Surplus Food Listing'}
              </button>
            </div>

            {/* Right Column: Image Upload & AI Quality Assessment */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '12px' }}>
                  Food Photograph & Visual Inspection
                </h3>

                <div style={{
                  width: '100%',
                  height: '220px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#f1f5f9',
                  border: '2px dashed #cbd5e1',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  {imageURL ? (
                    <img
                      src={imageURL}
                      alt="Food Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📸</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>No Food Photo Uploaded</div>
                      <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>Upload a photo to run the AI freshness inspection</div>
                    </div>
                  )}
                </div>

                <label className="btn btn-primary btn-sm" style={{ width: '100%', textAlign: 'center', cursor: 'pointer' }}>
                  📷 Upload Food Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {/* AI Quality Card */}
              <AIQualityCard
                score={aiScore}
                status={aiScore >= 85 ? 'Good Quality' : 'Moderate Quality'}
                analysis={aiAnalysis}
                loading={analyzingAi}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
