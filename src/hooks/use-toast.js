/**
 * USE TOAST HOOK
 *
 * Hook wrapper để sử dụng toast notification dễ dàng hơn
 * Re-export từ NotificationContext
 *
 * Cách dùng:
 * const { success, error, warning, info } = useToast();
 *
 * success("Đã tạo thành công!");
 * error("Có lỗi xảy ra!");
 * warning("Vui lòng kiểm tra lại!");
 * info("Thông tin quan trọng");
 */

import { useNotification } from "./use-notification";

export function useToast() {
  const notification = useNotification();

  return {
    success: notification.success,
    error: notification.error,
    warning: notification.warning,
    info: notification.info,
    clearAll: notification.clearToasts,
  };
}

// Export singleton toast object để có thể sử dụng trực tiếp
// import { toast } from '@/hooks/use-toast'
// toast.success("Done!")
let _notificationInstance = null;

export function setToastInstance(instance) {
  _notificationInstance = instance;
}

export const toast = {
  success: (message, title) => {
    if (_notificationInstance) {
      return _notificationInstance.success(message, title);
    }
    console.warn("Toast not initialized");
  },
  error: (message, title) => {
    if (_notificationInstance) {
      return _notificationInstance.error(message, title);
    }
    console.warn("Toast not initialized");
  },
  warning: (message, title) => {
    if (_notificationInstance) {
      return _notificationInstance.warning(message, title);
    }
    console.warn("Toast not initialized");
  },
  info: (message, title) => {
    if (_notificationInstance) {
      return _notificationInstance.info(message, title);
    }
    console.warn("Toast not initialized");
  },
};
