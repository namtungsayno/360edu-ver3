import NotificationAPI from "./notification.api";

const NotificationService = {
  /**
   * Lấy danh sách thông báo với phân trang
   */
  getNotifications: async (page = 0, size = 10) => {
    const response = await NotificationAPI.getNotifications(page, size);
    return response.data;
  },

  /**
   * Lấy thông báo chưa đọc
   */
  getUnreadNotifications: async () => {
    const response = await NotificationAPI.getUnreadNotifications();
    return response.data;
  },

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  getUnreadCount: async () => {
    const response = await NotificationAPI.getUnreadCount();
    return response.data.count;
  },

  /**
   * Đánh dấu 1 thông báo đã đọc
   */
  markAsRead: async (id) => {
    const response = await NotificationAPI.markAsRead(id);
    return response.data;
  },

  /**
   * Đánh dấu tất cả đã đọc
   */
  markAllAsRead: async () => {
    const response = await NotificationAPI.markAllAsRead();
    return response.data;
  },

  /**
   * Xóa 1 thông báo
   */
  deleteNotification: async (id) => {
    const response = await NotificationAPI.deleteNotification(id);
    return response.data;
  },

  /**
   * Lấy thống kê
   */
  getStats: async () => {
    const response = await NotificationAPI.getStats();
    return response.data;
  },

  /**
   * Format thời gian thông báo
   */
  formatTime: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;

    return date.toLocaleDateString("vi-VN");
  },

  /**
   * Lấy màu theo loại thông báo
   */
  getNotificationStyle: (type) => {
    const styles = {
      ENROLLED_NEW_CLASS: {
        color: "text-green-600",
        bgColor: "bg-green-100",
        dotColor: "bg-green-500",
      },
      REMOVED_FROM_CLASS: {
        color: "text-red-600",
        bgColor: "bg-red-100",
        dotColor: "bg-red-500",
      },
      SCHEDULE_CHANGED: {
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        dotColor: "bg-yellow-500",
      },
      PAYMENT_SUCCESS: {
        color: "text-green-600",
        bgColor: "bg-green-100",
        dotColor: "bg-green-500",
      },
      PAYMENT_FAILED: {
        color: "text-red-600",
        bgColor: "bg-red-100",
        dotColor: "bg-red-500",
      },
      PAYMENT_PENDING: {
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        dotColor: "bg-orange-500",
      },
      CLASS_REMINDER: {
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        dotColor: "bg-blue-500",
      },
      ASSIGNMENT_NEW: {
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        dotColor: "bg-purple-500",
      },
      ASSIGNMENT_GRADED: {
        color: "text-green-600",
        bgColor: "bg-green-100",
        dotColor: "bg-green-500",
      },
      ATTENDANCE_MARKED: {
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        dotColor: "bg-blue-500",
      },
      SYSTEM_ANNOUNCEMENT: {
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        dotColor: "bg-gray-500",
      },
      NEWS_PUBLISHED: {
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
        dotColor: "bg-indigo-500",
      },
    };

    return (
      styles[type] || {
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        dotColor: "bg-blue-500",
      }
    );
  },
};

export default NotificationService;
