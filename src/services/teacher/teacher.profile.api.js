// src/services/teacher/teacher.profile.api.js
import { http } from "../http";

export const teacherProfileApi = {
  getMyProfile() {
    return http.get("/teacher/profile/me").then((r) => r.data);
  },
  saveMyProfile(data) {
    return http.post("/teacher/profile", data).then((r) => r.data);
  },
};
