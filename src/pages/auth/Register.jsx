/**
 * REGISTER PAGE - Trang đăng ký tài khoản mới
 *
 * Route: /home/register
 * Layout: AuthLayout
 *
 * Chức năng:
 * - Form đăng ký với đầy đủ thông tin (họ tên, username, email, phone, password)
 * - Validation password confirmation
 * - Link quay về trang đăng nhập
 * - Link quay về trang chủ
 * - UI tương tự Login.jsx với background animations
 *
 * TODO: Implement actual registration logic với API
 */ /**
 * REGISTER PAGE - Trang đăng ký tài khoản mới
 *
 * Route: /home/register
 * Layout: AuthLayout
 *
 * Core:
 * - Validate: fullName, username, email, phone, password, confirmPassword
 * - Hiển thị lỗi theo field + banner lỗi/ok
 * - Submit -> authService.register -> điều hướng /home/login
 * - Nền animation không chặn click (pointer-events-none) + z-index cho card
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import Logo from "../../components/common/Logo";
import { authService } from "../../services/auth/auth.service";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const PHONE_REGEX = /^0\d{9}$/; // 10 số, bắt đầu bằng 0

export default function Register() {
  const nav = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState({ type: "", message: "" }); // 'success' | 'error'

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (banner.message) setBanner({ type: "", message: "" });
  };

  const validate = () => {
    const next = {};

    if (!formData.fullName.trim()) next.fullName = "Vui lòng nhập họ và tên.";
    if (!formData.username.trim())
      next.username = "Vui lòng nhập tên đăng nhập.";

    if (!formData.email.trim()) next.email = "Vui lòng nhập email.";
    else if (!EMAIL_REGEX.test(formData.email))
      next.email = "Email không hợp lệ.";

    if (!formData.phone.trim()) next.phone = "Vui lòng nhập số điện thoại.";
    else if (!PHONE_REGEX.test(formData.phone))
      next.phone = "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0).";

    if (!formData.password) next.password = "Vui lòng nhập mật khẩu.";
    else if (formData.password.length < 6)
      next.password = "Mật khẩu tối thiểu 6 ký tự.";

    if (!formData.confirmPassword)
      next.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    else if (formData.confirmPassword !== formData.password)
      next.confirmPassword = "Mật khẩu xác nhận không khớp.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBanner({ type: "", message: "" });
    if (!validate()) return;

    try {
      setSubmitting(true);

      await authService.register({
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      setBanner({
        type: "success",
        message: "Đăng ký thành công! Vui lòng đăng nhập.",
      });
      nav("/home/login");
    } catch (err) {
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Đăng ký thất bại. Vui lòng thử lại.";
      setBanner({ type: "error", message: apiMsg });

      const fieldErrors = err?.response?.data?.errors;
      if (fieldErrors && typeof fieldErrors === "object") {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 overflow-hidden relative isolate">
      {/* Animated Background Elements (không bắt click) */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-20">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 relative z-30">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg p-2">
                <Logo />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 bg-clip-text text-transparent">
                360edu
              </h1>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Tạo tài khoản mới
            </h2>
            <p className="text-gray-600">Tham gia cộng đồng học tập 360edu</p>
          </div>

          {/* Banner */}
          {banner.message && (
            <div
              className={`mb-4 rounded-md px-3 py-2 text-sm ${
                banner.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {banner.message}
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Fullname */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Họ và tên
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Nhập họ và tên của bạn"
                className="w-full"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Username */}
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
              {errors.username && (
                <p className="mt-1 text-xs text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="w-full"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Số điện thoại
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="0123456789"
                className="w-full"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
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
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-[11px] text-gray-500">
                Tối thiểu 6 ký tự.
              </p>
            </div>

            {/* Confirm */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Xác nhận mật khẩu
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Nhập lại mật khẩu"
                className="w-full"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {submitting ? "Đang tạo tài khoản..." : "Đăng ký"}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={() => nav("/home/login")}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
              >
                Đăng nhập ngay
              </button>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => nav("/home")}
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
