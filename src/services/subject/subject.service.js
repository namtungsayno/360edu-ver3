// ✅ SỬA LỖI: Thêm import http để gọi API trực tiếp
// (Chưa có subject.api.js nên gọi http trực tiếp tại service layer)
import { getAllSubjects } from "./subject.api";

// Service tiện ích cho nghiệp vụ xử lý môn học ở FE
export const subjectService = {
  /**
   * Lấy tất cả môn học có trạng thái AVAILABLE (đang hoạt động)
   * Backend hiện chưa hỗ trợ filter qua query param, nên filter ở FE.
   */
  async all() {
    const data = await getAllSubjects();
    return Array.isArray(data)
      ? data.filter((s) => String(s.status) === "AVAILABLE")
      : [];
  },

  /**
   * (Tuỳ chọn mở rộng) Trả về cả danh sách đầy đủ không lọc
   */
  async allRaw() {
    return getAllSubjects();
  },
};
