import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  perfisPermitidos?: string[];
}

export default function ProtectedRoute({
  children,
  perfisPermitidos = ["administrador", "secretaria"],
}: ProtectedRouteProps) {
  const token = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole");

  if (!token || !userRole) {
    return <Navigate to="/login" replace />;
  }

  if (!perfisPermitidos.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  if (mustChangePassword) {
    return <Navigate to="/trocar-senha" replace />;
  }

  if (userRole !== "administrador") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}