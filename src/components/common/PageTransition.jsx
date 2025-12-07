// src/components/common/PageTransition.jsx
// Component wrapper để tạo hiệu ứng chuyển trang mượt mà

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function PageTransition({ children }) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    // Chỉ trigger animation khi PATHNAME thực sự thay đổi
    if (location.pathname !== currentPath) {
      setIsVisible(false);

      const timer = setTimeout(() => {
        setCurrentPath(location.pathname);
        setIsVisible(true);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, currentPath]);

  return (
    <div
      className={`page-transition ${
        isVisible ? "page-enter-active" : "page-enter"
      }`}
    >
      {children}
    </div>
  );
}
