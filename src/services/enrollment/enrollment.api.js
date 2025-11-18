import { http } from "../http";

export const enrollmentApi = {
  selfEnroll: (classId) =>
    http.post(`/classes/${classId}/enrollments/self`).then((r) => r.data),
  // Admin/Teacher: list students enrolled in a class
  listStudents: (classId) =>
    http.get(`/classes/${classId}/enrollments`).then((r) => r.data),
};
