import { studentScheduleApi } from "./student-schedule.api";

export const studentScheduleService = {
  /**
   * Lấy lịch học theo tuần (weekStart dạng YYYY-MM-DD)
   */
  async getScheduleByWeek(weekStart) {
    try {
      console.log("📅 [StudentScheduleService] Request weekStart=", weekStart);
      const data = await studentScheduleApi.getWeeklySchedule(weekStart);
      if (!Array.isArray(data)) {
        console.warn("⚠️ [StudentScheduleService] Response is not array", data);
        return [];
      }
      return data;
    } catch (err) {
      console.error("❌ [StudentScheduleService] getScheduleByWeek error:", err);
      return [];
    }
  }
};