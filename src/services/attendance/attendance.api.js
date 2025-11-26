import { http } from "../http";

export const attendanceApi = {
  // Save attendance by classId and date
  saveByClass: (classId, date, attendanceData, slotId) =>
    http
      .post(`/attendance/class/${classId}`, attendanceData, {
        params: { date, slotId },
      })
      .then((r) => r.data),

  // Get attendance detail by classId and date
  getByClass: (classId, date, slotId) =>
    http
      .get(`/attendance/class/${classId}`, { params: { date, slotId } })
      .then((r) => r.data),

  // Get attendance detail by classId and date for Admin (no ownership check)
  getByClassForAdmin: (classId, date, slotId) =>
    http
      .get(`/attendance/admin/class/${classId}`, { params: { date, slotId } })
      .then((r) => r.data),
};
