// ===================================================================
// FOODCONNECT - FIREBASE CONFIGURATION
// Connects to Firebase if environment variables are provided,
// and gracefully falls back to persistent storage for easy local testing.
// ===================================================================

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD-mock-foodconnect-demo-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "foodconnect-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "foodconnect-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "foodconnect-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

// Check if actual Firebase project credentials are configured
export const isLiveFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

let app = null;
let auth = null;
let db = null;
let storage = null;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.warn("Firebase initialization warning (using local fallback service):", error);
}

export { app, auth, db, storage };
