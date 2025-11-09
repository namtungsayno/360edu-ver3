// ✅ SỬA LỖI: Thêm import http để gọi API trực tiếp
// (Chưa có subject.api.js nên gọi http trực tiếp tại service layer)
import { http } from "../http";

export const subjectService = {
  /**
   * ✅ THÊM MỚI: Lấy tất cả môn học đang ACTIVE
   * Endpoint: GET /subjects?status=ACTIVE
   *
   * @returns {Promise<Array>} - Danh sách môn học đang hoạt động
   */
  async all() {
    return http
      .get(`/subjects`, { params: { status: "ACTIVE" } })
      .then((r) => r.data);
  },
};
