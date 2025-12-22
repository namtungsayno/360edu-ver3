// src/services/lesson-material/lesson-material.api.js
import { http } from "../http";

const BASE_URL = "/lesson-materials";

export const lessonMaterialApi = {
  /**
   * Upload tài liệu cho bài học
   * @param {number} lessonId - ID bài học
   * @param {File} file - File cần upload
   * @param {string} description - Mô tả tài liệu (optional)
   */
  uploadMaterial: (lessonId, file, description = "") => {
    const formData = new FormData();
    formData.append("file", file);
    if (description) {
      formData.append("description", description);
    }
    return http.post(`${BASE_URL}/upload/${lessonId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Thêm link tài liệu cho bài học
   * @param {number} lessonId - ID bài học
   * @param {string} url - URL link
   */
  addLink: (lessonId, url) => {
    return http.post(`${BASE_URL}/link/${lessonId}`, { url });
  },

  /**
   * Lấy danh sách tài liệu của bài học
   * @param {number} lessonId - ID bài học
   */
  getMaterialsByLesson: (lessonId) => {
    return http.get(`${BASE_URL}/lesson/${lessonId}`);
  },

  /**
   * Lấy danh sách tài liệu của chapter
   * @param {number} chapterId - ID chapter
   */
  getMaterialsByChapter: (chapterId) => {
    return http.get(`${BASE_URL}/chapter/${chapterId}`);
  },

  /**
   * Lấy thông tin chi tiết một tài liệu
   * @param {number} materialId - ID tài liệu
   */
  getMaterialById: (materialId) => {
    return http.get(`${BASE_URL}/${materialId}`);
  },

  /**
   * Xóa tài liệu
   * @param {number} materialId - ID tài liệu
   */
  deleteMaterial: (materialId) => {
    return http.delete(`${BASE_URL}/${materialId}`);
  },

  /**
   * Lấy URL download tài liệu
   * @param {number} lessonId - ID bài học
   * @param {string} fileName - Tên file
   */
  getDownloadUrl: (lessonId, fileName) => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
    return `${baseUrl}/api/lesson-materials/download/${lessonId}/${fileName}`;
  },
};

export default lessonMaterialApi;
