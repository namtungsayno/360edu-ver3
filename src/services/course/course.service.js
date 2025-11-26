// src/services/course/course.service.js
// Business layer cho Course / Chapter / Lesson
// Sử dụng trong các page Teacher/Admin để thao tác dễ hơn.

import { courseApi } from "./course.api";

export const courseService = {
  // ====== COURSE (TEACHER VIEW) ======

  /**
   * Lấy danh sách khóa học cá nhân của giáo viên
   * - FE sẽ truyền scope = "mine" để BE hiểu là lọc theo current user (nếu BE hỗ trợ)
   * - Có thể kèm thêm status, subjectId, search...
   */
  async listMyCourses(filters = {}) {
    const params = {
      scope: "mine",
      ...filters,
    };
    return courseApi.list(params);
  },

  /**
   * Lấy chi tiết 1 khóa học (dùng cho màn detail + editor)
   */
  async getCourseDetail(id) {
    return courseApi.getById(id);
  },

  /**
   * Tạo mới 1 khóa học (teacher hoặc admin)
   * payload: { subjectId, title, description }  (hoặc có thể payload.intro, sẽ map sang description)
   * (BE tự set status PENDING / APPROVED theo role)
   */
  async createCourse(payload) {
    const body = {
      subjectId: payload.subjectId,
      title: payload.title,
      description: payload.description ?? payload.intro ?? "",
    };
    return courseApi.create(body);
  },

  /**
   * Cập nhật thông tin cơ bản của course (tiêu đề, mô tả,...)
   */
  async updateCourse(id, payload) {
    const body = {
      ...payload,
      description: payload.description ?? payload.intro ?? payload.description,
    };
    return courseApi.update(id, body);
  },

  async deleteCourse(id) {
    return courseApi.remove(id);
  },

  // ====== COURSE (ADMIN APPROVAL) ======

  async approveCourse(id) {
    return courseApi.approve(id);
  },

  async rejectCourse(id) {
    return courseApi.reject(id);
  },

  /**
   * Dùng khi tạo Class:
   * - Truyền subjectId → nhận danh sách course APPROVED thuộc môn đó
   */
  async getApprovedCoursesBySubject(subjectId) {
    if (!subjectId) return [];
    return courseApi.getApprovedBySubject(subjectId);
  },

  // ====== CHAPTER / LESSON EDITOR ======

  async addChapter(courseId, data) {
    return courseApi.createChapter({
      courseId,
      title: data.title,
      description: data.description ?? data.intro ?? "",
      orderIndex: data.orderIndex,
    });
  },

  async updateChapter(chapterId, data) {
    const body = {
      ...data,
      description: data.description ?? data.intro ?? data.description,
    };
    return courseApi.updateChapter(chapterId, body);
  },

  async removeChapter(chapterId) {
    return courseApi.removeChapter(chapterId);
  },

  async addLesson(chapterId, data) {
    return courseApi.createLesson({
      chapterId,
      title: data.title,
      description: data.description ?? data.intro ?? "",
      orderIndex: data.orderIndex,
    });
  },

  async updateLesson(lessonId, data) {
    const body = {
      ...data,
      description: data.description ?? data.intro ?? data.description,
    };
    return courseApi.updateLesson(lessonId, body);
  },

  async removeLesson(lessonId) {
    return courseApi.removeLesson(lessonId);
  },

  // ====== SESSION CONTENT LINK ======

  /**
   * Link list chapter/lesson với một buổi học cụ thể
   * - Dùng cho màn điểm danh / chi tiết lịch dạy của giáo viên
   * - chaptersOrLessons: { chapterIds?: number[], lessonIds?: number[] }
   */
  async setLessonsForSession(sessionId, chaptersOrLessons) {
    if (!sessionId) {
      throw new Error("sessionId là bắt buộc");
    }

    const payload = {
      chapterIds: chaptersOrLessons?.chapterIds ?? [],
      lessonIds: chaptersOrLessons?.lessonIds ?? [],
    };

    return courseApi.setSessionContent(sessionId, payload);
  },
};
