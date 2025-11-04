// /**
//  * Simple Dialog (Modal) Component — có hiệu ứng fadeIn/fadeOut + slide-up
//  * Không cần Radix, chỉ React + Tailwind
//  */

// import React, { useEffect, useState } from "react";

// export function Dialog({ open, onOpenChange, children }) {
//   const [visible, setVisible] = useState(open);

//   // Khi open = false thì delay 200ms để chạy animation fadeOut
//   useEffect(() => {
//     if (open) setVisible(true);
//     else {
//       const timer = setTimeout(() => setVisible(false), 200);
//       return () => clearTimeout(timer);
//     }
//   }, [open]);

//   if (!visible) return null;

//   return (
//     <div
//       className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm
//         transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
//       onClick={() => onOpenChange(false)}
//     >
//       <div
//         className={`bg-gray-800 text-white rounded-xl shadow-xl border border-gray-700 p-6 w-[90%] max-w-md relative
//           transform transition-all duration-300
//           ${
//             open
//               ? "opacity-100 translate-y-0 scale-100"
//               : "opacity-0 translate-y-4 scale-95"
//           }`}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {children}
//       </div>
//     </div>
//   );
// }

// export function DialogHeader({ children }) {
//   return <div className="mb-4">{children}</div>;
// }

// export function DialogTitle({ children }) {
//   return <h3 className="text-lg font-semibold text-yellow-400">{children}</h3>;
// }

// export function DialogContent({ children }) {
//   return <div className="mt-2">{children}</div>;
// }

// export function DialogFooter({ children }) {
//   return <div className="mt-4 flex justify-end gap-2">{children}</div>;
// }
/**
 * Simple Dialog (Modal) — Light by default
 * - giữ fadeIn/fadeOut + slide-up
 * - thêm variant: "light" | "dark" (mặc định: light)
 * - thêm size: "sm" | "md" | "lg"
 * - đóng khi bấm overlay hoặc ESC
 */

import React, { useEffect, useState } from "react";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

export function Dialog({
  open,
  onOpenChange,
  children,
  variant = "light",
  size = "md",
}) {
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) setVisible(true);
    else {
      const t = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    function onEsc(e) {
      if (e.key === "Escape") onOpenChange?.(false);
    }
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onOpenChange]);

  if (!visible) return null;

  const sizeCls =
    size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-md";

  const lightCls = "bg-white text-gray-900 border border-gray-200 shadow-xl";
  const darkCls = "bg-gray-900 text-white border border-gray-700 shadow-2xl";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "backdrop-blur-sm transition-opacity duration-200",
        open ? "opacity-100" : "opacity-0"
      )}
      onClick={() => onOpenChange?.(false)}
      style={{ backgroundColor: "rgba(0,0,0,0.3)" }} // tương đương bg-black/30 (nhẹ hơn 70)
    >
      <div
        className={cn(
          "rounded-xl p-6 w-[90%]",
          sizeCls,
          variant === "dark" ? darkCls : lightCls,
          "relative transform transition-all duration-300",
          open
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children, className = "" }) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function DialogTitle({ children, className = "" }) {
  // bỏ text vàng để phù hợp light theme
  return (
    <h3 className={cn("text-lg font-semibold text-gray-900", className)}>
      {children}
    </h3>
  );
}

export function DialogContent({ children, className = "" }) {
  return <div className={cn("mt-2", className)}>{children}</div>;
}

export function DialogFooter({ children, className = "" }) {
  return (
    <div className={cn("mt-4 flex justify-end gap-2", className)}>
      {children}
    </div>
  );
}
