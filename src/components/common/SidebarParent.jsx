// src/components/common/SidebarParent.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/use-toast";
import {
  LayoutDashboard,
  Calendar,
  CheckCircle,
  Bell,
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
        {
          id: "notifications",
          label: "Thông báo",
          icon: Bell,
          href: "/home/parent/notifications",
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

  const handleLogout = () => {
    logout();
    success("Đăng xuất thành công!");
    navigate("/home/login");
  };

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

      {/* User Info */}
      {user && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {user.name?.charAt(0) || "P"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-black truncate">
                {user.name || "Phụ huynh"}
              </p>
              <p className="text-xs text-gray-600 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

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
                        ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
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

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default SidebarParent;
