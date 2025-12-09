// src/services/teacher-attendance/teacher-attendance.service.js
// Business logic layer for Teacher Attendance Management

import { teacherAttendanceApi } from "./teacher-attendance.api";

export const teacherAttendanceService = {
  /**
   * Lấy danh sách giáo viên với thống kê chấm công (có phân trang)
   * @param {Object} params - { search, page, size }
   */
  async getTeacherList(params = {}) {
    return teacherAttendanceApi.getAllTeachers(params);
  },

  /**
   * Lấy thống kê chi tiết của một giáo viên
   */
  async getTeacherSummary(teacherId, month, year) {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    return teacherAttendanceApi.getTeacherSummary(teacherId, params);
  },

  /**
   * Lấy chi tiết chấm công theo lớp
   */
  async getTeacherClassAttendance(teacherId, classId) {
    return teacherAttendanceApi.getTeacherClassAttendance(teacherId, classId);
  },

  /**
   * Helper: Format attendance rate
   */
  formatAttendanceRate(rate) {
    if (rate == null) return "0%";
    return `${rate.toFixed(1)}%`;
  },

  /**
   * Helper: Get status color based on rate
   */
  getStatusColor(rate) {
    if (rate >= 90) return "green";
    if (rate >= 70) return "yellow";
    if (rate >= 50) return "orange";
    return "red";
  },
};
