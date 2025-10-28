// src/services/http.js
import axios from "axios";

export const http = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true, // ✅ để nhận Set-Cookie từ BE
  headers: { "Content-Type": "application/json" },
});

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
