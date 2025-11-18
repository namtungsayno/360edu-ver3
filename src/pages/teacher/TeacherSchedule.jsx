import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { scheduleService } from "../../services/schedule/schedule.service";
import { useAuth } from "../../hooks/useAuth";
import ClassCard from "../admin/schedule/ClassCard.jsx";

// Lightweight date helpers
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
function subWeeks(d, n) {
  return addDays(d, -n * 7);
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

// Static week day meta (1-7 Mon-Sun)
const WEEK_DAYS = [
  { id: 1, name: "MON" },
  { id: 2, name: "TUE" },
  { id: 3, name: "WED" },
  { id: 4, name: "THU" },
  { id: 5, name: "FRI" },
  { id: 6, name: "SAT" },
  { id: 7, name: "SUN" },
];

function TeacherSchedule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const [weekSchedule, setWeekSchedule] = useState([]);

  // Calculate week dates based on currentWeek
  const weekStart = useMemo(() => {
    return startOfWeek(currentWeek);
  }, [currentWeek]);

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

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
      } catch (e) {
        console.error("Failed to load teacher schedule:", e);
        alert(
          "Không thể tải lịch dạy của bạn. Vui lòng kiểm tra kết nối backend."
        );
        setWeekSchedule([]);
      }
    })();
  }, [user]);

  const scheduleLookup = useMemo(() => {
    const map = {};
    for (const item of weekSchedule) {
      if (!map[item.day]) map[item.day] = {};
      if (!map[item.day][item.slotId]) map[item.day][item.slotId] = [];
      map[item.day][item.slotId].push(item);
    }
    return map;
  }, [weekSchedule]);

  const getClassesForSlot = (dayId, slotId) => {
    return scheduleLookup?.[dayId]?.[slotId] || [];
  };

  const handlePreviousWeek = () => {
    setCurrentWeek((prev) => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek((prev) => addWeeks(prev, 1));
  };

  const openClassDetail = (classData) => {
    // Navigate to class detail page
    navigate(`/home/teacher/class/${classData.classId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lịch dạy trong tuần</h1>
          <p className="text-slate-600 mt-1">
            Xem lịch giảng dạy của bạn theo tuần
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="space-y-4">
            {/* Week Navigation */}
            <div className="flex items-center justify-center gap-3 pt-2 border-t border-gray-200">
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
                  {fmt(weekStart, "dd/MM/yyyy")} -{" "}
                  {fmt(addDays(weekStart, 6), "dd/MM/yyyy")}
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

              {/* Today button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  setCurrentWeek(today);
                }}
                className="h-9 px-3 hover:bg-green-50 border-green-300 text-green-700"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Hôm nay
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          {/* Show stats */}
          <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="font-semibold text-gray-700">
                  Tổng lớp trong tuần:
                </span>
                <span className="text-blue-700 font-bold">
                  {weekSchedule.length}
                </span>
              </div>
            </div>
          </div>

          {weekSchedule.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Calendar className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">
                Không có lịch dạy trong tuần này
              </p>
              <p className="text-sm mt-2">Hãy thử chọn tuần khác</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[1100px]">
                <div className="grid grid-cols-8 gap-2 mb-3">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-md p-2 font-medium text-center">
                    <div className="text-xs text-blue-900 font-bold">Slot</div>
                    <div className="text-xs text-blue-600 mt-1">Thời gian</div>
                  </div>
                  {weekDates.map((date, index) => {
                    const dayInfo = WEEK_DAYS[index];
                    return (
                      <div
                        key={fmt(date, "yyyy-MM-dd")}
                        className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-md p-2 text-center shadow-sm"
                      >
                        <div className="font-bold text-sm">{dayInfo.name}</div>
                        <div className="text-xs mt-1 opacity-90">
                          {fmt(date, "dd/MM")}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  {timeSlots.map((slot) => (
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
                              <div className="space-y-1">
                                {classes.map((classData) => (
                                  <ClassCard
                                    key={classData.id}
                                    classData={classData}
                                    onViewDetail={openClassDetail}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                                Trống
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

export default TeacherSchedule;
