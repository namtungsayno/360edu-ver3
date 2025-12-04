import { http } from "../http";

export const enrollmentApi = {
  selfEnroll: (classId) =>
    http.post(`/classes/${classId}/enrollments/self`).then((r) => r.data),
  // Admin/Teacher: list students enrolled in a class
  listStudents: (classId) =>
    http.get(`/classes/${classId}/enrollments`).then((r) => r.data),
  // Student: list classes the current student enrolled
  listMyClasses: () =>
    http
      .get(`/enrollments/me/classes`)
      .then((r) => r.data)
      .catch((err) => {
        console.error("❌ [EnrollmentAPI] GET /enrollments/me/classes failed:", err);
        throw err;
      }),
  // Student: get all sessions of a class with lesson content
  getClassSessions: (classId) =>
    http
      .get(`/enrollments/me/classes/${classId}/sessions`)
      .then((r) => r.data)
      .catch((err) => {
        console.error("❌ [EnrollmentAPI] GET class sessions failed:", err);
        throw err;
      }),
};
