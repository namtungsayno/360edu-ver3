/**
 * Component nút Quay lại chuẩn cho toàn bộ ứng dụng
 * Đảm bảo sự đồng nhất về giao diện và hành vi
 */
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";

/**
 * BackButton - Nút quay lại chuẩn
 * @param {function} onClick - Handler tùy chỉnh (nếu không có sẽ dùng navigate(-1))
 * @param {string} to - Đường dẫn cụ thể để navigate tới
 * @param {string} label - Text hiển thị (mặc định: "Quay lại")
 * @param {boolean} showLabel - Hiển thị text hay không (mặc định: true)
 * @param {string} variant - Variant của nút: "ghost" | "outline" | "link" (mặc định: "ghost")
 * @param {string} className - Class CSS bổ sung
 */
export function BackButton({
  onClick,
  to,
  label = "Quay lại",
  showLabel = true,
  variant = "ghost",
  className = "",
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant={variant}
      size={showLabel ? "sm" : "icon"}
      onClick={handleClick}
      className={`text-gray-600 hover:text-gray-900 hover:bg-gray-100 ${
        showLabel ? "-ml-2" : "rounded-full"
      } ${className}`}
    >
      <ArrowLeft className={`w-5 h-5 ${showLabel ? "mr-2" : ""}`} />
      {showLabel && <span>{label}</span>}
    </Button>
  );
}

export default BackButton;
