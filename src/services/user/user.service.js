// src/services/user.service.js
import { userApi } from "./user.api";

const normalizeRole = (roles = []) => {
  const first = (roles[0] || "")
    .toString()
    .replace(/^ROLE_/, "")
    .toUpperCase();
  if (["TEACHER", "STUDENT", "PARENT"].includes(first)) return first;
  return first || "STUDENT";
};

export const userService = {
  async list(params = {}) {
    const rawData = await userApi.list(params);
    const raw = Array.isArray(rawData?.content)
      ? rawData.content
      : rawData || [];

    // Chuẩn hoá shape cho UI
    return raw.map((u) => ({
      id: u.id,
      fullName: u.fullName || u.name || u.username || "",
      email: u.email || "",
      phone: u.phone || "",
      role: u.role || normalizeRole(u.roles || []), // "TEACHER" | "STUDENT" | "PARENT"
      active: typeof u.active === "boolean" ? u.active : false, // boolean
      joinDate: u.joinDate || u.createdAt || "", // nếu có
    }));
  },

  async createStudent(payload) {
    return userApi.create({ ...payload, role: "STUDENT" });
  },

  async createTeacher(payload) {
    return userApi.create({ ...payload, role: "TEACHER" });
  },

  async updateStatus(userId, active) {
    return userApi.updateStatus(userId, active);
  },
};
