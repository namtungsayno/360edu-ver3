// src/services/material/material.api.js
import { http } from '../http';

const BASE_URL = '/materials';

export const materialApi = {
  /**
   * Upload tài liệu cho buổi học
   * @param {number} sessionId - ID buổi học
   * @param {File} file - File cần upload
   * @param {string} description - Mô tả tài liệu (optional)
   */
  uploadMaterial: (sessionId, file, description = '') => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    return http.post(`${BASE_URL}/upload/${sessionId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Thêm link tài liệu cho buổi học
   * @param {number} sessionId - ID buổi học
   * @param {string} url - URL link
   */
  addLink: (sessionId, url) => {
    return http.post(`${BASE_URL}/link/${sessionId}`, { url });
  },

  /**
   * Lấy danh sách tài liệu của buổi học
   * @param {number} sessionId - ID buổi học
   */
  getMaterialsBySession: (sessionId) => {
    return http.get(`${BASE_URL}/session/${sessionId}`);
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
   * @param {number} sessionId - ID buổi học
   * @param {string} fileName - Tên file
   */
  getDownloadUrl: (sessionId, fileName) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    return `${baseUrl}/api/materials/download/${sessionId}/${fileName}`;
  },
};

export default materialApi;
