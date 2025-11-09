import { http } from "../http";

// BaseURL in http.js already ends with /api -> only append resource segment
const API_BASE = "/semesters";

export const semesterApi = {
  getAll: async (status = null) => {
    const params = status ? { status } : {};
    const response = await http.get(API_BASE, { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await http.get(`${API_BASE}/${id}`);
    return response.data;
  },
};
