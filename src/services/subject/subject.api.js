import axios from "axios";

// Base URL của backend
const API_URL = "http://localhost:8080/api/subjects";

// Lấy token từ localStorage (nếu dùng JWT)
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Lấy tất cả subjects
export const getAllSubjects = async () => {
  const response = await axios.get(API_URL, {
    headers: {
      ...getAuthHeader(),
    },
  });
  return response.data;
};

// Lấy subject theo id (role STUDENT)
export const getSubjectById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: {
      ...getAuthHeader(),
    },
  });
  return response.data;
};

// Tạo subject mới (role ADMIN)
export const createSubject = async (subjectData) => {
  const response = await axios.post(API_URL, subjectData, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });
  return response.data;
};

// Cập nhật subject (role ADMIN)
export const updateSubject = async (id, subjectData) => {
  const response = await axios.put(`${API_URL}/${id}`, subjectData, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });
  return response.data;
};

// Disable subject (role ADMIN)
export const disableSubject = async (id) => {
  const response = await axios.put(`${API_URL}/${id}/disable`, null, {
    headers: {
      ...getAuthHeader(),
    },
  });
  return response.data;
};

// Enable subject (role ADMIN)
export const enableSubject = async (id) => {
  const response = await axios.put(`${API_URL}/${id}/enable`, null, {
    headers: {
      ...getAuthHeader(),
    },
  });
  return response.data;
};
