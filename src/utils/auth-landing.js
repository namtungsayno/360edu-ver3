// src/utils/auth-landing.js
export function landingPathByRoles(roles = []) {
  const r = roles.map((x) => String(x).toLowerCase());
  if (r.includes("admin")) return "/home/admin/dashboard";
  if (r.includes("teacher")) return "/home/teacher/management";
  if (r.includes("parent")) return "/home";
  if (r.includes("student")) return "/home";
  return "/home"; // fallback
}
