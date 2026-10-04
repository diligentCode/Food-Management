import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Navbar.css';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="container navbar-container">
        {/* Brand */}
        <Link to="/" className="nav-brand">
          <div className="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#10b981"/>
              <path d="M12 7c-2 2-2 5 0 7 2-2 2-5 0-7z" fill="#ffffff"/>
            </svg>
          </div>
          <div className="brand-info">
            <span className="brand-title">FoodConnect</span>
            <span className="brand-subtitle">Share Food, Share Hope</span>
          </div>
        </Link>

        {/* Center Links */}
        <nav>
          <ul className="nav-links">
            <li><a href="#how-it-works" className="nav-link">How It Works</a></li>
            <li><a href="#donors" className="nav-link">For Donors</a></li>
            <li><a href="#ngos" className="nav-link">For NGOs</a></li>
            <li><a href="#impact" className="nav-link">Our Impact</a></li>
          </ul>
        </nav>

        {/* Actions */}
        <div className="nav-actions">
          <Link to="/login" className="btn btn-secondary btn-sm">
            Log In
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
