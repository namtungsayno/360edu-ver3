import { http } from "../http";

export const teacherApi = {
  search: (keyword = "", limit = 20) =>
    http.get(`/teachers`, { params: { keyword, limit } }).then((r) => r.data),
  freeBusy: (id, fromISO, toISO) =>
    http
      .get(`/teachers/${id}/free-busy`, {
        params: { from: fromISO, to: toISO },
      })
      .then((r) => r.data),
};
