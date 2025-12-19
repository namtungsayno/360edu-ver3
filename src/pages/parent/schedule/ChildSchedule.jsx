// pages/parent/schedule/ChildSchedule.jsx
import { useEffect, useState, useMemo } from "react";
import {
  User,
  MapPin,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import PageTitle from "../../../components/common/PageTitle";
import { Card } from "../../../components/ui/Card";
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle title="Lịch học" subtitle="Xem lịch học của con" />

      {/* Child Selector */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <User className="w-6 h-6 text-blue-600" />
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Chọn con
            </label>
            <select
              value={selectedChild || ""}
              onChange={(e) => setSelectedChild(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Modern Week Calendar */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
  );
};

export default ChildSchedule;
