/**
 * GUEST LAYOUT - Layout cho các trang guest (chưa đăng nhập)
 * 
 * Routes được quản lý:
 * - /home (Trang chủ)
 * - /home/profile (Profile guest)
 * - /home/classes (Danh sách lớp học)
 * - /home/classes/:id (Chi tiết lớp)
 * - /home/teachers (Danh sách giáo viên)
 * - /home/about (Giới thiệu)
 * - /home/news (Tin tức - chưa implement)
 * 
 * Chức năng:
 * - Quản lý navigation giữa các trang guest
 * - Track trang hiện tại để highlight menu
 * - Truyền onNavigate function qua Outlet context
 * - Hiển thị Header chung cho tất cả pages
 */

import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/common/Header";

export default function GuestLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State để track trang hiện tại (cho highlight navigation)
  const [currentPage, setCurrentPage] = useState({ type: "home" });

  // Cập nhật currentPage dựa trên URL thay đổi
  useEffect(() => {
    const path = location.pathname;
    if (path === "/home") {
      setCurrentPage({ type: "home" });
    } else if (path === "/home/profile") {
      setCurrentPage({ type: "profile" });
    } else if (path === "/home/classes" || path.startsWith("/home/classes/")) {
      setCurrentPage({ type: "classes" });
    } else if (path === "/home/teachers") {
      setCurrentPage({ type: "teachers" });
    } else if (path === "/home/about") {
      setCurrentPage({ type: "about" });
    } else if (path.includes("/news")) {
      setCurrentPage({ type: "news" });
    }
  }, [location.pathname]);

  // Hàm điều hướng - được truyền xuống cho Header và các components
  const onNavigate = (page) => {
    switch (page.type) {
      case "home":
        navigate("/home");
        break;
      case "login":
        navigate("/home/login");
        break;
      case "register":
        navigate("/home/register");
        break; 
      case "profile":
        navigate("/home/profile");
        break;
      case "classes":
        navigate("/home/classes");
        break;
      case "teachers":
        navigate("/home/teachers");
        break;
      case "news":
        if (page.id) {
          navigate(`/home/news/${page.id}`);
        } else {
          navigate("/home/news");
        }
        break;
      case "about":
        navigate("/home/about");
        break;
      case "course":
        // TODO: Navigate đến chi tiết course
        console.log("Navigate to course:", page.courseId);
        break;
      case "subject":
        // TODO: Navigate đến chi tiết subject
        console.log("Navigate to subject:", page.subjectId);
        break;
      case "teacher":
        // TODO: Navigate đến profile teacher
        console.log("Navigate to teacher:", page.teacherId);
        break;
      default:
        console.log("Unknown navigation:", page);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header cố định cho tất cả guest pages */}
      <Header onNavigate={onNavigate} currentPage={currentPage} />
      
      {/* Main content - render các page components thông qua Outlet */}
      <main>
        <Outlet context={{ onNavigate }} />
      </main>
    </div>
  );
}

