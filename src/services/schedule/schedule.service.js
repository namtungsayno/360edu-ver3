// src/services/schedule/schedule.service.js
// Business logic for schedule management with real API integration
import { semesterService } from "../semester/semester.service";
import { timeslotService } from "../timeslot/timeslot.service";
import { teacherService } from "../teacher/teacher.service";
import { classService } from "../class/class.service";
import { enrollmentService } from "../enrollment/enrollment.service";

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
  //Lấy thông tin lớp học
  async getScheduleBySemester(semesterId) {
    // Get all classes from backend - Sử dụng classService.list()
    const classes = await classService.list();

    // Get all teachers to create teacherId -> userId mapping
    const teachers = await teacherService.list();
    const teacherIdToUserIdMap = {};
    for (const t of teachers) {
      teacherIdToUserIdMap[t.id] = t.userId; // Map teacher.id to user.id
    }

    // Filter classes by semester if provided
    let filteredClasses = classes;
    if (semesterId && semesterId !== "all") {
      filteredClasses = classes.filter((cls) => {
        // Match if semesterId matches OR if class has no semester (null)
        // This allows viewing classes created without semester assignment
        return cls.semesterId === Number(semesterId) || cls.semesterId === null;
      });
    }

    // Transform classes to schedule items for the grid
    const scheduleItems = [];

    for (const cls of filteredClasses) {
      // Each class has a schedule array with dayOfWeek and timeSlot info
      if (cls.schedule && cls.schedule.length > 0) {
        // Get the userId from teacherId mapping
        const teacherUserId =
          teacherIdToUserIdMap[cls.teacherId] || cls.teacherId;

        for (const scheduleItem of cls.schedule) {
          // Normalize start/end dates to yyyy-MM-dd (component expects this)
          const normalizeDate = (d) => {
            if (!d) return null;
            // Accept Date object or string with time; always return first 10 chars yyyy-MM-dd
            try {
              if (d instanceof Date) {
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                const dd = String(d.getDate()).padStart(2, "0");
                return `${yyyy}-${mm}-${dd}`;
              }
              return String(d).slice(0, 10);
            } catch {
              return null;
            }
          };

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
            // Date range of the class (used for weekly filtering in UI)
            startDate: normalizeDate(cls.startDate),
            endDate: normalizeDate(cls.endDate),
            // Teacher information - use userId for filtering compatibility
            teacherId: teacherUserId, // Use userId instead of backend's teacherId
            teacherEntityId: cls.teacherId, // Keep original teacher entity ID for reference
            teacherName: cls.teacherFullName || "TBA",
            // Subject and room information
            subjectId: cls.subjectId,
            subjectName: cls.subjectName || "Unknown Subject",
            roomId: cls.roomId,
            room: cls.roomName || null,
            // Course information
            courseId: cls.courseId || null,
            courseTitle: cls.courseTitle || null,
            // Additional info
            studentCount: cls.currentStudents || 0,
            maxStudents: cls.maxStudents || 0,
            isOnline: cls.online || false,
            meetLink: cls.meetingLink || null,
            status: cls.status || "ACTIVE",
            // Original class data for reference
            originalClass: cls,
          });
        }
      }
    }

    return scheduleItems;
  },

  /**
   * Get schedule filtered by specific teacher's userId
   * @param {number} teacherUserId - User ID of the teacher
   * @returns {Promise<Array>} schedule items for that teacher only
   */
  async getScheduleByTeacher(teacherUserId) {
    // Get all classes and filter by teacher
    const allSchedule = await this.getScheduleBySemester("all");

    // Filter by teacherId (which is actually userId in our mapping)
    const teacherSchedule = allSchedule.filter(
      (item) => String(item.teacherId) === String(teacherUserId)
    );

    return teacherSchedule;
  },

  /**
   * Get attendance for a class
   * Tạm thời sử dụng danh sách học sinh đã đăng ký lớp
   * (GET /classes/{classId}/enrollments) để hiển thị trong modal.
   * @returns {Promise<Array>} mapped records for the UI table
   */
  async getAttendance(classId) {
    try {
      const students = await enrollmentService.listStudentsByClass(classId);
      // Map to UI structure used by ScheduleManagement modal
      return students.map((s, idx) => ({
        id: s.studentId ?? idx,
        student:
          s.fullName && s.email
            ? `${s.fullName} (${s.email})`
            : s.fullName || s.email || `Student #${idx + 1}`,
        status: "-", // not counted in present/absent/late summary
        time: "", // no attendance time yet
      }));
    } catch (e) {
      return [];
    }
  },
};
