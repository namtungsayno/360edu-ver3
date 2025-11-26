/**
 * API ENDPOINTS - Khai báo tất cả các endpoint của ứng dụng
 * Sử dụng: import { API_ENDPOINTS } from '@/constants/api.endpoints';
 */

export const API_ENDPOINTS = {
  // ============ AUTH ============
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
  },

  // ============ NEWS MANAGEMENT ============
  NEWS: {
    // Lấy danh sách tin tức (hỗ trợ pagination, search, filter)
    LIST: "/news",
    
    // Lấy chi tiết 1 tin tức
    DETAIL: (id) => `/news/${id}`,
    
    // Tạo tin tức mới
    CREATE: "/news",
    
    // Cập nhật tin tức
    UPDATE: (id) => `/news/${id}`,
    
    // Xóa tin tức
    DELETE: (id) => `/news/${id}`,
    
    // Toggle trạng thái (published/hidden)
    TOGGLE_STATUS: (id) => `/news/${id}/toggle-status`,
    
    // Cập nhật trạng thái
    UPDATE_STATUS: (id) => `/news/${id}/status`,
    
    // Tăng lượt xem
    INCREMENT_VIEW: (id) => `/news/${id}/view`,
  },

  // ============ USER MANAGEMENT ============
  USERS: {
    LIST: "/users",
    DETAIL: (id) => `/users/${id}`,
    CREATE: "/users",
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
  },

  // ============ COURSE MANAGEMENT ============
  COURSES: {
    LIST: "/courses",
    DETAIL: (id) => `/courses/${id}`,
    CREATE: "/courses",
    UPDATE: (id) => `/courses/${id}`,
    DELETE: (id) => `/courses/${id}`,
  },

  // ============ SUBJECT MANAGEMENT ============
  SUBJECTS: {
    LIST: "/subjects",
    DETAIL: (id) => `/subjects/${id}`,
    CREATE: "/subjects",
    UPDATE: (id) => `/subjects/${id}`,
    DELETE: (id) => `/subjects/${id}`,
  },

  // ============ TEACHER MANAGEMENT ============
  TEACHER: {
    LIST: "/teachers",
    DETAIL: (id) => `/teachers/${id}`,
    PROFILE: "/teachers/profile",
    UPDATE_PROFILE: "/teachers/profile",
    BY_USER: (userId) => `/teachers/by-user/${userId}`,
    FREE_BUSY: (userId) => `/teachers/${userId}/free-busy`,
  },
};
