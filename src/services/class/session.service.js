import { http } from "../http";

const sessionService = {
  /**
   * Save lesson content for a class session
   * @param {Object} data - Session content data
   * @param {number} data.classId - Class ID
   * @param {string} data.date - Date in YYYY-MM-DD format
   * @param {number[]} data.chapterIds - Array of chapter IDs taught
   * @param {number[]} data.lessonIds - Array of lesson IDs taught
   * @param {string} data.content - Lesson content text written by teacher
   */
  saveSessionContent: async (data) => {
    const {
      classId,
      date,
      slotId,
      chapterIds,
      lessonIds,
      content,
      // optional metadata to help BE persist exact source + mapping
      sourceType,
      classCourseId,
      courseId,
      chapterId,
      lessonId,
    } = data;

    const response = await http.post(
      `/sessions/by-class-date`,
      {
        chapterIds: chapterIds || [],
        lessonIds: lessonIds || [],
        content: content || "",
        // pass-through extra fields if provided (BE can ignore if unsupported)
        ...(sourceType ? { sourceType } : {}),
        ...(classCourseId ? { classCourseId } : {}),
        ...(courseId ? { baseCourseId: courseId } : {}),
        ...(chapterId ? { chapterId } : {}),
        ...(lessonId ? { lessonId } : {}),
      },
      {
        params: { classId, date, ...(slotId ? { slotId } : {}) },
      }
    );

    return response.data;
  },

  /**
   * Get session content by session ID
   * @param {number} sessionId - Session ID
   */
  getSessionContent: async (sessionId) => {
    const response = await http.get(`/sessions/${sessionId}/content`);
    return response.data;
  },

  /**
   * Save session content by session ID (preferred long-term)
   * @param {number} sessionId - Session ID
   * @param {{chapterIds:number[], lessonIds:number[], content:string}} body
   */
  saveSessionContentBySessionId: async (sessionId, body) => {
    // allow callers to include optional metadata (sourceType, classCourseId, etc.)
    const response = await http.post(`/sessions/${sessionId}/content`, body);
    return response.data;
  },

  /**
   * Get session content by class ID and date
   * @param {number} classId - Class ID
   * @param {string} date - Date in YYYY-MM-DD format
   */
  getSessionContentByClassDate: async (classId, date, slotId) => {
    const response = await http.get(`/sessions/content/by-class-date`, {
      params: { classId, date, ...(slotId ? { slotId } : {}) },
    });
    return response.data;
  },
};

export default sessionService;
