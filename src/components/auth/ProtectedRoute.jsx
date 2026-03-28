import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to a default page if user doesn't have the required role
    // For example, redirect to the portal selector or their appropriate portal
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'organizer') return <Navigate to="/organization" replace />;
    if (user.role === 'attendee') return <Navigate to="/attendee" replace />;
    
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
