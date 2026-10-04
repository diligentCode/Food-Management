import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Donor Pages
import DonorDashboard from './pages/donor/DonorDashboard';
import AddFoodPage from './pages/donor/AddFoodPage';
import MyListingsPage from './pages/donor/MyListingsPage';
import DonorTrackingPage from './pages/donor/DonorTrackingPage';

// NGO Pages
import NGODashboard from './pages/ngo/NGODashboard';
import NGOAvailableFoodPage from './pages/ngo/NGOAvailableFoodPage';
import NGODistributionsPage from './pages/ngo/NGODistributionsPage';
import NGOMapPage from './pages/ngo/NGOMapPage';

// Shared Pages
import ChatPage from './pages/shared/ChatPage';
import ProfilePage from './pages/shared/ProfilePage';

// Admin Page
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* DONOR PROTECTED ROUTES */}
        <Route
          path="/donor"
          element={
            <ProtectedRoute allowedRoles={['donor']}>
              <DonorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor/add-food"
          element={
            <ProtectedRoute allowedRoles={['donor']}>
              <AddFoodPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor/listings"
          element={
            <ProtectedRoute allowedRoles={['donor']}>
              <MyListingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor/tracking"
          element={
            <ProtectedRoute allowedRoles={['donor']}>
              <DonorTrackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor/messages"
          element={
            <ProtectedRoute allowedRoles={['donor']}>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor/profile"
          element={
            <ProtectedRoute allowedRoles={['donor']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* NGO PROTECTED ROUTES */}
        <Route
          path="/ngo"
          element={
            <ProtectedRoute allowedRoles={['ngo']}>
              <NGODashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ngo/available"
          element={
            <ProtectedRoute allowedRoles={['ngo']}>
              <NGOAvailableFoodPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ngo/requests"
          element={
            <ProtectedRoute allowedRoles={['ngo']}>
              <NGODistributionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ngo/map"
          element={
            <ProtectedRoute allowedRoles={['ngo']}>
              <NGOMapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ngo/messages"
          element={
            <ProtectedRoute allowedRoles={['ngo']}>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ngo/profile"
          element={
            <ProtectedRoute allowedRoles={['ngo']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/listings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/donations"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
