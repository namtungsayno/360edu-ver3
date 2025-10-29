// src/services/user.service.js
import { http } from "./http";

/**
 * Tùy backend của bạn, đổi path nếu khác:
 * - Lấy users:        GET /users
 * - Tạo user:         POST /users  (body: {..., role: 'STUDENT' | 'TEACHER'})
 * - Cập nhật trạng thái: PATCH /users/{id}/status (body: { active: boolean })
 */
export const userService = {
  async list(params = {}) {
    // params: { q, role, status, page, size } nếu backend hỗ trợ
    const res = await http.get("/users", { params });
    // Chuẩn hóa tối thiểu cho UI
    return Array.isArray(res.data?.content) ? res.data.content : res.data || [];
  },

  async createStudent(payload) {
    // gợi ý body tối thiểu; chỉnh theo BE
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
