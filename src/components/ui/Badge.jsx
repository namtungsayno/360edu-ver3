/**
 * BADGE COMPONENT - Component hiển thị nhãn/tag
 *
 * Chức năng:
 * - Hỗ trợ nhiều variants: default, secondary, destructive, outline
 * - Có thể tùy chỉnh className
 */

import { forwardRef } from "react";

const Badge = forwardRef(({ className = "", variant = "default", children, ...props }, ref) => {
	const variants = {
		default: "bg-blue-600 text-white hover:bg-blue-700",
		secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
		destructive: "bg-red-600 text-white hover:bg-red-700",
		outline: "border border-gray-300 bg-white text-gray-900",
	};

	const variantClasses = variants[variant] || variants.default;

	return (
		<div
			ref={ref}
			className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${variantClasses} ${className}`}
			{...props}
		>
			{children}
		</div>
	);
});

Badge.displayName = "Badge";

export { Badge };
