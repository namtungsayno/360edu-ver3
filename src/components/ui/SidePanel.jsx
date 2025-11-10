/**
 * SidePanel.jsx
 * Panel chi tiết trượt từ bên phải cho chế độ xem/sửa entity.
 * Props:
 * - open: boolean
 * - onClose: function
 * - title: string
 * - children: content
 * - width: tailwind width class (mặc định w-[420px])
 */
import { X } from "lucide-react";
import { useEffect } from "react";

export default function SidePanel({
  open,
  onClose,
  title,
  children,
  width = "w-[420px]",
  actions = null,
}) {
  useEffect(() => {
    function onEsc(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      ></div>

      {/* Panel */}
      <div
        className={`absolute top-0 right-0 h-full bg-white shadow-2xl border-l border-gray-200 flex flex-col ${width} transform transition-transform duration-300 pointer-events-auto ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Nhấn ESC hoặc ngoài vùng để đóng
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded p-1 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {actions && (
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex gap-2">
            {actions}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">{children}</div>
      </div>
    </div>
  );
}
