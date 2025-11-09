// Thuần API: chỉ gọi HTTP và trả về r.data
import { http } from "../http";

const BASE = "/rooms";

export const classroomApi = {
  /** GET /rooms?{params} */
  list(params = {}) {
    return http.get(BASE, { params }).then((r) => r.data);
  },

  /** POST /rooms */
  create(payload) {
    return http.post(BASE, payload).then((r) => r.data);
  },

  /** PUT /rooms/:id */
  update(id, payload) {
    return http.put(`${BASE}/${id}`, payload).then((r) => r.data);
  },

  /** PUT /rooms/:id/enable */
  enable(id) {
    return http.put(`${BASE}/${id}/enable`).then((r) => r.data);
  },

  /** PUT /rooms/:id/disable */
  disable(id) {
    return http.put(`${BASE}/${id}/disable`).then((r) => r.data);
  },

  /**
   * ✅ THÊM MỚI: Tìm kiếm phòng học theo keyword và type
   * Endpoint: GET /rooms?keyword=...&type=...
   *
   * @param {string} keyword - Từ khóa tìm kiếm (tên phòng, mã phòng, v.v.)
   * @param {string} type - Loại phòng: "OFFLINE" (phòng học thực tế) hoặc "ONLINE" (phòng học online)
   * @returns {Promise<Array>} - Danh sách phòng học phù hợp
   */
  search(keyword = "", type = "OFFLINE") {
    return http.get(BASE, { params: { keyword, type } }).then((r) => r.data);
  },

  /**
   * ✅ THÊM MỚI: Lấy lịch rảnh/bận của phòng học trong khoảng thời gian
   * Endpoint: GET /rooms/:id/free-busy?from=...&to=...
   * Dùng để kiểm tra phòng học có trống trong khung giờ cần đặt không
   *
   * @param {number|string} id - ID của phòng học
   * @param {string} fromISO - Thời gian bắt đầu (ISO format: YYYY-MM-DDTHH:mm:ss)
   * @param {string} toISO - Thời gian kết thúc (ISO format: YYYY-MM-DDTHH:mm:ss)
   * @returns {Promise<Object>} - Thông tin lịch rảnh/bận của phòng
   */
  freeBusy(id, fromISO, toISO) {
    return http
      .get(`${BASE}/${id}/free-busy`, {
        params: { from: fromISO, to: toISO },
      })
      .then((r) => r.data);
  },
};
