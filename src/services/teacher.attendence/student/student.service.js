//tuấn test
import { studentApi } from "./student.api";
export const studentService = {
  async lookupByCode(code) {
    return studentApi.lookupByCode(code);
  },
};
