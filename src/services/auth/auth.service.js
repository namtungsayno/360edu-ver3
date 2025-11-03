import { authApi } from "./auth.api";

const REMEMBER_KEY = "auth_remember_username";
const AUTH_USER_KEY = "auth_user";

const normalizeRoles = (roles = []) =>
  roles.map((r) =>
    String(r)
      .replace(/^ROLE_/, "")
      .toLowerCase()
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

  // ❌ Bỏ hẳn me()
  async logout() {
    await authApi.logout();
    localStorage.removeItem(AUTH_USER_KEY);
  },

  register: (data) => authApi.register(data),

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
};
