// src/services/student/student-profile.api.js
// Low-level API wrapper cho Student Profile

import { http } from "../http";

export const studentProfileApi = {
  /**
   * Get current student profile
   */
  getProfile: () => http.get("/students/profile").then((r) => r.data),

  /**
   * Update student profile
   * @param {Object} payload - { fullName, email, phoneNumber, dob, grade, school, avatarUrl }
   */
  updateProfile: (payload) =>
    http.put("/students/profile", payload).then((r) => r.data),

  /**
   * Upload avatar file
   * @param {File} file - Image file
   * @returns {Promise<{url: string}>}
   */
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return http
      .post("/students/profile/upload-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((r) => r.data);
  },

  /**
   * Change password
   * @param {Object} payload - { currentPassword, newPassword, confirmPassword }
   */
  changePassword: (payload) =>
    http.post("/students/profile/change-password", payload).then((r) => r.data),
};
