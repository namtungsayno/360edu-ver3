/**
 * NOTIFICATION CONTEXT
 *
 * Context quản lý toast notifications toàn ứng dụng
 * Cung cấp các phương thức: success, error, warning, info
 * Tự động tạo ID và quản lý lifecycle của toast
 */

import { useState, useCallback, useMemo } from "react";
import { NotificationContext } from "./NotificationContextCore";

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Thêm toast mới
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  // Thêm toast error/warning - xóa toast error/warning cũ trước khi thêm mới (tránh tràn màn hình)
  const addErrorToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => {
      // Xóa tất cả toast error/warning cũ, giữ lại success/info
      const filtered = prev.filter(
        (t) => t.type !== "error" && t.type !== "warning"
      );
      return [...filtered, { ...toast, id }];
    });
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

  // Error và Warning dùng addErrorToast để tránh stack nhiều toast
  const error = useCallback(
    (message, title = "Lỗi") => {
      return addErrorToast({ type: "error", title, message });
    },
    [addErrorToast]
  );

  const warning = useCallback(
    (message, title = "Cảnh báo") => {
      return addErrorToast({ type: "warning", title, message });
    },
    [addErrorToast]
  );

  const info = useCallback(
    (message, title = "Thông tin") => {
      return addToast({ type: "info", title, message });
    },
    [addToast]
  );

  const value = useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
      clearToasts,
      success,
      error,
      warning,
      info,
    }),
    [toasts, addToast, removeToast, clearToasts, success, error, warning, info]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook đã tách sang file hooks/use-notification.js để tránh Fast Refresh cảnh báo.
