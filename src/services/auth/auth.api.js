
//Dùng axios để gọi REST API tới backend.
// Tất cả request (GET, POST, …) được thực hiện ở đây → tách riêng khỏi UI.


import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // URL backend 
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor nếu cần
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error);
    return Promise.reject(error);
  }
);

export default api;

// Mock API (fallback khi backend chưa sẵn sàng)
export const mockApi = {
  async getUsers() {
    // mô phỏng trễ mạng
    await new Promise((r) => setTimeout(r, 300));
    return [
      { id: 1, name: "Alice Nguyen", email: "alice@example.com", role: "admin", status: "active", joinDate: "2023-01-15" },
      { id: 2, name: "Bob Tran", email: "bob@example.com", role: "teacher", status: "active", joinDate: "2023-02-20" },
      { id: 3, name: "Carol Le", email: "carol@example.com", role: "student", status: "active", joinDate: "2023-03-10" },
      { id: 4, name: "David Pham", email: "david@example.com", role: "student", status: "inactive", joinDate: "2023-04-05" },
      { id: 5, name: "Eva Kim", email: "eva@example.com", role: "teacher", status: "active", joinDate: "2023-05-12" },
    ];
  },

  async getDashboardStats() {
    await new Promise((r) => setTimeout(r, 200));
    return {
      totalUsers: 1250,
      activeUsers: 1100,
      totalCourses: 45,
      totalRevenue: 125000,
      userGrowth: { value: "12%", positive: true },
      revenueGrowth: { value: "8%", positive: true },
    };
  },

  async getCourses() {
    await new Promise((r) => setTimeout(r, 400));
    return [
      { id: 1, title: "React Fundamentals", instructor: "Alice Nguyen", students: 150, price: 99, status: "active" },
      { id: 2, title: "Advanced JavaScript", instructor: "Bob Tran", students: 89, price: 149, status: "active" },
      { id: 3, title: "Node.js Backend", instructor: "Eva Kim", students: 67, price: 199, status: "active" },
      { id: 4, title: "Database Design", instructor: "Alice Nguyen", students: 45, price: 79, status: "draft" },
    ];
  },
};