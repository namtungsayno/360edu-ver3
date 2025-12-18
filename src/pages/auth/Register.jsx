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
 * - Split screen layout với banner và form
 * - Kiểm tra số điện thoại phụ huynh: nếu đã tồn tại, hiện dialog xác nhận
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import Logo from "../../components/common/Logo";
import { authService } from "../../services/auth/auth.service";
import { authApi } from "../../services/auth/auth.api";
import { useToast } from "../../hooks/use-toast";
import {
  Eye,
  EyeOff,
  UserCheck,
  X,
  UserPlus,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Users,
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Sparkles,
} from "lucide-react";

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
    parentPhone: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State cho kiểm tra phụ huynh
  const [checkingParent, setCheckingParent] = useState(false);
  const [parentConfirmDialog, setParentConfirmDialog] = useState({
    open: false,
    parentInfo: null,
  });
  const [parentConfirmed, setParentConfirmed] = useState(false); // Đã xác nhận là phụ huynh cũ
  const [existingParentId, setExistingParentId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));

    // Reset parent confirmed status nếu thay đổi số điện thoại phụ huynh
    if (name === "parentPhone") {
      setParentConfirmed(false);
      setExistingParentId(null);
    }
  };

  // Kiểm tra số điện thoại phụ huynh khi blur
  const handleParentPhoneBlur = async () => {
    const phone = formData.parentPhone.trim();

    // Chỉ kiểm tra nếu số hợp lệ và chưa xác nhận
    if (!PHONE_REGEX.test(phone) || parentConfirmed) {
      return;
    }

    try {
      setCheckingParent(true);
      const response = await authApi.checkParentPhone(phone);

      if (response.exists && response.parentInfo) {
        // Hiển thị dialog xác nhận
        setParentConfirmDialog({
          open: true,
          parentInfo: response.parentInfo,
        });
      }
    } catch (err) {
    } finally {
      setCheckingParent(false);
    }
  };

  // Xác nhận đây là phụ huynh đã có
  const handleConfirmParent = () => {
    const { parentInfo } = parentConfirmDialog;
    if (parentInfo) {
      // Auto-fill thông tin phụ huynh
      setFormData((prev) => ({
        ...prev,
        parentName: parentInfo.fullName || "",
        parentEmail: parentInfo.email || "",
        parentPhone: parentInfo.phone || prev.parentPhone,
      }));
      setParentConfirmed(true);
      setExistingParentId(parentInfo.id);
    }
    setParentConfirmDialog({ open: false, parentInfo: null });
  };

  // Không phải phụ huynh này
  const handleRejectParent = () => {
    setParentConfirmDialog({ open: false, parentInfo: null });
    // Clear số điện thoại và hiện thông báo
    setFormData((prev) => ({ ...prev, parentPhone: "" }));
    setErrors((prev) => ({
      ...prev,
      parentPhone:
        "Số điện thoại phụ huynh đã có trong hệ thống. Vui lòng nhập số điện thoại khác.",
    }));
  };

  const validate = () => {
    const next = {};

    // Validate thông tin phụ huynh trước (vì form phụ huynh ở trên)
    if (!formData.parentPhone.trim()) {
      next.parentPhone = "Vui lòng nhập số điện thoại phụ huynh.";
    } else if (!PHONE_REGEX.test(formData.parentPhone)) {
      next.parentPhone =
        "Số điện thoại phụ huynh không hợp lệ (10 số, bắt đầu bằng 0).";
    }

    if (!formData.parentEmail.trim()) {
      next.parentEmail = "Vui lòng nhập email phụ huynh.";
    } else if (!EMAIL_REGEX.test(formData.parentEmail)) {
      next.parentEmail = "Email phụ huynh không hợp lệ.";
    }

    if (!formData.parentName.trim()) {
      next.parentName = "Vui lòng nhập tên phụ huynh.";
    }

    // Validate thông tin học sinh
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

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        existingParentId: existingParentId, // Nếu liên kết với phụ huynh đã có
      });

      success(
        "Tài khoản của bạn đã được tạo thành công! Vui lòng đăng nhập.",
        "Đăng ký thành công 🎉"
      );

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
    <div className="min-h-screen h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-purple-50/30 overflow-hidden">
      {/* ========== HEADER ========== */}
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg p-1.5">
              <Logo />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                360edu
              </h1>
              <p className="text-xs text-gray-500 -mt-0.5">
                Nền tảng giáo dục thông minh
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <main className="flex-1 flex items-center justify-center p-4 lg:p-6 overflow-hidden">
        <div className="w-full max-w-6xl">
          {/* Title */}
          <div className="text-center mb-4 lg:mb-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full mb-2">
              <UserPlus className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">
                Tạo tài khoản mới
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
              Điền thông tin để bắt đầu hành trình học tập
            </h2>

            {/* Google Register Button */}
            <button
              type="button"
              onClick={() => authService.startGoogleOAuth("register")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transition-all duration-300 group text-sm"
            >
              <img
                alt="Google"
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              />
              <span>Đăng ký nhanh bằng Google</span>
            </button>

            {/* Divider */}
            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gradient-to-br from-slate-50 via-white to-purple-50/30 px-4 text-sm text-gray-500">
                  Hoặc điền thông tin thủ công
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* ========== LEFT COLUMN - PHỤ HUYNH ========== */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-purple-500/5 p-4 lg:p-5 border border-purple-100/50 animate-fade-in-up">
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-purple-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Thông tin phụ huynh
                    </h3>
                    <p className="text-xs text-gray-500">
                      Người giám hộ của học sinh
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Parent Phone */}
                  <div className="group">
                    <label
                      htmlFor="parentPhone"
                      className="block text-xs font-medium text-gray-600 mb-1"
                    >
                      Số điện thoại <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors">
                        <Phone className="w-4 h-4" />
                      </div>
                      <Input
                        id="parentPhone"
                        name="parentPhone"
                        type="tel"
                        required
                        value={formData.parentPhone}
                        onChange={handleInputChange}
                        onBlur={handleParentPhoneBlur}
                        placeholder="0xxxxxxxxx"
                        className={`w-full pl-9 pr-9 py-2.5 bg-gray-50/50 border rounded-xl transition-all duration-300 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 text-sm ${
                          errors.parentPhone
                            ? "border-red-400 bg-red-50/50"
                            : parentConfirmed
                            ? "border-green-400 bg-green-50/50"
                            : "border-gray-200"
                        }`}
                        disabled={checkingParent}
                      />
                      {checkingParent && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      {parentConfirmed && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <UserCheck className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    {errors.parentPhone && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.parentPhone}
                      </p>
                    )}
                    {parentConfirmed && (
                      <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Đã liên kết với phụ huynh trong hệ thống
                      </p>
                    )}
                  </div>

                  {/* Parent Email */}
                  <div className="group">
                    <label
                      htmlFor="parentEmail"
                      className="block text-xs font-medium text-gray-600 mb-1"
                    >
                      Email <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors">
                        <Mail className="w-4 h-4" />
                      </div>
                      <Input
                        id="parentEmail"
                        name="parentEmail"
                        type="email"
                        required
                        value={formData.parentEmail}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                        className={`w-full pl-9 py-2.5 bg-gray-50/50 border rounded-xl transition-all duration-300 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 text-sm ${
                          errors.parentEmail
                            ? "border-red-400 bg-red-50/50"
                            : "border-gray-200"
                        } ${parentConfirmed ? "bg-gray-100" : ""}`}
                        disabled={parentConfirmed}
                      />
                    </div>
                    {errors.parentEmail && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.parentEmail}
                      </p>
                    )}
                  </div>

                  {/* Parent Name */}
                  <div className="group">
                    <label
                      htmlFor="parentName"
                      className="block text-xs font-medium text-gray-600 mb-1"
                    >
                      Họ và tên <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors">
                        <User className="w-4 h-4" />
                      </div>
                      <Input
                        id="parentName"
                        name="parentName"
                        type="text"
                        required
                        value={formData.parentName}
                        onChange={handleInputChange}
                        placeholder="Nguyễn Văn A"
                        className={`w-full pl-9 py-2.5 bg-gray-50/50 border rounded-xl transition-all duration-300 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 text-sm ${
                          errors.parentName
                            ? "border-red-400 bg-red-50/50"
                            : "border-gray-200"
                        } ${parentConfirmed ? "bg-gray-100" : ""}`}
                        disabled={parentConfirmed}
                      />
                    </div>
                    {errors.parentName && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.parentName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Info Note */}
                <div className="mt-4 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                  <p className="text-xs text-purple-700 flex items-start gap-2">
                    <Users className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      Phụ huynh sẽ nhận thông báo về tiến độ học tập và có thể
                      theo dõi kết quả của con.
                    </span>
                  </p>
                </div>
              </div>

              {/* ========== RIGHT COLUMN - HỌC SINH ========== */}
              <div
                className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-indigo-500/5 p-4 lg:p-5 border border-indigo-100/50 animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-indigo-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Thông tin học sinh
                    </h3>
                    <p className="text-xs text-gray-500">
                      Tài khoản đăng nhập hệ thống
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Full Name & Username - 2 columns */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="group">
                      <label
                        htmlFor="fullName"
                        className="block text-xs font-medium text-gray-600 mb-1"
                      >
                        Họ và tên <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                          <User className="w-4 h-4" />
                        </div>
                        <Input
                          id="fullName"
                          name="fullName"
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Họ và tên"
                          className={`w-full pl-9 py-2.5 bg-gray-50/50 border rounded-xl transition-all duration-300 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-sm ${
                            errors.fullName
                              ? "border-red-400 bg-red-50/50"
                              : "border-gray-200"
                          }`}
                        />
                      </div>
                      {errors.fullName && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.fullName}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label
                        htmlFor="username"
                        className="block text-xs font-medium text-gray-600 mb-1"
                      >
                        Tên đăng nhập <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                          <User className="w-4 h-4" />
                        </div>
                        <Input
                          id="username"
                          name="username"
                          type="text"
                          required
                          value={formData.username}
                          onChange={handleInputChange}
                          placeholder="username"
                          className={`w-full pl-9 py-2.5 bg-gray-50/50 border rounded-xl transition-all duration-300 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-sm ${
                            errors.username
                              ? "border-red-400 bg-red-50/50"
                              : "border-gray-200"
                          }`}
                        />
                      </div>
                      {errors.username && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.username}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email & Phone - 2 columns */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="group">
                      <label
                        htmlFor="email"
                        className="block text-xs font-medium text-gray-600 mb-1"
                      >
                        Email <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                          <Mail className="w-4 h-4" />
                        </div>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="email@example.com"
                          className={`w-full pl-9 py-2.5 bg-gray-50/50 border rounded-xl transition-all duration-300 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-sm ${
                            errors.email
                              ? "border-red-400 bg-red-50/50"
                              : "border-gray-200"
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label
                        htmlFor="phone"
                        className="block text-xs font-medium text-gray-600 mb-1"
                      >
                        Số điện thoại <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                          <Phone className="w-4 h-4" />
                        </div>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="0xxxxxxxxx"
                          className={`w-full pl-9 py-2.5 bg-gray-50/50 border rounded-xl transition-all duration-300 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-sm ${
                            errors.phone
                              ? "border-red-400 bg-red-50/50"
                              : "border-gray-200"
                          }`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Password & Confirm - 2 columns */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="group">
                      <label
                        htmlFor="password"
                        className="block text-xs font-medium text-gray-600 mb-1"
                      >
                        Mật khẩu <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                          <Lock className="w-4 h-4" />
                        </div>
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Tối thiểu 6 ký tự"
                          className={`w-full pl-9 pr-9 py-2.5 bg-gray-50/50 border rounded-xl transition-all duration-300 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-sm ${
                            errors.password
                              ? "border-red-400 bg-red-50/50"
                              : "border-gray-200"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.password}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label
                        htmlFor="confirmPassword"
                        className="block text-xs font-medium text-gray-600 mb-1"
                      >
                        Xác nhận mật khẩu{" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                          <Lock className="w-4 h-4" />
                        </div>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Nhập lại mật khẩu"
                          className={`w-full pl-9 pr-9 py-2.5 bg-gray-50/50 border rounded-xl transition-all duration-300 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-sm ${
                            errors.confirmPassword
                              ? "border-red-400 bg-red-50/50"
                              : "border-gray-200"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Note */}
                <div className="mt-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <p className="text-xs text-indigo-700 flex items-start gap-2">
                    <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      Học sinh sử dụng tài khoản này để đăng nhập, tham gia lớp
                      học và theo dõi tiến độ.
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* ========== FOOTER ACTIONS ========== */}
            <div className="mt-4 lg:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-100 shadow-lg">
              {/* Left: Navigation */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => nav("/home")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-300 group border border-gray-200 hover:border-gray-300"
                >
                  <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                  Trang chủ
                </button>
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                  <span>Đã có tài khoản?</span>
                  <button
                    type="button"
                    onClick={() => nav("/home/login")}
                    className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Đăng nhập
                  </button>
                </div>
              </div>

              {/* Right: Submit */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang tạo tài khoản...
                  </>
                ) : (
                  <>
                    Hoàn tất đăng ký
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Parent Confirm Dialog */}
      {parentConfirmDialog.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <UserCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Xác nhận phụ huynh
                </h3>
                <p className="text-sm text-gray-500">
                  Phụ huynh của bạn có phải là:
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-purple-50/50 rounded-2xl p-5 mb-6 space-y-3 border border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Họ tên:</span>
                <span className="font-semibold text-gray-900">
                  {parentConfirmDialog.parentInfo?.fullName || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Email:</span>
                <span className="font-semibold text-gray-900">
                  {parentConfirmDialog.parentInfo?.email || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Số điện thoại:</span>
                <span className="font-semibold text-gray-900">
                  {parentConfirmDialog.parentInfo?.phone || "—"}
                </span>
              </div>
              {parentConfirmDialog.parentInfo?.childCount > 0 && (
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-500">
                    Số con đang học:
                  </span>
                  <span className="font-semibold text-purple-600">
                    {parentConfirmDialog.parentInfo?.childCount} học sinh
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleRejectParent}
                className="flex-1 px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Không phải
              </button>
              <button
                type="button"
                onClick={handleConfirmParent}
                className="flex-1 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Đúng rồi
              </button>
            </div>
          </div>
        </div>
      )}

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
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-slide-right { animation: slide-right 8s ease-in-out infinite; }
        .animate-slide-left { animation: slide-left 8s ease-in-out infinite 4s; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
        .animate-bounce-gentle { animation: bounce-gentle 2s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .bg-size-200 { background-size: 200% 100%; }
        .bg-pos-0 { background-position: 0% 0%; }
        .bg-pos-100 { background-position: 100% 0%; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
    </div>
  );
}
