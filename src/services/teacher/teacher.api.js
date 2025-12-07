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
   * GET /teachers/paginated - Lấy teachers với phân trang từ server
   * @param {Object} params - { search, subjectId, page, size, sortBy, order }
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number, ...}>}
   */
  listPaginated(params = {}) {
    const {
      search = "",
      subjectId = null,
      page = 0,
      size = 10,
      sortBy = "id",
      order = "asc",
    } = params;
    const queryParams = { search, page, size, sortBy, order };
    if (subjectId) queryParams.subjectId = subjectId;
    return http
      .get("/teachers/paginated", { params: queryParams })
      .then((r) => r.data);
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

  /**
   * Get a teacher by associated userId (includes classCount)
   */
  getByUserId(userId) {
    return http.get(`/teachers/by-user/${userId}`).then((r) => r.data);
  },

  /**
   * Get subjects taught by a teacher via teacher_id
   * @param {number} teacherId
   * @returns {Promise<Array>} subjects array
   */
  getSubjects(teacherId) {
    return http.get(`/teachers/${teacherId}/subjects`).then((r) => r.data);
  },

  /**
   * Update primary subject via teacher_id
   * @param {number} teacherId
   * @param {number} subjectId
   * @returns {Promise<Object>} SubjectResponse or error payload
   */
  updatePrimarySubject(teacherId, subjectId) {
    return http
      .put(`/teachers/${teacherId}/primary-subject`, { subjectId })
      .then((r) => r.data);
  },

  /**
   * Get teacher profile by teacher ID
   * @param {number} userId - User ID of the teacher
   * @returns {Promise<Object>} Teacher profile with full details
   */
  getProfile(userId) {
    return http.get(`/teachers/by-user/${userId}/profile`).then((r) => r.data);
  },

  /**
   * Update subjects a teacher teaches
   * @param {number} teacherId
   * @param {number[]} subjectIds
   * @returns {Promise<Object>} Updated teacher
   */
  updateSubjects(teacherId, subjectIds) {
    return http
      .put(`/teachers/${teacherId}/subjects`, { subjectIds })
      .then((r) => r.data);
  },
};
