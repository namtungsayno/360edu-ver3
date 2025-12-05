import { http } from "../http";

const NotificationAPI = {
  /**
   * Lấy danh sách thông báo (có phân trang)
   */
  getNotifications: (page = 0, size = 10) => {
    return http.get(`/notifications?page=${page}&size=${size}`);
  },

  /**
   * Lấy thông báo chưa đọc
   */
  getUnreadNotifications: () => {
    return http.get("/notifications/unread");
  },

  /**
   * Đếm số thông báo chưa đọc
   */
  getUnreadCount: () => {
    return http.get("/notifications/unread-count");
  },

  /**
   * Đánh dấu 1 thông báo đã đọc
   */
  markAsRead: (id) => {
    return http.post(`/notifications/${id}/read`);
  },

  /**
   * Đánh dấu tất cả đã đọc
   */
  markAllAsRead: () => {
    return http.post("/notifications/read-all");
  },

  /**
   * Xóa 1 thông báo
   */
  deleteNotification: (id) => {
    return http.delete(`/notifications/${id}`);
  },

  /**
   * Lấy thống kê thông báo
   */
  getStats: () => {
    return http.get("/notifications/stats");
  },
};

export default NotificationAPI;
