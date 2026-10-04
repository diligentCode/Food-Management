// ===================================================================
// FOODCONNECT - AUTHENTICATION & USER ROLES CONTEXT
// Manages authentication state, user roles (donor, ngo, admin),
// login, registration, logout, and role redirection.
// ===================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/dataService';

const AuthContext = createContext(null);

const STORAGE_AUTH_KEY = 'foodconnect_active_user';

export function AuthProvider({ children }) {
  // Default to Donor (Hotel Green Valley) or saved active user
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AUTH_KEY);
      if (saved) return JSON.parse(saved);
      // Default to Hotel Green Valley from reference image
      const users = userService.getUsers();
      return users.find(u => u.role === 'donor') || users[0];
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_AUTH_KEY);
    }
  }, [currentUser]);

  // Login with Email & Password
  const login = async (email, password) => {
    setLoading(true);
    try {
      const users = userService.getUsers();
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!found) {
        throw new Error('No user found with this email. Please check your email or register.');
      }
      setCurrentUser(found);
      return found;
    } finally {
      setLoading(false);
    }
  };

  // Register a new Donor or NGO user
  const register = async (userData) => {
    setLoading(true);
    try {
      const users = userService.getUsers();
      const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existing) {
        throw new Error('An account with this email already exists.');
      }

      const newUser = userService.createUser({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '+91 98765 00000',
        role: userData.role || 'donor', // 'donor' or 'ngo'
        organizationName: userData.organizationName || userData.name,
        address: userData.address || 'Local City, India',
        location: { lat: 26.9124, lng: 75.7873 },
        isVerified: false
      });

      setCurrentUser(newUser);
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Logins for instant evaluation
  const loginAsDonor = () => {
    const users = userService.getUsers();
    const donor = users.find(u => u.role === 'donor') || users[0];
    setCurrentUser(donor);
    return donor;
  };

  const loginAsNGO = () => {
    const users = userService.getUsers();
    const ngo = users.find(u => u.role === 'ngo') || users[1];
    setCurrentUser(ngo);
    return ngo;
  };

  const loginAsAdmin = () => {
    const users = userService.getUsers();
    const admin = users.find(u => u.role === 'admin') || users[2];
    setCurrentUser(admin);
    return admin;
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
  };

  // Update profile
  const updateProfile = (updates) => {
    if (!currentUser) return;
    const updated = userService.updateUser(currentUser.id, updates);
    if (updated) setCurrentUser(updated);
    return updated;
  };

  const value = {
    currentUser,
    userRole: currentUser?.role || null,
    isAuthenticated: Boolean(currentUser),
    loading,
    login,
    register,
    logout,
    updateProfile,
    loginAsDonor,
    loginAsNGO,
    loginAsAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
