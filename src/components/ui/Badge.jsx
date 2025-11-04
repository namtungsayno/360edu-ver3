/**
 * BADGE COMPONENT - Component badge tùy chỉnh
 * 
 * Được sử dụng trong:
 * - SubjectDetail.jsx (status badge)
 * - Các components cần hiển thị trạng thái
 * 
 * Chức năng:
 * - Hiển thị trạng thái với màu sắc khác nhau
 * - Support variants: success, destructive, default
 * - Custom styling với Tailwind CSS
 */

import { forwardRef } from "react";

const Badge = forwardRef(({ className = "", variant = "default", children, ...props }, ref) => {
  const variants = {
    default: "bg-gray-100 text-gray-700 border border-gray-200",
    success: "bg-green-100 text-green-700 border border-green-200",
    destructive: "bg-red-100 text-red-700 border border-red-200",
    warning: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    info: "bg-blue-100 text-blue-700 border border-blue-200"
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export { Badge };
