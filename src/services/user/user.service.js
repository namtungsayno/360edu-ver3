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
      phone: u.phoneNumber || "", // ✅ Backend trả về phoneNumber
      role: u.role || normalizeRole(u.roles || []), // "TEACHER" | "STUDENT" | "PARENT"
      active: typeof u.active === "boolean" ? u.active : false, // boolean
      joinDate: u.joinDate || u.createdAt || "", // nếu có
    }));
  },

  // ✅ tạo giáo viên đúng luồng auth (khác với create generic)
  async createTeacher(payload) {
    return userApi.createTeacher(payload);
  },

  async updateStatus(userId, active) {
    return userApi.updateStatus(userId, active);
  },

  //  // (tuỳ chọn) dùng khi form edit người dùng
  // async update(userId, data) {
  //   return userApi.update(userId, data);
  // },
};
