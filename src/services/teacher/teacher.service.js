// src/services/teacher/teacher.service.js
import { teacherApi } from "./teacher.api";

/**
 * Teacher service - business logic layer
 */
export const teacherService = {
  /**
   * Get list of teachers, optionally filtered by subject
   * @param {number|null} subjectId - Optional subject ID
   * @returns {Promise<Array>} List of teachers
   */
  async list(subjectId = null) {
    return await teacherApi.list(subjectId);
  },

  /**
   * Get teacher's busy schedule
   * @param {number} userId - User ID of the teacher
   * @param {string} from - Start datetime ISO string
   * @param {string} to - End datetime ISO string
   * @returns {Promise<Array>} List of busy slots
   */
  async getFreeBusy(userId, from, to) {
    return await teacherApi.getFreeBusy(userId, from, to);
  },

  /**
   * Get a teacher by userId (used to verify classCount before disabling)
   */
  async getByUserId(userId) {
    return await teacherApi.getByUserId(userId);
  },
};
