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
};
