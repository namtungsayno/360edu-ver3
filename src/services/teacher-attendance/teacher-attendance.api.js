// src/services/teacher-attendance/teacher-attendance.api.js
// API layer for Teacher Attendance Management (Admin)

import { http } from "../http";

export const teacherAttendanceApi = {
  /**
   * Lấy danh sách giáo viên với thống kê chấm công (có phân trang)
   * @param {Object} params - { search, page, size }
   */
  getAllTeachers: (params = {}) =>
    http.get("/teacher-attendance/teachers", { params }).then((r) => r.data),

  /**
   * Lấy thống kê chi tiết chấm công của một giáo viên
   * @param {number} teacherId - ID của giáo viên
   * @param {Object} params - { month, year } (optional)
   */
  getTeacherSummary: (teacherId, params = {}) =>
    http
      .get(`/teacher-attendance/teachers/${teacherId}/summary`, { params })
      .then((r) => r.data),

  /**
   * Lấy chi tiết chấm công theo lớp của giáo viên
   * @param {number} teacherId - ID của giáo viên
   * @param {number} classId - ID của lớp
   */
  getTeacherClassAttendance: (teacherId, classId) =>
    http
      .get(`/teacher-attendance/teachers/${teacherId}/classes/${classId}`)
      .then((r) => r.data),
};
