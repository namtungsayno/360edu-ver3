/**
 * REGISTER PAGE - Trang đăng ký tài khoản mới
 *
 * Route: /home/register
 * Layout: AuthLayout
 *
 * Core:
 * - Validate: fullName, username, email, phone, password, confirmPassword, parentName, parentEmail, parentPhone
 * - Hiển thị lỗi theo field + toast notifications cho thành công/thất bại
 * - Submit -> authService.register -> toast thông báo -> điều hướng /home/login
 * - Nền animation không chặn click (pointer-events-none) + z-index cho card
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import Logo from "../../components/common/Logo";
import { authService } from "../../services/auth/auth.service";
import { useToast } from "../../hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const PHONE_REGEX = /^0\d{9}$/; // 10 số, bắt đầu bằng 0

export default function Register() {
  const nav = useNavigate();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "", // 👈 Thêm trường số điện thoại phụ huynh
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    //prev là giá trị trước đó của formData
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next = {};

    if (!formData.fullName.trim()) {
      next.fullName = "Vui lòng nhập họ và tên.";
    } else if (formData.fullName.trim().length < 2) {
      next.fullName = "Họ và tên phải có ít nhất 2 ký tự.";
    }
    
    if (!formData.username.trim()) {
      next.username = "Vui lòng nhập tên đăng nhập.";
    } else if (formData.username.trim().length < 3) {
      next.username = "Tên đăng nhập phải có ít nhất 3 ký tự.";
    }

    if (!formData.email.trim()) {
      next.email = "Vui lòng nhập email.";
    } else if (!EMAIL_REGEX.test(formData.email)) {
      next.email = "Email không hợp lệ.";
    }

    if (!formData.phone.trim()) {
      next.phone = "Vui lòng nhập số điện thoại.";
    } else if (!PHONE_REGEX.test(formData.phone)) {
      next.phone = "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0).";
    }

    if (!formData.password) {
      next.password = "Vui lòng nhập mật khẩu.";
    } else if (formData.password.length < 6) {
      next.password = "Mật khẩu tối thiểu 6 ký tự.";
    }

    if (!formData.confirmPassword) {
      next.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (formData.confirmPassword !== formData.password) {
      next.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    if (!formData.parentName.trim()) {
      next.parentName = "Vui lòng nhập tên phụ huynh.";
    }

    if (!formData.parentEmail.trim()) {
      next.parentEmail = "Vui lòng nhập email phụ huynh.";
    } else if (!EMAIL_REGEX.test(formData.parentEmail)) {
      next.parentEmail = "Email phụ huynh không hợp lệ.";
    }

    if (!formData.parentPhone.trim()) {
      next.parentPhone = "Vui lòng nhập số điện thoại phụ huynh.";
    } else if (!PHONE_REGEX.test(formData.parentPhone)) {
      next.parentPhone = "Số điện thoại phụ huynh không hợp lệ (10 số, bắt đầu bằng 0).";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // không cho reload trang
    if (!validate()) {
      error(
        "Có một số trường chưa được điền đúng",
        "Vui lòng kiểm tra lại thông tin"
      );
      return;
    }

    try {
      setSubmitting(true);

      await authService.register({
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        parentName: formData.parentName.trim(),
        parentEmail: formData.parentEmail.trim(),
        parentPhone: formData.parentPhone.trim(),
      });

      success(
        "Tài khoản của bạn đã được tạo thành công! Vui lòng đăng nhập.",
        "Đăng ký thành công 🎉"
      );

      // Delay để user thấy toast trước khi chuyển trang
      setTimeout(() => {
        nav("/home/login");
      }, 1500);
    } catch (err) {
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Đăng ký thất bại. Vui lòng thử lại.";

      error(apiMsg, "Đăng ký thất bại");

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
      {/* Animated Background Elements */}
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

          <button
            type="button"
            onClick={() => authService.startGoogleOAuth("register")}
            className="w-full border border-gray-300 rounded-lg py-2.5 px-4 flex items-center justify-center gap-3 hover:bg-gray-50 transition"
          >
            <img
              alt="Google"
              className="w-5 h-5"
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            />
            <span className="text-gray-700 font-medium">
              Đăng ký bằng Google
            </span>
          </button>
          <div className="my-5 flex items-center">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="px-3 text-gray-500 text-sm">Hoặc</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Fullname */}
            <Field
              id="fullName"
              label="Họ và tên"
              value={formData.fullName}
              error={errors.fullName}
              onChange={handleInputChange}
            />

            {/* Username */}
            <Field
              id="username"
              label="Tên đăng nhập"
              value={formData.username}
              error={errors.username}
              onChange={handleInputChange}
            />

            {/* Email */}
            <Field
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              error={errors.email}
              onChange={handleInputChange}
            />

            {/* Phone */}
            <Field
              id="phone"
              label="Số điện thoại"
              type="tel"
              value={formData.phone}
              error={errors.phone}
              onChange={handleInputChange}
            />

            {/* Password */}
            <Field
              id="password"
              label="Mật khẩu"
              type="password"
              value={formData.password}
              error={errors.password}
              onChange={handleInputChange}
              helper="Tối thiểu 6 ký tự."
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

            {/* Confirm */}
            <Field
              id="confirmPassword"
              label="Xác nhận mật khẩu"
              type="password"
              value={formData.confirmPassword}
              error={errors.confirmPassword}
              onChange={handleInputChange}
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            {/* Parent Name */}
            <Field
              id="parentName"
              label="Tên phụ huynh"
              value={formData.parentName}
              error={errors.parentName}
              onChange={handleInputChange}
            />

            {/* Parent Email */}
            <Field
              id="parentEmail"
              label="Email phụ huynh"
              type="email"
              value={formData.parentEmail}
              error={errors.parentEmail}
              onChange={handleInputChange}
            />

            {/* Parent Phone */}
            <Field
              id="parentPhone"
              label="Số điện thoại phụ huynh"
              type="tel"
              value={formData.parentPhone}
              error={errors.parentPhone}
              onChange={handleInputChange}
            />

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

/** Reusable field component */
function Field({ id, label, type = "text", value, onChange, error, helper, showPassword, onTogglePassword }) {
  const isPassword = type === "password";
  
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={isPassword && showPassword !== undefined ? (showPassword ? "text" : "password") : type}
          required
          value={value}
          onChange={onChange}
          placeholder={`Nhập ${label.toLowerCase()}`}
          className={`w-full ${isPassword && onTogglePassword ? "pr-10" : ""} ${error ? "border-red-500" : ""}`}
        />
        {isPassword && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {helper && <p className="mt-1 text-[11px] text-gray-500">{helper}</p>}
    </div>
  );
}
