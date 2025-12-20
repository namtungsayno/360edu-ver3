/**
 * RESET PASSWORD PAGE - Trang đặt lại mật khẩu
 *
 * Route: /reset-password?token=xxx
 * Layout: AuthLayout
 *
 * Chức năng:
 * - Validate token từ URL
 * - Cho phép user nhập mật khẩu mới
 * - Hiển thị thông báo thành công/thất bại
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import Logo from "../../components/common/Logo";
import { useToast } from "../../hooks/use-toast";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  KeyRound,
} from "lucide-react";
import { authApi } from "../../services/auth/auth.api";

const PASSWORD_MIN_LENGTH = 6;

export default function ResetPassword() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { success, error } = useToast();

  // States
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenError("Link đặt lại mật khẩu không hợp lệ.");
        setValidating(false);
        return;
      }

      try {
        await authApi.validateResetToken(token);
        setTokenValid(true);
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.";
        setTokenError(message);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const validate = () => {
    const next = {};

    if (!password) {
      next.password = "Vui lòng nhập mật khẩu mới.";
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      next.password = `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự.`;
    }

    if (!confirmPassword) {
      next.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (password !== confirmPassword) {
      next.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      setSubmitting(true);
      await authApi.resetPassword(token, password);
      setSubmitted(true);
      success("Mật khẩu đã được đặt lại thành công!", "Thành công! 🎉");
    } catch (err) {
      const apiMsg =
        err?.response?.data?.message ||
        "Có lỗi xảy ra. Vui lòng thử lại hoặc yêu cầu link mới.";
      error(apiMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang xác thực link...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 overflow-hidden relative">
        {/* ANIMATED BACKGROUND */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Link không hợp lệ
              </h2>
              <p className="text-gray-600 mb-6">{tokenError}</p>

              <div className="space-y-3">
                <Button
                  onClick={() => nav("/home/forgot-password")}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold"
                >
                  Yêu cầu link mới
                </Button>
                <button
                  onClick={() => nav("/home/login")}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm w-full justify-center"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại đăng nhập
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 overflow-hidden relative">
      {/* ANIMATED BACKGROUND */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>

      {/* FORM CONTAINER */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg p-2">
                <Logo />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 bg-clip-text text-transparent">
                360edu
              </h1>
            </div>

            {!submitted ? (
              <>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Đặt lại mật khẩu
                </h2>
                <p className="text-gray-600">
                  Nhập mật khẩu mới cho tài khoản của bạn
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Đặt lại mật khẩu thành công!
                </h2>
                <p className="text-gray-600">
                  Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ
                </p>
              </>
            )}
          </div>

          {/* FORM */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors((prev) => ({ ...prev, password: null }));
                      }
                    }}
                    className={`pl-10 pr-10 w-full ${
                      errors.password ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors((prev) => ({
                          ...prev,
                          confirmPassword: null,
                        }));
                      }
                    }}
                    className={`pl-10 pr-10 w-full ${
                      errors.confirmPassword
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Password requirements */}
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium mb-1">Yêu cầu mật khẩu:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li
                    className={
                      password.length >= PASSWORD_MIN_LENGTH
                        ? "text-green-600"
                        : ""
                    }
                  >
                    Ít nhất {PASSWORD_MIN_LENGTH} ký tự
                  </li>
                  <li
                    className={
                      password && password === confirmPassword
                        ? "text-green-600"
                        : ""
                    }
                  >
                    Mật khẩu xác nhận phải khớp
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </span>
                ) : (
                  "Đặt lại mật khẩu"
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={() => nav("/home/login")}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold"
              >
                Đăng nhập ngay
              </Button>
            </div>
          )}

          {/* BACK TO LOGIN */}
          {!submitted && (
            <div className="mt-6 text-center">
              <button
                onClick={() => nav("/home/login")}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại đăng nhập
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Cần hỗ trợ?{" "}
          <a
            href="mailto:support@360edu.vn"
            className="text-blue-600 hover:underline"
          >
            Liên hệ chúng tôi
          </a>
        </p>
      </div>
    </div>
  );
}
