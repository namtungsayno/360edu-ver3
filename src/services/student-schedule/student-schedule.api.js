import { http } from "../http";

export const studentScheduleApi = {
  /**
   * Lấy lịch học của học sinh theo tuần
   * @param {string} weekStart - Ngày bắt đầu tuần (YYYY-MM-DD format)
   * @returns {Promise<Array>} Danh sách lịch học
   */
  getWeeklySchedule: (weekStart) => 
    http.get(`/enrollments/me/schedule/week?weekStart=${weekStart}`)
      .then(response => response.data)
      .catch(error => {
        throw error;
      }),
};