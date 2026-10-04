import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          {/* Brand Info */}
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="brand-icon" style={{ background: '#10b981' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#0b462f"/>
                </svg>
              </div>
              <span className="footer-logo-title">FoodConnect</span>
            </div>
            <p className="footer-tagline">
              Connecting Surplus Food With Those Who Need It Most. Reducing food waste, fighting hunger, and building resilient communities.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><Link to="/register">Join as Food Donor</Link></li>
              <li><Link to="/register">Register as NGO</Link></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#impact">Impact Metrics</a></li>
            </ul>
          </div>

          {/* Donors & Partners */}
          <div className="footer-col">
            <h4>For Community</h4>
            <ul>
              <li><a href="#donors">Hotels & Restaurants</a></li>
              <li><a href="#donors">Catering & Event Halls</a></li>
              <li><a href="#ngos">Charities & Food Banks</a></li>
              <li><a href="#ngos">Community Kitchens</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-col">
            <h4>Contact & Safety</h4>
            <ul>
              <li><a href="#safety">Food Safety Guidelines</a></li>
              <li><a href="#support">Help & Support</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} FoodConnect Platform. All rights reserved.</p>
          <p>Built with ❤️ to fight food waste and nourish lives.</p>
        </div>
      </div>
    </footer>
  );
}
