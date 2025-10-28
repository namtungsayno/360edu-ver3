/**
 * ROUTER INDEX - Cấu hình điều hướng chính cho toàn bộ ứng dụng
 * 
 * Trang được định tuyến:
 * AUTH ROUTES (AuthLayout):
 * - /home/login → Login.jsx
 * - /home/register → Register.jsx
 * 
 * GUEST ROUTES (GuestLayout):
 * - /home → Home.jsx (trang chủ)
 * - /home/profile → Profile.jsx
 * - /home/courses → CourseList.jsx
 * - /home/subjects → SubjectList.jsx  
 * - /home/teachers → TeacherList.jsx
 * - /home/about → About.jsx
 * 
 * ADMIN ROUTES (AdminLayout):
 * - /home/admin/dashboard → Dashboard.jsx
 * - /home/admin/users → User.jsx
 * 
 * Chức năng:
 * - BrowserRouter cho client-side routing
 * - Nested routes với các Layout tương ứng
 * - Redirect từ root "/" về "/home"
 * - Tách biệt rõ ràng auth, guest, admin routes
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";
import GuestLayout from "../layouts/GuestLayout";

// GUEST PAGES - Các trang dành cho user chưa đăng nhập
import Home from "../pages/guest/Home";
import Profile from "../pages/guest/Profile";
import CourseList from "../pages/guest/CourseList";
import SubjectList from "../pages/guest/SubjectList";
import TeacherList from "../pages/guest/TeacherList";
import About from "../pages/guest/About";

// ADMIN PAGES - Các trang dành cho admin (cần đăng nhập)
import Dashboard from "../pages/admin/Dashboard";
import User from "../pages/admin/User";

// AUTH PAGES - Các trang đăng nhập/đăng ký
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ROOT REDIRECT - Tự động chuyển từ "/" về "/home" */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* AUTH ROUTES - Các route đăng nhập/đăng ký (không có Header) */}
        <Route element={<AuthLayout />}>
          <Route path="/home/login" element={<Login />} />
          <Route path="/home/register" element={<Register />} />
        </Route>

        {/* GUEST ROUTES - Các route cho người dùng chưa đăng nhập (có Header) */}
        <Route element={<GuestLayout />}>
          <Route path="/home" element={<Home />} />                    {/* Trang chủ */}
          <Route path="/home/profile" element={<Profile />} />         {/* Profile guest */}
          <Route path="/home/courses" element={<CourseList />} />      {/* Danh sách khóa học */}
          <Route path="/home/subjects" element={<SubjectList />} />    {/* Danh sách lớp học */}
          <Route path="/home/teachers" element={<TeacherList />} />    {/* Danh sách giáo viên */}
          <Route path="/home/about" element={<About />} />             {/* Giới thiệu */}
        </Route>

        {/* ADMIN ROUTES - Các route dành cho admin (cần authentication) */}
        <Route path="/home/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />   {/* Redirect admin root */}
          <Route path="dashboard" element={<Dashboard />} />              {/* Dashboard admin */}
          <Route path="users" element={<User />} />                       {/* Quản lý users */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
