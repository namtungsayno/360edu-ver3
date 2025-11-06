/**
 * LOGIN PAGE - Trang đăng nhập
 *
 * Route: /home/login
 * Layout: AuthLayout
 *
 * Chức năng:
 * - Form đăng nhập với username và password
 * - Validation cơ bản
 * - Link đến trang đăng ký
 * - Quay về trang chủ
 * - Remember me checkbox
 * - Forgot password link
 *
 * TODO: Implement actual login logic với API
 */

import { useState } from "react";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import Logo from "../../components/common/Logo";
import { useAuth } from "../../hooks/useAuth";
import { landingPathByRoles } from "../../utils/auth-landing";
import { authService } from "../../services/auth/auth.service";
export default function Login() {
  const { onNavigate } = useOutletContext();

  const { login } = useAuth();

  //useNavigate để chuyển hướng sau khi đăng nhập thành công
  const nav = useNavigate();
  //useLocation để lấy thông tin(URL) hiện tại
  const loc = useLocation();

  //Lấy state từ location hiện tại ( trang login ) nếu có state.from thì lấy pathname nếu không thì để undefined
  const from = loc.state?.from?.pathname;

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: true,
  });
  const [, setSubmitting] = useState(false);
  const [, setErr] = useState("");

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSubmitting(true);

    try {
      // await xử lý bất đồng bộ đăng nhập. await đợi đăng nhập xong mới chạy tiếp.
      const me = await login(formData);
      const to = from || landingPathByRoles(me.roles); // me.roles = ["Admin", "..."]

      //sử dụng nav... để chuyển sang trang đích sau khi login
      nav(to, { replace: true });
    } catch (ex) {
      setErr(ex.displayMessage || "Đăng nhập thất bại");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 overflow-hidden relative">
      {/* ANIMATED BACKGROUND - Giống như Banner */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>

      {/* LOGIN FORM CONTAINER */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* HEADER - Logo và tiêu đề */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              {/* Logo với gradient background */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg p-2">
                <Logo />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 bg-clip-text text-transparent">
                360edu
              </h1>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Chào mừng trở lại!
            </h2>
            <p className="text-gray-600">Đăng nhập để tiếp tục học tập</p>
          </div>

          {/* FORM ĐĂNG NHẬP */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tên đăng nhập
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Nhập tên đăng nhập"
                className="w-full"
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mật khẩu
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu"
                className="w-full"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Đăng nhập
            </Button>

            <div className="my-5 flex items-center">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="px-3 text-gray-500 text-sm">Hoặc</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              type="button"
              onClick={() => authService.loginWithGoogle()}
              className="w-full border border-gray-300 rounded-lg py-2.5 px-4 flex items-center justify-center gap-3 hover:bg-gray-50 transition"
            >
              <img
                alt="Google"
                className="w-5 h-5"
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              />
              <span className="text-gray-700 font-medium">
                Đăng nhập bằng Google
              </span>
            </button>
          </form>

          {/* LINK ĐẾN TRANG ĐĂNG KÝ */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Chưa có tài khoản?{" "}
              <button
                onClick={() => onNavigate({ type: "register" })}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
              >
                Đăng ký ngay
              </button>
            </p>
          </div>

          {/* QUAY VỀ TRANG CHỦ */}
          <div className="mt-4 text-center">
            <button
              onClick={() => onNavigate({ type: "home" })}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              ← Quay về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
