/**
 * SELECT COMPONENT - Component select tùy chỉnh
 * 
 * Được sử dụng trong:
 * - CreateSubjectManagement.jsx (department, status)
 * - Các forms cần dropdown selection
 * 
 * Chức năng:
 * - Dropdown với options
 * - Custom styling với Tailwind CSS
 * - Support cho placeholder
 * - Error state styling
 */

import { forwardRef } from "react";

const Select = forwardRef(({ className = "", options = [], placeholder = "Chọn...", error, ...props }, ref) => {
  return (
    <div className="w-full">
      <select
        className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          error 
            ? "border-red-300 focus-visible:ring-red-500" 
            : "border-gray-300"
        } ${className}`}
        ref={ref}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Select.displayName = "Select";

export { Select };