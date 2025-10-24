//Layout hiển thị khung chung (navbar/sidebar)
// Là khung giao diện cố định cho từng loại trang.
// AdminLayout: Có navbar, menu, hiển thị nội dung chính bằng <Outlet />.
import { Outlet } from "react-router-dom";
import Navigation from "../components/common/Navigation";

export default function AdminLayout() {
  const navigationItems = [
    { path: "/home", label: "← Back to Home" },
    { path: "/home/admin/dashboard", label: "Dashboard" },
    { path: "/home/admin/users", label: "User Management" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-yellow-400">360Edu Admin</h1>
              <span className="ml-2 text-sm text-gray-400">Management Panel</span>
            </div>
            <Navigation items={navigationItems} />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
