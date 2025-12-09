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
 * - /home/teachers → TeacherList.jsx
 * - /home/teachers/:id → TeacherDetail.jsx
 * - /home/news → NewsList.jsx
 * - /home/about → About.jsx
 * - /home/my-classes → StudentClasses.jsx (lớp đã đăng ký)
 * - /home/my-classes/:id → StudentClassDetail.jsx
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
import StudentClasses from "../pages/student/Classes.jsx";
import StudentClassDetail from "../pages/student/ClassDetail.jsx";
import StudentCourseDetail from "../pages/student/CourseDetail.jsx";
import StudentProfile from "../pages/student/StudentProfile.jsx";
import StudentSchedule from "../pages/student/StudentSchedule.jsx";
import AllNotifications from "../pages/student/AllNotifications.jsx";
import StudentPaymentHistory from "../pages/student/PaymentHistory.jsx";

// GUEST PAGES - Các trang dành cho user chưa đăng nhập
import Home from "../pages/guest/home/Home";
import Profile from "../pages/guest/profile/Profile";
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
import AdminNewsDetail from "../pages/admin/news/AdminNewsDetail.jsx";
import CreateNews from "../pages/admin/news/CreateNews";
import ClassroomList from "../pages/admin/room/RoomManagement.jsx";

// tuấn test
// FIXED: Import các component cho Class Management (Quản lý lớp học)
import ClassManagement from "../pages/admin/class/ClassManagement.jsx";
import ClassEditPage from "../pages/admin/class/ClassEditPage.jsx";
import CreateOfflineClassPage from "../pages/admin/class/CreateOfflineClassPage.jsx";
import CreateOnlineClassPage from "../pages/admin/class/CreateOnlineClassPage.jsx";
import ScheduleManagement from "../pages/admin/schedule/ScheduleManagement.jsx";
import AdminClassDetail from "../pages/admin/schedule/AdminClassDetail.jsx";

// AUTH PAGES - Các trang đăng nhập/đăng ký
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import GoogleCallback from "../pages/auth/GoogleCallback";
import SubjectManagement from "../pages/admin/subject/SubjectManagement.jsx";
import CreateSubjectManagement from "../pages/admin/subject/CreateSubjectManagement.jsx";
import SubjectDetail from "../pages/admin/subject/SubjectDetail.jsx";
import CourseOfSubjectDetail from "../pages/admin/subject/CourseOfSubjectDetail.jsx";
import CourseOfSubjectCreate from "../pages/admin/subject/CourseOfSubjectCreate.jsx";
import CreateTeacherPage from "../pages/admin/user/CreateTeacherPage.jsx";
import AdminCourseList from "../pages/admin/course/CourseList.jsx";
import AdminCourseDetail from "../pages/admin/course/CourseDetail.jsx";
import AdminCourseCreate from "../pages/admin/course/AdminCourseCreate.jsx";
import PaymentHistory from "../pages/admin/payment/PaymentHistory.jsx";
import TeacherAttendanceList from "../pages/admin/TeacherAttendanceList.jsx";
import TeacherAttendanceDetail from "../pages/admin/TeacherAttendanceDetail.jsx";
import TeacherClassAttendance from "../pages/admin/TeacherClassAttendance.jsx";
import ReportDashboard from "../pages/admin/report/ReportDashboard.jsx";

