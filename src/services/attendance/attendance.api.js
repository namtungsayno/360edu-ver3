import { http } from "../http";

export const attendanceApi = {
  // Save attendance by classId and date
  saveByClass: (classId, date, attendanceData) =>
    http
      .post(`/attendance/class/${classId}`, attendanceData, {
        params: { date },
      })
      .then((r) => r.data),

  // Get attendance detail by classId and date
  getByClass: (classId, date) =>
    http
      .get(`/attendance/class/${classId}`, { params: { date } })
      .then((r) => r.data),
};
