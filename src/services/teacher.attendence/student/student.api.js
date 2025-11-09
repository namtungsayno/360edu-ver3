//tuấn test
import { http } from "../../http";
export const studentApi = {
  lookupByCode: (code) =>
    http.get(`/students/lookup`, { params: { code } }).then((r) => r.data),
};
