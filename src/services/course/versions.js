// Service: teacher personal course versions mapping
// Filters: baseCourseId (required), status=APPROVED; teacherId derived from auth on backend

import { axiosInstance } from "../../config/axios.config";

/**
 * List approved personal course versions of the logged-in teacher
 * for a given base course used by the class.
 *
 * @param {string|number} baseCourseId
 * @returns {Promise<Array>} versions array or []
 */
export async function listTeacherCourseVersions(baseCourseId) {
  try {
    const { data } = await axiosInstance.get("/api/course-versions", {
      // Only filter by baseCourseId; teacherId derived from auth principal on backend.
      params: { baseCourseId: String(baseCourseId) },
    });
    // Ensure array shape
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  } catch {
    return [];
  }
}

/**
 * Create mapping when teacher personalizes a course.
 * @param {{ baseCourseId: string|number, teacherCourseId: string|number }} payload
 */
export async function createTeacherCourseVersionMapping(payload) {
  const { data } = await axiosInstance.post("/api/course-versions", {
    baseCourseId: String(payload.baseCourseId),
    teacherCourseId: String(payload.teacherCourseId),
  });
  return data;
}
