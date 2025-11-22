// src/services/auth/auth.service.js
import { authApi } from "./auth.api";

const REMEMBER_KEY = "auth_remember_username";
const AUTH_USER_KEY = "auth_user";

const normalizeRoles = (roles = []) =>
  roles.map((r) =>
    String(r)
      .replace(/^ROLE_/, "")
      .toLowerCase()
  );
// Trim tất cả các giá trị string trong object, làm sách, tránh khoảng trắng thừa
const trimDeep = (obj = {}) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      typeof v === "string" ? v.trim() : v,
    ])
  );

// ============================================================
// MOCK ADMIN - Uncomment below for local testing without backend
// ============================================================
// const MOCK_USERS = [
//   {
//     username: "admin",
//     password: "admin123",
//     fullName: "Admin Tester",
//     roles: ["admin"],
//   },
// ];

export const authService = {
  async login({ username, password, remember }) {
    const trimmedUsername = username?.trim();

    // ============================================================
    // MOCK LOGIN - Uncomment this block for local testing
    // ============================================================
    // const matchedMock = MOCK_USERS.find(
    //   (mock) => mock.username === trimmedUsername && mock.password === password
    // );
    //
    // if (matchedMock) {
    //   const mockUser = {
    //     username: matchedMock.username,
    //     fullName: matchedMock.fullName,
    //     roles: normalizeRoles(matchedMock.roles),
    //   };
    //
    //   if (remember) localStorage.setItem(REMEMBER_KEY, trimmedUsername || "");
    //   else localStorage.removeItem(REMEMBER_KEY);
    //   localStorage.setItem(AUTH_USER_KEY, JSON.stringify(mockUser));
    //   console.warn("Using mock admin credentials for local testing.");
    //   return mockUser;
    // }

    // eslint-disable-next-line no-useless-catch
    try {
      const me = await authApi.login({ username: trimmedUsername, password });
      me.roles = normalizeRoles(me.roles);
      if (remember) localStorage.setItem(REMEMBER_KEY, trimmedUsername || "");
      else localStorage.removeItem(REMEMBER_KEY);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(me));
      return me;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    await authApi.logout();
    localStorage.clear();
  },

  async register(data) {
    const d = trimDeep(data);
    const payload = {
      // ----- Student -----
      studentFullName: d.fullName,
      studentUsername: d.username,
      studentPassword: d.password,
      studentRePassword: d.confirmPassword, // 👈 map confirmPassword -> studentRePassword
      studentPhoneNumber: d.phone,
      studentEmail: d.email || null, // DTO chỉ @Email (không @NotBlank) → có thể null

      // ----- Parent -----
      parentFullName: d.parentName,
      parentEmail: d.parentEmail || null, // DTO cho phép null
      parentPhoneNumber: d.parentPhone,
    };

    return authApi.register(payload);
  },

  // ✅ Bắt đầu OAuth Google cho cả login/register
  startGoogleOAuth(mode = "login") {
    window.location.assign(authApi.getGoogleOAuthUrl(mode));
  },

  // ✅ Dùng ở trang callback để lưu user (nếu BE trả về ?user=... hoặc ?token=...)
  // - Nếu BE redirect kèm ?user= base64(JSON UserInfoResponse)
  // - Hoặc kèm ?token=... (tuỳ BE), ta vẫn có thể fallback
  saveUserFromOAuthCallback({ userBase64, userJson }) {
    try {
      let me = userJson;
      if (!me && userBase64) {
        const json = atob(decodeURIComponent(userBase64));
        me = JSON.parse(json);
      }
      if (me) {
        me.roles = normalizeRoles(me.roles);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(me));
        return me;
      }
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      // ignore
    }
    return null;
  },

  loadRememberUsername: () => localStorage.getItem(REMEMBER_KEY) || "",

  loadSavedUser: () => {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    try {
      const p = raw ? JSON.parse(raw) : null;
      if (p?.roles) p.roles = normalizeRoles(p.roles);
      return p;
    } catch {
      return null;
    }
  },
  // ✅ Revalidate user against backend. Nếu BE không trả về user hợp lệ → clear local.
  async revalidate() {
    const cached = authService.loadSavedUser();
    if (!cached) return null; // không có user để xác thực
    try {
      const fresh = await authApi.me();
      fresh.roles = normalizeRoles(fresh.roles);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(fresh));
      return fresh;
    } catch (e) {
      // Token / cookie không còn hợp lệ hoặc server down → xóa local để UI chuyển sang trạng thái guest
      localStorage.removeItem(AUTH_USER_KEY);
      return null;
    }
  },
};
