import React, { createContext, useContext, useMemo, useState } from "react";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

const TabsCtx = createContext(null);

export function Tabs({ value, defaultValue, onValueChange, children }) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);

  const current = isControlled ? value : internal;

  const api = useMemo(
    () => ({
      value: current,
      setValue: (v) => {
        if (!isControlled) setInternal(v);
        onValueChange?.(v);
      },
    }),
    [current, isControlled, onValueChange]
  );

  return <TabsCtx.Provider value={api}>{children}</TabsCtx.Provider>;
}

export function TabsList({ className = "", children, ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg bg-gray-100 p-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className = "", children, ...props }) {
  const ctx = useContext(TabsCtx);
  const active = ctx?.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx?.setValue(value)}
      data-state={active ? "active" : "inactive"}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-600 hover:bg-white/70",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = "", children, ...props }) {
  const ctx = useContext(TabsCtx);
  if (ctx?.value !== value) return null;
  return (
    <div className={cn("mt-3", className)} {...props}>
      {children}
    </div>
  );
}

export default { Tabs, TabsList, TabsTrigger, TabsContent };
