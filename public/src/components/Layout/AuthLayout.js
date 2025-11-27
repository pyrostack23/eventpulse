import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthLayout.css';

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  // Redirect to home if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-layout">
      <div className="auth-background">
        <div className="auth-gradient"></div>
        <div className="auth-pattern"></div>
      </div>
      
      <div className="auth-content">
        <div className="auth-brand">
          <h1 className="auth-logo">EventPulse</h1>
          <p className="auth-tagline">School Event Intelligence Platform</p>
        </div>
        
        <div className="auth-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
