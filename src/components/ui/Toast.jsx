/**
 * TOAST NOTIFICATION COMPONENT
 *
 * Component hiển thị thông báo toast với animation đẹp
 * Hỗ trợ 4 loại: success, error, warning, info
 * Tự động đóng sau 3 giây (có thể tùy chỉnh)
 * Có thể đóng thủ công bằng nút X
 */

import { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: {
    container: "bg-green-50 border-green-200",
    icon: "text-green-600",
    title: "text-green-900",
    message: "text-green-700",
  },
  error: {
    container: "bg-red-50 border-red-200",
    icon: "text-red-600",
    title: "text-red-900",
    message: "text-red-700",
  },
  warning: {
    container: "bg-yellow-50 border-yellow-200",
    icon: "text-yellow-600",
    title: "text-yellow-900",
    message: "text-yellow-700",
  },
  info: {
    container: "bg-blue-50 border-blue-200",
    icon: "text-blue-600",
    title: "text-blue-900",
    message: "text-blue-700",
  },
};

export function Toast({
  id,
  type = "info",
  title,
  message,
  duration = 3000,
  onClose,
}) {
  const Icon = icons[type];
  const style = styles[type];

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={`
        ${style.container}
        border rounded-lg shadow-lg p-4 mb-3 min-w-[320px] max-w-md
        animate-slide-in-right
        flex items-start gap-3
        transition-all duration-300 hover:shadow-xl
      `}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <Icon className={`${style.icon} w-5 h-5`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={`${style.title} font-semibold text-sm mb-1`}>
            {title}
          </h4>
        )}
        {message && <p className={`${style.message} text-sm`}>{message}</p>}
      </div>

      {/* Close Button */}
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Đóng"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/**
 * TOAST CONTAINER
 * Container chứa tất cả các toast notifications
 * Hiển thị ở góc trên bên phải màn hình
 */
export function ToastContainer({ toasts, onClose }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <div className="pointer-events-auto space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}
