// src/services/teacher/teacher.profile.api.js
import { http } from "../http";

export const teacherProfileApi = {
  getMyProfile() {
    return http.get("/teachers/profile").then((r) => r.data);
  },
  updateMyProfile(data) {
    return http.put("/teachers/profile", data).then((r) => r.data);
  },
};
