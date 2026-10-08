import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAuthService } from '../../services/adminAuthService';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userRole, loading, isApproved } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <p style={{ color: 'var(--color-primary-dark)', fontWeight: 600 }}>Loading FoodConnect Security Gateway...</p>
      </div>
    );
  }

  // Not signed in at all
  if (!currentUser) {
    if (allowedRoles && allowedRoles.includes('admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin route protection: Must have admin role AND valid crypto session token
  if (allowedRoles && allowedRoles.includes('admin')) {
    if (userRole !== 'admin' || !adminAuthService.hasValidAdminSession()) {
      return <Navigate to="/admin/login" state={{ from: location, securityAlert: 'Admin authorization required.' }} replace />;
    }
    return children;
  }

  // Regular user (Donor / NGO): Must be approved by Central Admin
  if (userRole !== 'admin' && !isApproved) {
    return <Navigate to="/pending-approval" replace />;
  }

  // Role authorization check
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === 'donor') return <Navigate to="/donor" replace />;
    if (userRole === 'ngo') return <Navigate to="/ngo" replace />;
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
