import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabase } from './SupabaseProvider';

// PUBLIC_INTERFACE
export function AuthGate({ children, adminOnly = false }) {
  /**
   * Protects routes: requires authenticated session; if adminOnly is true, requires profile.is_admin.
   * Redirects to /login if not authorized.
   */
  const { session, profile, loading } = useSupabase();
  const location = useLocation();

  if (loading) return <div className="card">Loading...</div>;
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;

  if (adminOnly && !profile?.is_admin) {
    return <div className="card">You do not have permission to view this page.</div>;
  }
  return <>{children}</>;
}
