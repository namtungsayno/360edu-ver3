// src/utils/RouteGuards.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { landingPathByRoles } from "./auth-landing";

function normalizeRole(role) {
  const r = String(role).toLowerCase();
  return r.replace(/^role[_ ]/, "");
}

// Loading spinner component để tránh flash content
function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Chỉ cho khách chưa login truy cập
export function GuestOnly() {
  const { user, loading } = useAuth();
  const _loc = useLocation();
  if (loading) return <AuthLoading />;
  if (user) return <Navigate to={landingPathByRoles(user.roles)} replace />;
  return <Outlet />;
}

// Chỉ cho người đã đăng nhập truy cập
export function RequireAuth() {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <AuthLoading />;
  if (!user) return <Navigate to="/home/login" replace state={{ from: loc }} />;
  return <Outlet />;
}

// ✅ CHÚ Ý: export đúng tên RequireRole
export function RequireRole({ allow = [] }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <AuthLoading />;
  if (!user) return <Navigate to="/home/login" replace state={{ from: loc }} />;
  const normalizedAllow = allow.map((a) => normalizeRole(a));
  const ok = user.roles?.some((r) => normalizedAllow.includes(normalizeRole(r)));
  if (!ok) return <Navigate to={landingPathByRoles(user.roles)} replace />;
  return <Outlet />;
}
