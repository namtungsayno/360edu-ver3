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
 * - /home/classes → ClassList.jsx
 * - /home/classes/:id → ClassDetail.jsx
 * - /home/courses → CourseList.jsx
 * - /home/subjects → SubjectList.jsx
 * - /home/teachers → TeacherList.jsx
 * - /home/teachers/:id → TeacherDetail.jsx
 * - /home/news → NewsList.jsx
 * - /home/about → About.jsx
 *
 * ADMIN ROUTES (AdminLayout):
 * - /home/admin/dashboard → Dashboard.jsx
 * - /home/admin/users → User.jsx
 * - /home/admin/subject → SubjectManagement.jsx
 * - /home/admin/subject/create → CreateSubjectManagement.jsx
 * - /home/admin/subject/:id → SubjectDetail.jsx
 *
 * Chức năng:
 * - BrowserRouter cho client-side routing
 * - Nested routes với các Layout tương ứng
 * - Redirect từ root "/" về "/home"
 * - Tách biệt rõ ràng auth, guest, admin routes
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RequireRole } from "../utils/RouteGuards.jsx";

import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";
import GuestLayout from "../layouts/GuestLayout";
import TeacherLayout from "../layouts/TeacherLayout.jsx";

// GUEST PAGES - Các trang dành cho user chưa đăng nhập
import Home from "../pages/guest/home/Home";
import Profile from "../pages/guest/profile/Profile";
import CourseList from "../pages/guest/courses/CourseList";
import SubjectList from "../pages/guest/subjects/SubjectList";
import TeacherList from "../pages/guest/teachers/TeacherList";
import TeacherDetail from "../pages/guest/teachers/TeacherDetail";
// Guest - Classes
import ClassList from "../pages/guest/classes/ClassList.jsx";
import ClassDetail from "../pages/guest/classes/ClassDetail.jsx";
// Guest - News
import GuestNewsList from "../pages/guest/news/NewsList.jsx";
import NewsDetail from "../pages/guest/news/NewsDetail.jsx";
import About from "../pages/guest/about/About";

// ADMIN PAGES - Các trang dành cho admin (cần đăng nhập)
import Dashboard from "../pages/admin/Dashboard";
import User from "../pages/admin/User";
import NewsList from "../pages/admin/news/NewsList";
import CreateNews from "../pages/admin/news/CreateNews";
import ClassroomList from "../pages/admin/room/RoomManagement.jsx";

// tuấn test
// FIXED: Import các component cho Class Management (Quản lý lớp học)
import CreateClass from "../pages/admin/class/ClassManagement.jsx";
import CreateOfflineClassPage from "../pages/admin/class/CreateOfflineClassPage.jsx";
import CreateOnlineClassPage from "../pages/admin/class/CreateOnlineClassPage.jsx";
import ScheduleManagement from "../pages/admin/schedule/ScheduleManagement.jsx";
import AdminClassDetail from "../pages/admin/schedule/AdminClassDetail.jsx";

// AUTH PAGES - Các trang đăng nhập/đăng ký
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import SubjectManagement from "../pages/admin/subject/SubjectManagement.jsx";
import CreateSubjectManagement from "../pages/admin/subject/CreateSubjectManagement.jsx";
import SubjectDetail from "../pages/admin/subject/SubjectDetail.jsx";
import CreateTeacherPage from "../pages/admin/user/CreateTeacherPage.jsx";
import AdminCourseList from "../pages/admin/course/CourseList.jsx";
import AdminCourseDetail from "../pages/admin/course/CourseDetail.jsx";

//TEACHER - Các trang danh cho Teacher
import TeacherProfile from "../pages/teacher/TeacherManagement.jsx";
import TeacherSchedule from "../pages/teacher/TeacherSchedule.jsx";
import TeacherClassDetail from "../pages/teacher/ClassDetail.jsx";
import TeacherCourseList from "../pages/teacher/TeacherCourseList.jsx";
import TeacherCourseCreate from "../pages/teacher/TeacherCourseCreate.jsx";
import TeacherCourseDetail from "../pages/teacher/TeacherCourseDetail.jsx";
import TeacherCourseEdit from "../pages/teacher/TeacherCourseEdit.jsx";

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
          <Route path="/home" element={<Home />} /> {/* Trang chủ */}
          <Route path="/home/profile" element={<Profile />} />
          <Route path="/home/classes" element={<ClassList />} />{" "}
          {/* Danh sách lớp học */}
          <Route path="/home/classes/:id" element={<ClassDetail />} />
          <Route path="/home/teachers" element={<TeacherList />} />{" "}
          {/* Danh sách giáo viên */}
          <Route path="/home/teachers/:id" element={<TeacherDetail />} />{" "}
          {/* Chi tiết giáo viên */}
          <Route path="/home/news" element={<GuestNewsList />} />{" "}
          {/* Tin tức */}
          <Route path="/home/news/:id" element={<NewsDetail />} />{" "}
          {/* Chi tiết tin tức */}
          <Route path="/home/about" element={<About />} /> {/* Giới thiệu */}
        </Route>
        {/* ADMIN ROUTES - Các route dành cho admin (cần authentication) */}
        <Route element={<RequireRole allow={["admin"]} />}>
          <Route path="/home/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<User />} />
            <Route
              path="users/create-teacher"
              element={<CreateTeacherPage />}
            />
            <Route path="news" element={<NewsList />} />
            <Route path="news/create" element={<CreateNews />} />
            <Route path="classrooms" element={<ClassroomList />} />
            {/* Tuấn test */}
            {/* FIXED: Thêm route cho Class Management - Quản lý lớp học */}
            <Route path="class" element={<CreateClass />} />
            <Route
              path="class/create-offline"
              element={<CreateOfflineClassPage />}
            />
            <Route
              path="class/create-online"
              element={<CreateOnlineClassPage />}
            />
            {/* FIXED: Thêm route cho Schedule Management - Quản lý lịch học */}
            <Route path="schedule" element={<ScheduleManagement />} />
            <Route
              path="schedule/class/:classId"
              element={<AdminClassDetail />}
            />
            <Route path="subject" element={<SubjectManagement />} />
            <Route
              path="subject/create"
              element={<CreateSubjectManagement />}
            />
            <Route path="subject/:id" element={<SubjectDetail />} />
            <Route path="courses" element={<AdminCourseList />} />
            <Route path="courses/:id" element={<AdminCourseDetail />} />
          </Route>
        </Route>
        {/* Teacher ROUTES - Các route dành cho teacher (cần authentication) */}
        <Route path="/home/teacher" element={<TeacherLayout />}>
          <Route path="management" element={<TeacherProfile />} />
          <Route path="profile" element={<TeacherProfile />} />
          <Route path="schedule" element={<TeacherSchedule />} />
          <Route path="class/:classId" element={<TeacherClassDetail />} />
          <Route path="courses" element={<TeacherCourseList />} />
          {/* ✅ khớp với navigate("/home/teacher/courses/create") trong TeacherCourseList */}
          <Route path="courses/create" element={<TeacherCourseCreate />} />
          {/* ✅ khớp với navigate(`/home/teacher/courses/${id}/edit`) - chỉnh sửa khóa học */}
          <Route path="courses/:id/edit" element={<TeacherCourseEdit />} />
          {/* ✅ khớp với navigate(`/home/teacher/courses/${id}`) - xem chi tiết khóa học */}
          <Route path="courses/:id" element={<TeacherCourseDetail />} />
          {/* <Route path="attendance" element={<TeacherAttendance />} /> */}
          {/* <Route path="attendance" element={<TeacherAttendance />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
