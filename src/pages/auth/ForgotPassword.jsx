/**
 * FORGOT PASSWORD PAGE - Trang quên mật khẩu
 *
 * Route: /home/forgot-password
 * Layout: AuthLayout
 *
 * Chức năng:
 * - Nhập email để nhận link đặt lại mật khẩu
 * - Validation email
 * - Hiển thị thông báo sau khi gửi yêu cầu
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import Logo from "../../components/common/Logo";
import { useToast } from "../../hooks/use-toast";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export default function ForgotPassword() {
  const nav = useNavigate();
  const { success, error, info } = useToast();

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const next = {};

    if (!email.trim()) {
      next.email = "Vui lòng nhập email.";
    } else if (!EMAIL_REGEX.test(email)) {
      next.email = "Email không hợp lệ.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      error("Vui lòng nhập email hợp lệ");
      return;
    }

    try {
      setSubmitting(true);

      // TODO: Implement API call when backend supports forgot password
      // await authService.forgotPassword(email.trim());

      // Simulate API call - remove this when real API is ready
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitted(true);
      success(
        "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu.",
        "Đã gửi yêu cầu! 📧"
      );

      // Note: Currently backend doesn't support this feature
      info(
        "Tính năng đang được phát triển. Vui lòng liên hệ Admin để được hỗ trợ.",
        "Thông báo"
      );
    } catch (err) {
      const apiMsg =
        err?.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại sau.";
      error(apiMsg);
    } finally {
      setSubmitting(false);
    }
  };

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
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Quên mật khẩu?
                </h2>
                <p className="text-gray-600">
                  Nhập email của bạn để nhận link đặt lại mật khẩu
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Kiểm tra email của bạn
                </h2>
                <p className="text-gray-600">
                  Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến{" "}
                  <span className="font-medium text-gray-900">{email}</span>
                </p>
              </>
            )}
          </div>

          {/* FORM */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({});
                    }}
                    className={`pl-10 w-full ${
                      errors.email ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                    disabled={submitting}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-200"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang gửi...
                  </span>
                ) : (
                  "Gửi yêu cầu"
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={() => setSubmitted(false)}
                variant="outline"
                className="w-full"
              >
                Gửi lại email
              </Button>
            </div>
          )}

          {/* BACK TO LOGIN */}
          <div className="mt-6 text-center">
            <button
              onClick={() => nav("/home/login")}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại đăng nhập
            </button>
          </div>
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
