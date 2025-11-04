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
};
