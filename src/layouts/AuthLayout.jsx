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
        console.log("Unknown navigation:", page);
    }
  };

  return (
    <div>
      {/* Chỉ render content, không có header/footer */}
      <Outlet context={{ onNavigate }} />
    </div>
  );
}
