// src/components/ProtectedRoute.jsx
// Layout-route guard: renders its nested routes only when the simulated
// session is authenticated, otherwise redirects to /login and remembers the
// page the user was headed to so Login can send them back after signing in.

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
