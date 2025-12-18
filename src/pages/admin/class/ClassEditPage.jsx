import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import ScheduleGrid from "../schedule/ScheduleGrid";
import ClassPreview from "../../../components/admin/ClassPreview";
import { classService } from "../../../services/class/class.service";
import { subjectService } from "../../../services/subject/subject.service";
import { teacherService } from "../../../services/teacher/teacher.service";
import { classroomService } from "../../../services/classrooms/classroom.service";
import { timeslotService } from "../../../services/timeslot/timeslot.service";
import { courseApi } from "../../../services/course/course.api";
import { Loader2, Eye, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "../../../hooks/use-toast";
import { BackButton } from "../../../components/common/BackButton";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "../../../components/ui/Dialog";

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
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showForceDeleteDialog, setShowForceDeleteDialog] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
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
  const [originalStartDate, setOriginalStartDate] = useState(""); // Ngày bắt đầu ban đầu của lớp
  const [pricePerSession, setPricePerSession] = useState("");
  const [name, setName] = useState("");

  // Data sources
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  // Busy & picked slots
  const [teacherBusy, setTeacherBusy] = useState([]);
  const [roomBusy, setRoomBusy] = useState([]);
  const [pickedSlots, setPickedSlots] = useState([]); // grid selections
  // Room conflict state for PUBLIC classes
  const [roomConflict, setRoomConflict] = useState(null); // { roomName, className, dayName, slotTime }
  const [checkingRoomConflict, setCheckingRoomConflict] = useState(false);
  // Toggle edit/view for schedule
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [prevPickedSlots, setPrevPickedSlots] = useState([]);
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
      } catch (e) {}
    })();
  }, []);

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
          setOriginalStartDate(data.startDate || ""); // Lưu ngày bắt đầu ban đầu
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
            // Lưu prevPickedSlots để hỗ trợ nút Hủy cho lớp DRAFT
            setPrevPickedSlots(uniq);
            // initialSlotsCount logic removed
            // originalPickedSlots removed
          }
        } else {
          error("Không tìm thấy lớp học");
        }
      } catch (e) {
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
        setRooms([]);
      }
    })();
  }, [cls]);

  // KHÔNG auto-generate tên ở trang Edit - giữ nguyên tên lớp từ database
  // Logic auto-generate chỉ dùng cho trang Create

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
            return ts
              ? { day, slotId: ts.id, start: b.start, end: b.end }
              : null;
          })
          .filter(Boolean);
        setTeacherBusy(busyMapped);
      } else setTeacherBusy([]);
    } catch (e) {
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
      setRoomBusy([]);
    }
  }, [roomId, startDate, cls, timeSlots]);

  useEffect(() => {
    loadRoomBusy();
  }, [loadRoomBusy]);

  // Check room conflict for PUBLIC classes when room changes
  const checkRoomConflict = useCallback(async () => {
    // Only check for PUBLIC classes when changing room
    if (!cls || cls.status !== "PUBLIC" || cls.online || !roomId) {
      setRoomConflict(null);
      return;
    }
    // If room hasn't changed from original, no need to check
    const originalRoomId = cls.roomId || cls.room?.id;
    if (String(roomId) === String(originalRoomId)) {
      setRoomConflict(null);
      return;
    }

    setCheckingRoomConflict(true);
    try {
      const fromDate = new Date(startDate || cls.startDate).toISOString();
      const toDate = new Date(endDate || cls.endDate).toISOString();
      const busyData = await classroomService.getFreeBusy(
        roomId,
        fromDate,
        toDate
      );

      if (!Array.isArray(busyData) || busyData.length === 0) {
        setRoomConflict(null);
        return;
      }

      // Get this class's schedule pattern (dayOfWeek + timeSlot)
      const thisClassSlots = pickedSlots.map((slot) => {
        const d = new Date(slot.isoStart);
        const dow = d.getDay(); // 0-6
        const h = String(d.getHours()).padStart(2, "0");
        const m = String(d.getMinutes()).padStart(2, "0");
        return { dow, time: `${h}:${m}` };
      });

      // Check if any busy slot overlaps with this class's schedule
      for (const busy of busyData) {
        if (!busy.start || !busy.end) continue;
        const busyStart = new Date(busy.start);
        const busyDow = busyStart.getDay();
        const busyH = String(busyStart.getHours()).padStart(2, "0");
        const busyM = String(busyStart.getMinutes()).padStart(2, "0");
        const busyTime = `${busyH}:${busyM}`;

        // Check if this busy slot matches any of our class's slots
        const conflict = thisClassSlots.find(
          (s) => s.dow === busyDow && s.time === busyTime
        );

        if (conflict) {
          const dayNames = [
            "Chủ nhật",
            "Thứ 2",
            "Thứ 3",
            "Thứ 4",
            "Thứ 5",
            "Thứ 6",
            "Thứ 7",
          ];
          const selectedRoom = rooms.find(
            (r) => String(r.id) === String(roomId)
          );
          const busyEnd = new Date(busy.end);
          const endH = String(busyEnd.getHours()).padStart(2, "0");
          const endM = String(busyEnd.getMinutes()).padStart(2, "0");

          setRoomConflict({
            roomName: selectedRoom?.name || "Phòng đã chọn",
            dayName: dayNames[busyDow],
            slotTime: `${busyTime} - ${endH}:${endM}`,
            className: busy.className || "lớp khác", // BE might include this
          });
          return;
        }
      }

      setRoomConflict(null);
    } catch (e) {
      setRoomConflict(null);
    } finally {
      setCheckingRoomConflict(false);
    }
  }, [cls, roomId, startDate, endDate, pickedSlots, rooms]);

  useEffect(() => {
    checkRoomConflict();
  }, [checkRoomConflict]);

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
  const isDraft = cls?.status === "DRAFT"; // Khi DRAFT: khóa Môn học, Giáo viên, Khóa học, Tên lớp
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
    // Lấy ngày theo múi giờ local (Việt Nam) thay vì UTC
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
    // Block if room conflict exists for PUBLIC classes
    if (roomConflict) return false;

    // Block nếu sĩ số < số học sinh hiện tại (lớp PUBLIC)
    if (
      cls?.status === "PUBLIC" &&
      capacity &&
      parseInt(capacity) < (cls?.currentStudents || 0)
    ) {
      return false;
    }

    // Chỉ kiểm tra startDate >= today cho lớp DRAFT
    // Lớp PUBLIC đã có startDate trong quá khứ vẫn cho phép edit
    const startDateInvalid = cls?.status === "DRAFT" && startDate < todayStr;

    if (
      !subjectId ||
      !teacherId ||
      !totalSessions ||
      parseInt(totalSessions) <= 0 ||
      !startDate ||
      startDateInvalid ||
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
    cls?.currentStudents,
    selectedRoom,
    roomConflict,
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
          // Lưu payload và hiển dialog xác nhận
          setPendingPayload(payload);
          setShowForceDeleteDialog(true);
          setSaving(false);
          return;
        } else {
          throw e1;
        }
      }
      success("Cập nhật lớp thành công");
      navigate("/home/admin/class");
    } catch (e) {
      let msg = "Không thể cập nhật lớp";
      if (e.response?.data?.message) msg = e.response.data.message;
      else if (e.response?.data?.error) msg = e.response.data.error;
      error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!cls || cls.status !== "DRAFT") return;
    setShowDeleteDialog(false);

    setDeleting(true);
    try {
      await classService.delete(cls.id);
      success("Đã xóa lớp học thành công");
      navigate("/home/admin/class");
    } catch (e) {
      let msg = "Không thể xóa lớp";
      if (e.response?.data?.message) msg = e.response.data.message;
      else if (e.response?.data?.error) msg = e.response.data.error;
      error(msg);
    } finally {
      setDeleting(false);
    }
  }

  function openDeleteDialog() {
    if (!cls || cls.status !== "DRAFT") return;
    setShowDeleteDialog(true);
  }

  // Xử lý khi xác nhận xóa nội dung lớp học
  async function handleForceDeleteConfirm() {
    if (!pendingPayload) return;
    setShowForceDeleteDialog(false);
    setSaving(true);
    try {
      const payload2 = { ...pendingPayload, forceDeleteContentAndCourse: true };
      await classService.update(cls.id, payload2);
      success("Cập nhật lớp thành công");
      navigate("/home/admin/class");
    } catch (e) {
      let msg = "Không thể cập nhật lớp";
      if (e.response?.data?.message) msg = e.response.data.message;
      else if (e.response?.data?.error) msg = e.response.data.error;
      error(msg);
    } finally {
      setSaving(false);
      setPendingPayload(null);
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
                    else navigate("/home/admin/class");
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

        <div className="max-w-[1600px] mx-auto px-6 py-4">
          {currentStep === 1 && (
            <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-4 items-start">
              {/* Left form */}
              <div
                className={`rounded-2xl p-4 bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg ${
                  isOnline ? "shadow-indigo-500/20" : "shadow-green-500/20"
                }`}
              >
                <div className="mb-3">
                  <div
                    className={`flex items-center gap-3 p-3 ${accentBlockGradient} text-white rounded-xl shadow-lg w-full ${accentShadowStrong}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-lg flex-shrink-0">
                      {isOnline ? "🌐" : "🏫"}
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold">
                        {isOnline ? "Lớp học Online" : "Lớp học Offline"}
                      </h2>
                      <p className="text-[10px] text-white/80">
                        Chỉnh sửa thông tin lớp
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {isPublic && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-700 leading-relaxed">
                      <div className="font-semibold">⚠️ Lớp đã Public</div>
                      <p className="mt-0.5">
                        {isOnline
                          ? "Chỉ sửa được Link Meet và Sĩ số"
                          : "Chỉ sửa được Phòng học và Sĩ số"}
                      </p>
                    </div>
                  )}

                  {isDraft && (
                    <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-700 leading-relaxed">
                      <div className="font-semibold flex items-center gap-1">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Một số trường bị khóa
                      </div>
                      <p className="mt-0.5">
                        <strong>Môn học</strong>, <strong>Giáo viên</strong>,{" "}
                        <strong>Khóa học</strong>, <strong>Tên lớp</strong>{" "}
                        không thể thay đổi sau khi tạo.
                      </p>
                    </div>
                  )}

                  {/* Thông báo và nút xóa cho lớp DRAFT */}
                  {isDraft && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-[11px] text-red-700 leading-relaxed">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold flex items-center gap-1">
                            <Trash2 className="w-3.5 h-3.5" />
                            Có thể xóa lớp
                          </div>
                          <p className="mt-0.5">
                            Lớp đang ở trạng thái{" "}
                            <strong>DRAFT (bản nháp)</strong> nên có thể xóa
                            vĩnh viễn.
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={openDeleteDialog}
                          disabled={deleting}
                          className="h-7 px-2.5 text-[10px] flex-shrink-0"
                        >
                          {deleting ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              Đang xóa...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-3 w-3 mr-1" />
                              Xóa lớp
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Row 1: Ngày bắt đầu + Ngày kết thúc */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Ngày bắt đầu <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={startDate}
                        min={
                          isPublic
                            ? startDate
                            : originalStartDate && originalStartDate < todayStr
                            ? originalStartDate
                            : todayStr
                        }
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-9 text-sm"
                        disabled={isPublic}
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
                      <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                        Môn học <span className="text-red-500">*</span>
                        {(isDraft || isPublic) && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 font-normal">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Đã khóa
                          </span>
                        )}
                      </label>
                      <Select
                        key={`subject-${subjectId}-${subjects.length}`}
                        value={String(subjectId)}
                        onValueChange={setSubjectId}
                        disabled={true}
                      >
                        <SelectTrigger className="h-9 text-sm w-full bg-gray-100 cursor-not-allowed opacity-70">
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
                      <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                        Giáo viên <span className="text-red-500">*</span>
                        {(isDraft || isPublic) && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 font-normal">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Đã khóa
                          </span>
                        )}
                      </label>
                      <Select
                        key={`teacher-${teacherId}-${teachers.length}`}
                        value={String(teacherId)}
                        onValueChange={setTeacherId}
                        disabled={true}
                      >
                        <SelectTrigger className="h-9 text-sm w-full bg-gray-100 cursor-not-allowed opacity-70">
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

                  {/* Row 3: Khóa học */}
                  {subjectId && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                        Khóa học <span className="text-red-500">*</span>
                        {(isDraft || isPublic) && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 font-normal">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Đã khóa
                          </span>
                        )}
                      </label>
                      <Select
                        key={`course-${courseId}-${courses.length}`}
                        value={String(courseId)}
                        onValueChange={setCourseId}
                        disabled={true}
                      >
                        <SelectTrigger className="h-auto min-h-[36px] text-sm py-2 bg-gray-100 cursor-not-allowed opacity-70">
                          <SelectValue
                            placeholder="Chọn khóa học"
                            className="whitespace-normal line-clamp-2"
                          />
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
                    </div>
                  )}

                  {/* Row 4: Phòng học/Link Meet + Số buổi */}
                  <div className="grid grid-cols-2 gap-3">
                    {isOnline ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Link Meet <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={meetingLink}
                          onChange={(e) => setMeetingLink(e.target.value)}
                          placeholder="https://"
                          className="h-9 text-sm"
                        />
                        {meetingLink && !isValidUrl(meetingLink) && (
                          <p className="text-[10px] text-red-600 mt-0.5">
                            Link không hợp lệ
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Phòng học <span className="text-red-500">*</span>
                        </label>
                        <Select
                          key={`room-${roomId}-${rooms.length}`}
                          value={String(roomId)}
                          onValueChange={setRoomId}
                        >
                          <SelectTrigger
                            className={`h-9 text-sm ${
                              roomConflict
                                ? "border-red-400 ring-1 ring-red-200"
                                : ""
                            }`}
                          >
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
                        {/* Room conflict warning */}
                        {checkingRoomConflict && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Đang kiểm tra phòng...
                          </div>
                        )}
                        {roomConflict && !checkingRoomConflict && (
                          <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs text-red-700 font-medium">
                                  Phòng bị trùng lịch!
                                </p>
                                <p className="text-[11px] text-red-600 mt-0.5">
                                  {roomConflict.roomName} đã có lớp khác dạy vào{" "}
                                  {roomConflict.dayName} (
                                  {roomConflict.slotTime})
                                </p>
                                <p className="text-[10px] text-red-500 mt-1">
                                  Vui lòng chọn phòng khác
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Số buổi <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={totalSessions}
                        onChange={(e) => setTotalSessions(e.target.value)}
                        className="h-9 text-sm"
                        disabled={isPublic}
                      />
                    </div>
                  </div>

                  {/* Row 5: Sĩ số + Giá/buổi */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Sĩ số <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={isOnline ? 30 : undefined}
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className={`h-9 text-sm ${
                          isPublic &&
                          capacity &&
                          parseInt(capacity) < (cls?.currentStudents || 0)
                            ? "border-red-500 focus:ring-red-500"
                            : ""
                        }`}
                      />
                      {/* Cảnh báo real-time khi sĩ số < số học sinh hiện tại (lớp PUBLIC) */}
                      {isPublic &&
                        capacity &&
                        parseInt(capacity) < (cls?.currentStudents || 0) && (
                          <p className="text-[10px] text-red-600 mt-0.5 font-medium">
                            ⚠️ Không thể giảm sĩ số xuống {capacity} vì lớp đang
                            có {cls?.currentStudents} học sinh
                          </p>
                        )}
                      {!isOnline && selectedRoom?.capacity && (
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Tối đa: {selectedRoom.capacity}
                        </p>
                      )}
                      {isOnline && capacity && parseInt(capacity) > 30 && (
                        <p className="text-[10px] text-red-600 mt-0.5">
                          Tối đa 30
                        </p>
                      )}
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
                        className="h-9 text-sm"
                        disabled={isPublic}
                      />
                    </div>
                  </div>

                  {/* Row 6: Tên lớp */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                      Tên lớp
                      {(isDraft || isPublic) && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 font-normal">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Đã khóa
                        </span>
                      )}
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-9 text-sm bg-gray-100 font-medium cursor-not-allowed opacity-70"
                      disabled={true}
                      readOnly
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
                      readOnly={isPublic}
                    />
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!step1Valid}
                    className={`w-full h-10 rounded-xl ${accentGradient} text-white shadow-lg ${accentShadowStrong} hover:brightness-105 mt-2`}
                  >
                    Xem trước
                  </Button>
                </div>
              </div>
              {/* Right schedule grid */}
              <div
                className={`rounded-2xl p-4 bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg ${
                  isOnline ? "shadow-indigo-500/20" : "shadow-green-500/20"
                }`}
              >
                <div
                  className={`-mx-4 px-4 py-2.5 rounded-xl text-white ${accentStepGradient} shadow-md flex items-center justify-between`}
                >
                  <h2 className="text-lg font-bold">Lịch học</h2>
                  {/* Lớp PUBLIC: cần bấm Chỉnh sửa để sửa lịch */}
                  {isPublic &&
                    (!isEditingSchedule ? (
                      <Button
                        variant="outline"
                        onClick={startEditSchedule}
                        className="h-8 px-3 text-xs bg-white/10 border-white/30 text-white hover:brightness-110"
                        disabled={isPublic}
                      >
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={cancelEditSchedule}
                        className="h-8 px-3 text-xs bg-white/10 border-white/30 text-white hover:brightness-110"
                      >
                        Hủy
                      </Button>
                    ))}
                  {/* Lớp DRAFT: có nút Hủy để quản lý thay đổi */}
                  {isDraft && (
                    <Button
                      variant="outline"
                      onClick={cancelEditSchedule}
                      className="h-8 px-3 text-xs bg-white/10 border-white/30 text-white hover:brightness-110"
                    >
                      Hủy
                    </Button>
                  )}
                </div>

                {/* Lớp DRAFT: hiện ScheduleGrid luôn để dễ xem phòng bận + lịch GV */}
                {isDraft && (
                  <div className="mt-4">
                    {/* Thông báo hướng dẫn */}
                    <div className="mb-3 p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-700 leading-relaxed">
                      <div className="font-semibold flex items-center gap-1">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Có thể chuyển slot cũ sang slot mới
                      </div>
                      <p className="mt-0.5">
                        Click vào ô{" "}
                        <span className="font-semibold text-blue-800">
                          Slot cũ
                        </span>{" "}
                        để bỏ chọn, sau đó click vào ô{" "}
                        <span className="font-semibold text-blue-800">
                          Trống
                        </span>{" "}
                        để chọn slot mới. Các ô{" "}
                        <span className="font-semibold text-orange-600">
                          GV bận
                        </span>{" "}
                        và{" "}
                        <span className="font-semibold text-gray-600">
                          Phòng bận
                        </span>{" "}
                        không thể chọn.
                      </p>
                    </div>
                    <ScheduleGrid
                      timeSlots={timeSlots}
                      weekStart={weekStart}
                      teacherBusy={teacherBusy}
                      roomBusy={isOnline ? [] : roomBusy}
                      selected={pickedSlots}
                      originalSelected={prevPickedSlots}
                      onToggle={toggleSlot}
                      disabled={!teacherId || (!isOnline && !roomId)}
                    />
                  </div>
                )}

                {/* Lớp PUBLIC: giữ nguyên logic cũ - cần bấm Chỉnh sửa mới thấy grid */}
                {isPublic &&
                  (!isEditingSchedule ? (
                    <div className="mt-4">
                      {pickedSlots.length === 0 ? (
                        <p className="text-xs text-gray-500">
                          Chưa có lịch học.
                        </p>
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
                  ))}
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
          {/* Footer actions - only for step 2 */}
          {currentStep === 2 && (
            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="px-6 h-10 rounded-xl"
              >
                Quay lại bước 1
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className={`px-8 h-10 rounded-xl ${accentGradient} text-white shadow-lg ${accentShadowStrong} hover:brightness-105`}
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
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl">Xác nhận xóa lớp học</DialogTitle>
          </DialogHeader>
          <DialogContent className="text-gray-500 mb-6">
            Bạn có chắc chắn muốn xóa lớp <strong>"{cls?.name}"</strong> không?
            <br />
            <span className="text-red-500 font-medium">
              Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn và không thể khôi
              phục.
            </span>
          </DialogContent>
          <DialogFooter className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
              className="min-w-[100px]"
            >
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="min-w-[100px] bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </Dialog>

      {/* Force Delete Content Confirmation Dialog */}
      <Dialog
        open={showForceDeleteDialog}
        onOpenChange={setShowForceDeleteDialog}
      >
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-7 w-7 text-amber-600" />
          </div>
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl">Xác nhận xóa nội dung</DialogTitle>
          </DialogHeader>
          <DialogContent className="text-gray-500 mb-6">
            Lớp đang có nội dung buổi học và khóa học của giáo viên.
            <br />
            <span className="text-amber-600 font-medium">
              Bạn có muốn xóa toàn bộ nội dung này để tiếp tục cập nhật?
            </span>
          </DialogContent>
          <DialogFooter className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowForceDeleteDialog(false);
                setPendingPayload(null);
              }}
              disabled={saving}
              className="min-w-[100px]"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleForceDeleteConfirm}
              disabled={saving}
              className="min-w-[100px] bg-amber-600 hover:bg-amber-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận & Tiếp tục"
              )}
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </>
  );
}
