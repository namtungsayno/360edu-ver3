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
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const IconCheck = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
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
  const [, setRefreshTick] = useState(0); // internal tick to force context identity change
  const rootRef = useRef(null);
  const registryRef = useRef(new Map()); // value -> label
  const lastLabelRef = useRef(""); // immediate feedback label

  const rawVal = isCtrl ? value : internal;
  const val = rawVal == null ? "" : String(rawVal);

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
        const next = v == null ? "" : String(v);
        if (!isCtrl) setInternal(next);
        onValueChange?.(next);
        setOpen(false);
      },
      setValueWithLabel: (v, label) => {
        lastLabelRef.current = String(label ?? "");
        const next = v == null ? "" : String(v);
        if (!isCtrl) setInternal(next);
        onValueChange?.(next);
        setOpen(false);
      },
      rootRef,
      register: (v, label) => {
        const key = String(v);
        if (!registryRef.current.has(key)) {
          registryRef.current.set(key, String(label ?? ""));
        }
      },
      unregister: (v) => {
        registryRef.current.delete(String(v));
      },
      getLabel: (v) => registryRef.current.get(String(v)),
      getImmediateLabel: () => lastLabelRef.current,
      forceRefresh: () => setRefreshTick((n) => n + 1),
    }),
    [val, open, isCtrl, onValueChange, setRefreshTick]
  );

  return (
    <div ref={rootRef} className="relative inline-block min-w-[8rem]">
      <Ctx.Provider value={api}>{children}</Ctx.Provider>
    </div>
  );
}

// Fallback: if controlled value was set before its item registered, ensure we re-bump after mount
// This handles edge case hydration where value arrives, options async register slightly later.
// The item registration already calls bump(), but we add a safety net to re-bump if label still missing.
// (Non-invasive: only triggers when a value exists but no label stored yet while some items are present.)
// Note: Keeping this outside Select component would require refactoring; simplest is an inline helper hook.

export function SelectTrigger({
  className = "",
  size = "default",
  children,
  ...props
}) {
  const { open, setOpen } = useContext(Ctx);
  const sizeCls = size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-3 text-sm";
  const iconCls = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
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
      <span className="flex-1 min-w-0 text-left truncate">{children}</span>
      <IconChevronDown
        className={cn("ml-2 opacity-60 text-gray-500", iconCls)}
      />
    </button>
  );
}

export function SelectValue({ placeholder }) {
  const { value, getLabel, getImmediateLabel } = useContext(Ctx);
  const label = value
    ? getLabel?.(String(value)) || getImmediateLabel?.()
    : undefined;
  return (
    <span className={cn("block truncate", value ? "" : "text-gray-400")}>
      {label || placeholder}
    </span>
  );
}

export function SelectContent({ className = "", children }) {
  const { open } = useContext(Ctx);
  return (
    <div
      className={cn(
        "absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg",
        className
      )}
      role="listbox"
      style={{ display: open ? "block" : "none" }}
    >
      <div className="p-1 max-h-60 overflow-auto">{children}</div>
    </div>
  );
}

export function SelectItem({ value, children, className = "", ...props }) {
  const ctx = useContext(Ctx);
  const selected = String(ctx.value) === String(value);
  // try to extract a string label from children for the trigger display
  const textLabel = useMemo(() => {
    const walk = (node) => {
      if (node == null) return "";
      if (typeof node === "string" || typeof node === "number")
        return String(node);
      if (Array.isArray(node)) return node.map(walk).join("");
      if (React.isValidElement(node)) return walk(node.props?.children);
      return "";
    };
    return walk(children).trim();
  }, [children]);

  useEffect(() => {
    ctx.register?.(String(value), textLabel);
    // One-time refresh if this item is selected and label wasn't ready when SelectValue first rendered
    if (selected && !ctx.getLabel?.(String(value))) {
      ctx.forceRefresh?.();
    }
    return () => ctx.unregister?.(String(value));
  }, [ctx, value, textLabel, selected]);
  return (
    <div
      role="option"
      aria-selected={selected}
      tabIndex={0}
      onMouseDown={(e) => {
        e.preventDefault();
        ctx.setValueWithLabel?.(value, textLabel);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          ctx.setValueWithLabel?.(value, textLabel);
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
      <span className="mr-6 leading-5">{children}</span>
      {selected ? (
        <IconCheck className="absolute right-2 h-4 w-4 text-gray-700" />
      ) : null}
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
