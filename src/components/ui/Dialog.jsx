import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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

  // Lock body scroll when dialog is open to avoid layout shifts and stray gaps
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!visible) return null;

  // ✅ Support more sizes: sm | md | lg | xl | full
  const sizeCls =
    size === "sm"
      ? "max-w-sm"
      : size === "lg"
      ? "max-w-2xl"
      : size === "xl"
      ? "max-w-6xl"
      : size === "full"
      ? "max-w-[95vw]"
      : "max-w-md"; // default md

  // Base width: use 90% for normal sizes, 95vw for full-width
  const widthCls = size === "full" ? "w-[95vw]" : "w-[90%]";

  const lightCls = "bg-white text-gray-900 border border-gray-200 shadow-xl";
  const darkCls = "bg-gray-900 text-white border border-gray-700 shadow-2xl";

  const overlay = (
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
          "rounded-xl p-6",
          widthCls,
          sizeCls,
          variant === "dark" ? darkCls : lightCls,
          "relative transform transition-all duration-300",
          open
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95"
        )}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        // Avoid any default focus outline that can appear as a stray border
        style={{ outline: "none" }}
      >
        {children}
      </div>
    </div>
  );

  // Use a portal so the overlay is not constrained by parent stacking contexts (fixes white strip near header)
  return createPortal(overlay, document.body);
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
