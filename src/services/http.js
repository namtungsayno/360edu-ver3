// src/services/http.js
import axios from "axios";

// Prefer environment config; fallback to default dev backend
const BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080/api";

// Helper function to get JWT token from cookie/localStorage
const getTokenFromCookie = () => {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "edu360_jwt") {
      return value;
    }
  }
  // Fallback: localStorage (more reliable across ports in dev)
  try {
    const lsToken = window.localStorage.getItem("edu360_jwt");
    if (lsToken) return lsToken;
  } catch {}
  return null;
};

export const http = axios.create({
  baseURL: BASE.replace(/\/$/, ""), // remove trailing slash if any
  withCredentials: true, // to send/receive jwt cookie (backend uses HTTP-only cookie)
  headers: { "Content-Type": "application/json" },
});

// Request interceptor to add Authorization header from cookie
http.interceptors.request.use(
  (config) => {
    const token = getTokenFromCookie();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (r) => r,
  (err) => {
    // Handle 401 Unauthorized - session expired, redirect to login
    if (err?.response?.status === 401) {
      // Clear localStorage and redirect to login
      localStorage.removeItem("auth_user");
      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/home/login";
      }
    }

    // Extract message from various response formats
    const data = err?.response?.data;
    let message = null;

    if (data) {
      // 1. Direct message field
      if (typeof data.message === "string") {
        message = data.message;
      }
      // 2. Error field
      else if (typeof data.error === "string") {
        message = data.error;
      }
      // 3. Array of errors (validation)
      else if (Array.isArray(data) && data.length > 0 && data[0]?.name) {
        message = data[0].name;
      }
      // 4. Errors object (validation)
      else if (data.errors && typeof data.errors === "object") {
        const firstError = Object.values(data.errors)[0];
        message = firstError || data.message;
      }
      // 5. Plain string response
      else if (typeof data === "string") {
        message = data;
      }
    }

    // Fallback to generic message
    err.displayMessage = message || err?.message || "Có lỗi xảy ra";

    return Promise.reject(err);
  }
);

// Global axios defaults & interceptor as a safety net for any ad-hoc axios usage
axios.defaults.baseURL = BASE.replace(/\/$/, "");
axios.defaults.withCredentials = true;
axios.interceptors.request.use(
  (config) => {
    const token = getTokenFromCookie();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
