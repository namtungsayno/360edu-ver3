// src/pages/NotFound.jsx
// Trang 404 Not Found - Hiển thị khi người dùng truy cập URL không tồn tại

import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search, AlertCircle } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-[180px] md:text-[220px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 leading-none select-none animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl">
              <AlertCircle className="w-16 h-16 md:w-20 md:h-20 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Oops! Không tìm thấy trang
          </h2>
          <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
            Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          
          <Link
            to="/home"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-200"
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Có thể bạn muốn tìm
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/home/classes"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              <Search className="w-4 h-4" />
              Lớp học
            </Link>
            <Link
              to="/home/teachers"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
            >
              <Search className="w-4 h-4" />
              Giáo viên
            </Link>
            <Link
              to="/home/news"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
            >
              <Search className="w-4 h-4" />
              Tin tức
            </Link>
            <Link
              to="/home/about"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
            >
              <Search className="w-4 h-4" />
              Giới thiệu
            </Link>
          </div>
        </div>

        {/* Footer hint */}
        <p className="mt-8 text-sm text-gray-500">
          Nếu bạn cho rằng đây là lỗi, vui lòng{" "}
          <Link to="/home/about" className="text-blue-600 hover:underline font-medium">
            liên hệ với chúng tôi
          </Link>
        </p>
      </div>
    </div>
  );
}
