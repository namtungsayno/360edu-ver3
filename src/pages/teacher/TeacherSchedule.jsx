import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Check,
  Clock,
  Users,
  BookOpen,
} from "lucide-react";
import { scheduleService } from "../../services/schedule/schedule.service";
import { attendanceService } from "../../services/attendance/attendance.service";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/use-toast";

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
  const { toast } = useToast();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});

  // Calculate week dates based on currentWeek
  const weekStart = useMemo(() => {
    return startOfWeek(currentWeek);
  }, [currentWeek]);

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Get the actual date for a class based on day of week
  const getDateForClass = (dayOfWeek) => {
    // dayOfWeek: 1=Mon, 2=Tue, ..., 7=Sun
    const date = new Date(weekStart);
    date.setDate(date.getDate() + (dayOfWeek - 1));
    return date;
  };

  // Load attendance status for all classes
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
            dateStr
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

  const handleClassClick = (classData, action = "view") => {
    const classDate = getDateForClass(classData.day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    classDate.setHours(0, 0, 0, 0);

    // Check if trying to mark attendance for future date
    if (classDate > today) {
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

    // Navigate to class detail page for attendance
    navigate(`/home/teacher/class/${classData.classId}`);
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

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Lịch dạy</h1>
        <p className="text-sm text-gray-600 mt-1">
          Quản lý lịch giảng dạy buổi tối của bạn (16:00 - 22:00)
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Tổng buổi học */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Tổng buổi học</div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalClasses} buổi
              </div>
            </div>
          </div>
        </div>

        {/* Đã điểm danh */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Đã điểm danh</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.marked} buổi
              </div>
            </div>
          </div>
        </div>

        {/* Chưa điểm danh */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Chưa điểm danh</div>
              <div className="text-2xl font-bold text-orange-600">
                {stats.unmarked} buổi
              </div>
            </div>
          </div>
        </div>

        {/* Tổng học viên */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Tổng học viên</div>
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalStudents} HV
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center justify-between gap-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousWeek}
            className="h-8 px-3"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextWeek}
            className="h-8 px-3"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded border border-blue-200">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-800">
              {fmt(weekStart, "dd/MM/yyyy")} -{" "}
              {fmt(addDays(weekStart, 6), "dd/MM/yyyy")}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(new Date())}
            className="h-8 px-3 ml-2"
          >
            Tuần hiện tại
          </Button>
        </div>
      </div>

      {/* Schedule Table */}
      <Card>
        <CardContent className="p-0">
          {weekSchedule.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Calendar className="h-20 w-20 mb-4 opacity-30" />
              <p className="text-lg font-medium">
                Không có lịch dạy trong tuần này
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1400px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="sticky left-0 z-10 bg-gradient-to-r from-slate-100 to-slate-50 p-3 text-left border-r border-gray-200">
                      <div className="text-xs font-bold text-gray-700">
                        Slot
                      </div>
                      <div className="text-xs text-gray-500">Thời gian</div>
                    </th>
                    {WEEK_DAYS.map((day, index) => {
                      const date = weekDates[index];
                      const isToday =
                        fmt(date, "yyyy-MM-dd") ===
                        fmt(new Date(), "yyyy-MM-dd");
                      return (
                        <th
                          key={day.id}
                          className={`p-3 text-center ${
                            isToday
                              ? "bg-gradient-to-br from-blue-600 to-blue-700"
                              : "bg-gradient-to-br from-blue-500 to-indigo-600"
                          }`}
                        >
                          <div className="text-white font-bold text-sm">
                            {day.name}
                          </div>
                          <div className="text-white text-xs opacity-90 mt-1">
                            {fmt(date, "dd/MM")}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot, slotIndex) => (
                    <tr key={slot.id} className="border-b border-gray-200">
                      <td className="sticky left-0 z-10 bg-gradient-to-r from-slate-50 to-white p-3 border-r border-gray-200">
                        <div className="font-bold text-xs text-gray-800">
                          {slot.label}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {slot.time}
                        </div>
                      </td>
                      {WEEK_DAYS.map((day) => {
                        const classes = getClassesForSlot(day.id, slot.id);
                        return (
                          <td
                            key={day.id}
                            className={`p-2 align-top ${
                              slotIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
                            }`}
                          >
                            {classes.length > 0 ? (
                              <div className="space-y-2">
                                {classes.map((classData) => {
                                  const key = `${classData.classId}-${classData.day}`;
                                  const attendance = attendanceMap[key];
                                  const isMarked =
                                    attendance?.isMarked || false;
                                  const classDate = getDateForClass(
                                    classData.day
                                  );
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  classDate.setHours(0, 0, 0, 0);
                                  const isFuture = classDate > today;
                                  const isPast = classDate < today;

                                  return (
                                    <div
                                      key={classData.id}
                                      onClick={() =>
                                        !isFuture &&
                                        !isPast &&
                                        handleClassClick(
                                          classData,
                                          isMarked ? "edit" : "mark"
                                        )
                                      }
                                      className={`relative rounded-lg p-3 transition-all duration-200 border-2 ${
                                        isFuture
                                          ? "bg-gray-100 border-gray-300 cursor-not-allowed opacity-60"
                                          : isPast && isMarked
                                          ? "bg-green-50 border-green-300 opacity-75 cursor-default"
                                          : isPast
                                          ? "bg-gray-100 border-gray-300 opacity-60 cursor-default"
                                          : isMarked
                                          ? "bg-green-50 border-green-400 hover:shadow-md hover:border-green-500 cursor-pointer"
                                          : "bg-orange-50 border-orange-400 hover:shadow-md hover:border-orange-500 cursor-pointer"
                                      }`}
                                    >
                                      {/* Status Badge */}
                                      {!isFuture && (
                                        <div
                                          className={`absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-xs font-bold flex items-center gap-1 shadow-sm ${
                                            isMarked
                                              ? "bg-green-500 text-white"
                                              : "bg-orange-500 text-white"
                                          }`}
                                        >
                                          {isMarked ? (
                                            <>
                                              <Check className="h-3 w-3" />
                                              Đã ĐD
                                            </>
                                          ) : (
                                            <>
                                              <Clock className="h-3 w-3" />
                                              Chưa ĐD
                                            </>
                                          )}
                                        </div>
                                      )}

                                      {/* Class Info */}
                                      <div className="space-y-1">
                                        <div className="font-bold text-sm text-gray-800">
                                          {classData.className ||
                                            classData.classCode}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                          {classData.subjectName}
                                        </div>
                                        {/* Course Info */}
                                        {classData.courseTitle && (
                                          <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded mt-1">
                                            <BookOpen className="h-3 w-3" />
                                            <span className="font-medium">
                                              {classData.courseTitle}
                                            </span>
                                          </div>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                          <span>
                                            📍 Phòng:{" "}
                                            {classData.isOnline
                                              ? "Phòng Online"
                                              : classData.room ||
                                                classData.roomName ||
                                                "Chưa xếp phòng"}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                          <Users className="h-3 w-3" />
                                          <span>
                                            SV:{" "}
                                            {attendance?.actualStudentCount ||
                                              classData.studentCount ||
                                              0}
                                            /{classData.maxStudents || 0}
                                          </span>
                                        </div>

                                        {/* Attendance Details */}
                                        {isMarked && attendance?.stats && (
                                          <div className="mt-2 pt-2 border-t border-green-200 flex items-center gap-2 text-xs">
                                            <span className="text-green-700 font-semibold">
                                              ✓ {attendance.stats.present}
                                            </span>
                                            <span className="text-gray-400">
                                              |
                                            </span>
                                            <span className="text-red-600">
                                              ✗ {attendance.stats.absent}
                                            </span>
                                            <span className="text-gray-400">
                                              |
                                            </span>
                                            <span className="text-orange-600">
                                              ⏱ {attendance.stats.late}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="mt-3 flex gap-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (isFuture) return;
                                            handleClassClick(
                                              classData,
                                              isMarked ? "edit" : "mark"
                                            );
                                          }}
                                          disabled={isFuture || isPast}
                                          className={`flex-1 text-xs py-1.5 px-2 rounded font-medium transition-colors ${
                                            isFuture || isPast
                                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                              : isMarked
                                              ? "bg-blue-600 text-white hover:bg-blue-700"
                                              : "bg-orange-600 text-white hover:bg-orange-700"
                                          }`}
                                        >
                                          {isFuture
                                            ? "Đang mở"
                                            : isPast
                                            ? isMarked
                                              ? "🔒 Đã khóa"
                                              : "❌ Đã qua"
                                            : isMarked
                                            ? "📝 Sửa ĐD"
                                            : "⚡ Điểm danh"}
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isPast && !isFuture) {
                                              handleClassClick(
                                                classData,
                                                "view"
                                              );
                                            }
                                          }}
                                          disabled={isFuture}
                                          className={`text-xs py-1.5 px-2 rounded font-medium transition-colors ${
                                            isFuture
                                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                          }`}
                                        >
                                          👁 Chi tiết
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-center text-gray-400 text-xs py-8">
                                Trống
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm bg-gray-50 rounded-lg p-4 border border-gray-200">
        <span className="font-semibold text-gray-700">Chú thích:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600">Đã điểm danh</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span className="text-gray-600">Chưa điểm danh</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <span className="text-gray-600">Chưa đến ngày dạy</span>
        </div>
      </div>
    </div>
  );
}

export default TeacherSchedule;
