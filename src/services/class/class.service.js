//Tuấn test
import { classApi } from "./class.api";
export const classService = {
  async create(payload) {
    return classApi.create(payload);
  },
  async list(filters = {}) {
    return classApi.list(filters);
  },
};
