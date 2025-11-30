// src/services/teacher/teacher.profile.api.js
import { http } from "../http";

export const teacherProfileApi = {
  // ==================== CERTIFICATES ====================
  
  /**
   * Get all certificates của teacher đang login
   */
  getMyCertificates() {
    return http.get("/teachers/profile/certificates").then((r) => r.data);
  },

  /**
   * Thêm certificate mới
   */
  addCertificate(data) {
    return http.post("/teachers/profile/certificates", data).then((r) => r.data);
  },

  /**
   * Cập nhật certificate
   */
  updateCertificate(certId, data) {
    return http.put(`/teachers/profile/certificates/${certId}`, data).then((r) => r.data);
  },

  /**
   * Xóa certificate
   */
  deleteCertificate(certId) {
    return http.delete(`/teachers/profile/certificates/${certId}`);
  },

  // ==================== EXPERIENCES ====================
  
  /**
   * Get all experiences của teacher đang login
   */
  getMyExperiences() {
    return http.get("/teachers/profile/experiences").then((r) => r.data);
  },

  /**
   * Thêm experience mới
   */
  addExperience(data) {
    return http.post("/teachers/profile/experiences", data).then((r) => r.data);
  },

  /**
   * Cập nhật experience
   */
  updateExperience(expId, data) {
    return http.put(`/teachers/profile/experiences/${expId}`, data).then((r) => r.data);
  },

  /**
   * Xóa experience
   */
  deleteExperience(expId) {
    return http.delete(`/teachers/profile/experiences/${expId}`);
  },

  // ==================== EDUCATIONS ====================
  
  /**
   * Get all educations của teacher đang login
   */
  getMyEducations() {
    return http.get("/teachers/profile/educations").then((r) => r.data);
  },

  /**
   * Thêm education mới
   */
  addEducation(data) {
    return http.post("/teachers/profile/educations", data).then((r) => r.data);
  },

  /**
   * Cập nhật education
   */
  updateEducation(eduId, data) {
    return http.put(`/teachers/profile/educations/${eduId}`, data).then((r) => r.data);
  },

  /**
   * Xóa education
   */
  deleteEducation(eduId) {
    return http.delete(`/teachers/profile/educations/${eduId}`);
  },

  // ==================== PROFILE ====================
  
  /**
   * Get teacher profile (main info)
   */
  getMyProfile() {
    return http.get("/teachers/profile").then((r) => r.data);
  },

  /**
   * Update teacher profile (main info)
   */
  updateMyProfile(data) {
    return http.put("/teachers/profile", data).then((r) => r.data);
  },
};
