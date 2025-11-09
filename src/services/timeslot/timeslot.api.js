import { http } from "../http";

// BaseURL in http.js already ends with /api -> only append resource segment
const API_BASE = "/timeslots";

export const timeslotApi = {
  getAll: async () => {
    const response = await http.get(API_BASE);
    return response.data;
  },
};
