import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button.jsx";
import {
  Calendar,
  Check,
  Clock,
  Users,
  BookOpen,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { scheduleService } from "../../../services/schedule/schedule.service";
import { attendanceService } from "../../../services/attendance/attendance.service";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../hooks/use-toast";
import ModernWeekCalendar, {
  CalendarEventCard,
  CalendarStatusBadge,
} from "../../../components/common/ModernWeekCalendar";
import {
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  fmt,
  WEEK_DAYS,
} from "../../../utils/date-helpers";

function TeacherSchedule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});

  // render header bảng lịch (hiển thị ngày cho 7 cột)
  const weekStart = useMemo(() => {
    return startOfWeek(currentWeek);
  }, [currentWeek]);

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // so sánh với ngày hôm nay, kiểu như biết ngày kia là thứ mấy...
  const getDateForClass = (dayOfWeek) => {
    // dayOfWeek: 1=Mon, 2=Tue, ..., 7=Sun
    const date = new Date(weekStart);
    date.setDate(date.getDate() + (dayOfWeek - 1));
    return date;
  };

  // Load điểm danh
  const loadAttendanceStatuses = async (scheduleData) => {
    const map = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const item of scheduleData) {
      const classDate = getDateForClass(item.day);
      if (classDate <= today) {
        try {
          const dateStr = fmt(classDate, "yyyy-MM-dd");
          const attendance = await attendanceService.getByClass(
            item.classId,
            dateStr,
            item.slotId
          );

          // Count statistics
          const stats = {
            present: attendance.filter((a) => a.status === "present").length,
            absent: attendance.filter((a) => a.status === "absent").length,
            late: attendance.filter((a) => a.status === "late").length,
            total: attendance.length,
          };

          map[`${item.classId}-${item.day}`] = {
            isMarked: attendance.some((a) => a.status !== "-"),
            stats,
            actualStudentCount: attendance.length, // Số sinh viên thực tế
          };
        } catch {
          // Not yet marked or error
          map[`${item.classId}-${item.day}`] = { isMarked: false };
        }
      }
    }
    setAttendanceMap(map);
  };

  useEffect(() => {
    (async () => {
      try {
        const slots = await scheduleService.getTimeSlots();
        setTimeSlots(slots);
      } catch (e) {
        console.error("Failed to load time slots:", e);
        alert("Không thể tải dữ liệu slot. Vui lòng kiểm tra kết nối backend.");
      }
    })();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      try {
        // Fetch schedule filtered by current teacher's userId
        const data = await scheduleService.getScheduleByTeacher(user.id);
        setWeekSchedule(data);

        // Load attendance status for all classes in the week
        await loadAttendanceStatuses(data);
      } catch (e) {
        console.error("Failed to load teacher schedule:", e);
        alert(
          "Không thể tải lịch dạy của bạn. Vui lòng kiểm tra kết nối backend."
        );
        setWeekSchedule([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, weekStart]);

  const scheduleLookup = useMemo(() => {
    // Filter schedule items by date range (same logic as admin)
    const weekStartDate = weekStart;
    const filteredSchedule = weekSchedule.filter((s) => {
      // Nếu thiếu dữ liệu ngày hoặc day, loại bỏ khỏi lịch
      if (!s.startDate || !s.endDate || !s.day || isNaN(Number(s.day))) {
        console.warn(
          "[TeacherSchedule] Bỏ qua lớp do thiếu startDate/endDate/day:",
          s
        );
        return false;
      }
      // Lấy ngày slot thực tế trong tuần này
      const slotDate = addDays(weekStartDate, Number(s.day) - 1); // day: 1-7 (Mon-Sun)
      if (isNaN(slotDate.getTime())) {
        console.warn(
          "[TeacherSchedule] Bỏ qua lớp do slotDate không hợp lệ:",
          s
        );
        return false;
      }
      const slotDateStr = fmt(slotDate, "yyyy-MM-dd");
      // So sánh ngày dạng chuỗi yyyy-MM-dd
      return slotDateStr >= s.startDate && slotDateStr <= s.endDate;
    });

    const map = {};
    for (const item of filteredSchedule) {
      if (!map[item.day]) map[item.day] = {};
      if (!map[item.day][item.slotId]) map[item.day][item.slotId] = [];
      map[item.day][item.slotId].push(item);
    }
    return map;
  }, [weekSchedule, weekStart]);

  const getClassesForSlot = (dayId, slotId) => {
    return scheduleLookup?.[dayId]?.[slotId] || [];
  };

  const handlePreviousWeek = () => {
    setCurrentWeek((prev) => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek((prev) => addWeeks(prev, 1));
  };

  const handleClassClick = (classData, action = "view") => {
    const classDate = getDateForClass(classData.day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    classDate.setHours(0, 0, 0, 0);

    // Chỉ chặn điểm danh trước ngày học; vẫn cho phép xem chi tiết
    if (classDate > today && action !== "view") {
      toast({
        title: "Chưa đến ngày dạy học lớp này",
        description: `Lớp này sẽ học vào ngày ${fmt(classDate, "dd/MM/yyyy")}`,
        variant: "destructive",
      });
      return;
    }

    // Check if trying to edit attendance for past date (not today)
    if (action === "edit" && classDate < today) {
      toast({
        title: "Không thể sửa điểm danh ngày cũ",
        description: `Chỉ có thể sửa điểm danh trong ngày hiện tại`,
        variant: "destructive",
      });
      return;
    }

    // Điều hướng tới chi tiết buổi học, kèm ngày phiên học
    const dateStr = fmt(classDate, "yyyy-MM-dd");
    navigate(
      `/home/teacher/class/${classData.classId}?slotId=${classData.slotId}&date=${dateStr}`
    );
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalClasses = weekSchedule.length;
    let marked = 0;
    let unmarked = 0;
    let totalStudents = 0;

    weekSchedule.forEach((item) => {
      const key = `${item.classId}-${item.day}`;
      const attendance = attendanceMap[key];

      if (attendance?.isMarked) {
        marked++;
      } else {
        const classDate = getDateForClass(item.day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        classDate.setHours(0, 0, 0, 0);

        if (classDate <= today) {
          unmarked++;
        }
      }

      totalStudents += item.studentCount || 0;
    });

    return { totalClasses, marked, unmarked, totalStudents };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekSchedule, attendanceMap, weekStart]);

  // Render event card cho calendar
  const renderScheduleEvent = (classData, dayId, slotId) => {
    const key = `${classData.classId}-${classData.day}`;
    const attendance = attendanceMap[key];
    const isMarked = attendance?.isMarked || false;

    const classDate = getDateForClass(classData.day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    classDate.setHours(0, 0, 0, 0);

    const isFuture = classDate > today;
    const isPast = classDate < today;

    // Determine variant
    let variant = "default";
    let statusType = "default";
    let statusText = "";

    if (isFuture) {
      variant = "default";
      statusType = "default";
      statusText = "Sắp tới";
    } else if (isMarked) {
      variant = "success";
      statusType = "success";
      statusText = "Đã ĐD";
    } else {
      variant = "warning";
      statusType = "warning";
      statusText = "Chưa ĐD";
    }

    return (
      <CalendarEventCard
        key={classData.id}
        variant={variant}
        onClick={() => handleClassClick(classData, "view")}
      >
        {/* Header with Status Badge */}
        <div className="flex items-center justify-end mb-1.5">
          <CalendarStatusBadge status={statusType}>
            {isFuture ? (
              <Clock className="h-3 w-3" />
            ) : isMarked ? (
              <Check className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            <span>{statusText}</span>
          </CalendarStatusBadge>
        </div>

        {/* Class Name - Full display */}
        <div
          className="font-bold text-sm text-gray-800 leading-snug mb-1.5"
          title={classData.className || classData.classCode}
        >
          {classData.className || classData.classCode}
        </div>

        {/* Subject */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
          <BookOpen className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{classData.subjectName}</span>
        </div>

        {/* Info Row */}
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {attendance?.actualStudentCount || classData.studentCount || 0}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {classData.isOnline
              ? "Online"
              : classData.room || classData.roomName || "TBD"}
          </span>
        </div>

        {/* Attendance Stats */}
        {isMarked && attendance?.stats && (
          <div className="mt-2 pt-2 border-t border-emerald-200/50 flex items-center gap-3 text-[10px]">
            <span className="text-emerald-600 font-semibold">
              ✓ {attendance.stats.present}
            </span>
            <span className="text-red-500 font-semibold">
              ✗ {attendance.stats.absent}
            </span>
            <span className="text-amber-500 font-semibold">
              ⏱ {attendance.stats.late}
            </span>
          </div>
        )}

        {/* Quick Action */}
        {!isFuture && (
          <div className="mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClassClick(classData, isMarked ? "edit" : "mark");
              }}
              disabled={isPast && !isMarked}
              className={`w-full flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-lg font-semibold transition-all ${
                isPast && !isMarked
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : isMarked
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                  : "bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
              }`}
            >
              {isPast && !isMarked ? (
                "Đã qua"
              ) : isMarked ? (
                <>
                  Xem chi tiết <ArrowRight className="h-3 w-3" />
                </>
              ) : (
                <>
                  Điểm danh ngay <ArrowRight className="h-3 w-3" />
                </>
              )}
            </button>
          </div>
        )}
      </CalendarEventCard>
    );
  };

  // Stats content for calendar
  const StatsContent = (
    <div className="grid grid-cols-4 gap-4">
      <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-xs text-blue-600 font-medium">Tổng buổi</div>
          <div className="text-xl font-bold text-blue-700">
            {stats.totalClasses}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200">
          <Check className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-xs text-emerald-600 font-medium">Đã ĐD</div>
          <div className="text-xl font-bold text-emerald-700">
            {stats.marked}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-200">
          <Clock className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-xs text-amber-600 font-medium">Chưa ĐD</div>
          <div className="text-xl font-bold text-amber-700">
            {stats.unmarked}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-200">
          <Users className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-xs text-purple-600 font-medium">Học viên</div>
          <div className="text-xl font-bold text-purple-700">
            {stats.totalStudents}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-200">
          <Calendar className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch dạy</h1>
          <p className="text-sm text-gray-500">
            Quản lý lịch giảng dạy buổi tối của bạn (16:00 - 22:00)
          </p>
        </div>
      </div>

      {/* Modern Calendar */}
      <ModernWeekCalendar
        currentWeek={currentWeek}
        onWeekChange={setCurrentWeek}
        timeSlots={timeSlots}
        getEventsForSlot={getClassesForSlot}
        renderEvent={renderScheduleEvent}
        accentColor="indigo"
        showStats={true}
        statsContent={StatsContent}
      />

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <span className="font-semibold text-gray-700">Chú thích:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
          <span className="text-gray-600">Đã điểm danh</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full shadow-sm"></div>
          <span className="text-gray-600">Chưa điểm danh</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-300 rounded-full shadow-sm"></div>
          <span className="text-gray-600">Sắp tới</span>
        </div>
      </div>
    </div>
  );
}

export default TeacherSchedule;
