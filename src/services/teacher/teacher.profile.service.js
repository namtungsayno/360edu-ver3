// src/services/teacher/teacher.profile.service.js
import { teacherProfileApi } from "./teacher.profile.api";

const KEY = "360edu.teacher.profile";

export const teacherProfileService = {
  async getProfile() {
    try {
      const profile = await teacherProfileApi.getMyProfile();
      // Cache to localStorage
      localStorage.setItem(KEY, JSON.stringify(profile));
      return profile;
    } catch (error) {
      // Fallback to cached data
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    }
  },

  async updateProfile(data) {
    try {
      const updated = await teacherProfileApi.updateMyProfile(data);
      // Update cache
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    } catch (error) {
      throw error;
    }
  },

  // Alias for updateProfile to match component expectations
  async saveProfile(data) {
    return this.updateProfile(data);
  },

  async uploadAvatar(base64Image) {
    try {
      const updated = await teacherProfileApi.updateMyProfile({
        avatarUrl: base64Image
      });
      // Update cache
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    } catch (error) {
      throw error;
    }
  },

  clearCache() {
    localStorage.removeItem(KEY);
  }
};
