import React from 'react';
import { useAuth } from '../core/auth';
import Login from '../components/Login';

const ProtectedRoute = ({ children }) => {
  const { user, login } = useAuth();

  if (!user) {
    return <Login onLogin={login} />;
  }

  return children;
};

export default ProtectedRoute;