// Teacher pages
import TeacherManagement from "../pages/teacher/profile/TeacherManagement.jsx";
import AdminTeacherManagement from "../pages/admin/teacher/TeacherManagement.jsx";
import TeacherSchedule from "../pages/teacher/schedule/TeacherSchedule.jsx";
import TeacherClassDetail from "../pages/teacher/class/ClassDetail.jsx";
import TeacherCourseList from "../pages/teacher/course/TeacherCourseList.jsx";
import TeacherCourseDetail from "../pages/teacher/course/TeacherCourseDetail.jsx";
import TeacherCourseEdit from "../pages/teacher/course/TeacherCourseEdit.jsx";
import TeachingContent from "../pages/teacher/content/TeachingContent.jsx";
import TeachingContentDetail from "../pages/teacher/content/TeachingContentDetail.jsx";
import TeacherResetPassword from "../pages/teacher/profile/TeacherResetPassword.jsx";

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
          <Route path="/home/forgot-password" element={<ForgotPassword />} />
        </Route>
        {/* GOOGLE AUTH CALLBACK - Xử lý OAuth redirect */}
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
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
          {/* STUDENT ROUTES - Lớp đã đăng ký (cần đăng nhập) - Dùng chung GuestLayout */}
          <Route path="/home/my-classes" element={<StudentClasses />} />{" "}
          {/* Lớp đã đăng ký */}
          <Route
            path="/home/my-classes/:id"
            element={<StudentClassDetail />}
          />{" "}
          {/* Chi tiết lớp đã đăng ký */}
          <Route path="/home/my-schedule" element={<StudentSchedule />} />{" "}
          {/* Lịch học của học sinh */}
          <Route
            path="/home/courses/:id"
            element={<StudentCourseDetail />}
          />{" "}
          {/* Chi tiết khóa học cho student */}
          <Route
            path="/home/profile/student"
            element={<StudentProfile />}
          />{" "}
          {/* Profile học sinh */}
          <Route
            path="/home/notifications"
            element={<AllNotifications />}
          />{" "}
          {/* Tất cả thông báo */}
          <Route
            path="/home/payment-history"
            element={<StudentPaymentHistory />}
          />{" "}
          {/* Lịch sử thanh toán */}
        </Route>
        {/* ADMIN ROUTES - Các route dành cho admin (cần authentication) */}
        <Route element={<RequireRole allow={["admin"]} />}>
          <Route path="/home/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<User />} />
            {/* Redirect đường dẫn cũ sang mới */}
            <Route
              path="users/create-teacher"
              element={<Navigate to="/home/admin/teachers/create" replace />}
            />
            <Route path="teachers" element={<AdminTeacherManagement />} />
            <Route path="teachers/create" element={<CreateTeacherPage />} />
            <Route path="news" element={<NewsList />} />
            <Route path="news/:id" element={<AdminNewsDetail />} />
            <Route path="news/create" element={<CreateNews />} />
            <Route path="classrooms" element={<ClassroomList />} />
            {/* Tuấn test */}
            {/* FIXED: Thêm route cho Class Management - Quản lý lớp học */}
            <Route path="class" element={<ClassManagement />} />
            <Route path="class/:id/edit" element={<ClassEditPage />} />
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
            <Route
              path="subject/:id/courses/create"
              element={<CourseOfSubjectCreate />}
            />
            <Route
              path="subject/:id/courses/:courseId"
              element={<CourseOfSubjectDetail />}
            />
            <Route path="courses" element={<AdminCourseList />} />
            <Route path="courses/create" element={<AdminCourseCreate />} />
            <Route path="courses/:id" element={<AdminCourseDetail />} />
            {/* Payment Management - Quản lý thanh toán */}
            <Route path="payment" element={<PaymentHistory />} />
            {/* Teacher Attendance - Chấm công giáo viên */}
            <Route
              path="teacher-attendance"
              element={<TeacherAttendanceList />}
            />
            <Route
              path="teacher-attendance/:teacherId"
              element={<TeacherAttendanceDetail />}
            />
            <Route
              path="teacher-attendance/:teacherId/class/:classId"
              element={<TeacherClassAttendance />}
            />
            {/* Reports - Báo cáo & Thống kê */}
            <Route path="reports" element={<ReportDashboard />} />
          </Route>
        </Route>
        {/* Teacher ROUTES - Các route dành cho teacher (cần authentication) */}
        <Route path="/home/teacher" element={<TeacherLayout />}>
          <Route path="management" element={<TeacherManagement />} />
          <Route path="schedule" element={<TeacherSchedule />} />
          <Route path="security" element={<TeacherResetPassword />} />
          <Route path="class/:classId" element={<TeacherClassDetail />} />
          <Route path="content" element={<TeachingContent />} />
          <Route path="content/:id" element={<TeachingContentDetail />} />
          {/* Cho phép chỉnh sửa dưới nhánh Nội dung giảng dạy */}
          <Route path="content/:id/edit" element={<TeacherCourseEdit />} />
          <Route path="courses" element={<TeacherCourseList />} />
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
