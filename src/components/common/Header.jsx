/**
 * HEADER COMPONENT - Thanh điều hướng chính của website
 * 
 * Các trang được truy cập:
 * - /home (Trang chủ)
 * - /home/classes (Danh sách lớp học)
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

import { useState, useContext } from "react";
import { Menu, X, User, GraduationCap, Search, LogOut } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import Logo from "./Logo";
import AuthContext from "../../context/AuthContext";

export default function Header({ onNavigate, currentPage }) {
  const { user, logout } = useContext(AuthContext);
  // State quản lý menu mobile (đóng/mở)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // State lưu từ khóa tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");
  // State quản lý dropdown profile
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileMenu(false);
      onNavigate({ type: "home" });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Hàm kiểm tra trang hiện tại để highlight navigation item
  const isActive = (pageType) => {
    return currentPage.type === pageType || 
           (pageType === "classes" && (currentPage.type === "class" || currentPage.type === "classes")) ||
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
          <nav className="hidden lg:flex items-center gap-1">
            {/* Nút Trang chủ */}
            <button 
              onClick={() => onNavigate({ type: "home" })}
              className={`px-3 py-1.5 rounded-lg transition-all text-sm ${
                isActive("home") 
                  ? "bg-white/20 text-white" 
                  : "text-blue-50 hover:bg-white/10 hover:text-white"
              }`}
            >
              Trang chủ
            </button>
            
            {/* Nút Lớp học với icon */}
            <button 
              onClick={() => onNavigate({ type: "classes" })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm ${
                isActive("classes") 
                  ? "bg-white/20 text-white" 
                  : "text-blue-50 hover:bg-white/10 hover:text-white"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Lớp học
            </button>

            {/* Nút Giáo viên */}
            <button 
              onClick={() => onNavigate({ type: "teachers" })}
              className={`px-3 py-1.5 rounded-lg transition-all text-sm ${
                isActive("teachers") 
                  ? "bg-white/20 text-white" 
                  : "text-blue-50 hover:bg-white/10 hover:text-white"
              }`}
            >
              Giáo viên
            </button>
            
            {/* Nút Tin tức */}
            <button 
              onClick={() => onNavigate({ type: "news" })}
              className={`px-3 py-1.5 rounded-lg transition-all text-sm ${
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
              className={`px-3 py-1.5 rounded-lg transition-all text-sm ${
                isActive("about") 
                  ? "bg-white/20 text-white" 
                  : "text-blue-50 hover:bg-white/10 hover:text-white"
              }`}
            >
              Giới thiệu
            </button>
          </nav>

          {/* NÚT ĐĂNG NHẬP / PROFILE DESKTOP */}
          <div className="hidden lg:flex items-center">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {user.username?.charAt(0).toUpperCase() || user.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-white text-sm font-medium max-w-[120px] truncate">
                    {user.fullName || user.username}
                  </span>
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.fullName || user.username}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button 
                onClick={() => onNavigate({ type: "login" })}
                variant="ghost"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30 gap-2 shadow-lg transition-all"
              >
                <User className="w-4 h-4" />
                Đăng nhập
              </Button>
            )}
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
                className={`text-left px-4 py-2 rounded-lg transition-all text-sm ${
                  isActive("home") 
                    ? "bg-white/20 text-white" 
                    : "text-blue-50 hover:bg-white/10"
                }`}
              >
                Trang chủ
              </button>
              
              <button 
                onClick={() => {
                  onNavigate({ type: "classes" });
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm ${
                  isActive("classes") 
                    ? "bg-white/20 text-white" 
                    : "text-blue-50 hover:bg-white/10"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Lớp học
              </button>

              <button 
                onClick={() => {
                  onNavigate({ type: "teachers" });
                  setIsMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-lg transition-all text-sm ${
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
                className={`px-4 py-2 rounded-lg transition-all text-sm ${
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
                className={`px-4 py-2 rounded-lg transition-all text-sm ${
                  isActive("about") 
                    ? "bg-white/20 text-white" 
                    : "text-blue-50 hover:bg-white/10"
                }`}
              >
                Giới thiệu
              </button>
              
              {/* Nút đăng nhập / profile mobile */}
              <div className="pt-4 border-t border-blue-500/30">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                        {user.username?.charAt(0).toUpperCase() || user.fullName?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {user.fullName || user.username}
                        </p>
                        <p className="text-blue-100 text-xs truncate">{user.email}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      variant="ghost"
                      className="w-full bg-red-500/10 border border-red-400/20 text-red-100 hover:bg-red-500/20 gap-2 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </Button>
                  </div>
                ) : (
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
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
