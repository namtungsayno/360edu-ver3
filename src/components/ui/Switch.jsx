import React from "react";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

/**
 * Props:
 * - checked, defaultChecked, onCheckedChange(boolean)
 * - disabled, className, id
 */
export const Switch = React.forwardRef(function Switch(
  {
    checked,
    defaultChecked,
    onCheckedChange,
    disabled,
    className = "",
    ...props
  },
  ref
) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const value = isControlled ? !!checked : internal;

  const toggle = () => {
    if (disabled) return;
    const next = !value;
    if (!isControlled) setInternal(next);
    onCheckedChange?.(next);
  };

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
        if (e.key === "ArrowLeft") {
          if (!isControlled) setInternal(false);
          onCheckedChange?.(false);
        }
        if (e.key === "ArrowRight") {
          if (!isControlled) setInternal(true);
          onCheckedChange?.(true);
        }
      }}
      className={cn(
        "inline-flex h-[22px] w-[42px] items-center rounded-full transition-colors",
        value ? "bg-gray-900" : "bg-gray-300",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "h-[18px] w-[18px] bg-white rounded-full shadow transform transition-transform",
          value ? "translate-x-[22px]" : "translate-x-1"
        )}
      />
    </button>
  );
});

export default Switch;
