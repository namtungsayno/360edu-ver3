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
  async getScheduleBySemester(semesterId) {
    console.log("🔍 [SCHEDULE_SERVICE] Loading schedule for semester:", semesterId);

    // Get all classes from backend - Sử dụng classService.list()
    const classes = await classService.list();
    console.log("📚 [SCHEDULE_SERVICE] Total classes loaded:", classes.length);

    // Get all teachers to create teacherId -> userId mapping
    const teachers = await teacherService.list();
    const teacherIdToUserIdMap = {};
    for (const t of teachers) {
      teacherIdToUserIdMap[t.id] = t.userId; // Map teacher.id to user.id
    }
    console.log("👥 [SCHEDULE_SERVICE] Teacher ID mapping created:", Object.keys(teacherIdToUserIdMap).length, "teachers");

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
      const teacherUserId = teacherIdToUserIdMap[cls.teacherId] || cls.teacherId;
      
      console.log(`📋 [SCHEDULE_SERVICE] Processing class ${cls.id}: "${cls.name}"`, {
        teacherFullName: cls.teacherFullName,
        teacherId: cls.teacherId,
        teacherUserId: teacherUserId,
        hasSchedule: !!cls.schedule,
        scheduleLength: cls.schedule?.length || 0,
      });

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
            // Additional info
            studentCount: cls.currentStudents || 0,
            maxStudents: cls.maxStudents || 0,
            isOnline: cls.online || false,
            meetLink: cls.meetingLink || null,
            status: cls.status || "ACTIVE",
            // Original class data for reference
            originalClass: cls,
          });
          
          console.log(`   ✅ Added schedule item: classId=${cls.id}, day=${scheduleItem.dayOfWeek}, slotId=${scheduleItem.timeSlotId}, teacher="${cls.teacherFullName}"`);
        }
      } else {
        console.warn(`⚠️ Class ${cls.id} (${cls.name}) has no schedule data`);
      }
    }

    console.log("✨ [SCHEDULE_SERVICE] Schedule data loaded:", scheduleItems.length, "total items");
    
    // Group by teacher to show distribution
    const byTeacher = scheduleItems.reduce((acc, item) => {
      acc[item.teacherName] = (acc[item.teacherName] || 0) + 1;
      return acc;
    }, {});
    console.log("📊 [SCHEDULE_SERVICE] Distribution by teacher:", byTeacher);
    
    // Show class id=4 items specifically
    const class4Items = scheduleItems.filter(item => item.classId === 4);
    console.log("🔍 [SCHEDULE_SERVICE] Class id=4 (Hóa Học - Dang Huy) items:", class4Items.length);
    if (class4Items.length > 0) {
      console.log("   Sample items:", class4Items.slice(0, 3).map(i => ({
        day: i.day,
        dayName: i.dayName,
        slotId: i.slotId,
        startDate: i.startDate,
        endDate: i.endDate
      })));
    }
    
    return scheduleItems;
  },

  /**
   * Get schedule filtered by specific teacher's userId
   * @param {number} teacherUserId - User ID of the teacher
   * @returns {Promise<Array>} schedule items for that teacher only
   */
  async getScheduleByTeacher(teacherUserId) {
    console.log("🔍 Loading schedule for teacher userId:", teacherUserId);

    // Get all classes and filter by teacher
    const allSchedule = await this.getScheduleBySemester("all");

    // Filter by teacherId (which is actually userId in our mapping)
    const teacherSchedule = allSchedule.filter(
      (item) => String(item.teacherId) === String(teacherUserId)
    );

    console.log(
      `✅ Found ${teacherSchedule.length} schedule items for teacher ${teacherUserId}`
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
      console.error("Failed to load enrolled students:", e);
      return [];
    }
  },
};
