import { attendanceApi } from "./attendance.api";

export const attendanceService = {
  async saveAttendance(classId, date, attendanceRecords) {
    // Transform data to match backend format
    const items = attendanceRecords.map((record) => ({
      studentId: record.studentId ?? record.id,
      status: (record.status || "UNMARKED").toUpperCase(), // Convert to uppercase for enum
      note: record.note || null,
    }));

    return attendanceApi.saveByClass(classId, date, { items });
  },

  async getByClass(classId, date) {
    const data = await attendanceApi.getByClass(classId, date);
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

    return (data.students || []).map((it) => ({
      id: it.studentId,
      student: it.studentName,
      status: mapStatus(it.status),
      note: it.note || "",
    }));
  },
};
