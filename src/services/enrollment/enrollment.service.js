import { enrollmentApi } from "./enrollment.api";

export const enrollmentService = {
  async selfEnroll(classId) {
    return enrollmentApi.selfEnroll(classId);
  },
  async listStudentsByClass(classId) {
    return enrollmentApi.listStudents(classId);
  },
};
