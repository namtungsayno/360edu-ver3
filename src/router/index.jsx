//E:\Semester9\360Edu\src\router\index.jsx NgocHung
// định tuyến & điều khiển layout
// Dùng react-router-dom để định nghĩa đường dẫn URL → Component/Page tương ứng.
// Có 3 nhóm route chính:
// - /home/login → dùng AuthLayout
// - /home → dùng GuestLayout (Home page)
// - /home/admin/* → dùng AdminLayout

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";
import GuestLayout from "../layouts/GuestLayout";

// Guest pages
import Home from "../pages/guest/Home";
import Profile from "../pages/guest/Profile";

// Admin pages
import Dashboard from "../pages/admin/Dashboard";
import User from "../pages/admin/User";

// Auth pages
import Login from "../pages/auth/Login";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect to home */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/home/login" element={<Login />} />
        </Route>

        {/* Guest routes */}
        <Route element={<GuestLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/home/profile" element={<Profile />} />
        </Route>

        {/* Admin routes */}
        <Route path="/home/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<User />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
