// src/services/user/user.api.js
import { http } from "../http";

/**
 * Chỉ làm nhiệm vụ gọi HTTP và trả về r.data (không xử lý/normalize)
 */
export const userApi = {
  list(params = {}) {
    return http.get("/users", { params }).then((r) => r.data);
  },

  create(payload) {
    return http.post("/users", payload).then((r) => r.data);
  },

  updateStatus(userId, active) {
    return http
      .patch(`/users/${userId}/status`, { active })
      .then((r) => r.data);
  },

  // ✅ Tạo giáo viên đúng endpoint BE /api/auth/register-teacher
  // Lưu ý: BE nhận "phoneNumber" và bắt buộc "subjectId"
  createTeacher({ fullName, email, phone, subjectIds }) {
    const payload = {
      fullName,
      email,
      phoneNumber: phone,
      subjectIds,
    };
    return http.post("/auth/register-teacher", payload).then((r) => r.data);
  },

  //  // (tuỳ chọn) cập nhật user cơ bản nếu bạn cần edit trong form
  // update(userId, data) {
  //   return http.put(`/users/${userId}`, data).then((r) => r.data);
  // },
};
