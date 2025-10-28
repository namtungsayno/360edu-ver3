/**
 * HEADER COMPONENT - Thanh điều hướng chính của website
 * 
 * Các trang được truy cập:
 * - /home (Trang chủ)
 * - /home/subjects (Danh sách lớp học)
 * - /home/courses (Danh sách khóa học) 
 * - /home/teachers (Danh sách giáo viên)
 * - /home/about (Giới thiệu)
 * - /home/login (Đăng nhập)
 * - /home/news (Tin tức - chưa implement)
 * 
 * Chức năng:
 * - Điều hướng giữa các trang
 * - Tìm kiếm khóa học/lớp học
 * - Responsive mobile menu
 * - Highlight trang hiện tại
 */

import { useState } from "react";
import { Menu, X, User, LogIn, Video, GraduationCap, Search } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import Logo from "./Logo";

export default function Header({ onNavigate, currentPage }) {
  // State quản lý menu mobile (đóng/mở)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // State lưu từ khóa tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");

  // Hàm kiểm tra trang hiện tại để highlight navigation item
  const isActive = (pageType) => {
    return currentPage.type === pageType || 
           (pageType === "subjects" && (currentPage.type === "subject" || currentPage.type === "class")) ||
           (pageType === "courses" && currentPage.type === "course") ||
           (pageType === "teachers" && currentPage.type === "teacher");
  };

  return (
    <header className="sticky top-0 z-50 shadow-lg header-gradient">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO VÀ TÊN THƯƠNG HIỆU - Click để về trang chủ */}
          <button 
            onClick={() => onNavigate({ type: "home" })}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            {/* Container logo với background trắng */}
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg p-2">
              <Logo />
            </div>
            {/* Tên thương hiệu */}
            <div>
              <h1 className="text-white text-xl font-bold">360edu</h1>
            </div>
          </button>

          {/* THANH TÌM KIẾM - Chỉ hiển thị trên desktop */}
          <div className="hidden lg:block flex-1 max-w-md mx-4">
            <div className="relative">
              {/* Icon tìm kiếm bên trái */}
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              {/* Input tìm kiếm với styling custom */}
              <Input
                type="text"
                placeholder="Tìm kiếm khóa học, lớp học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-blue-100 focus:bg-white/20 focus:border-white/30 rounded-lg"
              />
            </div>
          </div>

          {/* MENU ĐIỀU HƯỚNG DESKTOP - Chỉ hiển thị trên màn hình lớn */}
          <nav className="hidden lg:flex items-center gap-2">
            {/* Nút Trang chủ */}
            <button 
              onClick={() => onNavigate({ type: "home" })}
              className={`px-4 py-2 rounded-lg transition-all ${
                isActive("home") 
                  ? "bg-white/20 text-white" 
                  : "text-blue-50 hover:bg-white/10 hover:text-white"
              }`}
            >
              Trang chủ
            </button>
            
            {/* Nút Lớp học với icon */}
            <button 
              onClick={() => onNavigate({ type: "subjects" })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive("subjects") 
                  ? "bg-white/20 text-white" 
                  : "text-blue-50 hover:bg-white/10 hover:text-white"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Lớp học
            </button>

            {/* Nút Khóa học với icon */}
            <button 
              onClick={() => onNavigate({ type: "courses" })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive("courses") 
                  ? "bg-white/20 text-white" 
                  : "text-blue-50 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Video className="w-4 h-4" />
              Khóa học
            </button>

            {/* Nút Giáo viên */}
            <button 
              onClick={() => onNavigate({ type: "teachers" })}
              className={`px-4 py-2 rounded-lg transition-all ${
                isActive("teachers") 
                  ? "bg-white/20 text-white" 
                  : "text-blue-50 hover:bg-white/10 hover:text-white"
              }`}
            >
              Giáo viên
            </button>
            
            {/* Nút Tin tức - chưa có trang */}
            <button 
              onClick={() => onNavigate({ type: "news" })}
              className={`px-4 py-2 rounded-lg transition-all ${
                isActive("news") 
                  ? "bg-white/20 text-white" 
                  : "text-blue-50 hover:bg-white/10 hover:text-white"
              }`}
            >
              Tin tức
            </button>
            
            {/* Nút Giới thiệu */}
            <button 
              onClick={() => onNavigate({ type: "about" })}
              className={`px-4 py-2 rounded-lg transition-all ${
                isActive("about") 
                  ? "bg-white/20 text-white" 
                  : "text-blue-50 hover:bg-white/10 hover:text-white"
              }`}
            >
              Giới thiệu
            </button>
          </nav>

          {/* NÚT ĐĂNG NHẬP DESKTOP - Styling transparent với border */}
          <div className="hidden lg:flex items-center">
            <Button 
              onClick={() => onNavigate({ type: "login" })}
              variant="ghost"
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30 gap-2 shadow-lg transition-all"
            >
              <User className="w-4 h-4" />
              Đăng nhập
            </Button>
          </div>

          {/* NÚT MỞ MENU MOBILE - Chỉ hiển thị trên màn hình nhỏ */}
          <button
            className="lg:hidden p-2 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {/* Toggle icon giữa Menu và X */}
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* MENU MOBILE - Hiển thị khi click nút menu trên mobile */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-blue-500/30">
            <nav className="flex flex-col gap-2">
              {/* Các nút navigation mobile - Đóng menu sau khi click */}
              <button 
                onClick={() => {
                  onNavigate({ type: "home" });
                  setIsMenuOpen(false); // Đóng menu
                }}
                className={`text-left px-4 py-2 rounded-lg transition-all ${
                  isActive("home") 
                    ? "bg-white/20 text-white" 
                    : "text-blue-50 hover:bg-white/10"
                }`}
              >
                Trang chủ
              </button>
              
              <button 
                onClick={() => {
                  onNavigate({ type: "subjects" });
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive("subjects") 
                    ? "bg-white/20 text-white" 
                    : "text-blue-50 hover:bg-white/10"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Lớp học
              </button>

              <button 
                onClick={() => {
                  onNavigate({ type: "courses" });
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive("courses") 
                    ? "bg-white/20 text-white" 
                    : "text-blue-50 hover:bg-white/10"
                }`}
              >
                <Video className="w-4 h-4" />
                Khóa học
              </button>

              <button 
                onClick={() => {
                  onNavigate({ type: "teachers" });
                  setIsMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  isActive("teachers") 
                    ? "bg-white/20 text-white" 
                    : "text-blue-50 hover:bg-white/10"
                }`}
              >
                Giáo viên
              </button>
              
              <button 
                onClick={() => {
                  onNavigate({ type: "news" });
                  setIsMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  isActive("news") 
                    ? "bg-white/20 text-white" 
                    : "text-blue-50 hover:bg-white/10"
                }`}
              >
                Tin tức
              </button>
              
              <button 
                onClick={() => {
                  onNavigate({ type: "about" });
                  setIsMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  isActive("about") 
                    ? "bg-white/20 text-white" 
                    : "text-blue-50 hover:bg-white/10"
                }`}
              >
                Giới thiệu
              </button>
              
              {/* Nút đăng nhập mobile - Ở cuối với border top */}
              <div className="pt-4 border-t border-blue-500/30">
                <Button 
                  onClick={() => {
                    onNavigate({ type: "login" });
                    setIsMenuOpen(false);
                  }}
                  variant="ghost"
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30 gap-2 transition-all"
                >
                  <User className="w-4 h-4" />
                  Đăng nhập
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
