/**
 * CreateOnlineClassModal - Tạo lớp học Online
 * - Có trường Link Meet (bắt buộc)
 * - Sĩ số tối đa: nhập tay (bắt buộc)
 * - Không chọn phòng
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
import { Loader2, CalendarCheck2, Users, Link2 } from "lucide-react";

import ScheduleGrid from "../schedule/ScheduleGrid";

import { classService } from "../../../services/class/class.service";
import { subjectService } from "../../../services/subject/subject.service";
import { teacherService } from "../../../services/teacher/teacher.service";
import { semesterService } from "../../../services/semester/semester.service";
import { timeslotService } from "../../../services/timeslot/timeslot.service";
import { useToast } from "../../../hooks/use-toast";

export default function CreateOnlineClassModal({ open, onClose, onCreated }) {
  const [className, setClassName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [capacity, setCapacity] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [totalSessions, setTotalSessions] = useState("");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
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
      // Load teachers filtered by selected subject
      // If no subject selected, pass null to get all teachers
      const subjectIdParam = subjectId ? parseInt(subjectId) : null;
      const teacherList = await teacherService.list(subjectIdParam);
      setTeachers(Array.isArray(teacherList) ? teacherList : []);
    } catch (e) {
      console.error("[ERROR] Failed to load teachers:", e);
      setTeachers([]);
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

  function toggleSlot(slot) {
    setPickedSlots((prev) => {
      const exists = prev.some(
        (s) => s.isoStart === slot.isoStart && s.isoEnd === slot.isoEnd
      );
      return exists
        ? prev.filter(
            (s) => !(s.isoStart === slot.isoStart && s.isoEnd === slot.isoEnd)
          )
        : [...prev, slot];
    });
  }

  function isValidUrl(url) {
    try {
      const u = new URL(url);
      return ["http:", "https:"].includes(u.protocol);
    } catch {
      return false;
    }
  }

  const formValid = useMemo(() => {
    return (
      className.trim() &&
      classCode.trim() &&
      subjectId &&
      teacherId &&
      capacity &&
      parseInt(capacity) > 0 &&
      semesterId &&
      totalSessions &&
      parseInt(totalSessions) > 0 &&
      pickedSlots.length > 0 &&
      isValidUrl(meetingLink)
    );
  }, [
    className,
    classCode,
    subjectId,
    teacherId,
    capacity,
    semesterId,
    totalSessions,
    pickedSlots,
    meetingLink,
  ]);

  function resetForm() {
    setClassName("");
    setClassCode("");
    setSubjectId("");
    setTeacherId("");
    setCapacity("");
    setMeetingLink("");
    setSemesterId("");
    setTotalSessions("");
    setDesc("");
    setPickedSlots([]);
    setTeacherBusy([]);
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
      if (!subj) {
        error("Không tìm thấy môn học được chọn");
        setSubmitting(false);
        return;
      }
      if (subj.status !== "AVAILABLE") {
        error("Môn học đang không khả dụng");
        setSubmitting(false);
        return;
      }

      const teacher = teachers.find(
        (t) => String(t.userId) === String(teacherId)
      );

      if (!teacher) {
        error(`Không tìm thấy giáo viên với ID ${teacherId}`);
        setSubmitting(false);
        return;
      }
      if (teacher.active === false) {
        error("Giáo viên đang không hoạt động hoặc bị khóa");
        setSubmitting(false);
        return;
      }

      const payload = {
        name: className,
        code: classCode,
        subjectId: parseInt(subjectId),
        teacherId: parseInt(teacherId),
        roomId: null,
        maxStudents: parseInt(capacity),
        semesterId: parseInt(semesterId),
        totalSessions: parseInt(totalSessions),
        description: desc,
        meetingLink: meetingLink.trim(),
        schedule: schedules,
      };

      await classService.create(payload);
      success("Tạo lớp online thành công");
      onCreated?.();
      onClose?.();
      resetForm();
    } catch (e) {
      console.error("Create online class error:", e);

      // ✅ Hiển thị lỗi chi tiết từ backend
      let errorMessage = "Không thể tạo lớp online";

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
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 px-6 py-5 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarCheck2 className="h-6 w-6" />
            Tạo lớp học Online
          </h2>
          <p className="text-sm text-blue-100 mt-1">
            Nhập Link Meet và thông tin lớp học
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
                    placeholder="VD: Lập trình React cơ bản"
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
                    placeholder="VD: REACT01"
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
                    Sĩ số tối đa <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="VD: 50"
                    className="h-11"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-indigo-600" />
                    Link Meet <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    className="h-11"
                  />
                  {meetingLink && !isValidUrl(meetingLink) && (
                    <div className="text-xs text-red-600 mt-1">
                      Link không hợp lệ. Vui lòng nhập URL bắt đầu bằng
                      http(s)://
                    </div>
                  )}
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

            {/* Giáo viên */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-green-600 rounded"></div>
                Giáo viên
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
                      {teachers.length === 0 ? (
                        <div className="p-2 text-center text-sm text-gray-500">
                          Không có giáo viên nào
                        </div>
                      ) : (
                        teachers.map((t) => (
                          <SelectItem key={t.userId} value={String(t.userId)}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{t.fullName}</span>
                              <span className="text-gray-500 text-xs">
                                ({t.email || `ID: ${t.userId}`})
                              </span>
                              {!t.active && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                  Vô hiệu hóa
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
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
                weekStart={weekStart}
                timeSlots={timeSlots}
                teacherBusy={teacherBusy}
                roomBusy={[]}
                selected={pickedSlots}
                onToggle={toggleSlot}
                disabled={!teacherId || !semesterId}
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
              className="px-6 h-11 bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <CalendarCheck2 className="h-4 w-4 mr-2" />
                  Tạo lớp Online
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
