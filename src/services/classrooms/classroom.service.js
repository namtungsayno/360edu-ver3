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

  /**
   * ✅ THÊM MỚI: Tìm kiếm phòng học theo keyword và type
   * Wrapper cho classroomApi.search() với business logic nếu cần
   *
   * @param {string} keyword - Từ khóa tìm kiếm
   * @param {string} type - Loại phòng: "OFFLINE" hoặc "ONLINE"
   * @returns {Promise<Array>} - Danh sách phòng học
   */
  async search(keyword = "", type = "OFFLINE") {
    return classroomApi.search(keyword, type);
  },

  /**
   * ✅ THÊM MỚI: Lấy thông tin lịch rảnh/bận của phòng học
   * Wrapper cho classroomApi.freeBusy() với business logic nếu cần
   *
   * @param {number|string} id - ID của phòng học
   * @param {string} fromISO - Thời gian bắt đầu (ISO format)
   * @param {string} toISO - Thời gian kết thúc (ISO format)
   * @returns {Promise<Object>} - Thông tin lịch rảnh/bận
   */
  async getFreeBusy(id, fromISO, toISO) {
    return classroomApi.freeBusy(id, fromISO, toISO);
  },
};
