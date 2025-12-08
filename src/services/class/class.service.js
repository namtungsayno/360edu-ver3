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
  // Public API for guest: get class detail with base course info
  async getPublicDetail(id) {
    return classApi.getPublicDetail(id);
  },
  async update(id, payload) {
    return classApi.update(id, payload);
  },
  // Delete a DRAFT class permanently
  async delete(id) {
    return classApi.delete(id);
  },
};
