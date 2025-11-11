// src/services/schedule/schedule.service.js
// Business logic for schedule management with real API integration
import { scheduleApi } from "./schedule.api";

// Helper to map dayOfWeek number to day names
const DAY_NAMES = ["", "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export const scheduleService = {
  /**
   * Get all semesters
   * @returns {Promise<Array>} semesters with format for Select component
   */
  async getSemesters() {
    const semesters = await scheduleApi.getSemesters();
    // Transform to format: {id, value, label}
    return semesters.map((s) => ({
      id: s.id,
      value: String(s.id),
      label: s.name,
      startDate: s.startDate,
      endDate: s.endDate,
      status: s.status,
    }));
  },

  /**
   * Get all time slots
   * @returns {Promise<Array>} slots with id, label, time
   */
  async getTimeSlots() {
    const slots = await scheduleApi.getTimeSlots();
    return slots.map((s) => ({
      id: s.id,
      label: `Slot ${s.id}`,
      time: `${s.startTime}-${s.endTime}`,
      startTime: s.startTime,
      endTime: s.endTime,
    }));
  },

  /**
   * Get all teachers
   * @returns {Promise<Array>} teachers with id and name
   */
  async getTeachers() {
    const teachers = await scheduleApi.getTeachers();
    return teachers.map((t) => ({
      id: t.userId, // Use userId for compatibility with existing schedule logic
      name: t.fullName,
      email: t.email,
      subjectId: t.subjectId,
      subjectName: t.subjectName,
      specialization: t.specialization,
    }));
  },

  /**
   * Get schedule for a semester - Convert backend data to grid format
   * @param {number} semesterId
   * @returns {Promise<Array>} schedule items formatted for the grid
   */
  async getScheduleBySemester(semesterId) {
    // Get all classes from backend - the API already includes schedule data
    const classes = await scheduleApi.getClasses();
    
    // Filter classes by semester if provided
    let filteredClasses = classes;
    if (semesterId) {
      filteredClasses = classes.filter(cls => cls.semesterId === Number(semesterId));
    }

    // Transform classes to schedule items for the grid
    const scheduleItems = [];
    
    for (const cls of filteredClasses) {
      // Each class has a schedule array with dayOfWeek and timeSlot info
      if (cls.schedule && cls.schedule.length > 0) {
        for (const scheduleItem of cls.schedule) {
          scheduleItems.push({
            id: `${cls.id}-${scheduleItem.dayOfWeek}-${scheduleItem.timeSlotId}`, // Unique ID
            classId: cls.id,
            className: cls.code || cls.name,
            classFullName: cls.name,
            day: scheduleItem.dayOfWeek, // 1-7 (Mon-Sun)
            dayName: DAY_NAMES[scheduleItem.dayOfWeek] || "?",
            slotId: scheduleItem.timeSlotId,
            startTime: scheduleItem.startTime,
            endTime: scheduleItem.endTime,
            // Teacher information
            teacherId: cls.teacherId,
            teacherName: cls.teacherFullName || "TBA",
            // Subject and room information
            subjectId: cls.subjectId,
            subjectName: cls.subjectName || "Unknown Subject",
            roomId: cls.roomId,
            room: cls.roomName || null,
            // Additional info
            studentCount: cls.currentStudents || 0,
            maxStudents: cls.maxStudents || 0,
            isOnline: cls.online || false,
            meetLink: null, // Backend doesn't provide this in schedule API yet
            status: cls.status || "ACTIVE",
            // Original class data for reference
            originalClass: cls,
          });
        }
      }
    }

    console.log("Backend schedule data:", scheduleItems); // Debug log
    return scheduleItems;
  },

  /**
   * Get attendance for a class
   * @param {number} classId
   * @returns {Promise<Array>} attendance records
   */
  async getAttendance(classId) {
    return await scheduleApi.getAttendance(classId);
  },
};
