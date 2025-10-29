// src/services/classroom.service.js
// dùng http instance đã cấu hình (withCredentials, baseURL, interceptors, ...)
import { http } from "./http";

const BASE = "/rooms";

export const classroomService = {
  /** Lấy danh sách phòng học (lọc/tìm kiếm) */
  async list(params = {}) {
    const res = await http.get(BASE, { params });
    return res.data;
  },

  /** Tạo mới phòng học */
  async create(data) {
    const res = await http.post(BASE, data);
    return res.data;
  },

  /** Cập nhật thông tin phòng học */
  async update(id, data) {
    const res = await http.put(`${BASE}/${id}`, data);
    return res.data;
  },

  /** Kích hoạt (enable) phòng học */
  async enable(id) {
    return http.put(`${BASE}/${id}/enable`).then((r) => r.data);
  },

  /** Vô hiệu hóa (disable) phòng học */
  async disable(id) {
    return http.put(`${BASE}/${id}/disable`).then((r) => r.data);
  },
};
