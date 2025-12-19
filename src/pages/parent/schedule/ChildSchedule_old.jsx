// pages/parent/schedule/ChildSchedule.jsx
import { useEffect, useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Book,
  Monitor,
} from "lucide-react";
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
    }
  }, [selectedChild, currentWeek]);

  const fetchChildren = async () => {
    try {
      const response = await parentApi.getChildren();
      setChildren(response);
      if (response.length > 0) {
        setSelectedChild(response[0].id);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
      setChildren([]);
    }
  };

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentDate);
      startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Monday
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6); // Sunday

      const response = await parentApi.getChildSchedule(
        selectedChild,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      );
      setScheduleData(response || []);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setScheduleData([]);
    } finally {
      setLoading(false);
    }
  };

  // Group schedules by day and timeslot
  const groupedSchedules = useMemo(() => {
    const groups = {};
    scheduleData.forEach(session => {
      const dayKey = fmt(new Date(session.date), 'yyyy-MM-dd');
      const slotKey = `${session.startTime}-${session.endTime}`;
      const key = `${dayKey}_${slotKey}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(session);
    });
    return groups;
  }, [scheduleData]);
  
  // Get unique time slots
  const timeSlots = useMemo(() => {
    const slots = new Set();
    scheduleData.forEach(s => {
      slots.add(`${s.startTime}-${s.endTime}`);
    });
    return Array.from(slots).sort().map((slot, idx) => ({
      id: idx + 1,
      label: slot,
      time: slot
    }));
  }, [scheduleData]);
  
  const getEventsForSlot = (dayId, slotId) => {
    const date = addDays(weekStart, dayId);
    const dayKey = fmt(date, 'yyyy-MM-dd');
    const slot = timeSlots[slotId];
    if (!slot) return [];
    const key = `${dayKey}_${slot.time}`;
    return groupedSchedules[key] || [];
  };

  const renderWeekView = () => {
    const weekDays = [
      { key: "MONDAY", label: "Thứ 2" },
      { key: "TUESDAY", label: "Thứ 3" },
      { key: "WEDNESDAY", label: "Thứ 4" },
      { key: "THURSDAY", label: "Thứ 5" },
      { key: "FRIDAY", label: "Thứ 6" },
      { key: "SATURDAY", label: "Thứ 7" },
      { key: "SUNDAY", label: "Chủ nhật" },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const daySchedule = getDaySchedule(day.key);
          return (
            <Card key={day.key} className="p-4">
              <h3 className="font-bold text-center mb-3 text-gray-900 border-b pb-2">
                {day.label}
              </h3>
              <div className="space-y-2">
                {daySchedule.length > 0 ? (
                  daySchedule.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors"
                    >
                      <p className="font-semibold text-sm text-gray-900 mb-1">
                        {schedule.subjectName}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <User className="w-3 h-3" />
                        <span>{schedule.teacherName}</span>
                      </div>
                      {schedule.room && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span>Phòng {schedule.room}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 text-center py-4">
                    Không có lịch học
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderListView = () => {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {scheduleData.length > 0 ? (
            scheduleData.map((schedule) => (
              <div
                key={schedule.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      {schedule.className} - {schedule.subjectName}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>
                          {new Date(schedule.date).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span>
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-600" />
                        <span>{schedule.teacherName}</span>
                      </div>
                      {schedule.room && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-600" />
                          <span>Phòng {schedule.room}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">Không có lịch học</p>
          )}
        </div>
      </Card>
    );
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
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

      {/* Controls */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Child Selector */}
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

          {/* View Mode Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("week")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === "week"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Danh sách
            </button>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousWeek}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Hôm nay
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Week Display */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-center text-sm text-gray-600">
            Tuần {Math.ceil(currentDate.getDate() / 7)} - Tháng{" "}
            {currentDate.getMonth() + 1}, {currentDate.getFullYear()}
          </p>
        </div>
      </Card>

      {/* Schedule Display */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div>{viewMode === "week" ? renderWeekView() : renderListView()}</div>
      )}
    </div>
  );
};

export default ChildSchedule;
