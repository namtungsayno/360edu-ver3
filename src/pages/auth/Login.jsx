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
 * - Split screen layout với banner và form
 */

import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import Logo from "../../components/common/Logo";
import { useAuth } from "../../hooks/useAuth";
import { landingPathByRoles } from "../../utils/auth-landing";
import { authService } from "../../services/auth/auth.service";
import { useToast } from "../../hooks/use-toast";
import { teacherApi } from "../../services/teacher/teacher.api";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  ArrowRight,
  Sparkles,
  Star,
} from "lucide-react";
import { cacheLastPassword } from "../../utils/last-login";

export default function Login() {
  const { onNavigate } = useOutletContext();
  const { login } = useAuth();
  const { success, error } = useToast();

  const nav = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [teachers, setTeachers] = useState([]);

  // Fetch teachers for showcase
  useEffect(() => {
    async function fetchTeachers() {
      try {
        const data = await teacherApi.list();
        // Lấy tối đa 6 giáo viên có avatar
        const teachersWithAvatar = (data || [])
          .filter((t) => t.avatarUrl)
          .slice(0, 6);
        setTeachers(teachersWithAvatar);
      } catch (e) {
        // Ignore error - just don't show teachers
      }
    }
    fetchTeachers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const next = {};

    if (!formData.username.trim()) {
      next.username = "Vui lòng nhập tên đăng nhập.";
    } else if (formData.username.length < 3) {
      next.username = "Tên đăng nhập phải có ít nhất 3 ký tự.";
    }

    if (!formData.password) {
      next.password = "Vui lòng nhập mật khẩu.";
    } else if (formData.password.length < 6) {
      next.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      error("Vui lòng kiểm tra lại thông tin đăng nhập");
      return;
    }

    setSubmitting(true);

    try {
      const me = await login(formData);
      cacheLastPassword(formData.password);
      success("Đăng nhập thành công! Chào mừng bạn trở lại 👋");

      setTimeout(() => {
        nav(landingPathByRoles(me.roles), { replace: true });
      }, 500);
    } catch (ex) {
      const errorMsg =
        ex.displayMessage ||
        ex?.response?.data?.message ||
        "Tên đăng nhập hoặc mật khẩu không chính xác";
      error(errorMsg);

      if (errorMsg.includes("mật khẩu")) {
        setErrors({ password: "Mật khẩu không chính xác" });
      } else if (
        errorMsg.includes("tên đăng nhập") ||
        errorMsg.includes("không tồn tại")
      ) {
        setErrors({ username: "Tên đăng nhập không tồn tại" });
      } else if (
        errorMsg.includes("vô hiệu hóa") ||
        errorMsg.includes("bị khóa")
      ) {
        // Tài khoản bị vô hiệu hóa hoặc bị khóa - clear errors, chỉ hiển thị toast
        setErrors({ username: "", password: "" });
      } else {
        setErrors({ username: "", password: "" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ========== LEFT SIDE - BANNER ========== */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <img
          src="/assets/images/banner.jpg"
          alt="Education Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-purple-600/80 to-pink-500/70" />

        {/* Animated Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating circles */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-float" />
          <div className="absolute top-40 right-20 w-24 h-24 bg-white/10 rounded-full animate-float-delayed" />
          <div className="absolute bottom-32 left-32 w-20 h-20 bg-white/10 rounded-full animate-float-slow" />
          <div className="absolute bottom-20 right-40 w-16 h-16 bg-pink-400/20 rounded-full animate-pulse" />

          {/* Animated lines */}
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide-right" />
          <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide-left" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 py-16">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl border border-white/30 p-2">
              <Logo />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">360edu</h1>
              <p className="text-white/70 text-sm">
                Nền tảng giáo dục thông minh
              </p>
            </div>
          </div>

          {/* Main Text */}
          <div className="space-y-6 mb-12">
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Chào mừng
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-yellow-300">
                Trở lại!
              </span>
            </h2>
            <p className="text-white/80 text-lg max-w-md leading-relaxed">
              Đăng nhập để tiếp tục hành trình học tập và khám phá tri thức mới
              cùng hàng nghìn học viên khác.
            </p>
          </div>

          {/* Teacher Showcase - Premium Creative Layout */}
          {teachers.length > 0 && (
            <div className="space-y-6">
              {/* Animated Title */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex items-center gap-1">
                    <Star
                      className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-bounce"
                      style={{ animationDuration: "2s" }}
                    />
                    <Star
                      className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-bounce"
                      style={{
                        animationDuration: "2.2s",
                        animationDelay: "0.1s",
                      }}
                    />
                    <Star
                      className="w-4 h-4 text-yellow-200 fill-yellow-200 animate-bounce"
                      style={{
                        animationDuration: "2.4s",
                        animationDelay: "0.2s",
                      }}
                    />
                  </div>
                  {/* Sparkle effect */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
                </div>
                <div>
                  <p className="text-white font-bold text-xl tracking-wide">
                    Đội ngũ giảng viên
                  </p>
                  <p className="text-pink-200 text-sm font-medium">
                    Tận tâm • Chuyên nghiệp • Sáng tạo
                  </p>
                </div>
              </div>

              {/* Teacher Cards - Spread Layout */}
              <div className="flex gap-5 mt-4 flex-wrap">
                {teachers.slice(0, 5).map((teacher, index) => {
                  const rotations = [-5, 3, -3, 4, -4];
                  const rotate = rotations[index] || 0;

                  return (
                    <div
                      key={teacher.id || index}
                      className="group cursor-pointer relative"
                      style={{
                        animation: `float ${
                          3 + index * 0.4
                        }s ease-in-out infinite`,
                        animationDelay: `${index * 0.15}s`,
                      }}
                    >
                      {/* Outer glow ring */}
                      <div
                        className="absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"
                        style={{
                          background:
                            "conic-gradient(from 0deg, #f472b6, #c084fc, #60a5fa, #34d399, #fbbf24, #f472b6)",
                          filter: "blur(20px)",
                        }}
                      />

                      {/* Card container - BIGGER SIZE */}
                      <div
                        className="relative w-36 h-44 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-pink-500/50"
                        style={{
                          transform: `rotate(${rotate}deg)`,
                          border: "4px solid rgba(255,255,255,0.5)",
                        }}
                      >
                        {/* Image */}
                        <img
                          src={teacher.avatarUrl}
                          alt={teacher.fullName || "Giáo viên"}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                          onError={(e) => {
                            e.target.parentElement.parentElement.style.display =
                              "none";
                          }}
                        />

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Shimmer effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                        {/* Teacher info at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 transform translate-y-0 group-hover:-translate-y-1 transition-transform duration-300">
                          <p className="text-white text-xs font-bold text-center truncate drop-shadow-lg">
                            {teacher.fullName || "Giáo viên"}
                          </p>
                          {teacher.subjectName && (
                            <p className="text-white/70 text-[10px] text-center truncate">
                              {teacher.subjectName}
                            </p>
                          )}
                        </div>

                        {/* Verified badge */}
                        <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Floating hearts on hover */}
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-2">
                        <span className="text-lg animate-pulse">💜</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom tagline with animated underline */}
              <div className="relative inline-block mt-4">
                <p className="text-white/80 text-sm">
                  <span className="text-pink-300 font-semibold">
                    Hơn {teachers.length} giáo viên
                  </span>{" "}
                  đang chờ đồng hành cùng bạn ✨
                </p>
                <div
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 animate-pulse"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========== RIGHT SIDE - LOGIN FORM ========== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.015]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-indigo-200/40 to-purple-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-pink-200/40 to-rose-200/40 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg p-2">
              <Logo />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              360edu
            </h1>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/10 p-8 border border-white/50 animate-fade-in-up">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 mb-4 animate-bounce-gentle">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Đăng nhập
              </h2>
              <p className="text-gray-500">
                Nhập thông tin để truy cập tài khoản
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <div className="group">
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Nhập tên đăng nhập"
                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border-2 rounded-xl transition-all duration-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 ${
                      errors.username
                        ? "border-red-400 bg-red-50/50"
                        : "border-gray-200"
                    }`}
                  />
                </div>
                {errors.username && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1 animate-shake">
                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="group">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Nhập mật khẩu"
                    className={`w-full pl-12 pr-12 py-3.5 bg-gray-50/50 border-2 rounded-xl transition-all duration-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 ${
                      errors.password
                        ? "border-red-400 bg-red-50/50"
                        : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1 animate-shake">
                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 transition-all"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    Ghi nhớ đăng nhập
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => nav("/home/forgot-password")}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-2 transition-all"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white py-4 rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    Đăng nhập
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500">
                    Hoặc tiếp tục với
                  </span>
                </div>
              </div>

              {/* Google Login */}
              <button
                type="button"
                onClick={() => authService.loginWithGoogle()}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-300 group"
              >
                <img
                  alt="Google"
                  className="w-5 h-5 group-hover:scale-110 transition-transform"
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                />
                <span>Đăng nhập bằng Google</span>
              </button>
            </form>

            {/* Footer Actions */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Back to Home */}
                <button
                  onClick={() => onNavigate({ type: "home" })}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-300 group border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                >
                  <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                  Trang chủ
                </button>

                {/* Register Link */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Chưa có tài khoản?</span>
                  <button
                    onClick={() => onNavigate({ type: "register" })}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-purple-500/25 group"
                  >
                    Đăng ký
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-25px); }
        }
        @keyframes slide-right {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        @keyframes slide-left {
          0% { transform: translateX(100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(-100%); opacity: 0; }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-slide-right { animation: slide-right 8s ease-in-out infinite; }
        .animate-slide-left { animation: slide-left 8s ease-in-out infinite 4s; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
        .animate-bounce-gentle { animation: bounce-gentle 2s ease-in-out infinite; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .bg-size-200 { background-size: 200% 100%; }
        .bg-pos-0 { background-position: 0% 0%; }
        .bg-pos-100 { background-position: 100% 0%; }
      `}</style>
    </div>
  );
}
