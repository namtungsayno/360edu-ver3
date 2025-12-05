// src/components/common/PageTransition.jsx
// Component wrapper để tạo hiệu ứng chuyển trang mượt mà

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function PageTransition({ children }) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    // Khi route thay đổi, bắt đầu animation
    setIsVisible(false);

    // Đợi một chút rồi hiện nội dung mới với animation
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname, children]);

  return (
    <div
      className={`page-transition ${
        isVisible ? "page-enter-active" : "page-enter"
      }`}
    >
      {displayChildren}
    </div>
  );
}
