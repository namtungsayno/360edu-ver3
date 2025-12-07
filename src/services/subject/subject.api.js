import { http } from "../http";

// Lấy tất cả subjects
export const getAllSubjects = async () => {
  const response = await http.get("/subjects");
  return response.data;
};

/**
 * Lấy subjects với phân trang và filter từ server
 * @param {Object} params - { search, status, page, size, sortBy, order }
 * @returns {Promise<{content: Array, totalElements: number, totalPages: number, ...}>}
 */
export const getSubjectsPaginated = async (params = {}) => {
  const {
    search = "",
    status = "ALL", // ALL, AVAILABLE, UNAVAILABLE
    page = 0,
    size = 10,
    sortBy = "id",
    order = "asc",
  } = params;

  const response = await http.get("/subjects/paginated", {
    params: { search, status, page, size, sortBy, order },
  });
  return response.data;
};

// Lấy subject theo id
export const getSubjectById = async (id) => {
  const response = await http.get(`/subjects/${id}`);
  return response.data;
};

// Tạo subject mới (role ADMIN)
export const createSubject = async (subjectData) => {
  const response = await http.post("/subjects", subjectData);
  return response.data;
};

// Cập nhật subject (role ADMIN)
export const updateSubject = async (id, subjectData) => {
  const response = await http.put(`/subjects/${id}`, subjectData);
  return response.data;
};

// Disable subject (role ADMIN)
export const disableSubject = async (id) => {
  const response = await http.put(`/subjects/${id}/disable`);
  return response.data;
};

// Enable subject (role ADMIN)
export const enableSubject = async (id) => {
  const response = await http.put(`/subjects/${id}/enable`);
  return response.data;
};
