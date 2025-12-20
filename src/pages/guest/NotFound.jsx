import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Home, ArrowLeft, BookOpen } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            360edu
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-lg">
          {/* 404 Illustration */}
          <div className="relative mb-8">
            <div className="text-[180px] font-black leading-none select-none bg-gradient-to-br from-blue-100 to-indigo-100 bg-clip-text text-transparent">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-300/50 rotate-12 hover:rotate-0 transition-transform duration-300">
                <span className="text-5xl -rotate-12 hover:rotate-0 transition-transform duration-300">
                  🔍
                </span>
              </div>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Không tìm thấy trang
          </h1>
          <p className="text-gray-500 mb-8 text-lg">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển
            đến địa chỉ khác.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại
            </Button>
            <Button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white inline-flex items-center gap-2 px-6 py-3 shadow-lg shadow-blue-300/50 hover:shadow-xl hover:shadow-blue-400/50 transition-all duration-200"
            >
              <Home className="w-5 h-5" />
              Về trang chủ
            </Button>
          </div>

          {/* Help text */}
          <p className="mt-8 text-sm text-gray-400">
            Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ với quản trị viên.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-gray-400">
        © 2025 360edu. Nền tảng giáo dục trực tuyến.
      </footer>
    </div>
  );
}
