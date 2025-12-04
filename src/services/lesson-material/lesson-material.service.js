// src/services/lesson-material/lesson-material.service.js
import lessonMaterialApi from './lesson-material.api';

export const lessonMaterialService = {
  /**
   * Upload tài liệu cho bài học
   */
  async uploadMaterial(lessonId, file, description = '') {
    const response = await lessonMaterialApi.uploadMaterial(lessonId, file, description);
    return response.data;
  },

  /**
   * Thêm link tài liệu cho bài học
   */
  async addLink(lessonId, url) {
    const response = await lessonMaterialApi.addLink(lessonId, url);
    return response.data;
  },

  /**
   * Lấy danh sách tài liệu của bài học
   */
  async getMaterialsByLesson(lessonId) {
    const response = await lessonMaterialApi.getMaterialsByLesson(lessonId);
    return response.data;
  },

  /**
   * Lấy danh sách tài liệu của chapter
   */
  async getMaterialsByChapter(chapterId) {
    const response = await lessonMaterialApi.getMaterialsByChapter(chapterId);
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết một tài liệu
   */
  async getMaterialById(materialId) {
    const response = await lessonMaterialApi.getMaterialById(materialId);
    return response.data;
  },

  /**
   * Xóa tài liệu
   */
  async deleteMaterial(materialId) {
    await lessonMaterialApi.deleteMaterial(materialId);
  },

  /**
   * Lấy URL download tài liệu
   */
  getDownloadUrl(lessonId, fileName) {
    return lessonMaterialApi.getDownloadUrl(lessonId, fileName);
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

export default lessonMaterialService;
