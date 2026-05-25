import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

  // Se não há token ou role não é administrador, redireciona para login
  if (!token || userRole !== 'administrador') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
