import React from "react";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

export const Label = React.forwardRef(function Label(
  { className = "", required = false, children, ...props },
  ref
) {
  return (
    <label
      ref={ref}
      className={cn("block text-sm font-medium text-gray-700", className)}
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {required ? <span className="text-red-500">*</span> : null}
      </span>
    </label>
  );
});

export default Label;
