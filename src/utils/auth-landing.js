// src/utils/auth-landing.js
function normalizeRole(role) {
  const r = String(role).toLowerCase();
  // Hỗ trợ cả định dạng có tiền tố như ROLE_STUDENT / role_student
  return r.replace(/^role[_ ]/, "");
}

export function landingPathByRoles(roles = []) {
  const r = roles.map(normalizeRole);
  if (r.includes("admin")) return "/home/admin/dashboard";
  if (r.includes("teacher")) return "/home/teacher/management";
  if (r.includes("student")) return "/home/my-classes";
  if (r.includes("parent")) return "/home/parent/dashboard";
  return "/home"; // fallback
}
