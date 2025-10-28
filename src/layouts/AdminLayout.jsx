// //Layout hiển thị khung chung (navbar/sidebar)
// // Là khung giao diện cố định cho từng loại trang.
// // AdminLayout: Có navbar, menu, hiển thị nội dung chính bằng <Outlet />.
// import { Outlet } from "react-router-dom";
// import Navigation from "../components/common/Navigation";

// export default function AdminLayout() {
//   const navigationItems = [
//     { path: "/home", label: "← Back to Home" },
//     { path: "/home/admin/dashboard", label: "Dashboard" },
//     { path: "/home/admin/users", label: "User Management" },
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
//       <header className="bg-gray-800 shadow-lg border-b border-gray-700">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center">
//               <h1 className="text-2xl font-bold text-yellow-400">
//                 360Edu Admin
//               </h1>
//               <span className="ml-2 text-sm text-gray-400">
//                 Management Panel
//               </span>
//             </div>
//             <Navigation items={navigationItems} />
//           </div>
//         </div>
//       </header>
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <Outlet />
//       </main>
//     </div>
//   );
// }

// src/layouts/AdminLayout.jsx
import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import Navigation from "../components/common/Navigation";
import Sidebar from "../components/common/Sidebar"; // <— chỉnh path cho đúng với dự án của bạn
import { Menu } from "lucide-react";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigationItems = [
    { path: "/home", label: "← Back to Home" },
    { path: "/home/admin/dashboard", label: "Dashboard" },
    { path: "/home/admin/users", label: "User Management" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      {/* ====== MOBILE SIDEBAR (Drawer) ====== */}
      <div className="lg:hidden">
        {/* Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
        )}
        {/* Drawer */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          } w-72 bg-white shadow-xl`}
          aria-hidden={!mobileOpen}
        >
          {/* Dùng lại Sidebar hiện có (màu sáng) */}
          <Sidebar />
        </aside>
      </div>

      {/* ====== DESKTOP SIDEBAR ====== */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-72 z-30">
        <Sidebar />
      </aside>

      {/* ====== MAIN AREA (đẩy nội dung sang phải khi có sidebar) ====== */}
      <div className="lg:pl-72 flex min-h-screen flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-gray-800/95 backdrop-blur border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                {/* Nút mở mobile sidebar */}
                <button
                  className="lg:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  aria-label="Open sidebar"
                  onClick={() => setMobileOpen(true)}
                >
                  <Menu className="h-5 w-5 text-gray-200" />
                </button>

                <div className="flex items-center">
                  <Link
                    to="/home/admin/dashboard"
                    className="flex items-center"
                  >
                    <h1 className="text-2xl font-bold text-yellow-400">
                      360Edu Admin
                    </h1>
                  </Link>
                  <span className="ml-2 text-sm text-gray-300 hidden sm:inline">
                    Management Panel
                  </span>
                </div>
              </div>

              {/* Nav items trên header (giữ nguyên Navigation của bạn) */}
              <Navigation items={navigationItems} />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
