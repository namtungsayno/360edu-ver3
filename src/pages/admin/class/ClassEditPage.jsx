import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import ScheduleGrid from "../schedule/ScheduleGrid";
import ClassPreview from "../../../components/admin/ClassPreview";
import { classService } from "../../../services/class/class.service";
import { subjectService } from "../../../services/subject/subject.service";
import { teacherService } from "../../../services/teacher/teacher.service";
import { classroomService } from "../../../services/classrooms/classroom.service";
import { timeslotService } from "../../../services/timeslot/timeslot.service";
import { courseApi } from "../../../services/course/course.api";
import { Loader2, Eye } from "lucide-react";
import { useToast } from "../../../hooks/use-toast";
import { BackButton } from "../../../components/common/BackButton";

/**
 * ClassEditPage
 * - Tự động phân nhánh Online/Offline dựa vào dữ liệu lớp (online boolean)
 * - Prefill toàn bộ thông tin
 * - Cho phép chỉnh sửa thông tin + lịch học
 * - Giữ nguyên trạng thái (DRAFT/PUBLIC) – Publish/Revert dùng ở trang chi tiết
 */
export default function ClassEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { error, success } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: form, 2: preview

  // Original class data
  const [cls, setCls] = useState(null);

  // Shared form state
  const [subjectId, setSubjectId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [desc, setDesc] = useState("");
  const [capacity, setCapacity] = useState("");
  const [roomId, setRoomId] = useState(""); // offline
  const [meetingLink, setMeetingLink] = useState(""); // online
  const [totalSessions, setTotalSessions] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pricePerSession, setPricePerSession] = useState("");
  const [name, setName] = useState("");

  // Data sources
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  // Random code for new naming (1 letter + 1 digit), generated once per page open
  const [randomCode, setRandomCode] = useState("");

  // Busy & picked slots
  const [teacherBusy, setTeacherBusy] = useState([]);
  const [roomBusy, setRoomBusy] = useState([]);
  const [pickedSlots, setPickedSlots] = useState([]); // grid selections
  // Toggle edit/view for schedule
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [prevPickedSlots, setPrevPickedSlots] = useState([]);
  // Track previous generated name to detect manual edits
  const [prevGeneratedName, setPrevGeneratedName] = useState("");
  // Bỏ xác nhận endDate nên không cần giữ prev để hoàn tác
  // const [prevPickedSlots, setPrevPickedSlots] = useState([]); // unused
  // const [prevTotalSessions, setPrevTotalSessions] = useState(""); // unused
  // initialSlotsCount trước đây dùng để chặn giảm slot; đã bỏ chặn cho DRAFT nên không cần nữa
  // Giữ lại nếu sau này muốn tái áp dụng hạn chế cho PUBLIC; hiện PUBLIC không cho sửa lịch
  // const [initialSlotsCount, setInitialSlotsCount] = useState(0);
  // originalPickedSlots no longer needed
  // Schedule luôn cho sửa; không cần toggle

  // End date confirmation removed -> no need to track originalEndDate

  // Week start (Monday) for visual schedule mapping
  const [weekStart] = useState(() => {
    const now = new Date();
    const js = now.getDay();
    const diff = js === 0 ? -6 : 1 - js;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  // Load base data parallel
  useEffect(() => {
    (async () => {
      try {
        const [subj, ts] = await Promise.all([
          subjectService.all(),
          timeslotService.list(),
        ]);
        setSubjects(Array.isArray(subj) ? subj : []);
        setTimeSlots(Array.isArray(ts) ? ts : []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Helpers: alias and random code for class name
  const makeTeacherAlias = useCallback((fullName) => {
    const removeDiacritics = (s) =>
      (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    const last = removeDiacritics(parts[parts.length - 1] || "");
    if (!last) return "";
    return "GV" + last.charAt(0).toUpperCase() + last.slice(1).toLowerCase();
  }, []);

  const generateRandomCode = useCallback(() => {
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
  }, []);

  // Generate random code once
  useEffect(() => {
    setRandomCode(generateRandomCode());
  }, [generateRandomCode]);

  // Build a stable comparison key for a slot: dayOfWeek(0..6)-HH:mm
  // Use exact isoStart+isoEnd equality to align with ScheduleGrid
  const slotKey = useCallback((slot) => {
    if (!slot || !slot.isoStart || !slot.isoEnd) return "";
    return `${slot.isoStart}|${slot.isoEnd}`;
  }, []);

  const uniqByKey = useCallback(
    (slots) => {
      const seen = new Set();
      const out = [];
      for (const s of slots || []) {
        const k = slotKey(s);
        if (!seen.has(k)) {
          seen.add(k);
          out.push(s);
        }
      }
      return out;
    },
    [slotKey]
  );
  // Load class details
  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await classService.getById(id);
        if (data) {
          setCls(data);
          // Prefill
          setSubjectId(String(data.subjectId || ""));
          setCourseId(String(data.courseId || ""));
          // Always store teacher's USER ID in state; backend expects userId in teacherId field
          setTeacherId(String(data.teacherUserId || ""));
          setDesc(data.description || "");
          setCapacity(String(data.maxStudents || ""));
          setTotalSessions(String(data.totalSessions || ""));
          setStartDate(data.startDate || "");
          setEndDate(data.endDate || "");
          setPricePerSession(String(data.pricePerSession ?? ""));
          setName(data.name || "");
          // originalEndDate removed
          if (data.online) {
            setMeetingLink(data.meetingLink || "");
          } else {
            setRoomId(String(data.roomId || ""));
          }
          // Map existing schedule -> pickedSlots (approximate week representation)
          if (Array.isArray(data.schedule)) {
            const mapped = data.schedule
              .filter((s) => s && s.dayOfWeek && s.startTime && s.endTime)
              .map((s) => {
                // Backend dayOfWeek: 1..7 (Mon..Sun, Sunday=7). Cần chuẩn hoá về offset từ Monday.
                // Hiện tại weekStart là Monday. Trước đây dùng trực tiếp jsDay khiến Monday (+1) thành Tuesday, tất cả bị lệch +1 ngày.
                // Đúng: Monday(1)->offset 0, Tuesday(2)->1, ..., Saturday(6)->5, Sunday(7)->6.
                const raw = s.dayOfWeek; // 1..7
                const offset = raw === 7 ? 6 : raw - 1; // Sunday=6, others shift down by 1
                const base = new Date(weekStart);
                base.setDate(weekStart.getDate() + offset);
                const [sh, sm] = s.startTime.split(":");
                const [eh, em] = s.endTime.split(":");
                const start = new Date(base);
                start.setHours(parseInt(sh), parseInt(sm), 0, 0);
                const end = new Date(base);
                end.setHours(parseInt(eh), parseInt(em), 0, 0);
                return {
                  isoStart: start.toISOString(),
                  isoEnd: end.toISOString(),
                };
              });
            // Deduplicate by (day, HH:mm) to avoid duplicates later
            const uniq = uniqByKey(mapped);
            setPickedSlots(uniq);
            // initialSlotsCount logic removed
            // originalPickedSlots removed
          }
        } else {
          error("Không tìm thấy lớp học");
        }
      } catch (e) {
        console.error(e);
        error("Lỗi tải dữ liệu lớp");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, weekStart, error, uniqByKey]);

  // Track initial subjectId to avoid resetting teacherId on first load
  const [initialSubjectId, setInitialSubjectId] = useState(null);

  // Load dependent lists when subject changes
  useEffect(() => {
    (async () => {
      if (!subjectId) {
        setCourses([]);
        setTeachers([]);
        return;
      }
      try {
        const [courseList, teacherList] = await Promise.all([
          courseApi.list({
            subjectId: parseInt(subjectId),
            status: "APPROVED",
          }),
          teacherService.list(parseInt(subjectId)),
        ]);
        setCourses(Array.isArray(courseList) ? courseList : []);
        setTeachers(Array.isArray(teacherList) ? teacherList : []);

        // Reset teacherId when subject changes (except on initial load)
        if (initialSubjectId !== null && subjectId !== initialSubjectId) {
          setTeacherId("");
          setCourseId("");
          setTeacherBusy([]);
        }
        // Mark initial subject as loaded
        if (initialSubjectId === null) {
          setInitialSubjectId(subjectId);
        }
      } catch (e) {
        console.error(e);
        setCourses([]);
        setTeachers([]);
      }
    })();
  }, [subjectId, initialSubjectId]);

  // Load rooms (offline)
  useEffect(() => {
    if (!cls || cls.online) return;
    (async () => {
      try {
        const data = await classroomService.search("", "OFFLINE");
        setRooms(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setRooms([]);
      }
    })();
  }, [cls]);

  // Build new naming suggestion when data ready
  const generatedName = useMemo(() => {
    const subj = subjects.find((s) => String(s.id) === String(subjectId));
    const teacher = teachers.find(
      (t) => String(t.userId) === String(teacherId)
    );
    if (!subj || !teacher || !randomCode) return "";
    const alias = makeTeacherAlias(teacher.fullName);
    if (!alias) return "";
    return `${subj.name} - ${alias} - ${randomCode}`;
  }, [subjects, subjectId, teachers, teacherId, randomCode, makeTeacherAlias]);

  // Old naming (legacy): TeacherFullName - SubjectName
  const legacyName = useMemo(() => {
    const subj = subjects.find((s) => String(s.id) === String(subjectId));
    const teacher = teachers.find(
      (t) => String(t.userId) === String(teacherId)
    );
    if (!subj || !teacher) return "";
    return `${teacher.fullName} - ${subj.name}`;
  }, [subjects, subjectId, teachers, teacherId]);

  // Prefill name with new format if empty, using legacy pattern, or matching previous auto-generated name
  useEffect(() => {
    if (!generatedName) return;

    // Check if current name follows the auto-generated pattern: "SubjectName - GV... - XX"
    const autoGenPattern = /^.+ - GV\w+ - [A-Z]\d$/;
    const isAutoGenerated = autoGenPattern.test(name);

    // If current name is empty, exactly matches legacy style, matches the previous auto-generated name,
    // or follows the auto-generated pattern → update
    const shouldUpdate =
      !name ||
      (legacyName && name === legacyName) ||
      (prevGeneratedName && name === prevGeneratedName) ||
      isAutoGenerated;
    if (shouldUpdate) {
      setName(generatedName);
    }
    // Always track the latest generated name for future comparisons
    setPrevGeneratedName(generatedName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedName, legacyName]);

  // Busy data loads when teacher/room/startDate change
  const loadTeacherBusy = useCallback(async () => {
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
            const dStart = new Date(b.start);
            const day = dStart.getDay();
            // Lấy giờ phút theo local để khớp với timeSlots (định dạng "HH:MM")
            const h = String(dStart.getHours()).padStart(2, "0");
            const m = String(dStart.getMinutes()).padStart(2, "0");
            const hhmm = `${h}:${m}`;
            const ts = timeSlots.find((t) => t.startTime === hhmm);
            if (!ts) {
              // Debug nhẹ để kiểm tra mismatch giữa busy và timeSlots
              console.debug("[teacherBusy] No matching timeslot for", hhmm, {
                bStart: b.start,
              });
            }
            return ts
              ? { day, slotId: ts.id, start: b.start, end: b.end }
              : null;
          })
          .filter(Boolean);
        setTeacherBusy(busyMapped);
      } else setTeacherBusy([]);
    } catch (e) {
      console.error(e);
      setTeacherBusy([]);
    }
  }, [teacherId, startDate, timeSlots]);

  useEffect(() => {
    loadTeacherBusy();
  }, [loadTeacherBusy]);

  const loadRoomBusy = useCallback(async () => {
    if (!roomId || !startDate || !cls || cls.online) return;
    try {
      const fromDate = new Date(startDate).toISOString();
      const toDate = new Date(
        new Date(startDate).getTime() + 365 * 24 * 60 * 60 * 1000
      ).toISOString();
      const data = await classroomService.getFreeBusy(roomId, fromDate, toDate);
      if (Array.isArray(data)) {
        const busyMapped = data
          .filter((b) => b && b.start && b.end)
          .map((b) => {
            const dStart = new Date(b.start);
            const day = dStart.getDay();
            const h = String(dStart.getHours()).padStart(2, "0");
            const m = String(dStart.getMinutes()).padStart(2, "0");
            const hhmm = `${h}:${m}`;
            const ts = timeSlots.find((t) => t.startTime === hhmm);
            if (!ts) {
              console.debug("[roomBusy] No matching timeslot for", hhmm, {
                bStart: b.start,
              });
            }
            return ts
              ? { day, slotId: ts.id, start: b.start, end: b.end }
              : null;
          })
          .filter(Boolean);
        setRoomBusy(busyMapped);
      } else {
        setRoomBusy([]);
      }
    } catch (e) {
      console.error(e);
      setRoomBusy([]);
    }
  }, [roomId, startDate, cls, timeSlots]);

  useEffect(() => {
    loadRoomBusy();
  }, [loadRoomBusy]);

  function toggleSlot(slot) {
    const targetKey = slotKey(slot);
    const has = pickedSlots.some((s) => slotKey(s) === targetKey);
    const next = has
      ? pickedSlots.filter((s) => slotKey(s) !== targetKey)
      : uniqByKey([...pickedSlots, slot]);
    setPickedSlots(next);
    // endDate sẽ tự động cập nhật theo lịch phía trên
  }

  function startEditSchedule() {
    setPrevPickedSlots(pickedSlots);
    setIsEditingSchedule(true);
  }

  function cancelEditSchedule() {
    setPickedSlots(prevPickedSlots);
    setIsEditingSchedule(false);
  }

  function doneEditSchedule() {
    setIsEditingSchedule(false);
  }

  const selectedSubject = subjects.find(
    (s) => String(s.id) === String(subjectId)
  );
  const selectedTeacher = teachers.find(
    (t) => String(t.userId) === String(teacherId)
  );
  const selectedRoom = rooms.find((r) => String(r.id) === String(roomId));
  // Helpers for price formatting like create pages
  const digitsOnly = (val) => (val || "").replace(/\D/g, "");
  const formatVNNumber = (digits) =>
    (digits || "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  // Compute potential endDate and require confirmation if it changes from original
  useEffect(() => {
    if (!startDate || !totalSessions || !pickedSlots.length) return;
    const slotCountByDay = {};
    pickedSlots.forEach((slot) => {
      const day = new Date(slot.isoStart).getDay();
      slotCountByDay[day] = (slotCountByDay[day] || 0) + 1;
    });
    const slotsPerWeek = Object.values(slotCountByDay).reduce(
      (sum, c) => sum + c,
      0
    );
    if (!slotsPerWeek) return;
    const target = parseInt(totalSessions);
    let counted = 0;
    let current = new Date(startDate);
    let last = null;
    const maxIter = Math.ceil(target / slotsPerWeek) * 7 + 14;
    let iter = 0;
    while (counted < target && iter < maxIter) {
      const dow = current.getDay();
      const add = slotCountByDay[dow] || 0;
      if (add) {
        counted += add;
        last = new Date(current);
      }
      current.setDate(current.getDate() + 1);
      iter++;
    }
    if (last) {
      const candidate = last.toISOString().slice(0, 10);
      if (candidate !== endDate) {
        setEndDate(candidate);
      }
    }
  }, [startDate, totalSessions, pickedSlots, endDate]);

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

  const isOnline = cls?.online === true;
  const isPublic = cls?.status === "PUBLIC"; // giữ badge hiển thị, không ảnh hưởng chỉnh sửa
  // Centralized accent styles
  const accentGradient = isOnline
    ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"
    : "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600";
  const accentBlockGradient = isOnline
    ? "bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600"
    : "bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600";
  const accentStepGradient = isOnline
    ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
    : "bg-gradient-to-r from-green-500 to-emerald-500";
  const accentShadowStrong = isOnline
    ? "shadow-indigo-500/30"
    : "shadow-green-500/30";
  const todayStr = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.toISOString().slice(0, 10);
  }, []);

  function isValidUrl(url) {
    try {
      const u = new URL(url);
      return ["http:", "https:"].includes(u.protocol);
    } catch {
      return false;
    }
  }

  const step1Valid = useMemo(() => {
    if (
      !subjectId ||
      !teacherId ||
      !totalSessions ||
      parseInt(totalSessions) <= 0 ||
      !startDate ||
      startDate < todayStr ||
      !pickedSlots.length ||
      // Yêu cầu giá mỗi buổi chỉ khi DRAFT
      (cls?.status === "DRAFT" &&
        (pricePerSession === "" || parseInt(pricePerSession) < 0)) ||
      !name
    )
      return false;
    if (isOnline) {
      if (!meetingLink || !isValidUrl(meetingLink)) return false;
      if (!capacity || parseInt(capacity) <= 0 || parseInt(capacity) > 30)
        return false;
    } else {
      if (!roomId || !capacity || parseInt(capacity) <= 0) return false;
      const roomCapacity = selectedRoom
        ? parseInt(selectedRoom.capacity || 0)
        : 0;
      if (roomCapacity && parseInt(capacity) > roomCapacity) return false;
    }
    return true;
  }, [
    subjectId,
    teacherId,
    totalSessions,
    startDate,
    todayStr,
    pickedSlots,
    pricePerSession,
    name,
    isOnline,
    meetingLink,
    capacity,
    roomId,
    cls?.status,
    selectedRoom,
  ]);

  async function handleSave() {
    if (!cls || !step1Valid) return;
    setSaving(true);
    try {
      let schedules = mapSlotsToSchedule();
      if (!schedules.length) {
        error("Không thể xác định lịch học");
        setSaving(false);
        return;
      }
      const payload = {
        name: name || cls.name,
        subjectId: parseInt(subjectId),
        courseId: courseId ? parseInt(courseId) : null,
        teacherId: teacherId ? parseInt(teacherId) : null,
        roomId: isOnline ? null : roomId ? parseInt(roomId) : null,
        maxStudents: parseInt(capacity),
        totalSessions: parseInt(totalSessions),
        pricePerSession: parseInt(pricePerSession),
        description: desc,
        startDate,
        endDate,
        meetingLink: isOnline ? meetingLink.trim() : null,
        schedule: schedules,
      };
      try {
        await classService.update(cls.id, payload);
      } catch (e1) {
        const backendMsg =
          e1?.response?.data?.message || e1?.response?.data?.error || "";
        const needConfirm =
          typeof backendMsg === "string" &&
          backendMsg.toLowerCase().includes("lớp đang có nội dung");
        if (needConfirm) {
          const ok = window.confirm(
            "Lớp đang có nội dung. Xác nhận xóa toàn bộ nội dung buổi học và khóa học của giáo viên?"
          );
          if (!ok) throw e1;
          const payload2 = { ...payload, forceDeleteContentAndCourse: true };
          await classService.update(cls.id, payload2);
        } else {
          throw e1;
        }
      }
      success("Cập nhật lớp thành công");
      navigate(`/home/admin/class/${cls.id}`);
    } catch (e) {
      console.error(e);
      let msg = "Không thể cập nhật lớp";
      if (e.response?.data?.message) msg = e.response.data.message;
      else if (e.response?.data?.error) msg = e.response.data.error;
      error(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-4">
        <div className="h-6 w-48 rounded bg-slate-200" />
        <div className="h-4 w-64 rounded bg-slate-200" />
        <div className="grid grid-cols-2 gap-4 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="p-6">
        <div className="text-sm text-red-600">Không tìm thấy lớp học.</div>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <>
      <div
        className={`min-h-screen ${
          isOnline
            ? "bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50"
            : "bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50"
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg ${
            isOnline ? "shadow-indigo-500/20" : "shadow-green-500/20"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <BackButton
                  onClick={() => {
                    if (currentStep === 2) setCurrentStep(1);
                    else navigate(`/home/admin/class/${cls.id}`);
                  }}
                  showLabel={false}
                />
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1
                      className={`text-2xl font-bold bg-clip-text text-transparent ${accentGradient}`}
                    >
                      Chỉnh sửa lớp {isOnline ? "Online" : "Offline"}
                    </h1>
                    <span
                      className={`px-3 py-1 text-[11px] font-semibold rounded-full border ${
                        isPublic
                          ? "bg-amber-100 border-amber-300 text-amber-700"
                          : "bg-slate-100 border-slate-300 text-slate-700"
                      }`}
                    >
                      {isPublic ? "PUBLIC" : "DRAFT"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{cls.name}</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <div
                  className={`flex items-center gap-3 px-5 py-2.5 rounded-full transition-all ${
                    currentStep === 1
                      ? isOnline
                        ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30"
                        : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
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
                      ? isOnline
                        ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30"
                        : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
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

        <div className="max-w-[1400px] mx-auto px-6 py-8">
          {currentStep === 1 && (
            <div className="grid grid-cols-[380px_1fr] gap-6 items-stretch">
              {/* Left form */}
              <div
                className={`rounded-2xl p-5 h-[calc(100vh-250px)] overflow-y-auto sticky top-24 bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg ${
                  isOnline ? "shadow-indigo-500/20" : "shadow-green-500/20"
                }`}
              >
                <div className="mb-5">
                  <div
                    className={`flex items-center gap-3 p-4 ${accentBlockGradient} text-white rounded-2xl shadow-lg w-full ${accentShadowStrong}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl flex-shrink-0">
                      {isOnline ? "🌐" : "🏫"}
                    </div>
                    <div>
                      <h2 className="text-base font-semibold">
                        {isOnline ? "Lớp học Online" : "Lớp học Offline"}
                      </h2>
                      <p className="text-xs text-white/80">
                        Chỉnh sửa thông tin lớp
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {isPublic && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[13px] text-amber-700 leading-relaxed">
                      <div className="font-semibold mb-1">
                        Lớp đã ở trạng thái Public
                      </div>
                      {isOnline ? (
                        <p>
                          Chỉ được phép cập nhật{" "}
                          <span className="font-medium">Link Meet</span> và{" "}
                          <span className="font-medium">Sĩ số</span>. Các thông
                          tin khác đã bị khóa.
                        </p>
                      ) : (
                        <p>
                          Chỉ được phép cập nhật{" "}
                          <span className="font-medium">Phòng học</span> và{" "}
                          <span className="font-medium">Sĩ số</span>. Các thông
                          tin khác đã bị khóa.
                        </p>
                      )}
                    </div>
                  )}
                  {/* Dates */}
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
                        disabled={isPublic}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Ngày kết thúc
                      </label>
                      <Input
                        type="date"
                        value={endDate}
                        readOnly
                        className="h-10 text-sm bg-gray-50"
                      />
                    </div>
                  </div>
                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Môn học <span className="text-red-500">*</span>
                    </label>
                    <Select
                      key={`subject-${subjectId}-${subjects.length}`}
                      value={String(subjectId)}
                      onValueChange={setSubjectId}
                      disabled={isPublic}
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
                    {/* Cho phép đổi môn khi DRAFT; chỉ khóa khi PUBLIC */}
                  </div>
                  {/* Course optional */}
                  {subjectId && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Khóa học{" "}
                        <span className="text-xs text-gray-500">
                          (tùy chọn)
                        </span>
                      </label>
                      <Select
                        key={`course-${courseId}-${courses.length}`}
                        value={String(courseId)}
                        onValueChange={setCourseId}
                        disabled={isPublic}
                      >
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue placeholder="Chọn khóa học" />
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
                      {/* Cho phép đổi khóa học khi DRAFT; chỉ khóa khi PUBLIC */}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Giáo viên <span className="text-red-500">*</span>
                    </label>
                    <Select
                      key={`teacher-${teacherId}-${teachers.length}`}
                      value={String(teacherId)}
                      onValueChange={setTeacherId}
                      disabled={isPublic}
                    >
                      <SelectTrigger className="h-10 text-sm">
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
                    {/* Cho phép đổi giáo viên khi DRAFT; chỉ khóa khi PUBLIC */}
                  </div>
                  {/* Total sessions */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Số buổi <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={totalSessions}
                      onChange={(e) => {
                        // prevTotalSessions không còn dùng
                        setTotalSessions(e.target.value);
                        // endDate sẽ tự động cập nhật
                      }}
                      className="h-10 text-sm"
                      disabled={isPublic}
                    />
                    {isPublic && (
                      <p className="text-[10px] text-amber-600 mt-1">
                        Số buổi đã bị khóa ở trạng thái Public.
                      </p>
                    )}
                  </div>
                  {/* Giá tiền mỗi buổi học */}
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
                      className="h-10 text-sm"
                      disabled={isPublic}
                    />
                    {pricePerSession !== "" &&
                      parseInt(pricePerSession) < 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          Giá tiền mỗi buổi học phải ≥ 0
                        </p>
                      )}
                    {isPublic && (
                      <p className="text-[10px] text-amber-600 mt-1">
                        Giá tiền mỗi buổi bị khóa ở trạng thái Public.
                      </p>
                    )}
                  </div>
                  {/* Offline room or online link + Capacity */}
                  <div className="grid grid-cols-2 gap-3">
                    {isOnline ? (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Link Meet <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                            placeholder="https://"
                            className="h-10 text-sm"
                          />
                          {meetingLink && !isValidUrl(meetingLink) && (
                            <p className="text-xs text-red-600 mt-1">
                              Link không hợp lệ
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
                            className="h-10 text-sm"
                          />
                          {capacity && parseInt(capacity) > 30 && (
                            <p className="text-xs text-red-600 mt-1">
                              Tối đa 30
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Phòng học <span className="text-red-500">*</span>
                          </label>
                          <Select
                            key={`room-${roomId}-${rooms.length}`}
                            value={String(roomId)}
                            onValueChange={setRoomId}
                          >
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
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Sĩ số <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="number"
                            min={1}
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            className="h-10 text-sm"
                          />
                          {selectedRoom && selectedRoom.capacity && (
                            <p className="text-xs text-gray-500 mt-1">
                              Tối đa: {selectedRoom.capacity}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  {/* Class name readonly */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Tên lớp
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-10 text-sm"
                      disabled={isPublic}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Mô tả
                    </label>
                    <Textarea
                      rows={2}
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      className="resize-none text-sm"
                      disabled={isPublic}
                    />
                  </div>
                </div>
              </div>
              {/* Right schedule grid */}
              <div
                className={`rounded-2xl p-5 h-[calc(100vh-250px)] bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg ${
                  isOnline ? "shadow-indigo-500/20" : "shadow-green-500/20"
                }`}
              >
                <div
                  className={`sticky top-0 z-10 -mx-5 px-5 py-3 rounded-xl text-white ${accentStepGradient} shadow-md flex items-center justify-between`}
                >
                  <h2 className="text-lg font-bold">Lịch học</h2>
                  {!isEditingSchedule ? (
                    <Button
                      variant="outline"
                      onClick={startEditSchedule}
                      className="h-8 px-3 text-xs bg-white/10 border-white/30 text-white hover:brightness-110"
                      disabled={isPublic}
                    >
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={cancelEditSchedule}
                        className="h-8 px-3 text-xs bg-white/10 border-white/30 text-white hover:brightness-110"
                      >
                        Hủy
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={doneEditSchedule}
                        className="h-8 px-3 text-xs"
                      >
                        Xong
                      </Button>
                    </div>
                  )}
                </div>

                {!isEditingSchedule ? (
                  <div className="mt-4">
                    {pickedSlots.length === 0 ? (
                      <p className="text-xs text-gray-500">Chưa có lịch học.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {pickedSlots
                          .slice()
                          .sort(
                            (a, b) =>
                              new Date(a.isoStart) - new Date(b.isoStart)
                          )
                          .map((slot, idx) => {
                            const d = new Date(slot.isoStart);
                            const e = new Date(slot.isoEnd);
                            const days = [
                              "CN",
                              "T2",
                              "T3",
                              "T4",
                              "T5",
                              "T6",
                              "T7",
                            ];
                            const startStr = d.toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            });
                            const endStr = e.toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            });
                            return (
                              <div
                                key={idx}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                                  isOnline
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                                }`}
                              >
                                {days[d.getDay()]} - {startStr}–{endStr}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4">
                    <ScheduleGrid
                      timeSlots={timeSlots}
                      weekStart={weekStart}
                      teacherBusy={teacherBusy}
                      roomBusy={isOnline ? [] : roomBusy}
                      selected={pickedSlots}
                      originalSelected={prevPickedSlots}
                      onToggle={toggleSlot}
                      disabled={
                        isPublic ||
                        !isEditingSchedule ||
                        !teacherId ||
                        (!isOnline && !roomId)
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <ClassPreview
              name={name || cls.name}
              description={desc}
              isOnline={isOnline}
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
              roomName={selectedRoom?.name}
            />
          )}
          {/* Footer actions */}
          <div className="mt-8 flex items-center justify-between">
            <div>
              {currentStep === 2 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 h-11 rounded-xl"
                >
                  Quay lại bước 1
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {currentStep === 1 && (
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!step1Valid}
                  className={`px-8 h-11 rounded-xl ${accentGradient} text-white shadow-lg ${accentShadowStrong} hover:brightness-105`}
                >
                  Xem trước
                </Button>
              )}
              {currentStep === 2 && (
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-8 h-11 rounded-xl ${accentGradient} text-white shadow-lg ${accentShadowStrong} hover:brightness-105`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Modal xác nhận ngày kết thúc đã được bỏ. */}
    </>
  );
}
