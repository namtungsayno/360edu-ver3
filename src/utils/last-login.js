// src/utils/last-login.js
// Ephemeral storage for the last typed password after login (session-scoped)

const KEY = "auth.lastLoginPassword";

export function cacheLastPassword(password) {
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(KEY, String(password || ""));
    }
  } catch {
    // ignore storage errors
  }
}

export function consumeLastPassword() {
  try {
    if (typeof sessionStorage !== "undefined") {
      const p = sessionStorage.getItem(KEY) || "";
      sessionStorage.removeItem(KEY);
      return p;
    }
  } catch {
    // ignore
  }
  return "";
}

export function clearLastPassword() {
  try {
    if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
