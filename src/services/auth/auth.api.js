//Dùng axios để gọi REST API tới backend.
// Tất cả request (GET, POST, …) được thực hiện ở đây → tách riêng khỏi UI.
// src/services/auth/auth.api.js
import { http } from "../http";

//lấy base URL gốc từ của BE.
const API_BASE_ORIGIN = (http?.defaults?.baseURL || "").replace(
  /\/api\/?$/,
  ""
);

// FE callback (có thể override bằng env)
const OAUTH_REDIRECT =
  import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
  `${window.location.origin}/oauth2/callback`;

export const authApi = {
  // ✅ Đăng nhập → trả về UserInfoResponse
  login: (payload) => http.post("/auth/login", payload).then((r) => r.data),

  // ❌ BE KHÔNG có /me — xóa dòng này
  // me: () => http.get("/auth/me").then((r) => r.data),

  // ✅ Đăng xuất
  logout: () => http.post("/auth/logout").then((r) => r.data),

  // ✅ Đăng ký (signup)
  register: (payload) =>
    http
      .post("/auth/signup", payload, { withCredentials: false })
      .then((r) => r.data),
  // ✅ Thêm mode để phân biệt login/register (đi qua tham số state)
  getGoogleOAuthUrl(mode = "login") {
    const start = `${API_BASE_ORIGIN}/oauth2/authorization/google`;
    const stateObj = { mode, t: Date.now() }; // t chống cache
    const params = new URLSearchParams({
      redirect_uri: OAUTH_REDIRECT,
      state: encodeURIComponent(JSON.stringify(stateObj)),
    });
    return `${start}?${params.toString()}`;
  },
};
