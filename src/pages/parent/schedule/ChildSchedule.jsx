// pages/parent/schedule/ChildSchedule.jsx
import { useEffect, useState, useMemo } from "react";
import { Calendar, Clock, User, MapPin, BookOpen, Monitor } from "lucide-react";
import PageTitle from "../../../components/common/PageTitle";
import { Card } from "../../../components/ui/Card";
import ModernWeekCalendar from "../../../components/common/ModernWeekCalendar";
import { parentApi } from "../../../services/parent/parent.api";
import { startOfWeek, addDays, fmt } from "../../../utils/date-helpers";

const ChildSchedule = () => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = useMemo(() => startOfWeek(currentWeek), [currentWeek]);

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

  // Group schedules by date and timeslot
  const groupedSchedules = useMemo(() => {
    const groups = {};
    scheduleData.forEach((session) => {
      if (!session.date || !session.startTime || !session.endTime) return;
      const dayKey = fmt(new Date(session.date), "yyyy-MM-dd");
      const slotKey = `${session.startTime}-${session.endTime}`;
      const key = `${dayKey}_${slotKey}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(session);
    });
    return groups;
  }, [scheduleData]);

  // Get unique time slots - ensure we have all time slots
  const timeSlots = useMemo(() => {
    const slots = new Map();
    scheduleData.forEach((s) => {
      if (!s.startTime || !s.endTime) return;
      const key = `${s.startTime}-${s.endTime}`;
      if (!slots.has(key)) {
        slots.set(key, {
          id: slots.size + 1,
          label: `${s.startTime} - ${s.endTime}`,
          time: key,
          startTime: s.startTime,
          endTime: s.endTime,
        });
      }
    });
    // Sort by start time
    return Array.from(slots.values()).sort((a, b) => {
      if (a.startTime < b.startTime) return -1;
      if (a.startTime > b.startTime) return 1;
      return 0;
    });
  }, [scheduleData]);

  const getEventsForSlot = (dayId, slotId) => {
    // dayId từ WEEK_DAYS là 1-7 (T2-CN), cần convert sang index 0-6
    // slotId từ timeSlots là 1,2,3..., cần convert sang index 0,1,2...
    const dayIndex = dayId - 1; // 1->0, 2->1, ..., 7->6
    const slotIndex = slotId - 1; // 1->0, 2->1, ...

    const date = addDays(weekStart, dayIndex);
    const dayKey = fmt(date, "yyyy-MM-dd");
    const slot = timeSlots[slotIndex];
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
    return (
      <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg border border-blue-200 transition-all cursor-pointer group">
        <div className="flex items-start gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">
              {event.subjectName}
            </p>
            <p className="text-xs text-gray-600 truncate">{event.className}</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <User className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{event.teacherName}</span>
          </div>
          {event.room && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">Phòng {event.room}</span>
            </div>
          )}
        </div>

        {/* Status badge */}
        <div className="mt-2 flex items-center justify-between">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
            ${
              event.status === "COMPLETED"
                ? "bg-green-100 text-green-700"
                : event.status === "CANCELLED"
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {event.status === "COMPLETED"
              ? "Đã học"
              : event.status === "CANCELLED"
              ? "Đã hủy"
              : "Sắp diễn ra"}
          </span>
        </div>
      </div>
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
