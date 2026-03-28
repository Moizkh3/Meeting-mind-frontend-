import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based redirection
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  if (user.role === 'organizer') {
    return <Navigate to="/organization/dashboard" replace />;
  }
  
  if (user.role === 'attendee' || user.role === 'scribe') {
    return <Navigate to="/attendee/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default RootRedirect;
