/**
 * CreateOnlineClassPage - Page tạo lớp học Online (thay thế modal)
 * Layout 2 steps tương tự Offline nhưng:
 * - Có Link Meet thay vì Phòng học
 * - Capacity giới hạn tối đa 30
 */
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Loader2,
  CalendarCheck2,
  Users,
  Link2,
  Eye,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import ScheduleGrid from "../schedule/ScheduleGrid";

import { classService } from "../../../services/class/class.service";
import { subjectService } from "../../../services/subject/subject.service";
import { teacherService } from "../../../services/teacher/teacher.service";
import { timeslotService } from "../../../services/timeslot/timeslot.service";
import { courseApi } from "../../../services/course/course.api";
import { useToast } from "../../../hooks/use-toast";
import { formatCurrency } from "../../../helper/formatters";

export default function CreateOnlineClassPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [subjectId, setSubjectId] = useState("");
  const [courseId, setCourseId] = useState(""); // Khóa học của môn (tùy chọn)
  const [desc, setDesc] = useState("");
  const [capacity, setCapacity] = useState("");
  const [pricePerSession, setPricePerSession] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [totalSessions, setTotalSessions] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]); // Danh sách khóa học theo môn
  const [teachers, setTeachers] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  const [weekStart] = useState(() => {
    const now = new Date();
    const js = now.getDay();
    const diff = js === 0 ? -6 : 1 - js;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });
  const [teacherBusy, setTeacherBusy] = useState([]);
  const [pickedSlots, setPickedSlots] = useState([]);
  const { error, success } = useToast();

  // Helpers: giữ state dạng số (digits-only), hiển thị dạng có dấu . theo VN
  const digitsOnly = (val) => (val || "").replace(/\D/g, "");
  const formatVNNumber = (digits) =>
    (digits || "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  useEffect(() => {
    loadSubjects();
    loadTimeSlots();
  }, []);

  useEffect(() => {
    if (subjectId) {
      loadCourses();
      loadTeachers(); // Load giáo viên ngay khi chọn môn
      setCourseId("");
      setTeacherId("");
      setTeacherBusy([]);
    } else {
      setCourses([]);
      setCourseId("");
      setTeachers([]);
      setTeacherId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  async function loadSubjects() {
    try {
      const data = await subjectService.all();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadCourses() {
    try {
      // Chỉ lấy các khóa học hợp lệ do admin tạo (APPROVED), loại bỏ khóa cá nhân/đã chỉnh sửa
      const data = await courseApi.list({
        subjectId: parseInt(subjectId),
        status: "APPROVED",
      });
      const filtered = (Array.isArray(data) ? data : []).filter((c) => {
        const hasSourceTag = String(c.description || "").includes("[[SOURCE:");
        const isPersonal = c && c.ownerTeacherId != null;
        return !hasSourceTag && !isPersonal;
      });
      setCourses(filtered);
    } catch (e) {
      console.error(e);
      setCourses([]);
    }
  }

  async function loadTeachers() {
    try {
      if (subjectId) {
        // Load tất cả giáo viên dạy môn này
        // (1 GV dạy môn nào thì dạy được tất cả course của môn đó)
        const subjectIdParam = parseInt(subjectId);
        const teacherList = await teacherService.list(subjectIdParam);
        setTeachers(Array.isArray(teacherList) ? teacherList : []);
      } else {
        setTeachers([]);
      }
    } catch (e) {
      console.error(e);
      setTeachers([]);
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
    if (!teacherId || !startDate) return;
    try {
      const fromDate = new Date(startDate).toISOString();
      const toDate = new Date(
        new Date(startDate).getTime() + 365 * 24 * 60 * 60 * 1000
      ).toISOString();
      const data = await teacherService.getFreeBusy(
        teacherId,
        fromDate,
        toDate
      );
      if (Array.isArray(data)) {
        const busyMapped = data
          .filter((b) => b && b.start && b.end)
          .map((b) => {
            const d = new Date(b.start);
            const day = d.getDay();
            const hhmm = String(b.start).substring(11, 16);
            const ts = timeSlots.find((t) => t.startTime === hhmm);
            return ts
              ? { day, slotId: ts.id, start: b.start, end: b.end }
              : null;
          })
          .filter(Boolean);
        setTeacherBusy(busyMapped);
      } else {
        setTeacherBusy([]);
      }
    } catch (e) {
      console.error(e);
      setTeacherBusy([]);
    }
  }, [teacherId, startDate, timeSlots]);

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

  const className = useMemo(() => {
    const subj = subjects.find((s) => String(s.id) === String(subjectId));
    const teacher = teachers.find(
      (t) => String(t.userId || t.id) === String(teacherId)
    );
    // Yêu cầu: Tên giáo viên + Tên môn học (+ ID lớp do BE gắn sau khi tạo)
    if (subj && teacher) return `${teacher.fullName} - ${subj.name}`;
    return "";
  }, [subjectId, teacherId, subjects, teachers]);

  const todayStr = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.toISOString().slice(0, 10);
  }, []);

  useEffect(() => {
    if (!startDate || !totalSessions || !pickedSlots.length) {
      setEndDate("");
      return;
    }

    // Tạo map: dayOfWeek -> số slot trong ngày đó
    const slotCountByDay = {};
    pickedSlots.forEach((slot) => {
      const day = new Date(slot.isoStart).getDay();
      slotCountByDay[day] = (slotCountByDay[day] || 0) + 1;
    });

    // Tính tổng slot/tuần
    const slotsPerWeek = Object.values(slotCountByDay).reduce(
      (sum, count) => sum + count,
      0
    );
    if (slotsPerWeek === 0) {
      setEndDate("");
      return;
    }

    // Duyệt từng ngày, đếm slot cho đến khi đủ totalSessions
    const targetSlots = parseInt(totalSessions);
    let countedSlots = 0;
    let current = new Date(startDate);
    let lastDate = null;
    const maxIterations = Math.ceil(targetSlots / slotsPerWeek) * 7 + 14;
    let iterations = 0;

    while (countedSlots < targetSlots && iterations < maxIterations) {
      const dayOfWeek = current.getDay();
      const slotsOnThisDay = slotCountByDay[dayOfWeek] || 0;

      if (slotsOnThisDay > 0) {
        countedSlots += slotsOnThisDay;
        lastDate = new Date(current);
      }

      current.setDate(current.getDate() + 1);
      iterations++;
    }

    if (lastDate) {
      setEndDate(lastDate.toISOString().slice(0, 10));
    } else {
      setEndDate("");
    }
  }, [startDate, totalSessions, pickedSlots]);

  const step1Valid = useMemo(() => {
    return (
      subjectId &&
      capacity &&
      parseInt(capacity) > 0 &&
      parseInt(capacity) <= 30 &&
      pricePerSession !== "" &&
      parseInt(pricePerSession) >= 0 &&
      teacherId &&
      className &&
      totalSessions &&
      parseInt(totalSessions) > 0 &&
      startDate &&
      startDate >= todayStr &&
      endDate &&
      pickedSlots.length > 0 &&
      isValidUrl(meetingLink)
    );
  }, [
    subjectId,
    capacity,
    pricePerSession,
    teacherId,
    className,
    totalSessions,
    startDate,
    todayStr,
    endDate,
    pickedSlots,
    meetingLink,
  ]);

  function mapSlotsToSchedule() {
    const scheduleMap = new Map();
    pickedSlots.forEach((slot) => {
      const slotDate = new Date(slot.isoStart);
      const dayOfWeekJS = slotDate.getDay();
      const dayOfWeek = dayOfWeekJS === 0 ? 7 : dayOfWeekJS;
      const slotTimeStr = slotDate.toTimeString().substring(0, 5);
      const matchingTimeSlot = timeSlots.find(
        (ts) => ts.startTime === slotTimeStr
      );
      if (matchingTimeSlot) {
        const key = `${dayOfWeek}-${matchingTimeSlot.id}`;
        if (!scheduleMap.has(key)) {
          scheduleMap.set(key, { dayOfWeek, timeSlotId: matchingTimeSlot.id });
        }
      }
    });
    return Array.from(scheduleMap.values());
  }

  async function handleSubmit() {
    if (!step1Valid || submitting) return;
    setSubmitting(true);
    try {
      const schedules = mapSlotsToSchedule();
      if (schedules.length === 0) {
        error("Không thể xác định lịch học. Vui lòng chọn lại slot!");
        setSubmitting(false);
        return;
      }

      // Validate: Giáo viên không được dạy quá 3 slot/ngày thường, 5 slot/ngày cuối tuần
      const slotsPerDay = {};
      schedules.forEach((s) => {
        slotsPerDay[s.dayOfWeek] = (slotsPerDay[s.dayOfWeek] || 0) + 1;
      });
      for (const [day, count] of Object.entries(slotsPerDay)) {
        const dayOfWeek = parseInt(day);
        const dayNames = [
          "",
          "Thứ 2",
          "Thứ 3",
          "Thứ 4",
          "Thứ 5",
          "Thứ 6",
          "Thứ 7",
          "Chủ nhật",
        ];

        // Thứ 7 (6) và Chủ nhật (7): tối đa 5 slot
        if (dayOfWeek === 6 || dayOfWeek === 7) {
          if (count > 5) {
            error(
              `Giáo viên không được dạy quá 5 slot vào cuối tuần (vi phạm: ${dayNames[dayOfWeek]} có ${count} slot)`
            );
            setSubmitting(false);
            return;
          }
        } else {
          // Các ngày thường (Thứ 2-6): tối đa 3 slot
          if (count > 3) {
            error(
              `Giáo viên không được dạy quá 3 slot vào ngày thường (vi phạm: ${dayNames[dayOfWeek]} có ${count} slot)`
            );
            setSubmitting(false);
            return;
          }
        }
      }

      const subj = subjects.find((s) => String(s.id) === String(subjectId));
      if (!subj || subj.status !== "AVAILABLE") {
        error("Môn học không khả dụng");
        setSubmitting(false);
        return;
      }

      const teacher = teachers.find(
        (t) => String(t.userId) === String(teacherId)
      );
      if (!teacher || teacher.active === false) {
        error("Giáo viên không hoạt động");
        setSubmitting(false);
        return;
      }

      const payload = {
        // BE có thể nối thêm ID lớp sau khi tạo
        name: className,
        subjectId: parseInt(subjectId),
        courseId: courseId ? parseInt(courseId) : null,
        teacherId: parseInt(teacherId),
        roomId: null,
        maxStudents: parseInt(capacity),
        totalSessions: parseInt(totalSessions),
        pricePerSession: parseInt(pricePerSession),
        description: desc,
        startDate,
        endDate,
        meetingLink: meetingLink.trim(),
        schedule: schedules,
      };

      await classService.create(payload);
      success("Tạo lớp online thành công");
      navigate("/home/admin/class");
    } catch (e) {
      console.error("Create online class error:", e);
      let errorMessage = "Không thể tạo lớp online";
      if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e.response?.data?.error) {
        errorMessage = e.response.data.error;
      } else if (e.message) {
        errorMessage = `Lỗi: ${e.message}`;
      }
      error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  const selectedSubject = subjects.find(
    (s) => String(s.id) === String(subjectId)
  );
  const selectedTeacher = teachers.find(
    (t) => String(t.userId) === String(teacherId)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
      {/* Header - Glassmorphism */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg shadow-indigo-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Title */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => {
                  if (currentStep === 2) {
                    setCurrentStep(1);
                  } else {
                    navigate("/home/admin/class");
                  }
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Tạo lớp học Online
                </h1>
                <p className="text-sm text-gray-600">Học từ xa qua Internet</p>
              </div>
            </div>

            {/* Right: Steps - Pill Style */}
            <div className="hidden md:flex items-center gap-4">
              <div
                className={`flex items-center gap-3 px-5 py-2.5 rounded-full transition-all ${
                  currentStep === 1
                    ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-sm font-semibold">1</span>
                </div>
                <span className="text-sm font-semibold">
                  Thông tin & Lịch học
                </span>
              </div>
              <div
                className={`flex items-center gap-3 px-5 py-2.5 rounded-full transition-all ${
                  currentStep === 2
                    ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <Eye className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold">Xem trước</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps moved to header above */}

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {currentStep === 1 && (
          <div className="grid grid-cols-[380px_1fr] gap-6 items-stretch">
            {/* Left: Thông tin cơ bản - Frosted Card */}
            <div className="rounded-2xl p-5 h-[calc(100vh-250px)] overflow-y-auto sticky top-24 bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg shadow-indigo-500/20">
              <div className="mb-5">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-500/30 w-full">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl flex-shrink-0">
                    🌐
                  </div>
                  <div>
                    <h2 className="text-base font-semibold">Lớp học Online</h2>
                    <p className="text-xs text-white/80">
                      Học từ xa qua Internet
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Ngày bắt đầu + Ngày kết thúc */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      min={todayStr}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-10 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Ngày kết thúc <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      readOnly
                      className="h-10 text-sm bg-gray-50"
                    />
                  </div>
                </div>

                {/* Môn học */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Môn học <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={String(subjectId)}
                    onValueChange={setSubjectId}
                  >
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue placeholder="Chọn môn" />
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

                {/* Khóa học của môn (tùy chọn) */}
                {subjectId && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Khóa học của môn
                      <span className="ml-1 text-xs text-gray-500">
                        (Tùy chọn)
                      </span>
                    </label>
                    <Select
                      value={String(courseId)}
                      onValueChange={setCourseId}
                    >
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue placeholder="Chọn khóa học (không bắt buộc)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">-- Không chọn --</SelectItem>
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Khóa học này sẽ được liên kết với lớp học
                    </p>
                  </div>
                )}

                {/* Giáo viên */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Giáo viên <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={String(teacherId)}
                    onValueChange={setTeacherId}
                    disabled={!subjectId}
                  >
                    <SelectTrigger className="w-full h-10 text-sm">
                      <SelectValue placeholder="Chọn GV" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((t) => (
                        <SelectItem key={t.userId} value={String(t.userId)}>
                          {t.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {subjectId && teachers.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      Không có giáo viên dạy môn này
                    </p>
                  )}
                </div>

                {/* Số buổi */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Số buổi <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={totalSessions}
                    onChange={(e) => setTotalSessions(e.target.value)}
                    placeholder="24"
                    className="h-10 text-sm"
                  />
                </div>

                {/* Link Meet + Sĩ số */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Link Meet <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://meet.google.com/..."
                      className="h-10 text-sm"
                    />
                    {meetingLink && !isValidUrl(meetingLink) && (
                      <p className="text-xs text-red-600 mt-1">
                        Link không hợp lệ. Nhập URL http(s)://
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Sĩ số <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      placeholder="Tối đa 30"
                      className="h-10 text-sm"
                    />
                    {capacity && parseInt(capacity) > 30 && (
                      <p className="text-xs text-red-600 mt-1">
                        Sĩ số không vượt quá 30
                      </p>
                    )}
                  </div>
                </div>

                {/* Giá tiền mỗi buổi học (VNĐ) */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Giá tiền mỗi buổi học (VNĐ){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={formatVNNumber(pricePerSession)}
                    onChange={(e) =>
                      setPricePerSession(digitsOnly(e.target.value))
                    }
                    placeholder="Ví dụ: 150.000"
                    className="h-10 text-sm"
                  />
                  {pricePerSession !== "" && parseInt(pricePerSession) < 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      Giá tiền mỗi buổi học phải ≥ 0
                    </p>
                  )}
                </div>

                {/* Tên lớp */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Tên lớp
                  </label>
                  <Input
                    value={className}
                    placeholder="Tự động từ môn & GV"
                    readOnly
                    className="w-full h-10 text-sm bg-gray-50"
                  />
                </div>

                {/* Mô tả */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Mô tả
                  </label>
                  <Textarea
                    rows={2}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Mô tả về lớp..."
                    className="resize-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Right: Chọn lịch học - Glass Card */}
            <div className="rounded-2xl p-5 h-[calc(100vh-250px)] bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg shadow-indigo-500/20">
              <div className="mb-4">
                <div className="sticky top-0 z-10 -mx-5 px-5 py-3 rounded-xl text-white bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-md">
                  <h2 className="text-lg font-bold">Chọn lịch học</h2>
                </div>
                <div className="flex items-center justify-between">
                  {pickedSlots.length > 0 && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked
                        readOnly
                        className="rounded w-4 h-4"
                      />
                      <span className="text-sm text-gray-600">
                        Chi lịch rảnh
                      </span>
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    Lọc ngày: <span className="font-medium">Không có</span>
                  </div>
                </div>
              </div>

              <ScheduleGrid
                timeSlots={timeSlots}
                weekStart={weekStart}
                teacherBusy={teacherBusy}
                roomBusy={[]}
                selected={pickedSlots}
                onToggle={toggleSlot}
                disabled={!teacherId}
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="text-center py-8 px-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Xem trước lớp học
                </h2>
                <p className="text-sm text-gray-500">
                  Kiểm tra thông tin trước khi tạo
                </p>
              </div>

              {/* Content */}
              <div className="px-8 pb-8">
                {/* Blue card with class info */}
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl flex-shrink-0">
                      🌐
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">
                          {className || "Tên lớp"}
                        </h3>
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded">
                          Online
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Học từ xa qua Internet
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">
                        Môn học:
                      </label>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedSubject?.name || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">
                        Giáo viên:
                      </label>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedTeacher?.fullName || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">
                        Link Meet:
                      </label>
                      <a
                        href={meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-blue-600 hover:underline block truncate"
                      >
                        {meetingLink}
                      </a>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">
                        Sĩ số:
                      </label>
                      <p className="text-sm font-semibold text-gray-900">
                        {capacity} học sinh
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">
                        Thời gian:
                      </label>
                      <p className="text-sm font-semibold text-gray-900">
                        {startDate} đến {endDate}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">
                        Giá tiền mỗi buổi học:
                      </label>
                      <p className="text-sm font-semibold text-gray-900">
                        {pricePerSession !== ""
                          ? formatCurrency(parseInt(pricePerSession))
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">
                        Tổng giá tiền của lớp học:
                      </label>
                      <p className="text-sm font-semibold text-gray-900">
                        {pricePerSession !== "" && totalSessions
                          ? formatCurrency(
                              parseInt(pricePerSession) *
                                parseInt(totalSessions)
                            )
                          : "-"}
                      </p>
                    </div>
                    {desc && (
                      <div className="col-span-2">
                        <label className="text-xs font-medium text-gray-500 block mb-1">
                          Mô tả:
                        </label>
                        <p className="text-sm font-semibold text-gray-900">
                          {desc}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Schedule Summary */}
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarCheck2 className="h-5 w-5 text-blue-600" />
                    <h4 className="text-sm font-semibold text-gray-900">
                      Lịch học ({pickedSlots.length} buổi)
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pickedSlots.map((slot, idx) => {
                      const d = new Date(slot.isoStart);
                      const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
                      const timeStr = d.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      return (
                        <div
                          key={idx}
                          className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-lg text-sm font-medium"
                        >
                          {days[d.getDay()]} - {timeStr}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-between">
          <div>
            {currentStep === 2 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="px-6 h-11 rounded-xl"
              >
                Hủy
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {currentStep === 1 && (
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!step1Valid}
                className="px-8 h-11 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
              >
                Tiếp tục
              </Button>
            )}
            {currentStep === 2 && (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 h-11 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <CalendarCheck2 className="h-4 w-4 mr-2" />
                    Xác nhận
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
