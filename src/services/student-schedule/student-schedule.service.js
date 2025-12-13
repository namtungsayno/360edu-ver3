import { studentScheduleApi } from "./student-schedule.api";

export const studentScheduleService = {
  /**
   * Lấy lịch học theo tuần (weekStart dạng YYYY-MM-DD)
   */
  async getScheduleByWeek(weekStart) {
    try {
      const data = await studentScheduleApi.getWeeklySchedule(weekStart);
      if (!Array.isArray(data)) {
        return [];
      }
      return data;
    } catch (err) {
      return [];
    }
  }
};