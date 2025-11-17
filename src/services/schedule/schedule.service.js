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
      id: t.userId, // Use userId for dropdown filter
      teacherId: t.id, // Keep original teacher.id for reference
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
    // Get all classes from backend - Sử dụng classService.list()
    const classes = await classService.list();
    console.log("Raw classes from backend:", classes);
    
    // Get all teachers to create teacherId -> userId mapping
    const teachers = await teacherService.list();
    const teacherIdToUserIdMap = {};
    for (const t of teachers) {
      teacherIdToUserIdMap[t.id] = t.userId; // Map teacher.id to user.id
    }
    console.log("Teacher ID to User ID mapping:", teacherIdToUserIdMap);
    
    // Filter classes by semester if provided
    let filteredClasses = classes;
    if (semesterId) {
      // Get semester details to check date range
      const semesters = await this.getSemesters();
      const semester = semesters.find(s => s.id === Number(semesterId));
      
      console.log("Filtering by semesterId:", semesterId, "semester data:", semester);
      console.log("Classes semesterIds:", classes.map(c => ({ id: c.id, semesterId: c.semesterId, startDate: c.startDate, endDate: c.endDate })));
      
      // Filter by semesterId OR by date overlap if semesterId is null
      filteredClasses = classes.filter(cls => {
        // If class has semesterId, match directly
        if (cls.semesterId !== null && cls.semesterId !== undefined) {
          return cls.semesterId === Number(semesterId);
        }
        
        // If class has no semesterId, check if class date range overlaps with semester
        if (semester && cls.startDate && cls.endDate) {
          const classStart = new Date(cls.startDate);
          const classEnd = new Date(cls.endDate);
          const semesterStart = new Date(semester.startDate);
          const semesterEnd = new Date(semester.endDate);
          
          // Check if there's any overlap between class and semester dates
          const hasOverlap = classStart <= semesterEnd && classEnd >= semesterStart;
          console.log(`Class ${cls.id}: ${cls.startDate} to ${cls.endDate}, overlap with semester: ${hasOverlap}`);
          return hasOverlap;
        }
        
        // If no semesterId and no valid dates, include it (show all)
        return true;
      });
      
      console.log(`Filtered to semester ${semesterId}:`, filteredClasses.length, "classes");
    }

    // Transform classes to schedule items for the grid
    const scheduleItems = [];
    
    for (const cls of filteredClasses) {
      // Each class has a schedule array with dayOfWeek and timeSlot info
      if (cls.schedule && cls.schedule.length > 0) {
        // Get the userId from teacherId mapping
        const teacherUserId = teacherIdToUserIdMap[cls.teacherId] || cls.teacherId;
        
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
            // Teacher information - use userId for filtering compatibility
            teacherId: teacherUserId, // Use userId instead of backend's teacherId
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
            meetLink: cls.meetingLink || null, // Fix: use meetingLink instead of meetLink
            status: cls.status || "ACTIVE",
            // Original class data for reference
            originalClass: cls,
          });
        }
      }
    }

    console.log("Schedule items created:", scheduleItems.length, "items");
    console.log("Sample schedule item:", scheduleItems[0]);
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
