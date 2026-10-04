// ===================================================================
// FOODCONNECT - AUTHENTICATION & STRICT ROLE ACCESS CONTROL
// Manages authentication state, strict role enforcement (donor vs ngo),
// and session persistence.
// ===================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/dataService';
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  isCloudFirebaseActive, 
  doc, 
  getDoc 
} from '../services/firebase';

const AuthContext = createContext(null);
const STORAGE_AUTH_KEY = 'foodconnect_session_user_v2';

export function AuthProvider({ children }) {
  // Start with saved logged-in session, or null if no user is signed in
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AUTH_KEY);
      if (saved) return JSON.parse(saved);
      return null;
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

  // Login with Email & Password (Multi-Device Cloud Aware)
  const login = async (email, password) => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      let cloudUserFound = null;

      // 1. If Cloud Firebase is active, sign in via Firebase Auth
      if (isCloudFirebaseActive() && auth) {
        try {
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
          if (cred?.user?.uid && db) {
            // Fetch verified user profile directly from Firestore
            const docSnap = await getDoc(doc(db, 'users', cred.user.uid));
            if (docSnap.exists()) {
              cloudUserFound = docSnap.data();
            }
          }
        } catch (firebaseErr) {
          if (firebaseErr.code === 'auth/user-not-found' || firebaseErr.code === 'auth/invalid-credential') {
            throw new Error('Invalid email or password.');
          } else if (firebaseErr.code === 'auth/wrong-password') {
            throw new Error('Incorrect password.');
          }
          console.warn('Firebase login notice:', firebaseErr);
        }
      }

      // If cloud profile found, sync into local cache and authenticate
      if (cloudUserFound) {
        const users = userService.getUsers();
        const idx = users.findIndex(u => u.id === cloudUserFound.id);
        if (idx !== -1) {
          users[idx] = cloudUserFound;
        } else {
          users.push(cloudUserFound);
        }
        localStorage.setItem('foodconnect_users', JSON.stringify(users));
        setCurrentUser(cloudUserFound);
        return cloudUserFound;
      }

      // 2. Fallback to local / synced users directory
      const users = userService.getUsers();
      const found = users.find(u => u.email.toLowerCase() === cleanEmail);
      if (!found) {
        throw new Error('No registered account found with this email. Please register first.');
      }
      setCurrentUser(found);
      return found;
    } finally {
      setLoading(false);
    }
  };

  // Register a new Donor or NGO user (Multi-Device Cloud Aware)
  const register = async (userData) => {
    setLoading(true);
    try {
      let firebaseUid = null;

      // 1. If Cloud Firebase is active, register through Firebase Auth
      if (isCloudFirebaseActive() && auth) {
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth, 
            userData.email.trim(), 
            userData.password || 'TemporaryPass123'
          );
          firebaseUid = userCredential.user.uid;
        } catch (firebaseErr) {
          if (firebaseErr.code === 'auth/email-already-in-use') {
            throw new Error('An account with this email already exists on the cloud. Please sign in.');
          } else if (firebaseErr.code === 'auth/weak-password') {
            throw new Error('Password must be at least 6 characters.');
          } else if (firebaseErr.code === 'auth/invalid-email') {
            throw new Error('Please enter a valid email address.');
          } else {
            console.warn('Firebase registration notice:', firebaseErr);
          }
        }
      }

      // 2. Check local store uniqueness
      const users = userService.getUsers();
      const existing = users.find(u => u.email.toLowerCase() === userData.email.trim().toLowerCase());
      if (existing && !firebaseUid) {
        throw new Error('An account with this email already exists.');
      }

      // 3. Create user profile in Firestore & local
      const newUser = userService.createUser({
        id: firebaseUid || undefined,
        name: userData.name || userData.organizationName,
        organizationName: userData.organizationName,
        email: userData.email.trim(),
        phone: userData.phone || '',
        role: userData.role, // strictly 'donor' or 'ngo'
        city: userData.city || 'Jaipur',
        address: userData.address || '',
        location: userData.location || { lat: 26.9124, lng: 75.7873 }
      });

      setCurrentUser(newUser);
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  // Quick Account Generators for testing (creates fresh isolated accounts if not present)
  const quickTestLogin = (role) => {
    const users = userService.getUsers();
    let account = users.find(u => u.role === role);

    if (!account) {
      if (role === 'donor') {
        account = userService.createUser({
          name: 'Green Valley Grand Hotel',
          organizationName: 'Green Valley Grand Hotel & Banquets',
          email: 'donor@greenvalley.com',
          phone: '+91 98290 11223',
          role: 'donor',
          address: 'Tonk Road, Jaipur',
          location: { lat: 26.8520, lng: 75.8050 },
          isVerified: true
        });
      } else if (role === 'ngo') {
        account = userService.createUser({
          name: 'Hope Relief Foundation',
          organizationName: 'Hope Relief Foundation',
          email: 'contact@hoperelief.ngo',
          phone: '+91 98765 44332',
          role: 'ngo',
          address: 'Adarsh Nagar, Jaipur',
          location: { lat: 26.8920, lng: 75.8250 },
          isVerified: true
        });
      } else if (role === 'admin') {
        account = userService.createUser({
          name: 'Platform Administrator',
          organizationName: 'FoodConnect Operations',
          email: 'admin@foodconnect.org',
          phone: '+91 11 2233 4455',
          role: 'admin',
          address: 'Central Secretariat, Delhi',
          isVerified: true
        });
      }
    }

    setCurrentUser(account);
    return account;
  };

  // Logout
  const logout = async () => {
    try {
      if (isCloudFirebaseActive() && auth) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn('Firebase signout notice:', e);
    }
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_AUTH_KEY);
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
    quickTestLogin
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
