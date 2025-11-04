// dùng http instance nếu bạn đã có (withCredentials, baseURL, interceptors, ...)
import { http } from "./http";

const KEY = "360edu.teacher.profile";

export const teacherService = {
  async getProfile() {
    try {
      const res = await http.get("/teacher/profile/me");
      return res.data;
    } catch (e) {
      // fallback localStorage
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    }
  },

  async saveProfile(data) {
    try {
      const res = await http.post("/teacher/profile", data);
      return res.data;
    } catch (e) {
      // fallback localStorage
      localStorage.setItem(KEY, JSON.stringify(data));
      return data;
    }
  },
};
