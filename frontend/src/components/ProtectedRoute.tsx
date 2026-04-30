import { Navigate, Outlet, useLocation } from "react-router-dom";

import { LoadingState } from "./LoadingState";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingState label="Checking session" />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/not-authorized" replace />;
  return <Outlet />;
}
