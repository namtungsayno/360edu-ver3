// src/services/http.js
import axios from "axios";

// Prefer environment config; fallback to default dev backend
const BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080/api";

export const http = axios.create({
  baseURL: BASE.replace(/\/$/, ""), // remove trailing slash if any
  withCredentials: true, // to send/receive jwt cookie (backend uses HTTP-only cookie)
  headers: { "Content-Type": "application/json" },
});

// No need for Authorization header interceptor - backend uses HTTP-only cookie for JWT

http.interceptors.response.use(
  (r) => r,
  (err) => {
    console.error("HTTP ERROR:", err?.response?.status, err?.response?.data);

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
