// src/utils/RouteGuards.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { landingPathByRoles } from "./auth-landing";

// Chỉ cho khách chưa login truy cập
export function GuestOnly() {
  const { user, loading } = useAuth();
  const _loc = useLocation();
  if (loading) return null;
  if (user) return <Navigate to={landingPathByRoles(user.roles)} replace />;
  return <Outlet />;
}

// Chỉ cho người đã đăng nhập truy cập
export function RequireAuth() {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/home/login" replace state={{ from: loc }} />;
  return <Outlet />;
}

// ✅ CHÚ Ý: export đúng tên RequireRole
export function RequireRole({ allow = [] }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/home/login" replace state={{ from: loc }} />;
  const ok = user.roles?.some((r) => allow.includes(String(r).toLowerCase()));
  if (!ok) return <Navigate to={landingPathByRoles(user.roles)} replace />;
  return <Outlet />;
}
