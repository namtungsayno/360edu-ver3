// src/services/schedule/schedule.service.js
// Business logic for schedule management with real API integration
import { semesterService } from "../semester/semester.service";
import { timeslotService } from "../timeslot/timeslot.service";
import { teacherService } from "../teacher/teacher.service";
import { classService } from "../class/class.service";

// Helper to map dayOfWeek number to day names
const DAY_NAMES = ["", "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export const scheduleService = {
  /**
   * Get all semesters - Sử dụng service có sẵn
   * @returns {Promise<Array>} semesters with format for Select component
   */
  async getSemesters() {
    const semesters = await semesterService.getAllSemesters();
    // Add "All Semesters" option at the beginning
    const allOption = {
      id: "all",
      value: "all",
      label: "Tất cả học kỳ",
      startDate: null,
      endDate: null,
      status: "ACTIVE",
    };
    // Transform to format: {id, value, label}
    const semesterOptions = semesters.map((s) => ({
      id: s.id,
      value: String(s.id),
      label: s.name,
      startDate: s.startDate,
      endDate: s.endDate,
      status: s.status,
    }));
    return [allOption, ...semesterOptions];
  },

  /**
   * Get all time slots - Sử dụng service có sẵn
   * @returns {Promise<Array>} slots with id, label, time
   */
  async getTimeSlots() {
    const slots = await timeslotService.list();
    return slots.map((s) => ({
      id: s.id,
      label: `Slot ${s.id}`,
      time: `${s.startTime}-${s.endTime}`,
      startTime: s.startTime,
      endTime: s.endTime,
    }));
  },

  /**
   * Get all teachers - Sử dụng service có sẵn
   * @returns {Promise<Array>} teachers with id and name
   */
  async getTeachers() {
    const teachers = await teacherService.list();
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
    console.log("🔍 Loading schedule for semester:", semesterId);

    // Get all classes from backend - Sử dụng classService.list()
    const classes = await classService.list();
    console.log("📚 Total classes loaded:", classes.length);

    // Filter classes by semester if provided
    let filteredClasses = classes;
    if (semesterId && semesterId !== "all") {
      filteredClasses = classes.filter((cls) => {
        // Match if semesterId matches OR if class has no semester (null)
        // This allows viewing classes created without semester assignment
        const match =
          cls.semesterId === Number(semesterId) || cls.semesterId === null;
        if (!match) {
          console.log(
            `⏭️ Skipping class ${cls.id} (${cls.name}) - semesterId: ${cls.semesterId} != ${semesterId}`
          );
        } else if (cls.semesterId === null) {
          console.log(
            `✅ Including class ${cls.id} (${cls.name}) - no semester assigned (showing in all semesters)`
          );
        }
        return match;
      });
      console.log(
        `✅ Filtered to ${
          filteredClasses.length
        } classes for semester ${semesterId} (including ${
          classes.filter((c) => c.semesterId === null).length
        } classes without semester)`
      );
    } else if (semesterId === "all") {
      console.log(`📋 Showing all classes (${classes.length} total)`);
    }

    // Transform classes to schedule items for the grid
    const scheduleItems = [];

    for (const cls of filteredClasses) {
      console.log(`📋 Processing class ${cls.id}: ${cls.name}`, {
        hasSchedule: !!cls.schedule,
        scheduleLength: cls.schedule?.length || 0,
        schedule: cls.schedule,
      });

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
            teacherId: cls.teacherUserId, // Use teacherUserId (User ID) for filtering
            teacherEntityId: cls.teacherId, // Keep original teacher entity ID for reference
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
            meetLink: cls.meetingLink || null, // Fix: use meetingLink not meetLink
            status: cls.status || "ACTIVE",
            // Original class data for reference
            originalClass: cls,
          });
        }
      } else {
        console.warn(`⚠️ Class ${cls.id} (${cls.name}) has no schedule data`);
      }
    }

    console.log("✨ Schedule data loaded:", scheduleItems.length, "items");
    console.log("📊 Schedule items:", scheduleItems);
    return scheduleItems;
  },

  /**
   * Get attendance for a class
   * NOTE: Attendance API chưa có trong backend hiện tại
   * @returns {Promise<Array>} attendance records (empty for now)
   */
  async getAttendance() {
    // Backend chưa có endpoint attendance
    // Trả về empty array để tránh lỗi UI
    return [];
  },
};
