// Hook tách riêng để tránh cảnh báo Fast Refresh trong file provider
import { useContext } from "react";
import { NotificationContext } from "../context/NotificationContextCore";

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotification phải được dùng trong NotificationProvider"
    );
  return ctx;
}
