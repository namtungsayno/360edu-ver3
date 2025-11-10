// src/services/schedule/schedule.service.js
// Business logic for schedule management with real API integration
import { scheduleApi } from "./schedule.api";

// Helper to map dayOfWeek string to number (MON=1, TUE=2, ..., SUN=7)
const dayMap = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
  SUN: 7,
};

export const scheduleService = {
  /**
   * Get all semesters
   * @returns {Promise<Array>} semesters with format for Select component
   */
  async getSemesters() {
    try {
      const semesters = await scheduleApi.getSemesters();
      // Transform to format: {id, value, label}
      return semesters.map((s) => ({
        id: s.id,
        value: String(s.id),
        label: s.name,
        startDate: s.startDate,
        endDate: s.endDate,
      }));
    } catch (err) {
      console.warn("Failed to fetch semesters, using fallback", err.message);
      // Fallback mock data
      return [
        { id: 1, value: "1", label: "Spring 2024", startDate: "2024-01-15", endDate: "2024-05-15" },
        { id: 2, value: "2", label: "Summer 2024", startDate: "2024-05-20", endDate: "2024-08-15" },
        { id: 3, value: "3", label: "Fall 2024", startDate: "2024-09-01", endDate: "2024-12-20" },
        { id: 4, value: "4", label: "Spring 2025", startDate: "2025-01-15", endDate: "2025-05-15" },
        { id: 5, value: "5", label: "Summer 2025", startDate: "2025-05-20", endDate: "2025-08-15" },
        { id: 6, value: "6", label: "Fall 2025", startDate: "2025-09-01", endDate: "2025-12-20" },
      ];
    }
  },

  /**
   * Get all time slots
   * @returns {Promise<Array>} slots with id, label, time
   */
  async getSlots() {
    try {
      const slots = await scheduleApi.getSlots();
      return slots.map((s) => ({
        id: s.id,
        label: s.code || `Slot ${s.id}`,
        time: `${s.startTime}-${s.endTime}`,
        startTime: s.startTime,
        endTime: s.endTime,
      }));
    } catch (err) {
      console.warn("Failed to fetch slots, using fallback", err.message);
      return [
        { id: 1, label: "Slot 1", time: "07:30-09:00", startTime: "07:30", endTime: "09:00" },
        { id: 2, label: "Slot 2", time: "09:10-10:40", startTime: "09:10", endTime: "10:40" },
        { id: 3, label: "Slot 3", time: "10:50-12:20", startTime: "10:50", endTime: "12:20" },
        { id: 4, label: "Slot 4", time: "12:50-14:20", startTime: "12:50", endTime: "14:20" },
        { id: 5, label: "Slot 5", time: "14:30-16:00", startTime: "14:30", endTime: "16:00" },
        { id: 6, label: "Slot 6", time: "16:10-17:40", startTime: "16:10", endTime: "17:40" },
      ];
    }
  },

  /**
   * Get schedule for a semester
   * @param {number} semesterId
   * @returns {Promise<Array>} schedule items with all needed fields
   */
  async getScheduleBySemester(semesterId) {
    try {
      // Fetch both classes and schedules in parallel
      const [classes, schedules] = await Promise.all([
        scheduleApi.getClasses(semesterId),
        scheduleApi.getClassSchedules(semesterId),
      ]);

      // Create a map for quick class lookup
      const classMap = {};
      classes.forEach((cls) => {
        classMap[cls.id] = cls;
      });

      // Transform schedules to frontend format
      return schedules.map((schedule) => {
        const classInfo = classMap[schedule.classId] || {};
        const dayNum = dayMap[schedule.dayOfWeek?.toUpperCase()] || 1;

        return {
          id: schedule.id,
          classId: schedule.classId,
          className: classInfo.name || "Unknown Class",
          classCode: classInfo.code || "",
          day: dayNum,
          slotId: schedule.slotId,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          dayOfWeek: schedule.dayOfWeek,
          // Additional fields (may need to fetch from other endpoints)
          teacherId: null, // TODO: Add teacher info if available
          teacherName: "TBA",
          subjectName: classInfo.name || "Unknown",
          room: null, // TODO: Add room info if available
          studentCount: 0, // TODO: Add student count if available
          isOnline: false, // TODO: Add online/offline info if available
          meetLink: null,
          status: "scheduled",
        };
      });
    } catch (err) {
      console.warn("Failed to fetch schedule, using fallback", err.message);
      // Return fallback mock data
      return this.getFallbackSchedule();
    }
  },

  /**
   * Get attendance for a class schedule
   * @param {number} scheduleId
   * @returns {Promise<Array>} attendance records
   */
  async getAttendance(scheduleId) {
    try {
      return await scheduleApi.getAttendance(scheduleId);
    } catch (err) {
      console.warn("Failed to fetch attendance", err.message);
      // Fallback mock attendance
      return [
        { id: 1, student: "Nguyễn Văn A", status: "present", time: "16:05" },
        { id: 2, student: "Trần Thị B", status: "present", time: "16:03" },
        { id: 3, student: "Lê Văn C", status: "late", time: "16:15" },
        { id: 4, student: "Phạm Thị D", status: "absent", time: "-" },
        { id: 5, student: "Hoàng Văn E", status: "present", time: "16:02" },
      ];
    }
  },

  /**
   * Fallback mock schedule data
   */
  getFallbackSchedule() {
    return [
      {
        id: 1,
        classId: 101,
        teacherId: "teacher1",
        teacherName: "Nguyễn Văn Xuân",
        day: 1,
        slotId: 1,
        className: "SE1234",
        subjectName: "Software Engineering",
        room: "DE-201",
        studentCount: 35,
        isOnline: false,
        meetLink: null,
        status: "scheduled",
      },
      {
        id: 2,
        classId: 102,
        teacherId: "teacher2",
        teacherName: "Trần Thị Yến",
        day: 1,
        slotId: 2,
        className: "PRJ301",
        subjectName: "Java Web Application",
        room: null,
        studentCount: 40,
        isOnline: true,
        meetLink: "https://meet.google.com/prj-301",
        status: "scheduled",
      },
      {
        id: 3,
        classId: 103,
        teacherId: "teacher3",
        teacherName: "Lê Văn Z",
        day: 2,
        slotId: 1,
        className: "DBI202",
        subjectName: "Database",
        room: "DE-305",
        studentCount: 30,
        isOnline: false,
        meetLink: null,
        status: "scheduled",
      },
      {
        id: 4,
        classId: 104,
        teacherId: "teacher1",
        teacherName: "Nguyễn Văn Xuân",
        day: 3,
        slotId: 1,
        className: "SWE201",
        subjectName: "Software Engineering",
        room: "DE-102",
        studentCount: 28,
        isOnline: false,
        meetLink: null,
        status: "scheduled",
      },
      {
        id: 5,
        classId: 105,
        teacherId: "teacher4",
        teacherName: "Phạm Thị K",
        day: 4,
        slotId: 2,
        className: "IOT102",
        subjectName: "Internet of Things",
        room: null,
        studentCount: 25,
        isOnline: true,
        meetLink: "https://meet.google.com/iot-102",
        status: "scheduled",
      },
      {
        id: 6,
        classId: 106,
        teacherId: "teacher2",
        teacherName: "Trần Thị Yến",
        day: 5,
        slotId: 1,
        className: "MAS291",
        subjectName: "Mathematics",
        room: "DE-401",
        studentCount: 45,
        isOnline: false,
        meetLink: null,
        status: "scheduled",
      },
    ];
  },
};
