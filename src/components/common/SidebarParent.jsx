// src/components/common/SidebarParent.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/use-toast";
import {
  LayoutDashboard,
  Calendar,
  CheckCircle,
  Wallet,
  BookOpen,
  User,
  LogOut,
} from "lucide-react";

const SidebarParent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { success } = useToast();

  const nav = [
    {
      section: "Tổng quan",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          href: "/home/parent/dashboard",
        },
      ],
    },
    {
      section: "Theo dõi con",
      items: [
        {
          id: "classes",
          label: "Lớp học",
          icon: BookOpen,
          href: "/home/parent/classes",
        },
        {
          id: "schedule",
          label: "Lịch học",
          icon: Calendar,
          href: "/home/parent/schedule",
        },
        {
          id: "attendance",
          label: "Điểm danh",
          icon: CheckCircle,
          href: "/home/parent/attendance",
        },
        {
          id: "payment",
          label: "Lịch sử thanh toán",
          icon: Wallet,
          href: "/home/parent/payment",
        },
      ],
    },
    {
      section: "Tài khoản",
      items: [
        {
          id: "profile",
          label: "Thông tin cá nhân",
          icon: User,
          href: "/home/parent/profile",
        },
      ],
    },
  ];

  const isActive = (href) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <div className="w-72 bg-white text-black h-full flex flex-col border-r border-gray-200">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-200">
            <img
              src="/assets/images/logo.jpg"
              alt="360edu Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-black">360edu</h1>
            <p className="text-xs text-gray-600">Parent Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {nav.map((section) => (
          <div key={section.section} className="mb-6">
            <h3 className="px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {section.section}
            </h3>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                      active
                        ? "bg-gray-100 text-black border-r-2 border-black"
                        : "text-gray-600 hover:bg-gray-50 hover:text-black"
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3 text-current" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* User & Logout */}
      <div className="border-t border-gray-200 p-6">
        <button
          onClick={async () => {
            await logout();
            success("Đã đăng xuất thành công", "Đăng xuất");
            setTimeout(() => {
              navigate("/home/login");
            }, 1000);
          }}
          className="flex items-center w-full text-sm text-gray-600 hover:text-black mb-4 transition-colors duration-200"
        >
          <LogOut className="h-5 w-5 mr-3 text-current" />
          Đăng xuất
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {user?.name?.[0] || user?.fullName?.[0] || "P"}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-black">
              {user?.name || user?.fullName || "Phụ huynh"}
            </p>
            <p className="text-xs text-gray-600">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarParent;
