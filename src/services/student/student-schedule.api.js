// src/services/student/student-schedule.api.js
// API layer cho Student Schedule

import { axiosInstance } from "../../config/axios.config";

export const studentScheduleApi = {
  /**
   * Get student schedule by date
   * @param {string} date - Format: yyyy-MM-dd (optional, default today)
   * @returns {Promise<Array>} - Array of StudentScheduleItemResponse
   */
  async getScheduleByDate(date) {
    const params = date ? { date } : {};
    const response = await axiosInstance.get("/api/my-schedule/day", { params });
    return response.data;
  },

  /**
   * Get student schedule by week
   * @param {string} weekStart - Format: yyyy-MM-dd (optional, default current week start)
   * @returns {Promise<Array>} - Array of StudentScheduleItemResponse
   */
  async getScheduleByWeek(weekStart) {
    const params = weekStart ? { weekStart } : {};
    const response = await axiosInstance.get("/api/my-schedule/week", { params });
    return response.data;
  }
};