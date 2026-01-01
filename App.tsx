/**
 * Main App Component
 * Handles authentication routing and role-based navigation via React Router
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Layout } from './components/Layout';
import { ProtectedRoute, PublicRoute } from './components/RouteGuards';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfilePage from './pages/ProfilePage';
import ReportView from './pages/ReportView';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProjects from './pages/admin/Projects';
import AdminUsers from './pages/admin/Users';
import AdminActivity from './pages/admin/Activity';

// Client Pages
import ClientDashboard from './pages/client/Dashboard';

const RootRedirect: React.FC = () => {
  const { isAdmin } = useAuth();
  return <Navigate to={isAdmin ? "/admin" : "/client"} replace />;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes (Login/Signup) - Redirects to dashboard if already logged in */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>

            {/* Protected Routes - Requires Login */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                {/* Common Routes */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/report/:id" element={<ReportView />} />
                
                {/* Root Redirect */}
                <Route path="/" element={<RootRedirect />} />

                {/* Admin Routes - Requires Admin Role */}
                <Route element={<ProtectedRoute requiredRole="admin" />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/projects" element={<AdminProjects />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/activity" element={<AdminActivity />} />
                </Route>

                {/* Client Routes - Requires Client Role */}
                <Route element={<ProtectedRoute requiredRole="client" />}>
                  <Route path="/client" element={<ClientDashboard />} />
                </Route>
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;