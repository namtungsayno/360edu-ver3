// src/services/user.service.js
import { http } from "./http";

const normalizeRole = (roles = []) => {
  const first = (roles[0] || "")
    .toString()
    .replace(/^ROLE_/, "")
    .toUpperCase();
  // map về ba role mà UI đang dùng
  if (["TEACHER", "STUDENT", "PARENT"].includes(first)) return first;
  return first || "STUDENT"; // mặc định nếu BE chưa gán
};

export const userService = {
  async list(params = {}) {
    const res = await http.get("/users", { params });
    const raw = Array.isArray(res.data?.content)
      ? res.data.content
      : res.data || [];
    // Chuẩn hoá cho UI
    const list = raw.map((u) => ({
      id: u.id,
      fullName: u.fullName || u.name || u.username || "", // BE chưa có => dùng username tạm
      email: u.email || "",
      phone: u.phone || "",
      role: u.role || normalizeRole(u.roles || []),
      active: typeof u.active === "boolean" ? u.active : false,
    }));
    return list;
  },

  async createStudent(payload) {
    const body = { ...payload, role: "STUDENT" };
    const res = await http.post("/users", body);
    return res.data;
  },

  async createTeacher(payload) {
    const body = { ...payload, role: "TEACHER" };
    const res = await http.post("/users", body);
    return res.data;
  },

  async updateStatus(userId, active) {
    const res = await http.patch(`/users/${userId}/status`, { active });
    return res.data;
  },
};
