/**
 * BUTTON COMPONENT - Component button tùy chỉnh
 *
 * Được sử dụng trong:
 * - Header.jsx (nút đăng nhập)
 * - Banner.jsx (nút "Xem lớp học", "Khóa học Video")
 * - Login.jsx và Register.jsx (submit forms)
 * - Tất cả các trang cần buttons
 *
 * Chức năng:
 * - Hỗ trợ nhiều variants: default, destructive, outline, secondary, ghost, link
 * - Hỗ trợ nhiều sizes: default, sm, lg, icon
 * - Cho phép custom className override default styling
 * - forwardRef để tương thích với React components khác
 */

import { forwardRef } from "react";

const Button = forwardRef(
  (
    {
      className = "",
      variant = "default",
      size = "default",
      children,
      ...props
    },
    ref
  ) => {
    // Base classes cho tất cả buttons
    const baseClasses =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    // Các variant styling khác nhau
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline:
        "border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
      ghost: "hover:bg-gray-100 hover:text-gray-900", // Sử dụng trong Header
      link: "text-blue-600 underline-offset-4 hover:underline",
    };

    // Các size khác nhau
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8", // Sử dụng trong Banner
      icon: "h-10 w-10",
    };

    const variantClasses = variants[variant] || variants.default;
    const sizeClasses = sizes[size] || sizes.default;

    return (
      <button
        className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
