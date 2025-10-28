//src/components/common/Header.jsx
import { useState } from "react";
import { Menu, X, User, LogIn, Video, GraduationCap, Search } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import Logo from "./Logo";

export default function Header({ onNavigate, currentPage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (pageType) => {
    return currentPage.type === pageType || 
           (pageType === "subjects" && (currentPage.type === "subject" || currentPage.type === "class")) ||
           (pageType === "courses" && currentPage.type === "course") ||
           (pageType === "teachers" && currentPage.type === "teacher");
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => onNavigate({ type: "home" })}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg p-2">
              <Logo />
            </div>
            <div>
              <h1 className="text-white">360edu</h1>
              <p className="text-xs text-blue-100">Education Management</p>
            </div>
          </button>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm khóa học, lớp học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-blue-100 focus:bg-white/20 focus:border-white/30 rounded-lg"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
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

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button 
              onClick={() => onNavigate({ type: "login" })}
              variant="ghost" 
              className="gap-2 text-white hover:bg-white/10 hover:text-white"
            >
              <LogIn className="w-4 h-4" />
              Đăng nhập
            </Button>
            <Button 
              onClick={() => onNavigate({ type: "register" })}
              className="bg-white text-blue-600 hover:bg-blue-50 gap-2 shadow-lg"
            >
              <User className="w-4 h-4" />
              Đăng ký
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-blue-500/30">
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => {
                  onNavigate({ type: "home" });
                  setIsMenuOpen(false);
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
              
              <div className="flex flex-col gap-2 pt-4 border-t border-blue-500/30">
                <Button 
                  onClick={() => {
                    onNavigate({ type: "login" });
                    setIsMenuOpen(false);
                  }}
                  variant="outline" 
                  className="w-full gap-2 text-white border-white/30 hover:bg-white/10"
                >
                  <LogIn className="w-4 h-4" />
                  Đăng nhập
                </Button>
                <Button 
                  onClick={() => {
                    onNavigate({ type: "register" });
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-white text-blue-600 hover:bg-blue-50 gap-2"
                >
                  <User className="w-4 h-4" />
                  Đăng ký
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
