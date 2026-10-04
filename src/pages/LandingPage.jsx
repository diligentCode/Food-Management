import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import '../styles/LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="container hero-grid">
            {/* Left Column: Heading & CTAs */}
            <div className="hero-content">
              <div className="hero-badge">
                <span>🌱</span> Zero Food Waste &bull; Maximum Community Impact
              </div>
              <h1 className="hero-title">
                Connecting Surplus Food With <span>Those Who Need It Most</span>
              </h1>
              <p className="hero-description">
                FoodConnect is the dedicated bridge connecting hotels, restaurants, and caterers with local verified NGOs. We turn wholesome surplus meals into nourishment and keep edible food out of landfills.
              </p>
              <div className="hero-ctas">
                <Link to="/register?role=donor" className="btn btn-primary btn-lg">
                  <span>🍲</span> Join as Food Donor
                </Link>
                <Link to="/register?role=ngo" className="btn btn-secondary btn-lg">
                  <span>🤝</span> Join as Recipient NGO
                </Link>
              </div>

              {/* Impact Highlights */}
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Verified Partners</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">60s</span>
                  <span className="stat-label">Fast Food Listing</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">0%</span>
                  <span className="stat-label">Landfill Waste Target</span>
                </div>
              </div>
            </div>

            {/* Right Column: Platform Feature Showcase Card */}
            <div className="hero-visual-card">
              <div className="preview-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="preview-pulse"></span>
                  <strong style={{ fontSize: '0.95rem', color: '#0b462f' }}>FoodConnect Live Platform Workflow</strong>
                </div>
                <span className="preview-tag">Verified Platform</span>
              </div>

              {/* Showcase Feature 1 */}
              <div className="sample-food-item" style={{ background: '#ffffff', border: '1.5px solid #e2e8f0' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e6f4ea', color: '#126343', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                  🍲
                </div>
                <div className="sample-food-details">
                  <h4 className="sample-food-title">Instant Surplus Meal Posting</h4>
                  <p className="sample-food-source">Hotels & restaurants list surplus with photos, quantity, and preparation time.</p>
                  <div className="sample-meta-row">
                    <span className="tag-fresh">AI Quality Check</span>
                    <span className="badge badge-success" style={{ marginLeft: 'auto' }}>FREE / PAID</span>
                  </div>
                </div>
              </div>

              {/* Showcase Feature 2 */}
              <div className="sample-food-item" style={{ background: '#ffffff', border: '1.5px solid #e2e8f0' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                  🤝
                </div>
                <div className="sample-food-details">
                  <h4 className="sample-food-title">Verified NGO Discovery & Claiming</h4>
                  <p className="sample-food-source">Charities and shelters claim nearby batches with 1-click acceptance.</p>
                  <div className="sample-meta-row">
                    <span className="tag-time">Location & Distance Routing</span>
                    <span className="tag-fresh">No Duplicate Claims</span>
                  </div>
                </div>
              </div>

              {/* Showcase Feature 3 */}
              <div className="sample-food-item" style={{ background: '#ffffff', border: '1.5px solid #e2e8f0' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                  ♻️
                </div>
                <div className="sample-food-details">
                  <h4 className="sample-food-title">Municipal Circular Waste Management</h4>
                  <p className="sample-food-source">Expired food is diverted to municipal composting & bio-gas energy.</p>
                  <div className="sample-meta-row">
                    <span className="tag-fresh">Zero Landfill</span>
                    <span className="tag-time">Digital Municipal Tickets</span>
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
              We streamline surplus food rescue from posting to delivery with transparent status tracking.
            </p>
          </div>

          <div className="steps-grid">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Donor Posts Surplus Food</h3>
              <p>
                Hotels, restaurants, or caterers specify quantity, preparation time, pickup deadline, and upload a food photograph with AI freshness scoring.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>NGO Discovers & Claims</h3>
              <p>
                Nearby verified NGOs receive live notifications, review food details and distance, and accept the food batch for collection.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Tracked Pickup & Distribution</h3>
              <p>
                Both parties coordinate in real time. The collection advances along verified milestones: Posted &rarr; Accepted &rarr; Pickup Started &rarr; Delivered.
              </p>
            </div>
          </div>
        </section>

        {/* ROLE COMPARISON SECTION */}
        <section id="donors" className="section" style={{ backgroundColor: '#ffffff', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="container">
            <div className="section-header">
              <span className="section-subtitle">Tailored Portals</span>
              <h2 className="section-title">Completely Dedicated Roles For Donors & NGOs</h2>
            </div>

            <div className="roles-grid">
              {/* Donor Card */}
              <div className="role-card donor-card">
                <div className="role-header">
                  <span className="badge badge-green">Food Donors</span>
                  <h3>Hotels, Restaurants & Caterers</h3>
                  <p>
                    Prevent wholesome banquet meals from going to waste while creating measurable ESG and community impact.
                  </p>
                </div>

                <ul className="role-features">
                  <li><span className="check-icon">✓</span> 60-second surplus food listing with photos</li>
                  <li><span className="check-icon">✓</span> Choose 100% Free donation or subsidized recovery</li>
                  <li><span className="check-icon">✓</span> Built-in AI visual food quality & freshness scoring</li>
                  <li><span className="check-icon">✓</span> Municipal Corporation organic waste collection for expired batches</li>
                  <li><span className="check-icon">✓</span> Direct messaging & donation lifecycle tracking</li>
                </ul>

                <Link to="/register?role=donor" className="btn btn-primary" style={{ marginTop: '20px' }}>
                  Register as Food Donor
                </Link>
              </div>

              {/* NGO Card */}
              <div id="ngos" className="role-card ngo-card">
                <div className="role-header">
                  <span className="badge badge-green">Recipients</span>
                  <h3>Charities, Shelters & Food Banks</h3>
                  <p>
                    Gain reliable, dignified access to fresh, hygienic meals for the communities and families you support daily.
                  </p>
                </div>

                <ul className="role-features">
                  <li><span className="check-icon">✓</span> Live feed of available surplus food nearby</li>
                  <li><span className="check-icon">✓</span> Filter by category, dietary type, and distance</li>
                  <li><span className="check-icon">✓</span> Simple 1-click acceptance workflow</li>
                  <li><span className="check-icon">✓</span> Subsidized food settlement options (Pickup or UPI)</li>
                  <li><span className="check-icon">✓</span> Verified NGO badge and impact reports</li>
                </ul>

                <Link to="/register?role=ngo" className="btn btn-secondary" style={{ marginTop: '20px' }}>
                  Register as Recipient NGO
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION BANNER */}
        <section className="container" style={{ padding: '60px 24px' }}>
          <div className="cta-banner">
            <h2>Ready to Eradicate Food Waste in Your City?</h2>
            <p>
              Join the FoodConnect movement today as a donor or verified recipient partner.
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
      </main>

      <Footer />
    </div>
  );
}
