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

  const [weekStart] = useState(new Date());
  const [teacherBusy, setTeacherBusy] = useState([]);
  const [roomBusy, setRoomBusy] = useState([]);
  const [pickedSlots, setPickedSlots] = useState([]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Reload teachers when subject changes
  useEffect(() => {
    if (open && subjectId) {
      loadTeachers();
      // Reset teacher selection when subject changes
      setTeacherId("");
      setTeacherBusy([]);
    }
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
      // Load teachers filtered by selected subject
      // If no subject selected, pass null to get all teachers
      const subjectIdParam = subjectId ? parseInt(subjectId) : null;
      console.log("[DEBUG] Loading teachers with subjectId:", subjectIdParam);
      const teacherList = await teacherService.list(subjectIdParam);
      console.log("[DEBUG] Teachers loaded:", teacherList);
      setTeachers(Array.isArray(teacherList) ? teacherList : []);
    } catch (e) {
      console.error("[ERROR] Failed to load teachers:", e);
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
      console.log("[DEBUG] TimeSlots loaded from BE:", data);
      setTimeSlots(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("[ERROR] Failed to load timeSlots:", e);
      setTimeSlots([]);
    }
  }

  const loadTeacherBusy = React.useCallback(async () => {
    if (!teacherId || !selectedSemester) {
      console.log(
        "[DEBUG] Skipping loadTeacherBusy - teacherId:",
        teacherId,
        "selectedSemester:",
        selectedSemester
      );
      return;
    }
    try {
      const fromDate = new Date(selectedSemester.startDate).toISOString();
      const toDate = new Date(selectedSemester.endDate).toISOString();
      console.log(
        "[DEBUG] Loading teacher busy slots - teacherId:",
        teacherId,
        "from:",
        fromDate,
        "to:",
        toDate
      );

      const data = await teacherService.getFreeBusy(
        teacherId,
        fromDate,
        toDate
      );

      console.log("[DEBUG] Teacher busy slots received:", data);
      setTeacherBusy(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("[ERROR] Failed to load teacher busy slots:", e);
      setTeacherBusy([]);
    }
  }, [teacherId, selectedSemester]);

  useEffect(() => {
    loadTeacherBusy();
  }, [loadTeacherBusy]);

  const loadRoomBusy = React.useCallback(async () => {
    if (!roomId || !selectedSemester) {
      console.log(
        "[DEBUG] Skipping loadRoomBusy - roomId:",
        roomId,
        "selectedSemester:",
        selectedSemester
      );
      return;
    }
    try {
      const fromDate = new Date(selectedSemester.startDate).toISOString();
      const toDate = new Date(selectedSemester.endDate).toISOString();
      console.log(
        "[DEBUG] Loading room busy slots - roomId:",
        roomId,
        "from:",
        fromDate,
        "to:",
        toDate
      );

      const data = await classroomService.getFreeBusy(roomId, fromDate, toDate);

      console.log("[DEBUG] Room busy slots received:", data);
      setRoomBusy(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("[ERROR] Failed to load room busy slots:", e);
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

    console.log("[DEBUG] pickedSlots:", pickedSlots);
    console.log("[DEBUG] timeSlots from BE:", timeSlots);

    pickedSlots.forEach((slot) => {
      const slotDate = new Date(slot.isoStart);
      const jsDay = slotDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

      // Convert JS day (0-6) to business convention (2-8): Mon=2, Tue=3, ..., Sun=8
      const dayOfWeek = jsDay === 0 ? 8 : jsDay + 1;

      // Find matching timeSlot by comparing start time
      const slotTimeStr = slotDate.toTimeString().substring(0, 5); // "HH:mm"
      console.log("[DEBUG] Looking for timeSlot with startTime:", slotTimeStr);

      const matchingTimeSlot = timeSlots.find((ts) => {
        console.log("[DEBUG] Comparing with ts.startTime:", ts.startTime);
        return ts.startTime === slotTimeStr;
      });

      console.log("[DEBUG] matchingTimeSlot found:", matchingTimeSlot);

      if (matchingTimeSlot) {
        const key = `${dayOfWeek}-${matchingTimeSlot.id}`;
        if (!scheduleMap.has(key)) {
          scheduleMap.set(key, {
            dayOfWeek,
            timeSlotId: matchingTimeSlot.id,
          });
        }
      } else {
        console.warn(
          "[WARN] No matching timeSlot for:",
          slotTimeStr,
          "Available timeSlots:",
          timeSlots
        );
      }
    });

    const result = Array.from(scheduleMap.values());
    console.log("[DEBUG] Final schedules mapped:", result);
    return result;
  }

  async function handleSubmit() {
    if (!formValid || submitting) return;
    setSubmitting(true);
    try {
      const schedules = mapSlotsToSchedule();

      if (schedules.length === 0) {
        alert("Không thể xác định lịch học. Vui lòng chọn lại!");
        setSubmitting(false);
        return;
      }

      const payload = {
        name: className,
        code: classCode,
        subjectId: parseInt(subjectId),
        teacherId: parseInt(teacherId),
        roomId: parseInt(roomId),
        capacity: parseInt(capacity), // auto from room
        semesterId: parseInt(semesterId),
        totalSessions: parseInt(totalSessions),
        description: desc,
        schedule: schedules, // Changed from 'schedules' to 'schedule' to match backend DTO
      };

      console.log("[DEBUG] Final payload before sending:", payload);
      await classService.create(payload);
      onCreated?.();
      onClose?.();
      resetForm();
    } catch (e) {
      console.error("Create offline class error:", e);
      alert("Không thể tạo lớp offline. Vui lòng thử lại!");
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
