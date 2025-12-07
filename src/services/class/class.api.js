import { http } from "../http";
export const classApi = {
  create: (payload) => http.post(`/classes`, payload).then((r) => r.data),
  list: (params = {}) => {
    console.log("📋 [CLASS_API] Calling GET /classes with params:", params);
    return http.get(`/classes`, { params }).then((r) => {
      console.log(
        "📚 [CLASS_API] Received",
        r.data.length,
        "classes from backend"
      );
      // Log first 3 classes
      r.data
        .slice(0, 3)
        .forEach((c) =>
          console.log(
            `   Class: id=${c.id}, name=${c.name}, teacher=${
              c.teacherFullName
            }, schedules=${c.schedule?.length || 0}`
          )
        );
      return r.data;
    });
  },

  /**
   * GET /classes/paginated - Lấy classes với phân trang từ server
   * @param {Object} params - { search, status, isOnline, teacherUserId, page, size, sortBy, order }
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number, ...}>}
   */
  listPaginated: (params = {}) => {
    const {
      search = "",
      status = "ALL", // ALL, DRAFT, PUBLIC, ARCHIVED
      isOnline = null, // null = all, true = online, false = offline
      teacherUserId = null,
      page = 0,
      size = 10,
      sortBy = "id",
      order = "asc",
    } = params;
    const queryParams = { search, status, page, size, sortBy, order };
    if (isOnline !== null) queryParams.isOnline = isOnline;
    if (teacherUserId) queryParams.teacherUserId = teacherUserId;
    return http
      .get(`/classes/paginated`, { params: queryParams })
      .then((r) => r.data);
  },

  publish: (id) => http.post(`/classes/${id}/publish`).then((r) => r.data),
  revertDraft: (id) =>
    http.post(`/classes/${id}/revert-draft`).then((r) => r.data),
  getById: (id) =>
    http.get(`/classes/${id}`).then((r) => {
      console.log("📘 [CLASS_API] GET /classes/" + id, r.data);
      if (r?.data) {
        const keys = Object.keys(r.data);
        console.log("   Fields:", keys);
        console.log(
          "   pricePerSession=",
          r.data.pricePerSession,
          " totalSessions=",
          r.data.totalSessions
        );
      }
      return r.data;
    }),
  // Public API for guest: get class detail with base course info
  getPublicDetail: (id) =>
    http.get(`/classes/${id}/public`).then((r) => r.data),
  update: (id, payload) =>
    http.put(`/classes/${id}`, payload).then((r) => r.data),
};
