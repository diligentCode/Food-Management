import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import AppNavbar from '../../components/layout/AppNavbar';
import AIQualityCard from '../../components/common/AIQualityCard';
import { useAuth } from '../../context/AuthContext';
import { foodService } from '../../services/dataService';

const SAMPLE_PRESET_IMAGES = [
  { label: 'Veg Biryani', path: '/images/1.jpg' },
  { label: 'Paneer Curry', path: '/images/2.jpg' },
  { label: 'Fresh Salad', path: '/images/3.jpg' },
  { label: 'Dal Tadka', path: '/images/4.jpg' },
  { label: 'Gulab Jamun', path: '/images/5.jpg' },
  { label: 'Special Thali', path: '/images/6.jpg' }
];

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
  const [pickupDeadline, setPickupDeadline] = useState('Today, 8:00 PM');
  const [pickupAddress, setPickupAddress] = useState(currentUser?.address || 'Tonk Road, Jaipur');
  const [listingType, setListingType] = useState('free'); // free | paid
  const [price, setPrice] = useState(0);
  const [imageURL, setImageURL] = useState('/images/1.jpg');
  const [qualityScore, setQualityScore] = useState(89);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle local image file selection
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageURL(reader.result);
        // Recalculate AI score estimate
        setQualityScore(Math.floor(Math.random() * 10) + 85);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!foodName.trim()) {
      setError('Food name is required.');
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setError('Please specify a positive food quantity.');
      return;
    }

    try {
      setSubmitting(true);
      foodService.createListing({
        donorId: currentUser?.id || 'user_donor_1',
        donorName: currentUser?.organizationName || currentUser?.name || 'Hotel Green Valley',
        foodName,
        category,
        description: description || `Freshly prepared surplus ${foodName}.`,
        quantity: Number(quantity),
        unit,
        foodType,
        preparedAt,
        pickupDeadline,
        expiresInText: 'Expires in 6h 00m',
        imageURL,
        pickupAddress,
        latitude: 26.8520,
        longitude: 75.8050,
        listingType,
        price: listingType === 'paid' ? Number(price) : 0,
        qualityScore,
        qualityStatus: qualityScore >= 85 ? 'Good Quality' : 'Moderate Quality'
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

        <div className="dashboard-body" style={{ maxWidth: '960px', margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
              Add Surplus Food Listing 🍲
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
              Publish your surplus edible food in 60 seconds so nearby verified NGOs can collect and distribute it.
            </p>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
            {/* Left Column: Form Fields */}
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
                  placeholder="e.g. Fresh Veg Biryani & Raita"
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
                    onChange={(e) => setCategory(e.target.value)}
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
                    placeholder="e.g. 25"
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
                    <option value="meals">Meals (approx. plates)</option>
                    <option value="packs">Packets / Boxes</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Preparation Date & Time
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
                    Pickup Deadline *
                  </label>
                  <input
                    type="text"
                    required
                    value={pickupDeadline}
                    onChange={(e) => setPickupDeadline(e.target.value)}
                    placeholder="e.g. Today, 8:00 PM"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.92rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Pickup Address & Landmark
                </label>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="e.g. Hotel Green Valley Back Gate, Tonk Road, Jaipur"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.92rem' }}
                />
              </div>

              {/* Free vs Low-Cost Sale (Section 18) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
                  Listing Type
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
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Donated at ₹0 cost</div>
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
                      <strong style={{ fontSize: '0.88rem' }}>Low-Cost Sale</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Nominal subsidized price</div>
                    </div>
                  </label>
                </div>

                {listingType === 'paid' && (
                  <div style={{ marginTop: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                      Price (₹ INR)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 50"
                      style={{ width: '160px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Description / Handling Instructions
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Packed in clean stainless containers. Keep refrigerated or distribute within 4 hours."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.92rem' }}
                />
              </div>

              <button type="submit" disabled={submitting} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '10px' }}>
                {submitting ? 'Publishing Listing...' : '🚀 Publish Surplus Food Listing'}
              </button>
            </div>

            {/* Right Column: Image Upload & AI Quality Assessment Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card">
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '12px' }}>
                  Food Photograph
                </h3>

                <div style={{
                  width: '100%',
                  height: '200px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#e2e8f0',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={imageURL}
                    alt="Food Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Upload File Input */}
                <label className="btn btn-secondary btn-sm" style={{ width: '100%', textAlign: 'center', cursor: 'pointer' }}>
                  📷 Upload from Device
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>

                {/* Preset Fast Picker */}
                <div style={{ marginTop: '16px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>
                    Or Pick Sample Food:
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {SAMPLE_PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.path}
                        type="button"
                        onClick={() => {
                          setImageURL(preset.path);
                          setFoodName(preset.label);
                          setQualityScore(Math.floor(Math.random() * 8) + 87);
                        }}
                        style={{
                          fontSize: '0.75rem',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: imageURL === preset.path ? '#0b462f' : '#ffffff',
                          color: imageURL === preset.path ? '#ffffff' : '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Quality Card Preview */}
              <AIQualityCard score={qualityScore} status="Good Quality" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
