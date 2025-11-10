import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/Dialog.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/Select.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/Table.jsx";
import { ChevronLeft, ChevronRight, ExternalLink, Filter } from "lucide-react";
import { teacherService } from "../../../services/teacher/teacher.service";
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
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [classTypeFilter, setClassTypeFilter] = useState("all");
  const [isClassDetailOpen, setIsClassDetailOpen] = useState(false);
  const [selectedClassDetail, setSelectedClassDetail] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [attendanceDetails, setAttendanceDetails] = useState([]);

  const weekStart = startOfWeek(currentWeek);
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  useEffect(() => {
    (async () => {
      try {
        const [semesterList, tList, slots] = await Promise.all([
          scheduleService.getSemesters().catch(() => []),
          teacherService.list().catch(() => []),
          scheduleService.getSlots().catch(() => []),
        ]);
        
        setSemesters(semesterList);
        // Auto-select first semester (usually current semester)
        if (semesterList.length > 0 && !selectedSemester) {
          setSelectedSemester(semesterList[0].value);
        }

        const fallbackTeachers = [
          { id: "teacher1", name: "Nguyễn Văn Xuân" },
          { id: "teacher2", name: "Trần Thị Yến" },
          { id: "teacher3", name: "Lê Văn Z" },
          { id: "teacher4", name: "Phạm Thị K" },
        ];
        setTeachers(tList?.length ? tList : fallbackTeachers);
        setTimeSlots(slots);
      } catch (e) {
        console.warn("Init fetch failed", e.message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedSemester) return;
    
    (async () => {
      const data = await scheduleService.getScheduleBySemester(Number(selectedSemester));
      setWeekSchedule(data);
    })();
  }, [selectedSemester]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-100 text-green-800">Có mặt</Badge>;
      case "absent":
        return <Badge className="bg-red-100 text-red-800">Vắng</Badge>;
      case "late":
        return <Badge className="bg-yellow-100 text-yellow-800">Muộn</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800">-</Badge>;
    }
  };

  const filteredSchedule = useMemo(() => {
    let filtered = weekSchedule;
    if (selectedTeacher) {
      filtered = filtered.filter((s) => String(s.teacherId) === String(selectedTeacher));
    }
    if (classTypeFilter === "online") {
      filtered = filtered.filter((s) => s.isOnline === true);
    } else if (classTypeFilter === "offline") {
      filtered = filtered.filter((s) => s.isOnline === false);
    }
    return filtered;
  }, [weekSchedule, selectedTeacher, classTypeFilter]);

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

  const handlePreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const handleNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));

  const openClassDetail = async (classData) => {
    setSelectedClassDetail(classData);
    setIsClassDetailOpen(true);
    const attendance = await scheduleService.getAttendance(classData.id);
    setAttendanceDetails(attendance);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý lịch học</h1>
          <p className="text-slate-600 mt-1">Xem lịch giảng dạy của tất cả giáo viên theo tuần</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Học kỳ:</span>
              <Select value={selectedSemester || ""} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-[160px]">
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
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Giáo viên:</span>
              <Select value={selectedTeacher || "all"} onValueChange={(value) => setSelectedTeacher(value === "all" ? null : value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
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

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Loại lớp:</span>
              <Select value={classTypeFilter} onValueChange={setClassTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium min-w-[200px] text-center">
                Tuần {fmt(weekStart, "dd/MM")} - {fmt(addDays(weekStart, 6), "dd/MM/yyyy")}
              </div>
              <Button variant="outline" size="sm" onClick={handleNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <div className="min-w-[1400px]">
              <div className="grid grid-cols-8 gap-3 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 font-medium text-center">
                  <div className="text-sm text-blue-900 font-bold">Slot</div>
                  <div className="text-xs text-blue-600 mt-1">Thời gian</div>
                </div>
                {weekDates.map((date, index) => {
                  const dayInfo = WEEK_DAYS[index];
                  return (
                    <div key={fmt(date, "yyyy-MM-dd")} className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-lg p-3 text-center shadow-md">
                      <div className="font-bold text-base">{dayInfo.name}</div>
                      <div className="text-xs mt-1 opacity-90">{fmt(date, "dd/MM")}</div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3">
                {timeSlots.map((slot) => (
                  <div key={slot.id} className="grid grid-cols-8 gap-3">
                    <div className="bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-200 rounded-lg p-3 flex flex-col justify-center">
                      <div className="font-bold text-sm text-gray-800">{slot.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{slot.time}</div>
                    </div>

                    {WEEK_DAYS.map((day) => {
                      const classes = getClassesForSlot(day.id, slot.id);
                      
                      return (
                        <div key={day.id} className="border-2 border-gray-200 rounded-lg p-2 min-h-[140px] bg-gray-50">
                          {classes.length > 0 ? (
                            <div className="space-y-2">
                              {classes.map((classData) => (
                                <ClassCard
                                  key={classData.id}
                                  classData={classData}
                                  onViewDetail={openClassDetail}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
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
        </CardContent>
      </Card>

      <Dialog open={isClassDetailOpen} onOpenChange={setIsClassDetailOpen} size="xl">
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Chi tiết lớp {selectedClassDetail?.className}</span>
              {selectedClassDetail?.meetLink && (
                <Button 
                  size="sm"
                  onClick={() => window.open(selectedClassDetail.meetLink, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Vào lớp học
                </Button>
              )}
            </DialogTitle>
            <div className="text-sm text-slate-600 space-y-1 mt-3">
              <div>Môn học: <span className="font-medium">{selectedClassDetail?.subjectName}</span></div>
              <div>Giáo viên: <span className="font-medium">{selectedClassDetail?.teacherName}</span></div>
              <div>
                Địa điểm: 
                <span className="font-medium ml-1">
                  {selectedClassDetail?.isOnline ? (
                    <Badge className="bg-purple-100 text-purple-800">Online</Badge>
                  ) : (
                    selectedClassDetail?.room || "Chưa có phòng"
                  )}
                </span>
              </div>
              <div>Số học viên: <span className="font-medium">{selectedClassDetail?.studentCount}</span></div>
            </div>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="font-medium mb-3">Danh sách điểm danh</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Học viên</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceDetails.map((record, index) => (
                  <TableRow key={record.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{record.student}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-sm text-slate-600">{record.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-slate-600">
              <span className="font-medium">Tổng: {attendanceDetails.length}</span> • 
              <span className="text-green-600 font-medium ml-2">
                {attendanceDetails.filter((a) => a.status === "present").length} có mặt
              </span> • 
              <span className="text-red-600 font-medium ml-2">
                {attendanceDetails.filter((a) => a.status === "absent").length} vắng
              </span> • 
              <span className="text-yellow-600 font-medium ml-2">
                {attendanceDetails.filter((a) => a.status === "late").length} muộn
              </span>
            </div>
            <Button variant="outline" onClick={() => setIsClassDetailOpen(false)}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ScheduleManagement;
