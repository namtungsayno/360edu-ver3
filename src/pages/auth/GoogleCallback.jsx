import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { authApi } from "../../services/auth/auth.api";
import GoogleRegisterForm from "../../components/auth/GoogleRegisterForm";

/**
 * Trang callback xử lý Google OAuth
 * URL: /auth/google/callback?code=xxx
 *
 * Flow:
 * 1. Lấy authorization code từ URL
 * 2. Gửi code lên BE để exchange lấy user info
 * 3. Nếu user đã tồn tại → Login thành công → Redirect về dashboard
 * 4. Nếu user chưa tồn tại → Hiển thị form đăng ký với thông tin phụ huynh
 */
export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUserDirectly } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [googleUserInfo, setGoogleUserInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError("Đăng nhập Google thất bại: " + errorParam);
      setLoading(false);
      return;
    }

    if (!code) {
      setError("Không tìm thấy authorization code");
      setLoading(false);
      return;
    }

    // Kiểm tra xem đang xử lý hay chưa (tránh gọi 2 lần)
    if (isProcessing) {
      return;
    }

    // Kiểm tra xem code này đã được xử lý chưa (dùng sessionStorage để persist qua re-render)
    const processedCode = sessionStorage.getItem("google_oauth_code");
    if (processedCode === code) {
      setLoading(false);
      return;
    }

    // Đánh dấu đang xử lý
    setIsProcessing(true);

    // Đánh dấu code đã được xử lý NGAY LẬP TỨC
    sessionStorage.setItem("google_oauth_code", code);

    // Xóa code khỏi URL để tránh xử lý lại khi refresh
    window.history.replaceState({}, document.title, window.location.pathname);

    const handleGoogleAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await authApi.googleAuth(code);

        if (response.needsRegistration) {
          // User chưa có tài khoản → Hiển thị form đăng ký
          setNeedsRegistration(true);
          setGoogleUserInfo({
            googleId: response.googleId,
            googleEmail: response.googleEmail,
            googleName: response.googleName,
            googlePicture: response.googlePicture,
          });
        } else if (response.userId) {
          // User đã có tài khoản → Login thành công

          // Lưu JWT token vào cookie + localStorage (backup nếu Set-Cookie không hoạt động do cross-origin)
          if (response.token) {
            const token = response.token;
            document.cookie = `edu360_jwt=${token}; path=/; max-age=${
              24 * 60 * 60
            }; SameSite=Lax`;
            try {
              window.localStorage.setItem("edu360_jwt", token);
            } catch {}
          }

          // Set user directly without calling login API (avoid API call with null password)
          setUserDirectly({
            id: response.userId,
            username: response.username,
            email: response.email,
            fullName: response.fullName,
            avatarUrl: response.avatarUrl,
            roles: response.roles,
          });

          // Clear sessionStorage và redirect based on role
          sessionStorage.removeItem("google_oauth_code");
          const roles = response.roles || [];
          if (roles.includes("ROLE_ADMIN")) {
            navigate("/home/admin/dashboard", { replace: true });
          } else if (roles.includes("ROLE_TEACHER")) {
            navigate("/home/teacher/management", { replace: true });
          } else if (roles.includes("ROLE_STUDENT")) {
            navigate("/home/my-classes", { replace: true });
          } else {
            navigate("/home", { replace: true });
          }
        } else {
          sessionStorage.removeItem("google_oauth_code");
          setError(response.message || "Đăng nhập thất bại");
        }
      } catch (err) {
        sessionStorage.removeItem("google_oauth_code");
        setError(err.response?.data?.message || "Lỗi xác thực Google");
      } finally {
        setLoading(false);
      }
    };

    handleGoogleAuth();
  }, [searchParams, setUserDirectly, navigate]);

  const handleRegistrationComplete = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const registerData = {
        ...googleUserInfo,
        username: formData.username,
        studentFullName: formData.studentFullName || googleUserInfo.googleName,
        studentPhone: formData.studentPhone,
        parentFullName: formData.parentFullName,
        parentPhone: formData.parentPhone,
        parentEmail: formData.parentEmail,
      };

      const response = await authApi.googleRegister(registerData);

      if (response.userId) {
        // Đăng ký thành công → Lưu token và set user

        // Lưu JWT token vào cookie + localStorage (backup nếu Set-Cookie không hoạt động do cross-origin)
        if (response.token) {
          const token = response.token;
          document.cookie = `edu360_jwt=${token}; path=/; max-age=${
            24 * 60 * 60
          }; SameSite=Lax`;
          try {
            window.localStorage.setItem("edu360_jwt", token);
          } catch {}
        }

        setUserDirectly({
          id: response.userId,
          username: response.username,
          email: response.email,
          fullName: response.fullName,
          avatarUrl: response.avatarUrl,
          roles: response.roles,
        });

        // Clear sessionStorage và redirect to student dashboard
        sessionStorage.removeItem("google_oauth_code");
        navigate("/home/my-classes", { replace: true });
      } else {
        setError(response.message || "Đăng ký thất bại");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi đăng ký tài khoản");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {needsRegistration
              ? "Đang xử lý đăng ký..."
              : "Đang xác thực với Google..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !needsRegistration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Đăng nhập thất bại
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Registration form
  if (needsRegistration && googleUserInfo) {
    return (
      <GoogleRegisterForm
        googleUserInfo={googleUserInfo}
        onSubmit={handleRegistrationComplete}
        onCancel={() => navigate("/login")}
        error={error}
        loading={loading}
      />
    );
  }

  return null;
}
