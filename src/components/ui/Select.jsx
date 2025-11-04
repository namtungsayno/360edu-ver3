import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown, Check } from "lucide-react"; // nếu bạn muốn không dùng icon lib, thay bằng SVG inline phía dưới

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

// (Nếu không muốn lucide-react, dùng SVG thay thế):
const IconChevronDown = (props) => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" {...props}>
    <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const IconCheck = (props) => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" {...props}>
    <path
      d="M20 6L9 17l-5-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const Ctx = createContext(null);

export function Select({ value, defaultValue, onValueChange, children }) {
  const isCtrl = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const val = isCtrl ? value : internal;

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const api = useMemo(
    () => ({
      value: val,
      open,
      setOpen,
      setValue: (v) => {
        if (!isCtrl) setInternal(v);
        onValueChange?.(v);
        setOpen(false);
      },
      rootRef,
    }),
    [val, open, isCtrl, onValueChange]
  );

  return (
    <div ref={rootRef} className="relative inline-block min-w-[8rem]">
      <Ctx.Provider value={api}>{children}</Ctx.Provider>
    </div>
  );
}

export function SelectTrigger({
  className = "",
  size = "default",
  children,
  ...props
}) {
  const { open, setOpen } = useContext(Ctx);
  const sizeCls = size === "sm" ? "h-9 px-3 text-sm" : "h-10 px-3 text-sm";
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "inline-flex w-full items-center justify-between rounded-lg border",
        "border-gray-300 bg-white text-gray-900 shadow-sm transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-gray-900/80 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
        sizeCls,
        className
      )}
      {...props}
    >
      {children}
      <IconChevronDown className="ml-2 opacity-60" />
    </button>
  );
}

export function SelectValue({ placeholder }) {
  const { value } = useContext(Ctx);
  return (
    <span className={cn(value ? "" : "text-gray-400")}>
      {value || placeholder}
    </span>
  );
}

export function SelectContent({ className = "", children }) {
  const { open } = useContext(Ctx);
  if (!open) return null;
  return (
    <div
      className={cn(
        "absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg",
        className
      )}
      role="listbox"
    >
      <div className="p-1 max-h-60 overflow-auto">{children}</div>
    </div>
  );
}

export function SelectItem({ value, children, className = "", ...props }) {
  const ctx = useContext(Ctx);
  const selected = ctx.value === value;
  return (
    <div
      role="option"
      aria-selected={selected}
      tabIndex={0}
      onMouseDown={(e) => {
        e.preventDefault();
        ctx.setValue(value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          ctx.setValue(value);
        }
        if (e.key === "Escape") ctx.setOpen(false);
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm outline-none",
        "hover:bg-gray-100",
        className
      )}
      {...props}
    >
      <span className="mr-6">{children}</span>
      {selected ? <IconCheck className="absolute right-2" /> : null}
    </div>
  );
}

// (Optional) Label/Separator để tương thích API cũ
export function SelectLabel({ className = "", children }) {
  return (
    <div
      className={cn("px-2 py-1.5 text-xs font-medium text-gray-500", className)}
    >
      {children}
    </div>
  );
}
export function SelectSeparator({ className = "" }) {
  return <div className={cn("my-1 h-px bg-gray-200", className)} />;
}

export default {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
};
