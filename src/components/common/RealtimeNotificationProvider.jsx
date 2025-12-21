/**
 * REALTIME NOTIFICATION PROVIDER
 *
 * Component này polling notifications mới mỗi 10 giây
 * và hiển thị toast popup ở góc phải màn hình khi có notification mới
 *
 * Dùng cho Admin để nhận thông báo realtime khi có student đăng ký lớp
 */

import { useEffect, useRef, useCallback } from "react";
import NotificationService from "../../services/notification/notification.service";
import { useNotification } from "../../hooks/use-notification";

// Polling interval: 5 giây (để test, sau có thể tăng lên 10-15 giây)
const POLLING_INTERVAL = 5000;

// Các loại notification quan trọng cần hiển thị toast
const IMPORTANT_NOTIFICATION_TYPES = [
  "NEW_PAYMENT_PENDING", // Có student đăng ký lớp mới
  "PAYMENT_SUCCESS", // Thanh toán thành công
  "SYSTEM_ANNOUNCEMENT", // Thông báo hệ thống
];

export default function RealtimeNotificationProvider({ children }) {
  const { addToast } = useNotification();

  // Lưu ID của notification cuối cùng đã hiển thị để tránh hiển thị lại
  const lastNotificationIdRef = useRef(null);
  const isFirstLoadRef = useRef(true);

  // Hàm hiển thị toast notification với duration dài hơn cho payment
  const showNotificationToast = useCallback(
    (notification) => {
      console.log("🔔 Showing toast for notification:", notification);

      let toastType = "info";
      let duration = 5000; // 5 giây mặc định

      switch (notification.type) {
        case "NEW_PAYMENT_PENDING":
          toastType = "warning"; // Màu vàng/cam để thu hút attention
          duration = 10000; // 10 giây để admin có đủ thời gian đọc
          break;
        case "PAYMENT_SUCCESS":
          toastType = "success";
          duration = 5000;
          break;
        default:
          toastType = "info";
          duration = 5000;
      }

      addToast({
        type: toastType,
        title: notification.title,
        message: notification.message,
        duration: duration,
      });
    },
    [addToast]
  );

  // Hàm check notifications mới
  const checkNewNotifications = useCallback(async () => {
    console.log("🔍 Checking for new notifications...");

    try {
      // Lấy notifications chưa đọc
      const unreadNotifications =
        await NotificationService.getUnreadNotifications();

      console.log("📬 Unread notifications:", unreadNotifications);

      if (!unreadNotifications || unreadNotifications.length === 0) {
        console.log("📭 No unread notifications");
        return;
      }

      // Lần đầu load: chỉ set lastNotificationId, không hiển thị toast
      // để tránh hiển thị hết tất cả notifications cũ
      if (isFirstLoadRef.current) {
        const maxId = Math.max(...unreadNotifications.map((n) => n.id));
        lastNotificationIdRef.current = maxId;
        isFirstLoadRef.current = false;
        console.log("📋 First load - set lastNotificationId:", maxId);
        return;
      }

      // Lọc ra các notification quan trọng và mới hơn lần check trước
      const newImportantNotifications = unreadNotifications.filter(
        (notification) => {
          // Chỉ lấy notification quan trọng
          if (!IMPORTANT_NOTIFICATION_TYPES.includes(notification.type)) {
            return false;
          }

          // Chỉ lấy notification mới (chưa hiển thị)
          if (
            lastNotificationIdRef.current &&
            notification.id <= lastNotificationIdRef.current
          ) {
            return false;
          }

          return true;
        }
      );

      console.log("🆕 New important notifications:", newImportantNotifications);

      // Hiển thị toast cho mỗi notification mới (giới hạn 3 để tránh spam)
      const notificationsToShow = newImportantNotifications.slice(0, 3);

      // Check xem có payment notification không để trigger reload PaymentHistory
      const hasPaymentNotification = notificationsToShow.some(
        (n) => n.type === "NEW_PAYMENT_PENDING" || n.type === "PAYMENT_SUCCESS"
      );

      notificationsToShow.forEach((notification, index) => {
        // Delay mỗi toast 500ms để không hiện cùng lúc
        setTimeout(() => {
          showNotificationToast(notification);
        }, index * 500);
      });

      // Dispatch event để PaymentHistory tự reload nếu có payment notification
      if (hasPaymentNotification) {
        console.log(
          "📢 Dispatching newPaymentPending event for PaymentHistory"
        );
        window.dispatchEvent(new CustomEvent("newPaymentPending"));
      }

      // Cập nhật lastNotificationId
      if (unreadNotifications.length > 0) {
        const maxId = Math.max(...unreadNotifications.map((n) => n.id));
        lastNotificationIdRef.current = maxId;
      }
    } catch (error) {
      // Silently fail - không hiển thị lỗi cho user
      console.error("❌ Failed to check new notifications:", error);
    }
  }, [showNotificationToast]);

  // Setup polling interval
  useEffect(() => {
    console.log("🚀 RealtimeNotificationProvider mounted - starting polling");

    // Check ngay khi component mount
    checkNewNotifications();

    // Setup interval polling
    const intervalId = setInterval(checkNewNotifications, POLLING_INTERVAL);

    // Cleanup
    return () => {
      console.log(
        "🛑 RealtimeNotificationProvider unmounted - stopping polling"
      );
      clearInterval(intervalId);
    };
  }, [checkNewNotifications]);

  // Render children - component này chỉ là provider
  return children;
}
