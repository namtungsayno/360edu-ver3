//Tuấn test
import { classApi } from "./class.api";
export const classService = {
  async create(payload) {
    return classApi.create(payload);
  },
  async list(filters = {}) {
    return classApi.list(filters);
  },
  async publish(id) {
    return classApi.publish(id);
  },
  async revertDraft(id) {
    return classApi.revertDraft(id);
  },
  async getById(id) {
    return classApi.getById(id);
  },
  async update(id, payload) {
    return classApi.update(id, payload);
  },
};
