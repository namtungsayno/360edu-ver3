// src/services/schedule/schedule.api.js
// API layer for schedule management
// Backend endpoints:
//   GET /api/semesters - Get all semesters
//   GET /api/slots - Get all time slots
//   GET /api/classes?semesterId=x - Get classes by semester
//   GET /api/class-schedules?semesterId=x - Get class schedules by semester

import { http } from "../http";

export const scheduleApi = {
  /**
   * Fetch all semesters
   * @returns {Promise<Array>} list of semesters {id, name, startDate, endDate}
   */
  getSemesters() {
    return http.get("/api/semesters").then((r) => r.data);
  },

  /**
   * Fetch all time slots
   * @returns {Promise<Array>} list of slots {id, code, startTime, endTime}
   */
  getSlots() {
    return http.get("/api/slots").then((r) => r.data);
  },

  /**
   * Fetch classes by semester
   * @param {number} semesterId
   * @returns {Promise<Array>} list of classes {id, name, code, semesterId}
   */
  getClasses(semesterId) {
    return http.get("/api/classes", { params: { semesterId } }).then((r) => r.data);
  },

  /**
   * Fetch class schedules by semester
   * @param {number} semesterId
   * @returns {Promise<Array>} list of class schedules {id, classId, slotId, dayOfWeek, startTime, endTime}
   */
  getClassSchedules(semesterId) {
    return http.get("/api/class-schedules", { params: { semesterId } }).then((r) => r.data);
  },

  /**
   * Fetch attendance records for a class schedule
   * @param {number} scheduleId
   * @returns {Promise<Array>} attendance list
   */
  getAttendance(scheduleId) {
    return http
      .get(`/api/class-schedules/${scheduleId}/attendance`)
      .then((r) => r.data)
      .catch(() => []); // Return empty if endpoint doesn't exist yet
  },
};
