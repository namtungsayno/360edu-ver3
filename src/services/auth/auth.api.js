//Dùng axios để gọi REST API tới backend.
// Tất cả request (GET, POST, …) được thực hiện ở đây → tách riêng khỏi UI.
// src/services/auth/auth.api.js
import { http } from "../http";

export const authApi = {
  // ✅ Đăng nhập → trả về UserInfoResponse
  login: (payload) => http.post("/auth/login", payload).then((r) => r.data),

  // ❌ BE KHÔNG có /me — xóa dòng này
  // me: () => http.get("/auth/me").then((r) => r.data),

  // ✅ Đăng xuất
  logout: () => http.post("/auth/logout").then((r) => r.data),

  // ✅ Đăng ký (signup)
  register: (payload) => http.post("/auth/signup", payload).then((r) => r.data),
};
