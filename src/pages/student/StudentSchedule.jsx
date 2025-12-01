// src/pages/student/StudentSchedule.jsx
// Màn hình lịch học cho học sinh - Thiết kế giống Admin Schedule

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen
} from "lucide-react";
import { studentScheduleService } from "../../services/student-schedule/student-schedule.service.js";
import { useToast } from "../../hooks/use-toast";

// Date helper functions
function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d, n) {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + n);
  return nd;
}

function addWeeks(d, n) {
  return addDays(d, n * 7);
}

function fmt(date, pattern) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  if (pattern === "dd/MM") return `${dd}/${mm}`;
  if (pattern === "dd/MM/yyyy") return `${dd}/${mm}/${yyyy}`;
  if (pattern === "yyyy-MM-dd") return `${yyyy}-${mm}-${dd}`;
  return date.toISOString();
}

// Week days configuration - giống admin
const WEEK_DAYS = [
  { id: 1, name: "MON", label: "Thứ 2" },
  { id: 2, name: "TUE", label: "Thứ 3" },
  { id: 3, name: "WED", label: "Thứ 4" },
  { id: 4, name: "THU", label: "Thứ 5" },
  { id: 5, name: "FRI", label: "Thứ 6" },
  { id: 6, name: "SAT", label: "Thứ 7" },
  { id: 7, name: "SUN", label: "Chủ nhật" },
];

// Time slots (chỉ hiển thị khung 16:00 - 22:00 theo yêu cầu)
const TIME_SLOTS = [
  { id: 1, label: "Slot 1", time: "16:00 - 18:00" },
  { id: 2, label: "Slot 2", time: "18:00 - 20:00" },
  { id: 3, label: "Slot 3", time: "20:00 - 22:00" },
];

