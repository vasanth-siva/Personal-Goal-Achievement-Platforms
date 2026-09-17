import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    const origin = location.state?.from?.pathname && location.state?.from?.pathname !== '/' ? location.state.from.pathname : '/dashboard';
    return <Navigate to={origin} replace />;
  }

  return children;
}

export default PublicRoute;
