// src/services/teacher/teacher.security.api.js
// New API for teacher security operations (kept separate from existing profile API)

import { http } from "../http";

export const teacherSecurityApi = {
  /**
   * Change password for current teacher
   * @param {{currentPassword:string,newPassword:string,confirmPassword:string}} payload
   */
  changePassword: (payload) =>
    http.post("/teachers/profile/change-password", payload).then((r) => r.data),
};
