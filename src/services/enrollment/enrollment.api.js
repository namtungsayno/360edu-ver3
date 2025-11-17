import { http } from "../http";

export const enrollmentApi = {
  selfEnroll: (classId) => http.post(`/classes/${classId}/enrollments/self`).then(r => r.data),
};
