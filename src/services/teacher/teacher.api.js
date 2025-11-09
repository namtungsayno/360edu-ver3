// src/services/teacher/teacher.api.js
import { http } from "../http";

/**
 * Teacher API endpoints
 */
export const teacherApi = {
  /**
   * Get list of teachers, optionally filtered by subject
   * @param {number|null} subjectId - Optional subject ID to filter
   * @returns {Promise<Array>} List of teachers
   */
  list(subjectId = null) {
    const params = subjectId ? { subjectId } : {};
    return http.get("/teachers", { params }).then((r) => r.data);
  },

  /**
   * Get teacher's busy slots in date range
   * @param {number} userId - User ID of the teacher
   * @param {string} from - Start datetime ISO string
   * @param {string} to - End datetime ISO string
   * @returns {Promise<Array>} List of busy slots
   */
  getFreeBusy(userId, from, to) {
    return http
      .get(`/teachers/${userId}/free-busy`, {
        params: { from, to },
      })
      .then((r) => r.data);
  },
};
