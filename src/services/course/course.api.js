// src/services/course/course.api.js
// Low-level API wrapper cho Course / Chapter / Lesson

import { http } from "../http";

export const courseApi = {
  // ====== COURSE BASE ======

  /**
   * Lấy danh sách khóa học
   * @param {Object} params - Ví dụ: { page, size, status, subjectId, scope }
   *  - scope="mine" dùng cho teacher: chỉ lấy khóa học cá nhân (nếu BE hỗ trợ)
   */
  list: (params = {}) => http.get("/courses", { params }).then((r) => r.data),

  /**
   * Lấy chi tiết 1 khóa học (kèm chapters + lessons nếu BE trả về)
   */
  getById: (id) => http.get(`/courses/${id}`).then((r) => r.data),

  /**
   * Tạo khóa học mới
   * - Teacher tạo: status = PENDING (do BE quyết định theo role)
   * - Admin tạo: status = APPROVED
   */
  create: (payload) => http.post("/courses", payload).then((r) => r.data),

  /**
   * Cập nhật thông tin cơ bản của khóa học
   */
  update: (id, payload) =>
    http.put(`/courses/${id}`, payload).then((r) => r.data),

  /**
   * Xoá khoá học (tuỳ BE là soft/hard delete)
   */
  remove: (id) => http.delete(`/courses/${id}`).then((r) => r.data),

  // ====== COURSE APPROVAL (ADMIN) ======

  approve: (id) => http.put(`/courses/${id}/approve`).then((r) => r.data),

  // (tuỳ BE có hay không endpoint reject)
  reject: (id) => http.put(`/courses/${id}/reject`).then((r) => r.data),

  // ====== COURSE CHO CREATE CLASS ======

  /**
   * Lấy danh sách course đã APPROVED theo subject,
   * dùng khi tạo Class (Admin / Teacher chọn sẵn chương trình học).
   */
  getApprovedBySubject: (subjectId) =>
    http.get(`/courses/by-subject/${subjectId}/approved`).then((r) => r.data),

  // ====== CHAPTER ======

  /**
   * Tạo chapter mới cho 1 course
   * payload: { courseId, title, description, orderIndex }
   */
  createChapter: (payload) =>
    http.post("/courses/chapters", payload).then((r) => r.data),

  /**
   * (Tuỳ BE mở rộng) Cập nhật / xóa chapter
   */
  updateChapter: (id, payload) =>
    http.put(`/courses/chapters/${id}`, payload).then((r) => r.data),

  removeChapter: (id) =>
    http.delete(`/courses/chapters/${id}`).then((r) => r.data),

  // ====== LESSON ======

  /**
   * Tạo lesson mới cho 1 chapter
   * payload: { chapterId, title, description, orderIndex }
   */
  createLesson: (payload) =>
    http.post("/courses/lessons", payload).then((r) => r.data),

  updateLesson: (id, payload) =>
    http.put(`/courses/lessons/${id}`, payload).then((r) => r.data),

  removeLesson: (id) =>
    http.delete(`/courses/lessons/${id}`).then((r) => r.data),

  // ====== LINK SESSION ↔ CONTENT (CHAPTER/LESSON) ======

  /**
   * Link nội dung (chapter / lesson) với 1 buổi học (ClassSession)
   * BE theo format SessionContentUpsertRequest:
   *  { chapterIds: [...], lessonIds: [...] }
   */
  setSessionContent: (sessionId, payload) =>
    http.post(`/sessions/${sessionId}/content`, payload).then((r) => r.data),
};
