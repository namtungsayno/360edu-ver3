/**
 * NOTIFICATION CONTEXT
 *
 * Context quản lý toast notifications toàn ứng dụng
 * Cung cấp các phương thức: success, error, warning, info
 * Tự động tạo ID và quản lý lifecycle của toast
 */

import { useState, useCallback } from "react";
import { NotificationContext } from "./NotificationContextCore";

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Thêm toast mới
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  // Xóa toast theo ID
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Xóa tất cả toasts
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Helper methods
  const success = useCallback(
    (message, title = "Thành công") => {
      return addToast({ type: "success", title, message });
    },
    [addToast]
  );

  const error = useCallback(
    (message, title = "Lỗi") => {
      return addToast({ type: "error", title, message });
    },
    [addToast]
  );

  const warning = useCallback(
    (message, title = "Cảnh báo") => {
      return addToast({ type: "warning", title, message });
    },
    [addToast]
  );

  const info = useCallback(
    (message, title = "Thông tin") => {
      return addToast({ type: "info", title, message });
    },
    [addToast]
  );

  const value = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook đã tách sang file hooks/use-notification.js để tránh Fast Refresh cảnh báo.
