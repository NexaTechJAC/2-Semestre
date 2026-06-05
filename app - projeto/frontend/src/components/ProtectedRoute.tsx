import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole");
  const mustChangePassword = localStorage.getItem("mustChangePassword") === "true";

  if (!token) {
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
