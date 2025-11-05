// src/services/teacher/teacher.profile.service.js
import { teacherProfileApi } from "./teacher.profile.api";

const KEY = "360edu.teacher.profile";

export const teacherProfileService = {
  async getMyProfile() {
    try {
      return await teacherProfileApi.getMyProfile();
    } catch {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    }
  },

  async saveMyProfile(data) {
    try {
      const saved = await teacherProfileApi.saveMyProfile(data);
      // nếu BE trả về thành công, đồng bộ cache local (tuỳ chọn)
      localStorage.setItem(KEY, JSON.stringify(saved));
      return saved;
    } catch {
      localStorage.setItem(KEY, JSON.stringify(data));
      return data;
    }
  },
};
