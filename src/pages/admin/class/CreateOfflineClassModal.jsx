/**
 * CreateOfflineClassModal - Tạo lớp học Offline
 * - Bắt buộc chọn Phòng học
 * - Sĩ số tối đa tự động lấy theo sức chứa phòng, không cho nhập tay
 * - Không có Link Meet
 */
import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "../../../components/ui/Dialog";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/Select";
import { Loader2, CalendarCheck2, Users, Building2 } from "lucide-react";

import ScheduleGrid from "../schedule/ScheduleGrid";

import { classService } from "../../../services/class/class.service";
import { subjectService } from "../../../services/subject/subject.service";
import { teacherService } from "../../../services/teacher/teacher.service";
import { classroomService } from "../../../services/classrooms/classroom.service";
import { semesterService } from "../../../services/semester/semester.service";
import { timeslotService } from "../../../services/timeslot/timeslot.service";
import { useToast } from "../../../hooks/use-toast";

export default function CreateOfflineClassModal({ open, onClose, onCreated }) {
  const [className, setClassName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [capacity, setCapacity] = useState(""); // auto from room
  const [semesterId, setSemesterId] = useState("");
  const [totalSessions, setTotalSessions] = useState("");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  // Start-of-week (Monday) to align headers T2..CN with actual dates
  const [weekStart] = useState(() => {
    const now = new Date();
    const js = now.getDay(); // 0=Sun..6=Sat
    const diff = js === 0 ? -6 : 1 - js; // move to Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });
  const [teacherBusy, setTeacherBusy] = useState([]);
  const [roomBusy, setRoomBusy] = useState([]);
  const [pickedSlots, setPickedSlots] = useState([]);
  const { error, success } = useToast();

  // Derived state from selected semester
  const selectedSemester = useMemo(
    () => semesters.find((s) => s.id === parseInt(semesterId)),
    [semesters, semesterId]
  );

  useEffect(() => {
    if (open) {
      loadSubjects();
      loadRooms();
      loadSemesters();
      loadTimeSlots();
      resetForm();
    }
  }, [open]);

  // Reload teachers when subject changes
  useEffect(() => {
    if (open && subjectId) {
      loadTeachers();
      setTeacherId("");
      setTeacherBusy([]);
    }
    // loadTeachers defined stable (no deps) so safe to ignore lint
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId, open]);

  async function loadSubjects() {
    try {
      const data = await subjectService.all();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadTeachers() {
    try {
      const subjectIdParam = subjectId ? parseInt(subjectId) : null;
      const teacherList = await teacherService.list(subjectIdParam);
      setTeachers(Array.isArray(teacherList) ? teacherList : []);
    } catch (e) {
      console.error(e);
      setTeachers([]);
    }
  }

  async function loadRooms() {
    try {
      const data = await classroomService.search("", "OFFLINE");
      setRooms(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setRooms([]);
    }
  }

  async function loadSemesters() {
    try {
      const data = await semesterService.getOpenSemesters();
      setSemesters(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setSemesters([]);
    }
  }

  async function loadTimeSlots() {
    try {
      const data = await timeslotService.list();
      setTimeSlots(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setTimeSlots([]);
    }
  }

  const loadTeacherBusy = React.useCallback(async () => {
    if (!teacherId || !selectedSemester) {
      return;
    }
    try {
      const fromDate = new Date(selectedSemester.startDate).toISOString();
      const toDate = new Date(selectedSemester.endDate).toISOString();

      console.log("🔍 Loading teacher busy slots...", {
        teacherId,
        fromDate,
        toDate,
      });

      const data = await teacherService.getFreeBusy(
        teacherId,
        fromDate,
        toDate
      );

      console.log("📅 Teacher busy slots received:", data);
      setTeacherBusy(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setTeacherBusy([]);
    }
  }, [teacherId, selectedSemester]);

  useEffect(() => {
    loadTeacherBusy();
  }, [loadTeacherBusy]);

  const loadRoomBusy = React.useCallback(async () => {
    if (!roomId || !selectedSemester) {
      return;
    }
    try {
      const fromDate = new Date(selectedSemester.startDate).toISOString();
      const toDate = new Date(selectedSemester.endDate).toISOString();

      const data = await classroomService.getFreeBusy(roomId, fromDate, toDate);

      setRoomBusy(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setRoomBusy([]);
    }
  }, [roomId, selectedSemester]);

  useEffect(() => {
    loadRoomBusy();
  }, [loadRoomBusy]);

  // khi chọn phòng, auto set capacity
  useEffect(() => {
    if (!roomId) {
      setCapacity("");
      return;
    }
    const r = rooms.find((x) => String(x.id) === String(roomId));
    if (r) setCapacity(String(r.capacity || 0));
  }, [roomId, rooms]);

  function toggleSlot(slot) {
    console.log("[DEBUG] toggleSlot called with:", slot);
    setPickedSlots((prev) => {
      const exists = prev.some(
        (s) => s.isoStart === slot.isoStart && s.isoEnd === slot.isoEnd
      );
      const newSlots = exists
        ? prev.filter(
            (s) => !(s.isoStart === slot.isoStart && s.isoEnd === slot.isoEnd)
          )
        : [...prev, slot];
      console.log("[DEBUG] pickedSlots updated to:", newSlots);
      return newSlots;
    });
  }

  const formValid = useMemo(() => {
    return (
      className.trim() &&
      classCode.trim() &&
      subjectId &&
      teacherId &&
      roomId &&
      capacity &&
      parseInt(capacity) > 0 &&
      semesterId &&
      totalSessions &&
      parseInt(totalSessions) > 0 &&
      pickedSlots.length > 0
    );
  }, [
    className,
    classCode,
    subjectId,
    teacherId,
    roomId,
    capacity,
    semesterId,
    totalSessions,
    pickedSlots,
  ]);

  function resetForm() {
    setClassName("");
    setClassCode("");
    setSubjectId("");
    setTeacherId("");
    setRoomId("");
    setCapacity("");
    setSemesterId("");
    setTotalSessions("");
    setDesc("");
    setPickedSlots([]);
    setTeacherBusy([]);
    setRoomBusy([]);
  }

  // Helper function to map picked slots to backend format
  function mapSlotsToSchedule() {
    const scheduleMap = new Map();

    pickedSlots.forEach((slot) => {
      const slotDate = new Date(slot.isoStart);
      const dayOfWeek = slotDate.getDay(); // 0=Sunday, 1=Monday, ...

      // Find matching timeSlot by comparing start time
      const slotTimeStr = slotDate.toTimeString().substring(0, 5); // "HH:mm"
      const matchingTimeSlot = timeSlots.find(
        (ts) => ts.startTime === slotTimeStr
      );

      if (matchingTimeSlot) {
        const key = `${dayOfWeek}-${matchingTimeSlot.id}`;
        if (!scheduleMap.has(key)) {
          scheduleMap.set(key, {
            dayOfWeek,
            timeSlotId: matchingTimeSlot.id,
          });
        }
      }
    });

    return Array.from(scheduleMap.values());
  }

  async function handleSubmit() {
    if (!formValid || submitting) return;
    setSubmitting(true);
    try {
      const schedules = mapSlotsToSchedule();

      if (schedules.length === 0) {
        error("Không thể xác định lịch học. Vui lòng chọn lại slot!");
        setSubmitting(false);
        return;
      }

      // Validate active states
      const subj = subjects.find((s) => String(s.id) === String(subjectId));
      if (!subj || subj.active === false) {
        error("Môn học đang không hoạt động hoặc bị khóa");
        setSubmitting(false);
        return;
      }
      const teacher = teachers.find(
        (t) => String(t.userId || t.id) === String(teacherId)
      );
      if (!teacher || teacher.active === false) {
        error("Giáo viên đang không hoạt động hoặc bị khóa");
        setSubmitting(false);
        return;
      }
      const room = rooms.find((r) => String(r.id) === String(roomId));
      if (!room || room.enabled === false) {
        error("Phòng học đang không hoạt động hoặc bị khóa");
        setSubmitting(false);
        return;
      }

      const payload = {
        name: className,
        code: classCode,
        subjectId: parseInt(subjectId),
        teacherId: parseInt(teacherId),
        roomId: parseInt(roomId),
        maxStudents: parseInt(capacity), // backend expects maxStudents, not capacity
        semesterId: parseInt(semesterId),
        totalSessions: parseInt(totalSessions),
        description: desc,
        schedule: schedules, // backend expects 'schedule' not 'schedules'
      };

      await classService.create(payload);
      success("Tạo lớp offline thành công");
      onCreated?.();
      onClose?.();
      resetForm();
    } catch (e) {
      console.error("Create offline class error:", e);

      // ✅ Hiển thị lỗi chi tiết từ backend
      let errorMessage = "Không thể tạo lớp offline";

      if (e.response?.data?.message) {
        // Backend trả về message cụ thể
        errorMessage = e.response.data.message;
      } else if (e.response?.data?.error) {
        // Hoặc trong field error
        errorMessage = e.response.data.error;
      } else if (e.message) {
        // Hoặc lỗi từ axios/network
        errorMessage = `Lỗi: ${e.message}`;
      }

      error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose} size="xl">
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0">
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-5 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarCheck2 className="h-6 w-6" />
            Tạo lớp học Offline
          </h2>
          <p className="text-sm text-orange-100 mt-1">
            Chọn phòng học, sĩ số tự động theo sức chứa
          </p>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-180px)] px-6 py-6">
          <div className="space-y-6">
            {/* Thông tin cơ bản */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-600 rounded"></div>
                Thông tin cơ bản
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Tên lớp <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="VD: Toán 10A1"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Mã lớp <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                    placeholder="VD: TOAN10A1"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Môn học <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={String(subjectId)}
                    onValueChange={setSubjectId}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Chọn môn học" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Sĩ số tối đa
                  </label>
                  <Input
                    type="number"
                    value={capacity}
                    readOnly
                    className="h-11 bg-gray-100"
                  />
                  <p className="text-xs text-gray-500">
                    Tự động theo sức chứa phòng đã chọn
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Học kỳ <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={String(semesterId)}
                    onValueChange={setSemesterId}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Chọn học kỳ" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((sem) => (
                        <SelectItem key={sem.id} value={String(sem.id)}>
                          {sem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedSemester && (
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(selectedSemester.startDate).toLocaleDateString(
                        "vi-VN"
                      )}{" "}
                      -{" "}
                      {new Date(selectedSemester.endDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Tổng số buổi học <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={totalSessions}
                    onChange={(e) => setTotalSessions(e.target.value)}
                    placeholder="VD: 30"
                    className="h-11"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Mô tả
                  </label>
                  <Textarea
                    rows={3}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Mô tả (tuỳ chọn)"
                    className="resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Giáo viên & Phòng học */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-green-600 rounded"></div>
                Giáo viên & Phòng học
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    Giáo viên <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500">
                      ({teachers.length})
                    </span>
                  </label>
                  <Select
                    value={String(teacherId)}
                    onValueChange={setTeacherId}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Chọn giáo viên" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((t) => (
                        <SelectItem key={t.userId} value={String(t.userId)}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{t.fullName}</span>
                            <span className="text-gray-500 text-xs">
                              ({t.email || t.username})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-orange-600" />
                    Phòng học <span className="text-red-500">*</span>
                  </label>
                  <Select value={String(roomId)} onValueChange={setRoomId}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Chọn phòng học" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{r.name}</span>
                            <span className="text-gray-500 text-xs">
                              (Sức chứa: {r.capacity || 0})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Lịch học */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-purple-600 rounded"></div>
                Lịch học
              </h3>
              <ScheduleGrid
                timeSlots={timeSlots}
                weekStart={weekStart}
                teacherBusy={teacherBusy}
                roomBusy={roomBusy}
                selected={pickedSlots}
                onToggle={toggleSlot}
                disabled={!teacherId || !roomId}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-white px-6 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Trường đánh dấu (*) là bắt buộc</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} className="px-6 h-11">
              Hủy bỏ
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formValid || submitting}
              className="px-6 h-11 bg-amber-600 hover:bg-amber-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <CalendarCheck2 className="h-4 w-4 mr-2" />
                  Tạo lớp Offline
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
