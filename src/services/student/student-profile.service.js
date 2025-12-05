// src/services/student/student-profile.service.js
// Business layer cho Student Profile

import { studentProfileApi } from "./student-profile.api";

export const studentProfileService = {
  /**
   * Get current student profile including parent info
   */
  async getProfile() {
    return studentProfileApi.getProfile();
  },

  /**
   * Update student profile
   * @param {Object} data - Profile data to update
   */
  async updateProfile(data) {
    return studentProfileApi.updateProfile(data);
  },

  /**
   * Upload avatar image
   * @param {File} file - Image file to upload
   * @returns {Promise<{url: string}>}
   */
  async uploadAvatar(file) {
    // Validate file before upload
    if (!file) {
      throw new Error("No file provided");
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("File size exceeds 5MB limit");
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Invalid file type. Only JPEG, PNG, GIF, WEBP allowed");
    }

    return studentProfileApi.uploadAvatar(file);
  },

  /**
   * Change password
   * @param {Object} data - { currentPassword, newPassword, confirmPassword }
   */
  async changePassword(data) {
    if (!data.currentPassword) {
      throw new Error("Current password is required");
    }
    if (!data.newPassword) {
      throw new Error("New password is required");
    }
    if (data.newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters");
    }
    if (data.newPassword !== data.confirmPassword) {
      throw new Error("New password and confirmation do not match");
    }

    return studentProfileApi.changePassword(data);
  },
};
