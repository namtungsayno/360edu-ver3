// //Layout hiển thị khung chung (navbar/sidebar)
// // Là khung giao diện cố định cho từng loại trang.
// // AdminLayout: Có navbar, menu, hiển thị nội dung chính bằng <Outlet />.

import { useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import Navigation from "../components/common/Navigation";
import Sidebar from "../components/common/Sidebar";
import { Menu, X } from "lucide-react";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [mobileOpen]);

  const navigationItems = [
    { path: "/home", label: "← Back to Home" },
    { path: "/home/admin/dashboard", label: "Dashboard" },
    { path: "/home/admin/users", label: "User Management" },
  ];

  return (
    // Toàn bộ nền sáng
    <div className="min-h-screen bg-gray-50">
      {/* MOBILE SIDEBAR (sáng) */}
      <div className="lg:hidden">
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setMobileOpen(false)}
          />
        )}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-hidden={!mobileOpen}
        >
          <div className="h-full bg-white text-slate-900 border-r shadow-xl">
            <div className="flex items-center justify-between px-4 h-14 border-b">
              <span className="font-semibold">360edu</span>
              <button
                className="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100"
                onClick={() => setMobileOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Sidebar />
          </div>
        </aside>
      </div>

      {/* DESKTOP SIDEBAR (sáng) */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30 w-72">
        <div className="h-full bg-white text-slate-900 border-r">
          <Sidebar />
        </div>
      </aside>

      {/* MAIN */}
      <div className="lg:pl-72 min-h-screen flex flex-col">
        {/* Header LIGHT */}
        <header className="sticky top-0 z-20 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open sidebar"
                >
                  <Menu className="h-5 w-5 text-slate-700" />
                </button>

                <Link
                  to="/home/admin/dashboard"
                  className="flex items-baseline"
                >
                  <h1 className="text-2xl font-bold text-slate-900">
                    360Edu Admin
                  </h1>
                  <span className="ml-2 text-sm text-slate-500 hidden sm:inline">
                    Management Panel
                  </span>
                </Link>
              </div>

              {/* Navigation LIGHT (đã đổi ở file Navigation.jsx bên dưới) */}
              <Navigation items={navigationItems} />
            </div>
          </div>
        </header>

        {/* Content LIGHT */}
        <main className="flex-1 text-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* nếu các trang con đang dùng lớp bg-dark, chúng sẽ vẫn tối.
                Cứ để layout sáng trước, sau đó ta sửa từng trang sau. */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
