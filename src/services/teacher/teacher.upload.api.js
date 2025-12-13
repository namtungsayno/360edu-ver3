// src/services/teacher/teacher.upload.api.js
import { http } from "../http";

export const teacherUploadApi = {
  /**
   * Upload avatar file to server
   * @param {File} file - Image file to upload
   * @returns {Promise<string>} - URL of uploaded image
   */
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await http.post("/teachers/profile/upload-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data; // Expected: { url: "https://..." } or just the URL string
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete avatar from server
   * @param {string} avatarUrl - URL of avatar to delete
   * @returns {Promise<void>}
   */
  async deleteAvatar(avatarUrl) {
    try {
      await http.delete("/teachers/profile/avatar", {
        params: { url: avatarUrl },
      });
    } catch (error) {
      throw error;
    }
  },
};
