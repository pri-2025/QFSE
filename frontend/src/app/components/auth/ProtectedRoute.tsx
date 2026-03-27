import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

interface Props {
  children: ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const token = localStorage.getItem("qfse_token");
  const userStr = localStorage.getItem("qfse_user");
  const location = useLocation();

  if (!token || !userStr) {
    // Not logged in, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  let user;
  try {
    user = JSON.parse(userStr);
  } catch {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but not authorized
    const fallback = user.role === "ADMIN" ? "/admin/dashboard" : "/customer/home";
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}

export function RoleBasedRedirect() {
  const userStr = localStorage.getItem("qfse_user");
  if (!userStr) return <Navigate to="/login" replace />;

  try {
    const user = JSON.parse(userStr);
    if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "CUSTOMER") return <Navigate to="/customer/home" replace />;
  } catch {}

  return <Navigate to="/login" replace />;
}
