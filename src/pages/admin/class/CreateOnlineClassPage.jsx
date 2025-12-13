/**
 * CreateOnlineClassPage - Page tạo lớp học Online (thay thế modal)
 * Layout 2 steps tương tự Offline nhưng:
 * - Có Link Meet thay vì Phòng học
 * - Capacity giới hạn tối đa 30
 */
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import RichTextEditor from "../../../components/ui/RichTextEditor";
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
  Eye,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { BackButton } from "../../../components/common/BackButton";

import ScheduleGrid from "../schedule/ScheduleGrid";
import ClassPreview from "../../../components/admin/ClassPreview";

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
      setTeachers([]);
    }
  }

  async function loadTimeSlots() {
    try {
      const data = await timeslotService.list();
      setTimeSlots(Array.isArray(data) ? data : []);
    } catch (e) {
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
    if (subj && teacher && randomCode) {
      const alias = makeTeacherAlias(teacher.fullName);
      if (!alias) return "";
      // Format: <TÊN_MÔN> - <GV_ALIAS> - <RANDOM_CODE>
      return `${subj.name} - ${alias} - ${randomCode}`;
    }
    return "";
  }, [subjectId, teacherId, subjects, teachers, randomCode, makeTeacherAlias]);

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
      courseId && // Bắt buộc chọn khóa học
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
    courseId,
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
              <BackButton
                onClick={() => {
                  if (currentStep === 2) {
                    setCurrentStep(1);
                  } else {
                    navigate("/home/admin/class");
                  }
                }}
                showLabel={false}
              />
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
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {currentStep === 1 && (
          <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
            {/* Left: Thông tin cơ bản - Compact Form */}
            <div className="rounded-2xl p-5 bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg shadow-indigo-500/20">
              <div className="mb-4">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 w-full">
                  <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-lg flex-shrink-0">
                    🌐
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">Lớp học Online</h2>
                    <p className="text-xs text-white/80">
                      Học từ xa qua Internet
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Row 1: Ngày bắt đầu + Ngày kết thúc */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      min={todayStr}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Ngày kết thúc
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      readOnly
                      className="h-9 text-sm bg-gray-50"
                    />
                  </div>
                </div>

                {/* Row 2: Môn học + Giáo viên */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Môn học <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={String(subjectId)}
                      onValueChange={setSubjectId}
                    >
                      <SelectTrigger className="h-9 text-sm w-full">
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
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Giáo viên <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={String(teacherId)}
                      onValueChange={setTeacherId}
                      disabled={!subjectId}
                    >
                      <SelectTrigger className="h-9 text-sm w-full">
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
                  </div>
                </div>

                {/* Row 3: Khóa học (bắt buộc) */}
                {subjectId && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Khóa học <span className="text-red-500">*</span>
                    </label>
                    {courses.length > 0 ? (
                      <>
                        <Select
                          value={String(courseId)}
                          onValueChange={setCourseId}
                        >
                          <SelectTrigger
                            className={`h-auto min-h-[36px] text-sm py-2 ${
                              !courseId ? "border-amber-300" : ""
                            }`}
                          >
                            <SelectValue
                              placeholder="Chọn khóa học"
                              className="whitespace-normal line-clamp-2"
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>
                                {c.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!courseId && (
                          <p className="text-[10px] text-amber-600 mt-0.5">
                            Vui lòng chọn khóa học
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-amber-700 font-medium">
                              Môn học này chưa có khóa học nào
                            </p>
                            <p className="text-[10px] text-amber-600 mt-0.5">
                              Vui lòng tạo khóa học trước khi tạo lớp
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2 h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
                              onClick={() => {
                                navigate(
                                  `/home/admin/subject/${subjectId}/courses/create`
                                );
                              }}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Tạo khóa học ngay
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Row 4: Link Meet + Số buổi */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Link Meet <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://meet..."
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Số buổi <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={totalSessions}
                      onChange={(e) => setTotalSessions(e.target.value)}
                      placeholder="24"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Row 5: Sĩ số + Giá tiền */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Sĩ số <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      placeholder="Max 30"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Giá/buổi (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formatVNNumber(pricePerSession)}
                      onChange={(e) =>
                        setPricePerSession(digitsOnly(e.target.value))
                      }
                      placeholder="150.000"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Row 6: Tên lớp (auto) */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tên lớp <span className="text-gray-400">(Tự động)</span>
                  </label>
                  <Input
                    value={className}
                    readOnly
                    className="h-9 text-sm bg-gray-50 font-medium"
                  />
                </div>

                {/* Row 7: Mô tả */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <RichTextEditor
                    value={desc}
                    onChange={setDesc}
                    placeholder="Mô tả về lớp..."
                    simple={true}
                    minHeight="120px"
                    maxHeight="200px"
                  />
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!step1Valid}
                  className="w-full h-10 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30 mt-2"
                >
                  Tiếp tục
                </Button>
              </div>
            </div>

            {/* Right: Chọn lịch học - Expanded */}
            <div className="rounded-2xl p-5 bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg shadow-indigo-500/20">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-md">
                    <h2 className="text-base font-bold">Chọn lịch học</h2>
                  </div>
                  <div className="text-sm text-gray-500">
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
          <div className="space-y-6">
            <ClassPreview
              name={className}
              description={desc}
              isOnline={true}
              subjectName={selectedSubject?.name}
              courseName={
                courses.find((c) => String(c.id) === String(courseId))?.title
              }
              teacherFullName={selectedTeacher?.fullName}
              teacherAvatarUrl={selectedTeacher?.avatarUrl}
              teacherBio={selectedTeacher?.bio}
              pickedSlots={pickedSlots}
              startDate={startDate}
              endDate={endDate}
              totalSessions={totalSessions}
              maxStudents={capacity}
              pricePerSession={pricePerSession}
              meetingLink={meetingLink}
            />

            {/* Footer Actions for Step 2 */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="px-6 h-11 rounded-xl"
              >
                ← Quay lại
              </Button>
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
                    Xác nhận tạo lớp
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
