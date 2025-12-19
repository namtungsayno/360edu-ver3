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
import { useEffect, useState, useCallback, useMemo } from "react";
import Header from "../components/common/Header";
import { Footer } from "../components/common/Footer";
import PageTransition from "../components/common/PageTransition";

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
    } else if (path === "/home/profile/student") {
      setCurrentPage({ type: "student-profile" });
    } else if (
      path === "/home/my-classes" ||
      path.startsWith("/home/my-classes/")
    ) {
      setCurrentPage({ type: "my-classes" });
    } else if (path === "/home/my-schedule") {
      setCurrentPage({ type: "student-schedule" });
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
  // Memo hóa để tránh re-render không cần thiết
  const onNavigate = useCallback(
    (page) => {
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
          if (page.search) {
            navigate(`/home/classes?search=${encodeURIComponent(page.search)}`);
          } else {
            navigate("/home/classes");
          }
          break;
        case "class":
          if (page.id) {
            navigate(`/home/classes/${page.id}`);
          } else if (page.classId) {
            navigate(`/home/classes/${page.classId}`);
          } else {
            navigate("/home/classes");
          }
          break;
        case "teachers":
          if (page.search) {
            navigate(`/home/teachers?search=${encodeURIComponent(page.search)}`);
          } else {
            navigate("/home/teachers");
          }
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
          break;
        case "subject":
          // TODO: Navigate đến chi tiết subject
          break;
        case "teacher":
          // Navigate to teacher detail page
          if (page.id) {
            navigate(`/home/teachers/${page.id}`);
          } else if (page.teacherId) {
            navigate(`/home/teachers/${page.teacherId}`);
          } else if (page.search) {
            navigate(`/home/teachers?search=${encodeURIComponent(page.search)}`);
          } else {
            navigate("/home/teachers");
          }
          break;
        case "student-classes":
          navigate("/home/my-classes");
          break;
        case "student-schedule":
          navigate("/home/my-schedule");
          break;
        case "student-profile":
          navigate("/home/profile/student");
          break;
        case "my-classes":
          navigate("/home/my-classes");
          break;
        case "my-class":
          if (page.classId) {
            navigate(`/home/my-classes/${page.classId}`);
          } else {
            navigate("/home/my-classes");
          }
          break;
        case "payment-history":
          navigate("/home/payment-history");
          break;
        default:
          }
    },
    [navigate]
  );

  // Memo context value để tránh re-render
  const outletContext = useMemo(() => ({ onNavigate }), [onNavigate]);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Header cố định cho tất cả guest pages */}
      <Header onNavigate={onNavigate} currentPage={currentPage} />

      {/* Main content - render các page components với Page Transition */}
      <main className="flex-1">
        <PageTransition>
          <Outlet context={outletContext} />
        </PageTransition>
      </main>

      {/* Footer chung */}
      <Footer />
    </div>
  );
}
