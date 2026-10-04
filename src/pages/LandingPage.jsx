import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="container hero-grid">
          {/* Left Column: Heading & CTAs */}
          <div className="hero-content">
            <div className="hero-badge">
              <span>🌱</span> Zero Food Waste • Maximum Social Impact
            </div>
            <h1 className="hero-title">
              Connecting Surplus Food With <span>Those Who Need It Most</span>
            </h1>
            <p className="hero-description">
              FoodConnect empowers hotels, restaurants, caterers, and event halls to instantly share surplus fresh meals with local NGOs, shelters, and food banks.
            </p>
            <div className="hero-ctas">
              <Link to="/register?role=donor" className="btn btn-primary btn-lg">
                <span>🍲</span> Donate Surplus Food
              </Link>
              <Link to="/register?role=ngo" className="btn btn-secondary btn-lg">
                <span>🤝</span> Join as NGO / Recipient
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">2.6+</span>
                <span className="stat-label">Tons Food Saved</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">15,000+</span>
                <span className="stat-label">Nutritious Meals</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">120+</span>
                <span className="stat-label">Partner NGOs</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Feed Preview Card (Reflecting the exact project UI) */}
          <div className="hero-visual-card">
            <div className="preview-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="preview-pulse"></span>
                <strong style={{ fontSize: '0.95rem', color: '#0b462f' }}>Live Available Surplus Food</strong>
              </div>
              <span className="preview-tag">Verified Active</span>
            </div>

            {/* Sample Item 1 */}
            <div className="sample-food-item">
              <img 
                src="/images/1.jpg" 
                alt="Veg Biryani" 
                className="sample-food-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="sample-food-details">
                <h4 className="sample-food-title">Fresh Veg Biryani</h4>
                <p className="sample-food-source">🏨 Hotel Green Valley • 25 kg (approx. 70 meals)</p>
                <div className="sample-meta-row">
                  <span className="tag-fresh">Fresh</span>
                  <span className="tag-time">Prepared 2h ago</span>
                  <span className="badge badge-success" style={{ marginLeft: 'auto' }}>FREE</span>
                </div>
              </div>
            </div>

            {/* Sample Item 2 */}
            <div className="sample-food-item">
              <img 
                src="/images/2.jpg" 
                alt="Paneer Curry" 
                className="sample-food-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="sample-food-details">
                <h4 className="sample-food-title">Shahi Paneer Curry & Rotis</h4>
                <p className="sample-food-source">🍽️ Royal Palace Banquet • 15 kg (approx. 45 meals)</p>
                <div className="sample-meta-row">
                  <span className="tag-fresh">Fresh</span>
                  <span className="tag-time">Prepared 3h ago</span>
                  <span className="badge badge-success" style={{ marginLeft: 'auto' }}>FREE</span>
                </div>
              </div>
            </div>

            {/* Sample Item 3 */}
            <div className="sample-food-item">
              <img 
                src="/images/3.jpg" 
                alt="Fresh Salad" 
                className="sample-food-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="sample-food-details">
                <h4 className="sample-food-title">Nutritious Mixed Salad & Dal</h4>
                <p className="sample-food-source">🥗 Sunrise Grand Hotel • 20 kg</p>
                <div className="sample-meta-row">
                  <span className="tag-fresh">Fresh Produce</span>
                  <span className="tag-time">Prepared 1h ago</span>
                  <span className="badge badge-success" style={{ marginLeft: 'auto' }}>FREE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="section container">
        <div className="section-header">
          <span className="section-subtitle">Simple 3-Step Process</span>
          <h2 className="section-title">How FoodConnect Works</h2>
          <p className="section-description">
            We simplify surplus food rescue from posting to delivery with transparent status tracking.
          </p>
        </div>

        <div className="steps-grid">
          {/* Step 1 */}
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Donor Posts Surplus Food</h3>
            <p>
              Hotels, restaurants, or caterers quickly enter surplus details: food name, quantity, pickup deadline, address, and upload a food photo.
            </p>
          </div>

          {/* Step 2 */}
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>NGO Discovers & Accepts</h3>
            <p>
              Nearby verified NGOs receive alerts, view food type, distance, preparation time, and accept the donation with one click.
            </p>
          </div>

          {/* Step 3 */}
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Tracked Pickup & Delivery</h3>
            <p>
              Both parties communicate via chat and track status in real-time from Acceptance → Pickup Started → Picked Up → Delivered.
            </p>
          </div>
        </div>
      </section>

      {/* WHO WE EMPOWER SECTION */}
      <section id="donors" className="section" style={{ backgroundColor: '#ffffff', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Tailored For Every Role</span>
            <h2 className="section-title">A Unified Platform For Donors & NGOs</h2>
          </div>

          <div className="roles-grid">
            {/* Donor Card */}
            <div className="role-card donor-card">
              <div className="role-header">
                <span className="badge badge-green">For Donors</span>
                <h3>Hotels, Restaurants & Caterers</h3>
                <p>
                  Prevent wholesome food from going to waste while creating meaningful social impact in your community.
                </p>
              </div>

              <ul className="role-features">
                <li><span className="check-icon">✓</span> 60-second surplus food listing with photos</li>
                <li><span className="check-icon">✓</span> Choose 100% Free donation or low-cost recovery</li>
                <li><span className="check-icon">✓</span> AI-assisted estimated quality scoring</li>
                <li><span className="check-icon">✓</span> Direct in-app coordination with verified NGOs</li>
                <li><span className="check-icon">✓</span> Impact dashboard showing kg saved & meals delivered</li>
              </ul>

              <Link to="/register?role=donor" className="btn btn-primary" style={{ marginTop: '20px' }}>
                Register as Food Donor
              </Link>
            </div>

            {/* NGO Card */}
            <div id="ngos" className="role-card ngo-card">
              <div className="role-header">
                <span className="badge badge-green">For NGOs</span>
                <h3>Charities, Shelters & Food Banks</h3>
                <p>
                  Gain reliable access to fresh, hygienic meals for the families and communities you support daily.
                </p>
              </div>

              <ul className="role-features">
                <li><span className="check-icon">✓</span> Live feed of available surplus food nearby</li>
                <li><span className="check-icon">✓</span> Filter by category, distance, and preparation time</li>
                <li><span className="check-icon">✓</span> Simple 1-click donation acceptance workflow</li>
                <li><span className="check-icon">✓</span> Transparent step-by-step pickup timeline tracking</li>
                <li><span className="check-icon">✓</span> Verified NGO badge for trusted operations</li>
              </ul>

              <Link to="/register?role=ngo" className="btn btn-secondary" style={{ marginTop: '20px' }}>
                Register as Recipient NGO
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="container" style={{ paddingBottom: '40px' }}>
        <div className="cta-banner">
          <h2>Ready to Reduce Food Waste Together?</h2>
          <p>
            Whether you are a hotel with tonight's surplus meals or an NGO feeding community members, join FoodConnect today.
          </p>
          <div className="cta-banner-buttons">
            <Link to="/register?role=donor" className="btn btn-secondary btn-lg" style={{ backgroundColor: '#ffffff', color: '#0b462f' }}>
              Start Donating Food
            </Link>
            <Link to="/register?role=ngo" className="btn btn-outline-white btn-lg">
              Join as Recipient NGO
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
