import React from "react";
import { Navigate } from "react-router";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps a route and redirects to /login if no JWT token is present.
 * Also clears stale data on 401 via the Axios interceptor in api.ts.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("qfse_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
