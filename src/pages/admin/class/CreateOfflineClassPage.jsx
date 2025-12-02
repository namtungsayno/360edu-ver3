/**
 * CreateOfflineClassPage - Page tạo lớp học Offline (thay thế modal)
 * Layout 2 steps:
 * - Step 1: Thông tin cơ bản & Chọn lịch học
 * - Step 2: Xem trước & Xác nhận
 */
import React, { useEffect, useMemo, useState, useCallback } from "react";
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
  Building2,
  Eye,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import ScheduleGrid from "../schedule/ScheduleGrid";

import { classService } from "../../../services/class/class.service";
import { subjectService } from "../../../services/subject/subject.service";
import { teacherService } from "../../../services/teacher/teacher.service";
import { classroomService } from "../../../services/classrooms/classroom.service";
import { timeslotService } from "../../../services/timeslot/timeslot.service";
import { courseApi } from "../../../services/course/course.api";
import { useToast } from "../../../hooks/use-toast";
import { formatCurrency } from "../../../helper/formatters";

export default function CreateOfflineClassPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [subjectId, setSubjectId] = useState("");
  const [courseId, setCourseId] = useState(""); // Khóa học của môn
  const [desc, setDesc] = useState("");
  const [capacity, setCapacity] = useState("");
  const [pricePerSession, setPricePerSession] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [totalSessions, setTotalSessions] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]); // Danh sách khóa học theo môn
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  // Random code for class name (1 letter + 1 digit)
  const [randomCode, setRandomCode] = useState("");

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
  const [roomBusy, setRoomBusy] = useState([]);
  const [pickedSlots, setPickedSlots] = useState([]);
  const { error, success } = useToast();

  // Helpers: lưu state dạng số (digits-only), hiển thị dạng có dấu chấm ngăn cách nghìn
  const digitsOnly = (val) => (val || "").replace(/\D/g, "");
  const formatVNNumber = (digits) =>
    (digits || "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  useEffect(() => {
    loadSubjects();
    loadRooms();
    loadTimeSlots();
  }, []);

  // Helpers for alias + random code (FE only)
  const makeTeacherAlias = useCallback((fullName) => {
    const removeDiacritics = (s) =>
      (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    const last = removeDiacritics(parts[parts.length - 1] || "");
    if (!last) return "";
    return "GV" + last.charAt(0).toUpperCase() + last.slice(1).toLowerCase();
  }, []);
  const generateRandomCode = () => {
    try {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const nums = "0123456789";
      const arr = new Uint8Array(2);
      if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(arr);
      } else {
        arr[0] = Math.floor(Math.random() * 256);
        arr[1] = Math.floor(Math.random() * 256);
      }
      const ch = letters[arr[0] % letters.length];
      const dg = nums[arr[1] % nums.length];
      return `${ch}${dg}`;
    } catch {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const nums = "0123456789";
      return (
        letters[Math.floor(Math.random() * letters.length)] +
        nums[Math.floor(Math.random() * nums.length)]
      );
    }
  };
  // Generate once per page open
  useEffect(() => {
    setRandomCode(generateRandomCode());
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

  async function loadRooms() {
    try {
      const data = await classroomService.search("", "OFFLINE");
      setRooms(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setRooms([]);
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
      let data = await teacherService.getFreeBusy(teacherId, fromDate, toDate);
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

  const loadRoomBusy = React.useCallback(async () => {
    if (!roomId || !startDate) return;
    try {
      const fromDate = new Date(startDate).toISOString();
      const toDate = new Date(
        new Date(startDate).getTime() + 365 * 24 * 60 * 60 * 1000
      ).toISOString();
      const data = await classroomService.getFreeBusy(roomId, fromDate, toDate);
      setRoomBusy(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setRoomBusy([]);
    }
  }, [roomId, startDate]);

  useEffect(() => {
    loadRoomBusy();
  }, [loadRoomBusy]);

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

  const className = useMemo(() => {
    const subj = subjects.find((s) => String(s.id) === String(subjectId));
    const teacher = teachers.find(
      (t) => String(t.userId || t.id) === String(teacherId)
    );
    if (subj && teacher && randomCode) {
      const alias = makeTeacherAlias(teacher.fullName);
      if (!alias) return "";
      // Format: <TÊN_MÔN> - <GV_ALIAS> - <RANDOM_CODE>
      return `${subj.name} - ${alias} - ${randomCode}`;
    }
    return "";
  }, [subjectId, teacherId, subjects, teachers, randomCode, makeTeacherAlias]);

  const roomCapacity = useMemo(() => {
    const r = rooms.find((x) => String(x.id) === String(roomId));
    return r ? parseInt(r.capacity || 0) : 0;
  }, [roomId, rooms]);

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
      (!roomCapacity || parseInt(capacity) <= roomCapacity) &&
      pricePerSession !== "" &&
      parseInt(pricePerSession) >= 0 &&
      teacherId &&
      className &&
      roomId &&
      totalSessions &&
      parseInt(totalSessions) > 0 &&
      startDate &&
      startDate >= todayStr &&
      endDate &&
      pickedSlots.length > 0
    );
  }, [
    subjectId,
    capacity,
    roomCapacity,
    pricePerSession,
    teacherId,
    className,
    roomId,
    totalSessions,
    startDate,
    todayStr,
    endDate,
    pickedSlots,
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

      const room = rooms.find((r) => String(r.id) === String(roomId));
      if (!room || room.status !== "AVAILABLE") {
        error("Phòng học không khả dụng");
        setSubmitting(false);
        return;
      }

      const payload = {
        // BE có thể nối thêm ID lớp sau khi tạo
        name: className,
        subjectId: parseInt(subjectId),
        courseId: courseId ? parseInt(courseId) : null, // Thêm courseId (optional)
        teacherId: parseInt(teacherId),
        roomId: parseInt(roomId),
        maxStudents: parseInt(capacity),
        totalSessions: parseInt(totalSessions),
        pricePerSession: parseInt(pricePerSession),
        description: desc,
        startDate,
        endDate,
        schedule: schedules,
      };

      await classService.create(payload);
      success("Tạo lớp offline thành công");
      navigate("/home/admin/class");
    } catch (e) {
      console.error("Create offline class error:", e);
      let errorMessage = "Không thể tạo lớp offline";
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
  const selectedRoom = rooms.find((r) => String(r.id) === String(roomId));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50">
      {/* Header - Glassmorphism */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg shadow-green-500/20">
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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Tạo lớp học Offline
                </h1>
                <p className="text-sm text-gray-600">
                  Học trực tiếp tại trung tâm
                </p>
              </div>
            </div>

            {/* Right: Steps - Pill Style */}
            <div className="hidden md:flex items-center gap-4">
              <div
                className={`flex items-center gap-3 px-5 py-2.5 rounded-full transition-all ${
                  currentStep === 1
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
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
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
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
            <div className="rounded-2xl p-5 h-[calc(100vh-250px)] overflow-y-auto sticky top-24 bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg shadow-green-500/20">
              <div className="mb-5">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 text-white rounded-2xl shadow-lg shadow-green-500/30 w-full">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl flex-shrink-0">
                    🏫
                  </div>
                  <div>
                    <h2 className="text-base font-semibold">Lớp học Offline</h2>
                    <p className="text-xs text-white/80">
                      Học trực tiếp tại trung tâm
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Ngày bắt đầu + Ngày kết thúc trên cùng một hàng */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Ngày bắt đầu */}
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

                  {/* Ngày kết thúc */}
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

                {/* Phòng học + Sĩ số trên cùng một hàng */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Phòng học */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Phòng học <span className="text-red-500">*</span>
                    </label>
                    <Select value={String(roomId)} onValueChange={setRoomId}>
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue placeholder="Chọn phòng" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((r) => (
                          <SelectItem key={r.id} value={String(r.id)}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sĩ số */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Sĩ số <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      placeholder={
                        roomCapacity ? `Tối đa ${roomCapacity}` : "30"
                      }
                      className="h-10 text-sm"
                    />
                    {roomCapacity > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Tối đa: {roomCapacity}
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
            <div className="rounded-2xl p-5 h-[calc(100vh-250px)] bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg shadow-green-500/20">
              <div className="mb-4">
                <div className="sticky top-0 z-10 -mx-5 px-5 py-3 rounded-xl text-white bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 shadow-md">
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
                roomBusy={roomBusy}
                selected={pickedSlots}
                onToggle={toggleSlot}
                disabled={!teacherId || !roomId}
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="max-w-5xl mx-auto">
            <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl shadow-green-500/10 p-12 flex flex-col gap-10 relative overflow-hidden">
              {/* Decorative gradient aura */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-72 h-72 bg-green-400/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
              </div>
              {/* Header / Title */}
              <div className="text-center relative">
                <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 shadow-lg shadow-green-500/30 flex items-center justify-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl">
                    🏫
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {className || "Tên lớp"}
                </h2>
                <div className="flex items-center justify-center gap-3">
                  <span className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-green-600 text-white shadow shadow-green-500/30">
                    Offline
                  </span>
                  {pickedSlots.length > 0 && (
                    <span className="text-xs font-medium text-gray-500">
                      {pickedSlots.length} buổi đã chọn
                    </span>
                  )}
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid md:grid-cols-2 gap-6 relative">
                <div className="rounded-2xl bg-green-50/70 border border-green-100 p-4">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Môn học
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {selectedSubject?.name || "-"}
                  </div>
                </div>
                <div className="rounded-2xl bg-green-50/70 border border-green-100 p-4">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Giáo viên
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {selectedTeacher?.fullName || "-"}
                  </div>
                </div>
                <div className="rounded-2xl bg-green-50/70 border border-green-100 p-4">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Phòng học
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {selectedRoom?.name || "-"}
                  </div>
                </div>
                <div className="rounded-2xl bg-green-50/70 border border-green-100 p-4">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Sĩ số
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {capacity || 0} học sinh
                  </div>
                </div>
                <div className="rounded-2xl bg-green-50/70 border border-green-100 p-4">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Thời gian
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {startDate || "-"} {startDate && endDate && "→"}{" "}
                    {endDate || "-"}
                  </div>
                </div>
                <div className="rounded-2xl bg-green-50/70 border border-green-100 p-4">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Tổng số buổi
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {totalSessions || 0} buổi
                  </div>
                </div>
                <div className="rounded-2xl bg-green-50/70 border border-green-100 p-4">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Giá tiền mỗi buổi học
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {pricePerSession !== ""
                      ? formatCurrency(parseInt(pricePerSession))
                      : "-"}
                  </div>
                </div>
                <div className="rounded-2xl bg-green-50/70 border border-green-100 p-4">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Tổng giá tiền của lớp học
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {pricePerSession !== "" && totalSessions
                      ? formatCurrency(
                          parseInt(pricePerSession) * parseInt(totalSessions)
                        )
                      : "-"}
                  </div>
                </div>
                {desc && (
                  <div className="md:col-span-2 rounded-2xl bg-green-50/60 border border-green-100 p-4">
                    <div className="text-xs font-semibold text-gray-500 mb-1">
                      Mô tả
                    </div>
                    <div className="text-sm font-medium text-gray-800 whitespace-pre-line">
                      {desc}
                    </div>
                  </div>
                )}
              </div>

              {/* Schedule Summary */}
              <div className="rounded-2xl bg-rose-50/70 border border-rose-100 p-6 relative">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarCheck2 className="h-5 w-5 text-rose-600" />
                  <h4 className="text-sm font-semibold text-gray-900">
                    Lịch học ({pickedSlots.length} buổi)
                  </h4>
                </div>
                {pickedSlots.length === 0 ? (
                  <p className="text-xs text-gray-500">Chưa chọn lịch học.</p>
                ) : (
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
                          className="px-3 py-1.5 rounded-xl bg-white/70 backdrop-blur-sm border border-rose-100 text-rose-700 text-sm font-medium shadow-sm"
                        >
                          {days[d.getDay()]} - {timeStr}
                        </div>
                      );
                    })}
                  </div>
                )}
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
                className="px-8 h-11 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30"
              >
                Tiếp tục
              </Button>
            )}
            {currentStep === 2 && (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 h-11 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30"
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
