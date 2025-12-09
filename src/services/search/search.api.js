// src/services/search/search.api.js
import { http } from "../http";

/**
 * API Service cho tính năng tìm kiếm tổng hợp
 */
export const searchApi = {
  /**
   * Tìm kiếm tổng hợp - trả về kết quả từ nhiều nguồn
   * @param {string} query - Từ khóa tìm kiếm
   * @param {number} limit - Số lượng kết quả tối đa mỗi loại (mặc định 5)
   * @returns {Promise<{query: string, classes: Array, teachers: Array, subjects: Array, totalResults: number}>}
   */
  globalSearch: (query, limit = 5) =>
    http.get("/search", { params: { q: query, limit } }).then((r) => r.data),

  /**
   * Tìm kiếm lớp học
   * @param {string} query - Từ khóa tìm kiếm
   * @param {number} page - Số trang
   * @param {number} size - Kích thước trang
   */
  searchClasses: (query, page = 0, size = 10) =>
    http.get("/search/classes", { params: { q: query, page, size } }).then((r) => r.data),

  /**
   * Tìm kiếm giáo viên
   * @param {string} query - Từ khóa tìm kiếm
   * @param {number} page - Số trang
   * @param {number} size - Kích thước trang
   */
  searchTeachers: (query, page = 0, size = 10) =>
    http.get("/search/teachers", { params: { q: query, page, size } }).then((r) => r.data),

  /**
   * Tìm kiếm môn học
   * @param {string} query - Từ khóa tìm kiếm
   * @param {number} page - Số trang
   * @param {number} size - Kích thước trang
   */
  searchSubjects: (query, page = 0, size = 10) =>
    http.get("/search/subjects", { params: { q: query, page, size } }).then((r) => r.data),
};
