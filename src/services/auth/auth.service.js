import { authApi } from "./auth.api";

const REMEMBER_KEY = "auth_remember_username";
const AUTH_USER_KEY = "auth_user";

const normalizeRoles = (roles = []) =>
  roles.map((r) =>
    String(r)
      .replace(/^ROLE_/, "")
      .toLowerCase()
  );

export const authService = {
  async login({ username, password, remember }) {
    const me = await authApi.login({ username: username?.trim(), password });
    me.roles = normalizeRoles(me.roles);
    if (remember) localStorage.setItem(REMEMBER_KEY, username?.trim() || "");
    else localStorage.removeItem(REMEMBER_KEY);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(me));
    return me;
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
