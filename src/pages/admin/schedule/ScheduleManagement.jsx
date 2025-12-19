import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../hooks/use-toast";
import { Button } from "../../../components/ui/Button.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/Select.jsx";
import {
  Calendar,
  Users,
  Monitor,
  MapPin,
  BookOpen,
  User,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { scheduleService } from "../../../services/schedule/schedule.service";
import { attendanceService } from "../../../services/attendance/attendance.service";
import ModernWeekCalendar, {
  CalendarEventCard,
  CalendarStatusBadge,
} from "../../../components/common/ModernWeekCalendar";
import {
  startOfWeek,
  addDays,
  fmt,
  WEEK_DAYS,
} from "../../../utils/date-helpers";

function ScheduleManagement() {
  const navigate = useNavigate();
  const { error: showError } = useToast();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [classTypeFilter, setClassTypeFilter] = useState("all");
  const [teachers, setTeachers] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({}); // Map of session key to attendance status

  // Calculate week start based on currentWeek
  const weekStart = useMemo(() => {
    return startOfWeek(currentWeek);
  }, [currentWeek]);

  useEffect(() => {
    (async () => {
      try {
        const [tList, slots] = await Promise.all([
          scheduleService.getTeachers(),
          scheduleService.getTimeSlots(),
        ]);

        setTeachers(tList);
        setTimeSlots(slots);
      } catch (e) {
        showError("Không thể tải dữ liệu. Vui lòng kiểm tra kết nối backend.");
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await scheduleService.getScheduleBySemester("all");
        setWeekSchedule(data);
      } catch (e) {
        showError(
          "Không thể tải dữ liệu lịch học. Vui lòng kiểm tra kết nối backend."
        );
        setWeekSchedule([]);
      }
    })();
  }, []);

  // Filter schedule by teacher + class type + current week dates
  const filteredSchedule = useMemo(() => {
    // Lọc theo giáo viên, loại lớp, và chỉ lấy lớp có ngày slot nằm trong khoảng startDate-endDate
    let filtered = weekSchedule;

    // Lọc theo giáo viên
    if (selectedTeacher) {
      filtered = filtered.filter(
        (s) => String(s.teacherId) === String(selectedTeacher)
      );
    }

    // Lọc theo loại lớp
    if (classTypeFilter === "online") {
      filtered = filtered.filter((s) => s.isOnline === true);
    } else if (classTypeFilter === "offline") {
      filtered = filtered.filter((s) => s.isOnline === false);
    }

    // Lọc theo ngày slot nằm trong khoảng startDate-endDate của lớp
    const weekStartDate = weekStart;
    filtered = filtered.filter((s) => {
      // Nếu thiếu dữ liệu ngày hoặc day, loại bỏ khỏi lịch
      if (!s.startDate || !s.endDate || !s.day || isNaN(Number(s.day))) {
        return false;
      }
      // Lấy ngày slot thực tế trong tuần này
      const slotDate = addDays(weekStartDate, Number(s.day) - 1); // day: 1-7 (Mon-Sun)
      if (isNaN(slotDate.getTime())) {
        return false;
      }
      const slotDateStr = fmt(slotDate, "yyyy-MM-dd");
      // So sánh ngày dạng chuỗi yyyy-MM-dd
      return slotDateStr >= s.startDate && slotDateStr <= s.endDate;
    });
    return filtered;
  }, [weekSchedule, selectedTeacher, classTypeFilter, weekStart]);

  // Fetch attendance status when filteredSchedule changes
  const fetchAttendanceStatus = useCallback(async () => {
    if (filteredSchedule.length === 0) {
      setAttendanceStatus({});
      return;
    }

    try {
      // Collect all sessions to check attendance status
      const sessionsToCheck = filteredSchedule.map((s) => {
        const dayIdx = WEEK_DAYS.findIndex((d) => d.id === s.day);
        const slotDate = addDays(weekStart, dayIdx);
        const dateStr = fmt(slotDate, "yyyy-MM-dd");
        return {
          classId: s.classId,
          date: dateStr,
          slotId: s.slotId,
        };
      });

      const statusMap = await attendanceService.checkAttendanceStatus(
        sessionsToCheck
      );
      setAttendanceStatus(statusMap);
    } catch (e) {
      console.error("Failed to fetch attendance status:", e);
    }
  }, [filteredSchedule, weekStart]);

  useEffect(() => {
    fetchAttendanceStatus();

    // Auto-refresh attendance status every 30 seconds for realtime updates
    const intervalId = setInterval(fetchAttendanceStatus, 30000);
    return () => clearInterval(intervalId);
  }, [fetchAttendanceStatus]);

  const scheduleLookup = useMemo(() => {
    const map = {};
    for (const item of filteredSchedule) {
      if (!map[item.day]) map[item.day] = {};
      if (!map[item.day][item.slotId]) map[item.day][item.slotId] = [];
      map[item.day][item.slotId].push(item);
    }
    return map;
  }, [filteredSchedule]);

  const getClassesForSlot = (dayId, slotId) => {
    return scheduleLookup?.[dayId]?.[slotId] || [];
  };

  const openClassDetail = (classData) => {
    // Tính ngày của slot này dựa vào weekStart + day index
    const dayIdx = WEEK_DAYS.findIndex((d) => d.id === classData.day);
    if (dayIdx === -1) {
      toast.error("Không thể xác định ngày học.");
      return;
    }
    const date = addDays(weekStart, dayIdx);
    const dateStr = fmt(date, "yyyy-MM-dd");

    // Điều hướng đến trang chi tiết lớp, truyền date qua URL state
    navigate(`/home/admin/schedule/class/${classData.classId}`, {
      state: { date: dateStr, classData, slotId: classData.slotId },
    });
  };

  // Convert timeSlots to ModernWeekCalendar format
  const calendarTimeSlots = useMemo(() => {
    return timeSlots.map((slot) => ({
      id: slot.id,
      label: slot.label || `Slot ${slot.id}`,
      time: slot.time || `${slot.startTime || ""} - ${slot.endTime || ""}`,
    }));
  }, [timeSlots]);

  // Render class card for calendar
  const renderClassEvent = (classData, dayId, slotId) => {
    // Calculate date for this slot
    const dayIdx = WEEK_DAYS.findIndex((d) => d.id === dayId);
    const slotDate = addDays(weekStart, dayIdx);
    const dateStr = fmt(slotDate, "yyyy-MM-dd");

    // Build attendance status key
    const attendanceKey = `${classData.classId}-${dateStr}-${slotId}`;
    const hasAttendance = attendanceStatus[attendanceKey] === true;

    return (
      <CalendarEventCard
        key={classData.id}
        variant={classData.isOnline ? "info" : "warning"}
        onClick={() => openClassDetail(classData)}
        className={`cursor-pointer relative ${
          hasAttendance ? "ring-2 ring-emerald-400 ring-offset-1" : ""
        }`}
      >
        {/* Attendance status indicator - positioned at top right corner */}
        {hasAttendance && (
          <div className="absolute -top-1.5 -right-1.5 z-10">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-emerald-400 rounded-full blur-sm animate-pulse"></div>
              {/* Badge */}
              <div className="relative flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[9px] font-bold rounded-full shadow-lg shadow-emerald-200">
                <CheckCircle className="h-3 w-3" />
                <span>Đã điểm danh</span>
              </div>
            </div>
          </div>
        )}

        {/* Class name */}
        <div
          className="font-semibold text-xs truncate mb-1 pr-16"
          title={classData.className}
        >
          {classData.className}
        </div>

        {/* Teacher name */}
        <div className="flex items-center gap-1 text-[10px] text-gray-600 mb-1.5">
          <User className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{classData.teacherName}</span>
        </div>

        {/* Class type badge */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <CalendarStatusBadge status={classData.isOnline ? "info" : "warning"}>
            {classData.isOnline ? (
              <>
                <Monitor className="h-2.5 w-2.5" />
                Online
              </>
            ) : (
              <>
                <MapPin className="h-2.5 w-2.5" />
                Offline
              </>
            )}
          </CalendarStatusBadge>

          {/* Room/Meet link */}
          {classData.isOnline && classData.meetLink && (
            <a
              href={classData.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
            >
              <ExternalLink className="h-2 w-2" />
              Meet
            </a>
          )}
          {!classData.isOnline && classData.room && (
            <span
              className="text-[9px] text-gray-500 truncate max-w-[60px]"
              title={classData.room}
            >
              {classData.room}
            </span>
          )}
        </div>
      </CalendarEventCard>
    );
  };

  // Stats content for calendar header
  const StatsContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total Classes Card */}
      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-cyan-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-cyan-100 text-sm font-medium">
              Tổng lớp trong tuần
            </p>
            <p className="text-3xl font-bold mt-1">{filteredSchedule.length}</p>
          </div>
          <div className="p-3 bg-white/20 rounded-xl">
            <Calendar className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Online Classes Card */}
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-violet-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-violet-100 text-sm font-medium">Lớp Online</p>
            <p className="text-3xl font-bold mt-1">
              {filteredSchedule.filter((s) => s.isOnline === true).length}
            </p>
          </div>
          <div className="p-3 bg-white/20 rounded-xl">
            <Monitor className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Offline Classes Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-emerald-100 text-sm font-medium">Lớp Offline</p>
            <p className="text-3xl font-bold mt-1">
              {filteredSchedule.filter((s) => s.isOnline === false).length}
            </p>
          </div>
          <div className="p-3 bg-white/20 rounded-xl">
            <MapPin className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header với gradient */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-200">
          <Calendar className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý lịch học</h1>
          <p className="text-gray-500 text-sm">
            Xem lịch giảng dạy của tất cả giáo viên theo tuần
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsContent />

      {/* Filter Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Giáo viên */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-1 h-5 bg-cyan-500 rounded"></div>
              Giáo viên
            </label>
            <Select
              value={selectedTeacher || "all"}
              onValueChange={(value) =>
                setSelectedTeacher(value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-full h-10 text-sm bg-white border-gray-300 hover:border-cyan-400 transition-colors">
                <SelectValue placeholder="Tất cả giáo viên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả giáo viên</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={String(teacher.id)}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Loại lớp */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-1 h-5 bg-purple-500 rounded"></div>
              Loại lớp
            </label>
            <Select value={classTypeFilter} onValueChange={setClassTypeFilter}>
              <SelectTrigger className="w-full h-10 text-sm bg-white border-gray-300 hover:border-purple-400 transition-colors">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter indicator */}
        {selectedTeacher && (
          <div className="mt-4 flex items-center gap-2 text-sm text-cyan-700 bg-cyan-50 rounded-xl px-3 py-2 border border-cyan-200">
            <Users className="h-4 w-4" />
            <span>Đang lọc theo giáo viên</span>
          </div>
        )}
      </div>

      {/* Modern Week Calendar */}
      <ModernWeekCalendar
        currentWeek={currentWeek}
        onWeekChange={setCurrentWeek}
        timeSlots={calendarTimeSlots}
        getEventsForSlot={getClassesForSlot}
        renderEvent={renderClassEvent}
        accentColor="cyan"
        showStats={false}
      />
    </div>
  );
}

export default ScheduleManagement;
