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
    err.displayMessage =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Có lỗi xảy ra";
    return Promise.reject(err);
  }
);
