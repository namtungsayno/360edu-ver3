// src/services/material/material.service.js
import materialApi from './material.api';

export const materialService = {
  /**
   * Upload tài liệu cho buổi học
   */
  async uploadMaterial(sessionId, file, description = '') {
    const response = await materialApi.uploadMaterial(sessionId, file, description);
    return response.data;
  },

  /**
   * Thêm link tài liệu cho buổi học
   */
  async addLink(sessionId, url) {
    const response = await materialApi.addLink(sessionId, url);
    return response.data;
  },

  /**
   * Lấy danh sách tài liệu của buổi học
   */
  async getMaterialsBySession(sessionId) {
    const response = await materialApi.getMaterialsBySession(sessionId);
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết một tài liệu
   */
  async getMaterialById(materialId) {
    const response = await materialApi.getMaterialById(materialId);
    return response.data;
  },

  /**
   * Xóa tài liệu
   */
  async deleteMaterial(materialId) {
    await materialApi.deleteMaterial(materialId);
  },

  /**
   * Lấy URL download tài liệu
   */
  getDownloadUrl(sessionId, fileName) {
    return materialApi.getDownloadUrl(sessionId, fileName);
  },

  /**
   * Format kích thước file
   */
  formatFileSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },

  /**
   * Lấy icon dựa vào loại file
   */
  getFileIcon(fileType) {
    if (!fileType) return 'file';
    if (fileType === 'link' || fileType === 'LINK') return 'link';
    if (fileType.startsWith('image/')) return 'image';
    if (fileType === 'application/pdf') return 'pdf';
    if (fileType.includes('word') || fileType.includes('document')) return 'word';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'excel';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'powerpoint';
    if (fileType.startsWith('video/')) return 'video';
    if (fileType.startsWith('audio/')) return 'audio';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('archive')) return 'archive';
    return 'file';
  },
};

export default materialService;
