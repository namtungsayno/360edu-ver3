// Service: teacher personal course versions mapping
// Filters: baseCourseId (required); teacherId derived từ auth cookie/backend

import { http } from "../http";

/**
 * List approved personal course versions of the logged-in teacher
 * for a given base course used by the class.
 *
 * @param {string|number} baseCourseId
 * @returns {Promise<Array>} versions array or []
 */
export async function listTeacherCourseVersions(baseCourseId) {
  try {
    const { data } = await http.get("/course-versions", {
      // Lọc theo baseCourseId; teacherId lấy từ principal nhờ cookie JWT (withCredentials)
      params: { baseCourseId: String(baseCourseId) },
    });
    // Ensure array shape (backend returns array of TeacherCourseVersionResponse)
    const raw = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
      ? data.items
      : [];
    // Normalize shape for UI dropdown
    return raw.map((v) => ({
      id: v.teacherCourseId, // use teacher course id for selection
      title: v.teacherCourseTitle || `Course ${v.teacherCourseId}`,
      teacherCourseId: v.teacherCourseId,
      baseCourseId: v.baseCourseId,
      mapped: !!v.id, // true if explicit mapping exists, false for fallback suggestion
      status: v.id ? "APPROVED" : "SUGGESTED",
    }));
  } catch {
    return [];
  }
}

/**
 * Create mapping when teacher personalizes a course.
 * @param {{ baseCourseId: string|number, teacherCourseId: string|number }} payload
 */
export async function createTeacherCourseVersionMapping(payload) {
  const { data } = await http.post("/course-versions", {
    baseCourseId: String(payload.baseCourseId),
    teacherCourseId: String(payload.teacherCourseId),
  });
  return data;
}
