import { ArrowRight, CheckCircle, LogIn } from "lucide-react";
import { Button } from "../ui/Button";

// Unified enrollment button styling
// Props:
// - state: "default" | "login" | "loading" | "disabled" | "success"
// - onClick: handler
// - fullWidth: boolean
// - children: override label
// - className: extra styles
export default function EnrollButton({
  state = "default",
  onClick,
  fullWidth = true,
  className = "",
  children,
  disabled = false,
}) {
  const base = "relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 shadow-sm";
  const sizing = fullWidth ? "w-full" : "px-5";

  let palette = "";
  let label = children;
  let icon = null;

  switch (state) {
    case "loading":
      palette = "bg-gradient-to-r from-blue-500 to-indigo-600 text-white cursor-wait";
      label = label || "Đang xử lý...";
      icon = (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      );
      break;
    case "login":
      palette = "bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50";
      label = label || "Đăng nhập để đăng ký";
      icon = <LogIn className="w-4 h-4" />;
      break;
    case "disabled":
      palette = "bg-gray-200 text-gray-500 cursor-not-allowed";
      label = label || "Hết chỗ";
      icon = <CheckCircle className="w-4 h-4" />;
      break;
    case "success":
      palette = "bg-green-500 hover:bg-green-600 text-white";
      label = label || "Đã đăng ký";
      icon = <CheckCircle className="w-4 h-4" />;
      break;
    default:
      palette = "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:shadow-lg hover:scale-[1.01] active:scale-[.99]";
      label = label || "Đăng ký ngay";
      icon = <ArrowRight className="w-4 h-4" />;
  }

  return (
    <Button
      onClick={onClick}
      disabled={disabled || state === "loading" || state === "disabled"}
      className={`${base} ${palette} ${sizing} py-3 text-sm ${className}`}
    >
      {icon}
      <span>{label}</span>
      {state === "default" && (
        <span className="absolute inset-0 rounded-xl ring-1 ring-black/5" />
      )}
    </Button>
  );
}
