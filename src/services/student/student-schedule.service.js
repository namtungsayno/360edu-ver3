// src/services/student/student-schedule.service.js
// Business layer cho Student Schedule

import { studentScheduleApi } from "./student-schedule.api";

export const studentScheduleService = {
  /**
   * Get student schedule for a specific date
   * @param {string} date - Format: yyyy-MM-dd (optional)
   * @returns {Promise<Array>} - Formatted schedule data
   */
  async getScheduleByDate(date) {
    try {
      const data = await studentScheduleApi.getScheduleByDate(date);
      // Handle both array and object response
      const scheduleArray = Array.isArray(data) ? data : (data.data || []);
      return scheduleArray.map(item => ({
        ...item,
        // Add formatted time display
        timeDisplay: `${item.timeStart?.slice(0, 5)} - ${item.timeEnd?.slice(0, 5)}`,
        // Add formatted date display
        dateDisplay: formatDate(item.date)
      }));
    } catch (error) {
      console.error("Error fetching daily schedule:", error);
      throw new Error(error.response?.data?.message || "Không thể tải lịch học");
    }
  },

  /**
   * Get student schedule for a week
   * @param {string} weekStart - Format: yyyy-MM-dd (optional)
   * @returns {Promise<Array>} - Formatted schedule data
   */
  async getScheduleByWeek(weekStart) {
    try {
      const data = await studentScheduleApi.getScheduleByWeek(weekStart);
      // Handle both array and object response
      const scheduleArray = Array.isArray(data) ? data : (data.data || []);
      return scheduleArray.map(item => ({
        ...item,
        // Add formatted time display
        timeDisplay: `${item.timeStart?.slice(0, 5)} - ${item.timeEnd?.slice(0, 5)}`,
        // Add formatted date display
        dateDisplay: formatDate(item.date),
        // Add day of week
        dayOfWeek: getDayOfWeek(item.date)
      }));
    } catch (error) {
      console.error("Error fetching weekly schedule:", error);
      throw new Error(error.response?.data?.message || "Không thể tải lịch học");
    }
  }
};

// Helper functions
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function getDayOfWeek(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
  return days[date.getDay()];
}