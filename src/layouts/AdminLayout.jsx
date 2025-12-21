// //Layout hiển thị khung chung (navbar/sidebar)
// // Là khung giao diện cố định cho từng loại trang.
// // AdminLayout: Có navbar, menu, hiển thị nội dung chính bằng <Outlet />.

import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Navigation from "../components/common/Navigation";
import Sidebar from "../components/common/Sidebar";
import PageTransition from "../components/common/PageTransition";
import RealtimeNotificationProvider from "../components/common/RealtimeNotificationProvider";
import { Menu, X } from "lucide-react";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [mobileOpen]);

  // const navigationItems = [
  //   { path: "/home", label: "← Back to Home" },
  //   { path: "/home/admin/dashboard", label: "Dashboard" },
  //   { path: "/home/admin/users", label: "User Management" },
  // ];

  return (
    // Toàn bộ nền sáng - với min-width để đảm bảo layout không vỡ khi zoom
    <div className="min-h-screen bg-gray-50 min-w-[1024px]">
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

      {/* DESKTOP SIDEBAR (sáng) - flex-shrink-0 để không bị co lại */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30 w-72 flex-shrink-0">
        <div className="h-full bg-white text-slate-900 border-r">
          <Sidebar />
        </div>
      </aside>

      {/* MAIN - overflow-x-auto để có scroll ngang khi cần */}
      <div className="lg:pl-72 min-h-screen flex flex-col overflow-x-auto">
        {/* Content LIGHT - với Page Transition */}
        <main className="flex-1 text-slate-900 min-w-0">
          {/* Realtime Notification Provider - polling và hiển thị toast */}
          <RealtimeNotificationProvider>
            <PageTransition>
              <Outlet />
            </PageTransition>
          </RealtimeNotificationProvider>
        </main>
      </div>
    </div>
  );
}
