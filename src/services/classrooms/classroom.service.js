// src/services/classroom.service.js
// Service layer — xử lý logic, gọi đến classroomApi
import { classroomApi } from "./classroom.api";

export const classroomService = {
  /** Lấy danh sách phòng học (lọc/tìm kiếm, phân trang, v.v.) */
  async list(params = {}) {
    const data = await classroomApi.list(params);
    return Array.isArray(data?.content) ? data.content : data;
  },

  /** Tạo mới phòng học */
  async create(payload) {
    return classroomApi.create(payload);
  },

  /** Cập nhật thông tin phòng học */
  async update(id, payload) {
    return classroomApi.update(id, payload);
  },

  /** Kích hoạt (enable) phòng học */
  async enable(id) {
    return classroomApi.enable(id);
  },

  /** Vô hiệu hóa (disable) phòng học */
  async disable(id) {
    return classroomApi.disable(id);
  },
};
