// src/services/parent/parent.api.js
import { http } from "../http";

export const parentApi = {
  /**
   * Get parent dashboard data
   */
  getDashboardData: () => http.get("/parent/dashboard").then((r) => r.data),

  /**
   * Get list of children
   */
  getChildren: () => http.get("/parent/children").then((r) => r.data),

  /**
   * Get child attendance records
   * @param {number} childId
   * @param {number} month - 1-12
   * @param {number} year
   */
  getChildAttendance: (childId, month, year) =>
    http
      .get(`/parent/children/${childId}/attendance`, {
        params: { month, year },
      })
      .then((r) => r.data),

  /**
   * Get child schedule
   * @param {number} childId
   * @param {string} startDate - YYYY-MM-DD
   * @param {string} endDate - YYYY-MM-DD
   */
  getChildSchedule: (childId, startDate, endDate) =>
    http
      .get(`/parent/children/${childId}/schedule`, {
        params: { startDate, endDate },
      })
      .then((r) => r.data),

  /**
   * Get child classes
   * @param {number} childId
   */
  getChildClasses: (childId) =>
    http.get(`/parent/children/${childId}/classes`).then((r) => r.data),

  /**
   * Get class detail for parent
   * @param {number} classId
   */
  getClassDetail: (classId) =>
    http.get(`/parent/classes/${classId}`).then((r) => r.data),

  /**
   * Get session detail with attendance
   * @param {number} sessionId
   */
  getSessionDetail: (sessionId) =>
    http.get(`/parent/sessions/${sessionId}`).then((r) => r.data),

  /**
   * Get parent notifications
   * @param {Object} params - { filter, childId, page, size }
   */
  getNotifications: (params = {}) =>
    http.get("/parent/notifications", { params }).then((r) => r.data),

  /**
   * Mark notification as read
   * @param {number} notificationId
   */
  markNotificationAsRead: (notificationId) =>
    http
      .put(`/parent/notifications/${notificationId}/read`)
      .then((r) => r.data),

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead: () =>
    http.put("/parent/notifications/read-all").then((r) => r.data),

  /**
   * Get payment history
   * @param {Object} params - { childId, status, page, size }
   */
  getPaymentHistory: (params = {}) =>
    http.get("/parent/payment-history", { params }).then((r) => r.data),

  /**
   * Get parent profile
   */
  getProfile: () => http.get("/parent/profile").then((r) => r.data),

  /**
   * Update parent profile
   * @param {Object} profileData
   */
  updateProfile: (profileData) =>
    http.put("/parent/profile", profileData).then((r) => r.data),
};
