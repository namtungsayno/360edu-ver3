/**
 * INPUT COMPONENT - Component input tùy chỉnh
 * 
 * Được sử dụng trong:
 * - Header.jsx (thanh tìm kiếm)
 * - Login.jsx (username, password)
 * - Register.jsx (fullName, username, email, phone, password, confirmPassword)
 * - Tất cả forms cần input fields
 * 
 * Chức năng:
 * - Hỗ trợ tất cả input types (text, email, password, tel, etc)
 * - Custom styling với Tailwind CSS
 * - Focus states và accessibility
 * - forwardRef để tương thích với React forms
 * - Auto lang="en" cho number inputs (fix Vietnamese IME issue)
 */

import { forwardRef } from "react";

const Input = forwardRef(({ className = "", type = "text", inputMode, ...props }, ref) => {
  // Fix Vietnamese keyboard issue: khi nhập số với bàn phím Telex,
  // "00" sẽ bị chuyển thành "ô". Thêm lang="en" để disable IME cho số
  const isNumericInput = type === "number" || inputMode === "numeric";
  
  return (
    <input
      type={type}
      inputMode={inputMode}
      // Thêm lang="en" để ngăn Vietnamese IME can thiệp vào số
      lang={isNumericInput ? "en" : undefined}
      // Base styling với Tailwind classes
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
