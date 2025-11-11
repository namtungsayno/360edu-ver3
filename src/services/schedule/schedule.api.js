// src/services/schedule/schedule.api.js
// API layer for schedule management
// Backend endpoints:
//   GET /api/semesters - Get all semesters
//   GET /api/timeslots - Get all time slots
//   GET /api/classes - Get classes (with optional filters)
//   GET /api/teachers - Get teachers

import { http } from "../http";

export const scheduleApi = {
  /**
   * Fetch all semesters
   * @returns {Promise<Array>} list of semesters {id, name, startDate, endDate, status}
   */
  getSemesters() {
    return http.get("/semesters").then((r) => r.data);
  },

  /**
   * Fetch all time slots
   * @returns {Promise<Array>} list of slots {id, startTime, endTime}
   */
  getTimeSlots() {
    return http.get("/timeslots").then((r) => r.data);
  },

  /**
   * Fetch classes with optional filters
   * @param {Object} params - Optional filters {teacherUserId, timeSlotId}
   * @returns {Promise<Array>} list of classes with detailed info
   */
  getClasses(params = {}) {
    return http.get("/classes", { params }).then((r) => r.data);
  },

  /**
   * Fetch all teachers
   * @param {Object} params - Optional filters {subjectId}
   * @returns {Promise<Array>} list of teachers
   */
  getTeachers(params = {}) {
    return http.get("/teachers", { params }).then((r) => r.data);
  },

  /**
   * Fetch teacher busy slots (for schedule visualization)
   * @param {number} teacherUserId - User ID of the teacher
   * @param {string} from - Start date in ISO format
   * @param {string} to - End date in ISO format
   * @returns {Promise<Array>} busy slots list
   */
  getTeacherBusySlots(teacherUserId, from, to) {
    return http.get(`/teachers/${teacherUserId}/free-busy`, {
      params: { from, to }
    }).then((r) => r.data);
  },

  /**
   * Fetch attendance data for a class
   * @param {number} classId
   * @returns {Promise<Array>} attendance list
   */
  getAttendance(classId) {
    return http.get(`/classes/${classId}/attendance`).then((r) => r.data);
  },
};
