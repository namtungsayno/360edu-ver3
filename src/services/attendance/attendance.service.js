import { attendanceApi } from "./attendance.api";

export const attendanceService = {
  async saveBySession(sessionId, attendanceRecords) {
    const items = attendanceRecords.map((record) => ({
      studentId: record.studentId ?? record.id,
      status: (record.status || "UNMARKED").toUpperCase(),
      note: record.note || null,
    }));
    return attendanceApi.saveBySession(sessionId, { items });
  },
  // lấy danh sách điểm danh
  async getBySession(sessionId) {
    const data = await attendanceApi.getBySession(sessionId);
    const mapStatus = (s) => {
      switch (s) {
        case "PRESENT":
          return "present";
        case "ABSENT":
          return "absent";
        case "LATE":
          return "late";
        case "UNMARKED":
        default:
          return "-";
      }
    };
    return (data.students || []).map((it) => ({
      id: it.studentId,
      student: it.studentName,
      status: mapStatus(it.status),
      note: it.note || "",
    }));
  },
  async saveAttendance(classId, date, attendanceRecords, slotId) {
    // Transform data to match backend format
    const items = attendanceRecords.map((record) => ({
      studentId: record.studentId ?? record.id,
      status: (record.status || "UNMARKED").toUpperCase(), // Convert to uppercase for enum
      note: record.note || null,
    }));

    return attendanceApi.saveByClass(classId, date, { items }, slotId);
  },

  async getByClass(classId, date, slotId) {
    const data = await attendanceApi.getByClass(classId, date, slotId);
    // Map backend response to UI format used by ClassDetail.jsx
    // Expecting data.students: [{studentId, studentName, status}]
    const mapStatus = (s) => {
      switch (s) {
        case "PRESENT":
          return "present";
        case "ABSENT":
          return "absent";
        case "LATE":
          return "late";
        case "UNMARKED":
        default:
          return "-";
      }
    };

    const students = (data.students || []).map((it) => ({
      id: it.studentId,
      student: it.studentName,
      status: mapStatus(it.status),
      note: it.note || "",
    }));

    return {
      sessionId: data.sessionId,
      students,
    };
  },

  async getByClassForAdmin(classId, date, slotId) {
    const data = await attendanceApi.getByClassForAdmin(classId, date, slotId);
    // Map backend response to UI format
    const mapStatus = (s) => {
      switch (s) {
        case "PRESENT":
          return "present";
        case "ABSENT":
          return "absent";
        case "LATE":
          return "late";
        case "UNMARKED":
        default:
          return "-";
      }
    };

    return (data.students || []).map((it) => ({
      id: it.studentId,
      student: it.studentName,
      status: mapStatus(it.status),
      note: it.note || "",
    }));
  },

  /**
   * Check attendance status for multiple sessions
   * @param {Array<{classId: number, date: string, slotId: number}>} sessions
   * @returns {Promise<Map<string, boolean>>} Map of session key to attendance status
   */
  async checkAttendanceStatus(sessions) {
    // Convert sessions to identifiers: "classId-yyyy-MM-dd-slotId"
    const identifiers = sessions.map(
      (s) => `${s.classId}-${s.date}-${s.slotId}`
    );

    return attendanceApi.checkStatus(identifiers);
  },
};
