import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 10000,
});

// Interceptor hiển thị message lỗi cụ thể từ backend
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Chuẩn hóa thông điệp lỗi để FE có thể hiển thị
    const backendMessage =
      error?.response?.data?.message || // trường message JSON
      (typeof error?.response?.data === "string"
        ? error.response.data
        : null) ||
      error?.response?.data?.error ||
      error.message ||
      "Đã xảy ra lỗi";

    error.normalizedMessage = backendMessage;
    return Promise.reject(error);
  }
);
