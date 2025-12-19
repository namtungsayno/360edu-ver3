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

  // Save attendance by sessionId (preferred long-term)
  saveBySession: (sessionId, attendanceData) =>
    http
      .post(`/attendance/session/${sessionId}`, attendanceData)
      .then((r) => r.data),

  // Get attendance detail by sessionId (preferred long-term)
  getBySession: (sessionId) =>
    http.get(`/attendance/session/${sessionId}`).then((r) => r.data),

  // Check attendance status for multiple sessions
  // sessionIdentifiers: array of strings in format "classId-yyyy-MM-dd-slotId"
  // Returns: { "classId-yyyy-MM-dd-slotId": true/false, ... }
  checkStatus: (sessionIdentifiers) =>
    http
      .post(`/attendance/check-status`, sessionIdentifiers)
      .then((r) => r.data),
};
