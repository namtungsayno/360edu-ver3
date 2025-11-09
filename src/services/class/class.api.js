import { http } from "../http";
export const classApi = {
  create: (payload) => http.post(`/classes`, payload).then((r) => r.data),
  list: (params = {}) => http.get(`/classes`, { params }).then((r) => r.data),
};
