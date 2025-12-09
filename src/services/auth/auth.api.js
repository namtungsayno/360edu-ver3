//Dùng axios để gọi REST API tới backend.
// Tất cả request (GET, POST, …) được thực hiện ở đây → tách riêng khỏi UI.
// src/services/auth/auth.api.js
import { http } from "../http";

// Google OAuth Config - Lấy từ Google Cloud Console
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const GOOGLE_REDIRECT_URI =
  import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
  `${window.location.origin}/auth/google/callback`;

export const authApi = {
  //  Đăng nhập → trả về UserInfoResponse
  login: (payload) => http.post("/auth/login", payload).then((r) => r.data),

  //  Đăng xuất
  logout: () => http.post("/auth/logout").then((r) => r.data),

  //  Đăng ký (signup)
  register: (payload) =>
    http
      .post("/auth/signup", payload, { withCredentials: false })
      .then((r) => r.data),

  //  Quên mật khẩu - gửi email để nhận mật khẩu mới
  forgotPassword: (email) =>
    http.post("/auth/forgot-password", { email }).then((r) => r.data),

  //  Google OAuth - Lấy URL đăng nhập Google
  getGoogleOAuthUrl() {
    const baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account consent", // Force chọn account mỗi lần
    });
    return `${baseUrl}?${params.toString()}`;
  },

  //  Google OAuth - Exchange code for user info
  // Gửi authorization code lên BE để xử lý
  googleAuth: (code, redirectUri = GOOGLE_REDIRECT_URI) =>
    http
      .post("/auth/google", { code, redirectUri })
      .then((r) => r.data),

  //  Google OAuth - Complete registration với thông tin phụ huynh
  googleRegister: (data) =>
    http.post("/auth/google/register", data).then((r) => r.data),

  //  Check if parent phone exists in system
  checkParentPhone: (phone) =>
    http.get(`/auth/check-parent-phone?phone=${encodeURIComponent(phone)}`).then((r) => r.data),
};
