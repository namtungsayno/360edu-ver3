/**
 * SELECT COMPONENTS - Components để tạo dropdown select
 * 
 * Chức năng:
 * - Select: Container chính
 * - SelectTrigger: Button để mở dropdown
 * - SelectValue: Giá trị được chọn
 * - SelectContent: Dropdown menu
 * - SelectItem: Các option trong dropdown
 */

import { createContext, useContext, useState, useRef, useEffect } from "react";

const SelectContext = createContext();

export function Select({ defaultValue, value, onValueChange, children }) {
	const [selectedValue, setSelectedValue] = useState(value || defaultValue || "");
	const [isOpen, setIsOpen] = useState(false);

	const handleValueChange = (newValue) => {
		setSelectedValue(newValue);
		if (onValueChange) {
			onValueChange(newValue);
		}
		setIsOpen(false);
	};

	return (
		<SelectContext.Provider
			value={{
				selectedValue,
				setSelectedValue: handleValueChange,
				isOpen,
				setIsOpen,
			}}
		>
			<div className="relative">{children}</div>
		</SelectContext.Provider>
	);
}

export function SelectTrigger({ className = "", children, ...props }) {
	const { isOpen, setIsOpen } = useContext(SelectContext);
	const triggerRef = useRef(null);

	return (
		<button
			ref={triggerRef}
			type="button"
			className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
			onClick={() => setIsOpen(!isOpen)}
			{...props}
		>
			{children}
			<svg
				className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? "rotate-180" : ""}`}
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<polyline points="6 9 12 15 18 9"></polyline>
			</svg>
		</button>
	);
}

export function SelectValue({ placeholder }) {
	const { selectedValue } = useContext(SelectContext);
	return <span>{selectedValue || placeholder}</span>;
}

export function SelectContent({ className = "", children, ...props }) {
	const { isOpen, setIsOpen } = useContext(SelectContext);
	const contentRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (contentRef.current && !contentRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, setIsOpen]);

	if (!isOpen) return null;

	return (
		<div
			ref={contentRef}
			className={`absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg ${className}`}
			{...props}
		>
			{children}
		</div>
	);
}

export function SelectItem({ value, className = "", children, ...props }) {
	const { selectedValue, setSelectedValue } = useContext(SelectContext);
	const isSelected = selectedValue === value;

	return (
		<div
			className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${
				isSelected ? "bg-gray-50" : ""
			} ${className}`}
			onClick={() => setSelectedValue(value)}
			{...props}
		>
			{isSelected && (
				<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
					<svg
						className="h-4 w-4"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="20 6 9 17 4 12"></polyline>
					</svg>
				</span>
			)}
			{children}
		</div>
	);
}
