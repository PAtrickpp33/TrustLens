import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSessionStore } from '@/store/session';

type ProtectedRouteProps = {
  children: React.ReactElement;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = useSessionStore((s) => Boolean(s.accessToken));

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};


