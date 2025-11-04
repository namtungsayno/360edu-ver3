import React from "react";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

const VARIANTS = {
  default: "bg-gray-100 text-gray-800",
  info: "bg-blue-100 text-blue-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
};

export function Badge({
  children,
  className = "",
  variant = "default",
  ...props
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
        VARIANTS[variant] || VARIANTS.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
