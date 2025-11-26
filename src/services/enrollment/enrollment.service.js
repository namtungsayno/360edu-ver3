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
      console.error("❌ [EnrollmentService] listMyClasses error:", err);
      throw err;
    }
  },
};
