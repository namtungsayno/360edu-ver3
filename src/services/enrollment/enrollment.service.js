import { enrollmentApi } from "./enrollment.api";

export const enrollmentService = {
  async selfEnroll(classId) {
    return enrollmentApi.selfEnroll(classId);
  },
  async listStudentsByClass(classId) {
    return enrollmentApi.listStudents(classId);
  },
  async listMyClasses() {
    try {
      return await enrollmentApi.listMyClasses();
    } catch (err) {
      throw err;
    }
  },
  /**
   * Lấy tất cả các buổi học của một lớp kèm nội dung bài học
   * @param {number} classId - ID của lớp học
   * @returns {Promise<Array>} Danh sách sessions với lesson content
   */
  async getClassSessions(classId) {
    try {
      return await enrollmentApi.getClassSessions(classId);
    } catch (err) {
      throw err;
    }
  },
};
