import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/Select.jsx";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { scheduleService } from "../../../services/schedule/schedule.service";
import ClassCard from "./ClassCard.jsx";

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

function ScheduleManagement() {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(new Date()); // Current week state
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSemesterData, setSelectedSemesterData] = useState(null); // Store full semester object
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [classTypeFilter, setClassTypeFilter] = useState("all");
  const [semesters, setSemesters] = useState([]);
  const [teachers, setTeachers] = useState([]);
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

  // Calculate if can navigate to prev/next week based on semester range
  const canGoPrevWeek = useMemo(() => {
    // If "All" is selected, allow unlimited navigation
    if (selectedSemester === "all") return true;
    if (!selectedSemesterData?.startDate) return true;
    const prevWeekStart = subWeeks(weekStart, 1);
    return prevWeekStart >= new Date(selectedSemesterData.startDate);
  }, [weekStart, selectedSemesterData, selectedSemester]);

  const canGoNextWeek = useMemo(() => {
    // If "All" is selected, allow unlimited navigation
    if (selectedSemester === "all") return true;
    if (!selectedSemesterData?.endDate) return true;
    const nextWeekEnd = addDays(addWeeks(weekStart, 1), 6);
    return nextWeekEnd <= new Date(selectedSemesterData.endDate);
  }, [weekStart, selectedSemesterData, selectedSemester]);

  useEffect(() => {
    (async () => {
      try {
        const [semesterList, tList, slots] = await Promise.all([
          scheduleService.getSemesters(),
          scheduleService.getTeachers(),
          scheduleService.getTimeSlots(),
        ]);

        setSemesters(semesterList);
        // Auto-select "All" option by default
        if (semesterList.length > 0 && !selectedSemester) {
          setSelectedSemester("all");
          setSelectedSemesterData(
            semesterList.find((s) => s.value !== "all") || semesterList[0]
          ); // Store first real semester data for reference
        }

        setTeachers(tList);
        setTimeSlots(slots);
      } catch (e) {
        console.error("Failed to load initial data:", e);
        alert("Không thể tải dữ liệu. Vui lòng kiểm tra kết nối backend.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedSemester) return;

    (async () => {
      try {
        // Pass 'all' or numeric semesterId to service
        const data = await scheduleService.getScheduleBySemester(
          selectedSemester
        );

        setWeekSchedule(data);
      } catch (e) {
        console.error("Failed to load schedule data:", e);
        alert(
          "Không thể tải dữ liệu lịch học. Vui lòng kiểm tra kết nối backend."
        );
        setWeekSchedule([]);
      }
    })();
  }, [selectedSemester]);

  // Filter schedule by teacher + class type + current week dates
  const filteredSchedule = useMemo(() => {
    console.log(
      "Filtering schedule. weekSchedule length:",
      weekSchedule.length
    );
    console.log("Selected teacher:", selectedTeacher);
    console.log("Class type filter:", classTypeFilter);
    console.log("Current week start:", fmt(weekStart, "yyyy-MM-dd"));
    console.log("Current week end:", fmt(addDays(weekStart, 6), "yyyy-MM-dd"));

    let filtered = weekSchedule;

    console.log("🔍 Filter Debug - Initial schedule items:", filtered.length);
    console.log("🔍 Selected teacher:", selectedTeacher);
    console.log("🔍 Class type filter:", classTypeFilter);

    if (selectedTeacher) {
      console.log("👨‍🏫 Filtering by teacher ID:", selectedTeacher);
      const before = filtered.length;
      filtered = filtered.filter(
        (s) => String(s.teacherId) === String(selectedTeacher)
      );
      console.log(
        `👨‍🏫 After teacher filter: ${before} → ${filtered.length} items`
      );
      if (filtered.length > 0) {
        console.log("Sample filtered item:", filtered[0]);
      }
    }

    // Filter by class type
    if (classTypeFilter === "online") {
      const before = filtered.length;
      filtered = filtered.filter((s) => s.isOnline === true);

      console.log(
        `💻 After online filter: ${before} → ${filtered.length} items`
      );
    } else if (classTypeFilter === "offline") {
      const before = filtered.length;
      filtered = filtered.filter((s) => s.isOnline === false);
      console.log(
        `🏫 After offline filter: ${before} → ${filtered.length} items`
      );
    }
    console.log("✅ Final filtered schedule:", filtered.length, "items");
    return filtered;
  }, [weekSchedule, selectedTeacher, classTypeFilter, weekStart]);

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

  // Handle semester change - update both value and full data, keep current week
  const handleSemesterChange = (value) => {
    setSelectedSemester(value);
    const semesterData = semesters.find((s) => s.value === value);
    setSelectedSemesterData(semesterData || null);

    // Reset to first week of semester or current week if "All"
    if (value === "all") {
      setCurrentWeek(new Date()); // Reset to current week
    } else if (semesterData?.startDate) {
      setCurrentWeek(new Date(semesterData.startDate));
    }
  };

  // Week navigation handlers
  const handlePreviousWeek = () => {
    if (canGoPrevWeek) {
      setCurrentWeek((prev) => subWeeks(prev, 1));
    }
  };

  const handleNextWeek = () => {
    if (canGoNextWeek) {
      setCurrentWeek((prev) => addWeeks(prev, 1));
    }
  };

  const openClassDetail = (classData) => {
    // Navigate to admin class detail page
    navigate(`/home/admin/schedule/class/${classData.classId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý lịch học</h1>
          <p className="text-slate-600 mt-1">
            Xem lịch giảng dạy của tất cả giáo viên theo tuần
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Học kỳ */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-1 h-5 bg-blue-600 rounded"></div>
                  Học kỳ
                </label>
                <Select
                  value={selectedSemester || ""}
                  onValueChange={handleSemesterChange}
                >
                  <SelectTrigger className="w-full h-10 text-sm bg-white border-gray-300 hover:border-blue-500 transition-colors [&>svg]:h-4 [&>svg]:w-4">
                    <SelectValue placeholder="Chọn học kỳ" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester.id} value={semester.value}>
                        {semester.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSemester === "all" ? (
                  <p className="text-xs text-blue-600 mt-1 font-medium">
                    📅 Xem toàn bộ lịch học
                  </p>
                ) : (
                  selectedSemesterData &&
                  selectedSemesterData.startDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      {fmt(
                        new Date(selectedSemesterData.startDate),
                        "dd/MM/yyyy"
                      )}{" "}
                      -{" "}
                      {fmt(
                        new Date(selectedSemesterData.endDate),
                        "dd/MM/yyyy"
                      )}
                    </p>
                  )
                )}
              </div>

              {/* Giáo viên */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-1 h-5 bg-green-600 rounded"></div>
                  Giáo viên
                </label>
                <Select
                  value={selectedTeacher || "all"}
                  onValueChange={(value) =>
                    setSelectedTeacher(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger className="w-full h-10 text-sm bg-white border-gray-300 hover:border-green-500 transition-colors [&>svg]:h-4 [&>svg]:w-4">
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
                  <div className="w-1 h-5 bg-purple-600 rounded"></div>
                  Loại lớp
                </label>
                <Select
                  value={classTypeFilter}
                  onValueChange={setClassTypeFilter}
                >
                  <SelectTrigger className="w-full h-10 text-sm bg-white border-gray-300 hover:border-purple-500 transition-colors [&>svg]:h-4 [&>svg]:w-4">
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

            {/* Week Navigation */}
            <div className="flex items-center justify-center gap-3 pt-2 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousWeek}
                disabled={!canGoPrevWeek}
                className="h-9 px-3 hover:bg-blue-50 disabled:opacity-50"
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
                disabled={!canGoNextWeek}
                className="h-9 px-3 hover:bg-blue-50 disabled:opacity-50"
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
                  console.log("Reset to today:", fmt(today, "yyyy-MM-dd"));
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
                  {filteredSchedule.length}
                </span>
              </div>
              {selectedTeacher && (
                <div className="flex items-center gap-2 text-green-700">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Lọc theo giáo viên</span>
                </div>
              )}
            </div>
          </div>

          {filteredSchedule.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Calendar className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">
                Không có lịch học trong tuần này
              </p>
              <p className="text-sm mt-2">
                Hãy thử chọn tuần khác hoặc thay đổi bộ lọc
              </p>
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

export default ScheduleManagement;
