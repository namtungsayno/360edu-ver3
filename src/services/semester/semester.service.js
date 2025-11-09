import { semesterApi } from "./semester.api";

export const semesterService = {
  getOpenSemesters: async () => {
    // Prefer OPEN semesters; if none found, fallback to all to avoid empty dropdown in dev
    const open = await semesterApi.getAll("OPEN");
    if (Array.isArray(open) && open.length > 0) return open;
    return await semesterApi.getAll();
  },

  getAllSemesters: async () => {
    return await semesterApi.getAll();
  },

  getById: async (id) => {
    return await semesterApi.getById(id);
  },
};
