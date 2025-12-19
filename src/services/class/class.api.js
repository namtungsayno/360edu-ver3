import { http } from "../http";
export const classApi = {
  create: (payload) => http.post(`/classes`, payload).then((r) => r.data),
  list: (params = {}) => {
    return http.get(`/classes`, { params }).then((r) => r.data);
  },

  /**
   * GET /classes/paginated - Lấy classes với phân trang từ server
   * @param {Object} params - { search, status, isOnline, teacherUserId, subjectId, minPrice, maxPrice, page, size, sortBy, order }
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number, ...}>}
   */
  listPaginated: (params = {}) => {
    const {
      search = "",
      status = "ALL", // ALL, DRAFT, PUBLIC, ARCHIVED
      isOnline = null, // null = all, true = false, false = offline
      teacherUserId = null,
      subjectId = null, // Filter by subject ID
      minPrice = null, // Filter by min price
      maxPrice = null, // Filter by max price
      page = 0,
      size = 10,
      sortBy = "id",
      order = "asc",
    } = params;
    const queryParams = { search, status, page, size, sortBy, order };
    if (isOnline !== null) queryParams.online = isOnline;
    if (teacherUserId) queryParams.teacherUserId = teacherUserId;
    if (subjectId) queryParams.subjectId = subjectId;
    if (minPrice !== null) queryParams.minPrice = minPrice;
    if (maxPrice !== null) queryParams.maxPrice = maxPrice;
    return http
      .get(`/classes/paginated`, { params: queryParams })
      .then((r) => r.data);
  },

  publish: (id) => http.post(`/classes/${id}/publish`).then((r) => r.data),
  revertDraft: (id) =>
    http.post(`/classes/${id}/revert-draft`).then((r) => r.data),
  getById: (id) => http.get(`/classes/${id}`).then((r) => r.data),
  // Public API for guest: get class detail with base course info
  getPublicDetail: (id) =>
    http.get(`/classes/${id}/public`).then((r) => r.data),
  update: (id, payload) =>
    http.put(`/classes/${id}`, payload).then((r) => r.data),
  // Delete a DRAFT class permanently
  delete: (id) => http.delete(`/classes/${id}`).then((r) => r.data),

  // Get DRAFT classes approaching start date (within 3 days) - for admin warning
  getDraftApproaching: () =>
    http.get(`/classes/draft-approaching`).then((r) => r.data),
};
