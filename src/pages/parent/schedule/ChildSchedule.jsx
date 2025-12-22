// pages/parent/schedule/ChildSchedule.jsx
import { useEffect, useState, useMemo } from "react";
import {
  User,
  MapPin,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Clock,
  Play,
} from "lucide-react";
import ModernWeekCalendar, {
  CalendarEventCard,
  CalendarStatusBadge,
} from "../../../components/common/ModernWeekCalendar";
import { parentApi } from "../../../services/parent/parent.api";
import { timeslotService } from "../../../services/timeslot/timeslot.service";
import { startOfWeek, addDays, fmt } from "../../../utils/date-helpers";

const ChildSchedule = () => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [allTimeSlots, setAllTimeSlots] = useState([]);

  const weekStart = useMemo(() => startOfWeek(currentWeek), [currentWeek]);

  // Fetch all time slots on mount
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const slots = await timeslotService.list();
        // Transform to calendar format
        const formattedSlots = slots.map((slot, index) => ({
          id: slot.id || index + 1,
          label: `Slot ${index + 1}`,
          time: `${slot.startTime}-${slot.endTime}`,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }));
        setAllTimeSlots(formattedSlots);
      } catch (error) {
        console.error("Error fetching time slots:", error);
      }
    };
    fetchTimeSlots();
  }, []);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchScheduleData();
    } else {
      setLoading(false);
    }
  }, [selectedChild, currentWeek]);

  const fetchChildren = async () => {
    try {
      const response = await parentApi.getChildren();
      setChildren(response || []);
      if (response && response.length > 0) {
        setSelectedChild(response[0].id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
      setChildren([]);
      setLoading(false);
    }
  };

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      const startDate = weekStart;
      const endDate = addDays(weekStart, 6);

      console.log("Fetching schedule for:", {
        childId: selectedChild,
        startDate: fmt(startDate, "yyyy-MM-dd"),
        endDate: fmt(endDate, "yyyy-MM-dd"),
      });

      const response = await parentApi.getChildSchedule(
        selectedChild,
        fmt(startDate, "yyyy-MM-dd"),
        fmt(endDate, "yyyy-MM-dd")
      );

      console.log("Schedule API response:", response);
      console.log("Response length:", response?.length);

      setScheduleData(response || []);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setScheduleData([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to normalize time format (remove seconds if present)
  const normalizeTime = (time) => {
    if (!time) return "";
    // Convert "16:00:00" to "16:00"
    const parts = String(time).split(":");
    return parts.slice(0, 2).join(":");
  };

  // Group schedules by date and timeslot
  const groupedSchedules = useMemo(() => {
    const groups = {};
    scheduleData.forEach((session) => {
      if (!session.date || !session.startTime || !session.endTime) return;
      const dayKey = fmt(new Date(session.date), "yyyy-MM-dd");
      // Normalize time format to ensure matching
      const normalizedStart = normalizeTime(session.startTime);
      const normalizedEnd = normalizeTime(session.endTime);
      const slotKey = `${normalizedStart}-${normalizedEnd}`;
      const key = `${dayKey}_${slotKey}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(session);
    });
    return groups;
  }, [scheduleData]);

  // Use all time slots from API (same as Admin/Teacher)
  const timeSlots = useMemo(() => {
    // Normalize time format in slots
    return allTimeSlots.map((slot) => ({
      ...slot,
      time: `${normalizeTime(slot.startTime)}-${normalizeTime(slot.endTime)}`,
      startTime: normalizeTime(slot.startTime),
      endTime: normalizeTime(slot.endTime),
    }));
  }, [allTimeSlots]);

  const getEventsForSlot = (dayId, slotId) => {
    // dayId từ WEEK_DAYS là 1-7 (T2-CN), cần convert sang index 0-6
    const dayIndex = dayId - 1; // 1->0, 2->1, ..., 7->6

    const date = addDays(weekStart, dayIndex);
    const dayKey = fmt(date, "yyyy-MM-dd");

    // Find the slot by ID from normalized timeSlots
    const slot = timeSlots.find((s) => s.id === slotId);
    if (!slot) return [];

    const key = `${dayKey}_${slot.time}`;
    return groupedSchedules[key] || [];
  };

  // Debug info
  console.log("Schedule Debug:", {
    scheduleDataCount: scheduleData.length,
    timeSlotsCount: timeSlots.length,
    groupedKeys: Object.keys(groupedSchedules),
    weekStart: fmt(weekStart, "yyyy-MM-dd"),
    weekEnd: fmt(addDays(weekStart, 6), "yyyy-MM-dd"),
    allScheduleDates: scheduleData.map((s) => ({
      date: s.date,
      class: s.className,
      time: `${s.startTime}-${s.endTime}`,
    })),
    uniqueClasses: [...new Set(scheduleData.map((s) => s.className))],
  });

  const renderEvent = (event) => {
    // Determine attendance status display with enhanced styling
    const getAttendanceDisplay = () => {
      switch (event.attendanceStatus) {
        case "PRESENT":
          return {
            label: "Có mặt",
            icon: CheckCircle,
            gradientClass: "from-emerald-500 to-green-500",
            glowClass: "bg-emerald-400",
            ringClass: "ring-emerald-400",
            shadowClass: "shadow-emerald-200",
          };
        case "ABSENT":
          return {
            label: "Vắng mặt",
            icon: XCircle,
            gradientClass: "from-red-500 to-rose-500",
            glowClass: "bg-red-400",
            ringClass: "ring-red-400",
            shadowClass: "shadow-red-200",
          };
        case "LATE":
          return {
            label: "Đi muộn",
            icon: AlertCircle,
            gradientClass: "from-amber-500 to-orange-500",
            glowClass: "bg-amber-400",
            ringClass: "ring-amber-400",
            shadowClass: "shadow-amber-200",
          };
        case "UNMARKED":
        default:
          return null; // Không hiển thị badge nếu chưa điểm danh
      }
    };

    const attendanceDisplay = getAttendanceDisplay();
    const hasAttendance = attendanceDisplay !== null;
    const AttendanceIcon = attendanceDisplay?.icon;

    return (
      <CalendarEventCard
        key={event.id}
        variant="info"
        className={`cursor-pointer relative ${
          hasAttendance
            ? `ring-2 ${attendanceDisplay.ringClass} ring-offset-1`
            : ""
        }`}
      >
        {/* Attendance status badge - positioned at top right corner */}
        {hasAttendance && (
          <div className="absolute -top-1.5 -right-1.5 z-10">
            <div className="relative">
              {/* Glow effect */}
              <div
                className={`absolute inset-0 ${attendanceDisplay.glowClass} rounded-full blur-sm animate-pulse`}
              ></div>
              {/* Badge */}
              <div
                className={`relative flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r ${attendanceDisplay.gradientClass} text-white text-[9px] font-bold rounded-full shadow-lg ${attendanceDisplay.shadowClass}`}
              >
                <AttendanceIcon className="h-3 w-3" />
                <span>{attendanceDisplay.label}</span>
              </div>
            </div>
          </div>
        )}

        {/* Subject name */}
        <div
          className="font-semibold text-xs truncate mb-1 pr-16"
          title={event.subjectName}
        >
          {event.subjectName}
        </div>

        {/* Class name */}
        <div className="text-[10px] text-gray-500 truncate mb-1">
          {event.className}
        </div>

        {/* Teacher name */}
        <div className="flex items-center gap-1 text-[10px] text-gray-600 mb-1.5">
          <User className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{event.teacherName}</span>
        </div>

        {/* Room info */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <CalendarStatusBadge status="info">
            <BookOpen className="h-2.5 w-2.5" />
            Lịch học
          </CalendarStatusBadge>

          {event.room && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium bg-violet-50 text-violet-700 border border-violet-200">
              <MapPin className="h-2.5 w-2.5" />
              {event.room}
            </span>
          )}
        </div>
      </CalendarEventCard>
    );
  };

  const renderEmptySlot = () => {
    return (
      <div className="text-center py-4 text-gray-400 text-xs">
        Không có lịch
      </div>
    );
  };

  if (loading && !selectedChild) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const getSelectedChildData = () => {
    return children.find((c) => c.id === selectedChild);
  };

  const childData = getSelectedChildData();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white">
        <div className="px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Child Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border-2 border-white/30">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedChild || ""}
                    onChange={(e) => setSelectedChild(Number(e.target.value))}
                    className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer appearance-none pr-8"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                      backgroundPosition: "right 0 center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                    }}
                  >
                    {children.map((child) => (
                      <option
                        key={child.id}
                        value={child.id}
                        className="text-gray-900 text-base"
                      >
                        {child.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-blue-200 mt-1">Lịch học trong tuần</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{scheduleData.length}</p>
                    <p className="text-xs text-blue-200">Buổi học</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/30 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{timeSlots.length}</p>
                    <p className="text-xs text-blue-200">Slot học</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
        ) : (
          <ModernWeekCalendar
            currentWeek={currentWeek}
            onWeekChange={setCurrentWeek}
            timeSlots={timeSlots}
            getEventsForSlot={getEventsForSlot}
            renderEvent={renderEvent}
            renderEmptySlot={renderEmptySlot}
            accentColor="blue"
            showStats={false}
          />
        )}
      </div>
    </div>
  );
};

export default ChildSchedule;
