/**
 * TOAST DEMO PAGE
 *
 * Trang demo để test tất cả các loại toast notification
 * Route: /admin/toast-demo (tạm thời cho development)
 */

import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { useToast } from "../../../hooks/use-toast";
import { toast } from "../../../hooks/use-toast";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Sparkles,
} from "lucide-react";

export default function ToastDemo() {
  const { success, error, warning, info } = useToast();
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Toast Notification Demo
            </h1>
          </div>
          <p className="text-gray-600">
            Test tất cả các loại toast notification với tiếng Việt
          </p>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
          <div className="text-center">
            <p className="text-5xl font-bold mb-2">{count}</p>
            <p className="text-blue-100">Số lần bạn đã click toast</p>
          </div>
        </div>

        {/* Toast Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Success */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Success</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Dùng cho thông báo thành công: tạo mới, cập nhật, lưu,...
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => {
                  success("Đã lưu thông tin thành công!");
                  setCount((c) => c + 1);
                }}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Lưu thành công
              </Button>
              <Button
                onClick={() => {
                  success("Đăng nhập thành công! Chào mừng bạn trở lại 👋");
                  setCount((c) => c + 1);
                }}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Đăng nhập thành công
              </Button>
              <Button
                onClick={() => {
                  success("Đã tạo lớp học mới thành công 🎉");
                  setCount((c) => c + 1);
                }}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Tạo lớp học thành công
              </Button>
            </div>
          </div>

          {/* Error */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">Error</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Dùng cho thông báo lỗi: validation, API error, thao tác thất
              bại,...
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => {
                  error("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
                  setCount((c) => c + 1);
                }}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Lỗi kết nối
              </Button>
              <Button
                onClick={() => {
                  error("Tên đăng nhập hoặc mật khẩu không chính xác");
                  setCount((c) => c + 1);
                }}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Đăng nhập thất bại
              </Button>
              <Button
                onClick={() => {
                  error("Email đã tồn tại trong hệ thống");
                  setCount((c) => c + 1);
                }}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Email trùng
              </Button>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <h2 className="text-xl font-semibold text-gray-900">Warning</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Dùng cho cảnh báo: xác nhận trước khi xóa, cảnh báo validation,...
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => {
                  warning("Bạn có chắc chắn muốn xóa không?");
                  setCount((c) => c + 1);
                }}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                Xác nhận xóa
              </Button>
              <Button
                onClick={() => {
                  warning("Mật khẩu phải có ít nhất 8 ký tự");
                  setCount((c) => c + 1);
                }}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                Validation cảnh báo
              </Button>
              <Button
                onClick={() => {
                  warning("Vui lòng điền đầy đủ thông tin bắt buộc");
                  setCount((c) => c + 1);
                }}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                Thiếu thông tin
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Info</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Dùng cho thông tin chung: hướng dẫn, tips, thông báo hệ thống,...
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => {
                  info("Đang tải dữ liệu...");
                  setCount((c) => c + 1);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Đang tải
              </Button>
              <Button
                onClick={() => {
                  info("Hệ thống sẽ bảo trì vào 2h sáng ngày mai");
                  setCount((c) => c + 1);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Thông báo hệ thống
              </Button>
              <Button
                onClick={() => {
                  info("Bạn có 3 lớp học mới hôm nay");
                  setCount((c) => c + 1);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Thông tin
              </Button>
            </div>
          </div>
        </div>

        {/* Multiple Toasts */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Multiple Toasts
          </h2>
          <p className="text-gray-600 mb-4">
            Test hiển thị nhiều toast cùng lúc
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                success("Toast 1");
                setTimeout(() => error("Toast 2"), 200);
                setTimeout(() => warning("Toast 3"), 400);
                setTimeout(() => info("Toast 4"), 600);
                setCount((c) => c + 4);
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Hiển thị 4 toasts
            </Button>
            <Button
              onClick={() => {
                for (let i = 1; i <= 5; i++) {
                  setTimeout(() => {
                    success(`Toast số ${i}`);
                  }, i * 300);
                }
                setCount((c) => c + 5);
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Hiển thị 5 toasts liên tiếp
            </Button>
          </div>
        </div>

        {/* Using toast object */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Global Toast Object
          </h2>
          <p className="text-gray-600 mb-4">
            Sử dụng `toast` object (không cần hook)
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                toast.success("Gọi từ toast.success()");
                setCount((c) => c + 1);
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              toast.success()
            </Button>
            <Button
              onClick={() => {
                toast.error("Gọi từ toast.error()");
                setCount((c) => c + 1);
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              toast.error()
            </Button>
            <Button
              onClick={() => {
                toast.warning("Gọi từ toast.warning()");
                setCount((c) => c + 1);
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              toast.warning()
            </Button>
            <Button
              onClick={() => {
                toast.info("Gọi từ toast.info()");
                setCount((c) => c + 1);
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              toast.info()
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8">
          Toast notifications sẽ tự động đóng sau 3 giây hoặc click nút X để
          đóng
        </div>
      </div>
    </div>
  );
}
