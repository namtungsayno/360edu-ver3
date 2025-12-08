import { http } from "../http";

const BASE_URL = "/admin/reports";

export const reportApi = {
  // Báo cáo tổng quan
  getOverview: () => http.get(`${BASE_URL}/overview`),

  // Doanh thu theo giáo viên
  getTeacherRevenue: () => http.get(`${BASE_URL}/teacher-revenue`),

  // Top giáo viên doanh thu cao nhất
  getTopTeacher: () => http.get(`${BASE_URL}/top-teacher`),

  // Doanh thu theo môn học
  getSubjectRevenue: () => http.get(`${BASE_URL}/subject-revenue`),

  // Doanh thu theo ngày
  getRevenueByDay: (days = 30) =>
    http.get(`${BASE_URL}/revenue-by-day`, { params: { days } }),

  // Hiệu suất lớp học
  getClassPerformance: () => http.get(`${BASE_URL}/class-performance`),
};

export default reportApi;
