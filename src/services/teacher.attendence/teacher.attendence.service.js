// FIXED: Sửa import path đúng với tên file teacher.attendence.api.js
import { teacherApi } from "./teacher.attendence.api";

export const teacherService = {
  /** Tìm kiếm giáo viên theo keyword */
  async search(keyword) {
    return teacherApi.search(keyword);
  },

  /** Lấy lịch rảnh/bận của giáo viên */
  async getFreeBusy(id, fromISO, toISO) {
    return teacherApi.freeBusy(id, fromISO, toISO);
  },
};
