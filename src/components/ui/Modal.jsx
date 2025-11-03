/**
 * MODAL COMPONENT - Modal đơn giản, truy cập tốt
 * Props:
 * - open: boolean - hiển thị modal
 * - onClose: () => void - đóng modal khi click overlay hoặc nút Close
 * - title?: string | ReactNode
 */

import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, className = "" }) {
	useEffect(() => {
		function onKey(e) {
			if (e.key === "Escape") onClose?.();
		}
		if (open) {
			document.addEventListener("keydown", onKey);
			document.body.style.overflow = "hidden";
		}
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			aria-modal="true"
			role="dialog"
		>
			{/* Overlay */}
			<div
				className="absolute inset-0 bg-black/50"
				onClick={onClose}
				aria-hidden="true"
			/>

			{/* Dialog */}
			<div className={`relative z-10 w-full max-w-2xl rounded-lg bg-white shadow-xl ${className}`}>
				<div className="flex items-center justify-between border-b p-4">
					<h2 className="text-lg font-semibold text-gray-900">{title}</h2>
					<button
						className="rounded p-1 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
						aria-label="Close"
						onClick={onClose}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M18 6 6 18" />
							<path d="m6 6 12 12" />
						</svg>
					</button>
				</div>
				<div className="p-4">{children}</div>
			</div>
		</div>
	);
}
