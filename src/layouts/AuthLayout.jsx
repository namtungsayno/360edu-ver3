/**
 * AUTH LAYOUT - Layout cho các trang authentication
 *
 * Routes được quản lý:
 * - /home/login → Login.jsx
 * - /home/register → Register.jsx
 *
 * Chức năng:
 * - Layout đơn giản không có Header/Footer
 * - Chỉ render Outlet với context navigation
 * - onNavigate function cho phép navigate giữa login/register/home
 * - Minimal design để focus vào form authentication
 */

import { Outlet, useNavigate } from "react-router-dom";
import PageTransition from "../components/common/PageTransition";

export default function AuthLayout() {
  const navigate = useNavigate();

  // Hàm navigation đơn giản cho auth pages
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
      default:
        }
  };

  return (
    <div>
      {/* Chỉ render content với Page Transition */}
      <PageTransition>
        <Outlet context={{ onNavigate }} />
      </PageTransition>
    </div>
  );
}