export default function StudentSchedule() {
  const { error } = useToast();

  // Week navigation state
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const weekStart = useMemo(() => startOfWeek(currentWeek), [currentWeek]);
  const weekKey = useMemo(() => fmt(weekStart, "yyyy-MM-dd"), [weekStart]);
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Cache state for smooth navigation
  const [cache, setCache] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Normalize API items
  const normalize = (raw) =>
    (raw || []).map((item) => ({
      ...item,
      timeDisplay:
        item.timeStart && item.timeEnd
          ? `${item.timeStart.slice(0, 5)} - ${item.timeEnd.slice(0, 5)}`
          : "",
    }));

  // Fetch a specific week and update cache
  const fetchWeek = async (ws) => {
    const key = fmt(ws, "yyyy-MM-dd");
    try {
      const raw = await studentScheduleService.getScheduleByWeek(key);
      const data = normalize(raw);
      setCache((prev) => ({ ...prev, [key]: data }));
    } catch (e) {
      console.error("Failed to load schedule data:", e);
      error("Không thể tải dữ liệu lịch học");
      setCache((prev) => ({ ...prev, [key]: [] }));
    }
  };

  // Main effect: fetch current week, keep previous content to avoid flicker
  useEffect(() => {
    let mounted = true;
    (async () => {
      // If already cached, render immediately and refresh in background
      const hasCache = cache[weekKey] !== undefined;
      setIsFetching(true);
      if (!hasCache && initialLoading) setInitialLoading(true);
      await fetchWeek(weekStart);
      if (mounted) {
        setIsFetching(false);
        setInitialLoading(false);
      }
      // Prefetch neighbors for smoother next/prev transitions
      fetchWeek(addWeeks(weekStart, 1));
      fetchWeek(addWeeks(weekStart, -1));
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekKey]);

  // Helper function to get classes for a specific day and slot
  const getClassesForSlot = (dayId, slotId) => {
    const dayDate = addDays(weekStart, dayId - 1);
    const dayStr = fmt(dayDate, "yyyy-MM-dd");
    const display = cache[weekKey] || [];
    return display.filter(session => {
      if (!session.date || !session.timeStart) return false;
      const sessionDate = fmt(new Date(session.date), "yyyy-MM-dd");
      if (sessionDate !== dayStr) return false;

      const timeStart = session.timeStart.slice(0,5); // HH:MM lấy từ HH:MM:SS
      const slotMapping = { "16:00": 1, "18:00": 2, "20:00": 3 };
      return slotMapping[timeStart] === slotId;
    });
  };

  // Navigation handlers
  const handlePreviousWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, -1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  if (initialLoading && !cache[weekKey]) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải lịch học...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header - giống admin */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lịch học của tôi</h1>
          <p className="text-slate-600 mt-1">
            Xem lịch học các lớp đã đăng ký theo tuần
          </p>
        </div>
      </div>

      {/* Week Navigation - giống admin */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center justify-center gap-3 border-t border-gray-200 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousWeek}
              className="h-9 px-3 hover:bg-blue-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Tuần trước
            </Button>

            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">
                {fmt(weekStart, "dd/MM/yyyy")} - {fmt(addDays(weekStart, 6), "dd/MM/yyyy")}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextWeek}
              className="h-9 px-3 hover:bg-blue-50"
            >
              Tuần sau
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToCurrentWeek}
              className="h-9 px-3 hover:bg-green-50 border-green-300 text-green-700"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Hôm nay
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Grid - giống admin */}
      <Card>
        <CardContent className="p-4">
          {/* Stats */}
          <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="font-semibold text-gray-700">
                  Tổng buổi học trong tuần:
                </span>
                <span className="text-blue-700 font-bold">
                  {(cache[weekKey] || []).length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="font-semibold text-gray-700">
                  Lớp khác nhau:
                </span>
                <span className="text-green-700 font-bold">
                  {new Set((cache[weekKey] || []).map(s => s.classId)).size}
                </span>
              </div>
            </div>
          </div>

          {(cache[weekKey] || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Calendar className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">
                Không có lịch học trong tuần này
              </p>
              <p className="text-sm mt-2">
                Hãy thử chọn tuần khác hoặc đăng ký thêm lớp học
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[1100px]">
                {/* Header row - giống admin */}
                <div className="grid grid-cols-8 gap-2 mb-3">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-md p-2 font-medium text-center">
                    <div className="text-xs text-blue-900 font-bold">Slot</div>
                    <div className="text-xs text-blue-600 mt-1">Thời gian</div>
                  </div>
                  {weekDates.map((date, index) => {
                    const dayInfo = WEEK_DAYS[index];
                    const isToday = fmt(date, "yyyy-MM-dd") === fmt(new Date(), "yyyy-MM-dd");
                    return (
                      <div
                        key={fmt(date, "yyyy-MM-dd")}
                        className={`rounded-md p-2 text-center shadow-sm ${
                          isToday 
                            ? "bg-gradient-to-br from-green-600 to-emerald-700 text-white ring-2 ring-green-400" 
                            : "bg-gradient-to-br from-blue-600 to-indigo-700 text-white"
                        }`}
                      >
                        <div className="font-bold text-sm">{dayInfo.name}</div>
                        <div className="text-xs mt-1 opacity-90">
                          {fmt(date, "dd/MM")}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Time slots grid - giống admin */}
                <div className="space-y-2 relative" aria-busy={isFetching}>
                  {isFetching && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] animate-pulse rounded-md z-10"></div>
                  )}
                  {TIME_SLOTS.map((slot) => (
                    <div key={slot.id} className="grid grid-cols-8 gap-2">
                      <div className="bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-200 rounded-md p-2 flex flex-col justify-center">
                        <div className="font-bold text-xs text-gray-800">
                          {slot.label}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {slot.time}
                        </div>
                      </div>

                      {WEEK_DAYS.map((day) => {
                        const classes = getClassesForSlot(day.id, slot.id);

                        return (
                          <div
                            key={day.id}
                            className="border-2 border-gray-200 rounded-md p-1 min-h-[100px] bg-gray-50"
                          >
                            {classes.length > 0 ? (
                              <div className="space-y-2">
                                {classes.map((classData) => (
                                  <StudentClassCard key={classData.sessionId} classData={classData} />
                                ))}
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center text-gray-300">
                                <div className="text-xs">Trống</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Student class card component - giống admin nhưng đơn giản hơn
function StudentClassCard({ classData }) {
  const STATUS_LABELS = { PRESENT: "Có mặt", ABSENT: "Vắng", LATE: "Đi trễ", UNMARKED: "Chưa điểm danh" };
  const STATUS_STYLES = {
    PRESENT: "from-green-500 to-green-600 border-green-400 text-white",
    ABSENT: "from-red-500 to-red-600 border-red-400 text-white",
    LATE: "from-amber-400 to-amber-500 border-amber-400 text-white",
    UNMARKED: "from-slate-200 to-slate-300 border-slate-300 text-slate-700"
  };
  const st = classData.attendanceStatus || "UNMARKED";
  const style = STATUS_STYLES[st] || STATUS_STYLES.UNMARKED;
  return (
    <div className={`relative bg-gradient-to-br ${style} rounded-md p-2 border shadow-sm transition-all cursor-pointer`}>      
      <div className="absolute top-1 right-1 text-[10px] px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm font-semibold">
        {STATUS_LABELS[st]}
      </div>
      <div className="text-xs font-bold mb-1 line-clamp-2">
        {classData.className}
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-xs opacity-90">
          <BookOpen className="w-3 h-3" />
          <span className="truncate">{classData.subjectName}</span>
        </div>
        
        <div className="flex items-center gap-1 text-xs opacity-90">
          <User className="w-3 h-3" />
          <span className="truncate">{classData.teacherName}</span>
        </div>
        
        <div className="flex items-center gap-1 text-xs opacity-90">
          <Clock className="w-3 h-3" />
          <span>{classData.timeDisplay}</span>
        </div>
        
        {classData.roomName && (
          <div className="flex items-center gap-1 text-xs opacity-90">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{classData.roomName}</span>
          </div>
        )}
      </div>
    </div>
  );
}

