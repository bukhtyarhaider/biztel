import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { Button } from './ui/Button';
import { GlobalLoader } from './ui/GlobalLoader';

export const ProtectedRoute: React.FC<{ requiredRole?: 'admin' | 'client' }> = ({ requiredRole }) => {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return <GlobalLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Handle case where user is logged in but profile is missing
  // This prevents infinite loops if data is inconsistent
  // Removed explicit error UI as per user request, will render Outlet but potentially with missing data
  
  if (requiredRole && profile && profile.role !== requiredRole) {
    // Redirect to appropriate dashboard if role doesn't match
    // Check current role to avoid redirect loop to same page
    const target = profile.role === 'admin' ? '/admin' : '/client';
    
    // Only redirect if valid role exists
    if (profile.role === 'admin' || profile.role === 'client') {
       return <Navigate to={target} replace />;
    }
    
    // Fallback?
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export const PublicRoute: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <GlobalLoader />;
  }

  if (user && profile) {
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/client'} replace />;
  }

  return <Outlet />;
};
