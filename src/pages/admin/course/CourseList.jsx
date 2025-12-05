// src/pages/admin/course/AdminCourseList.jsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Input } from "../../../components/ui/Input.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui/Select.jsx";

import {
  BookOpen,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  AlertTriangle,
  AlertCircle,
  Eye,
  User as UserIcon,
  Mail,
  Layers,
  CalendarClock,
  GraduationCap,
} from "lucide-react";

import { courseApi } from "../../../services/course/course.api.js";
import { courseService } from "../../../services/course/course.service.js";
import { classService } from "../../../services/class/class.service.js";
import { subjectService } from "../../../services/subject/subject.service.js";
import { useToast } from "../../../hooks/use-toast.js";

/**
 * Map màu + nhãn status
 */
function getStatusConfig(status) {
  const normalized = String(status || "").toUpperCase();

  switch (normalized) {
    case "APPROVED":
      return {
        label: "Đã phê duyệt",
        className: "bg-green-50 text-green-700 border border-green-200",
        icon: CheckCircle2,
      };
    case "PENDING":
      return {
        label: "Chờ phê duyệt",
        className: "bg-yellow-50 text-yellow-700 border border-yellow-300",
        icon: Clock,
      };
    case "REJECTED":
      return {
        label: "Đã từ chối",
        className: "bg-red-50 text-red-700 border border-red-200",
        icon: XCircle,
      };
    case "DRAFT":
      return {
        label: "Nháp",
        className: "bg-gray-100 text-gray-700 border border-gray-300",
        icon: FileText,
      };
    case "ARCHIVED":
      return {
        label: "Đã ẩn",
        className: "bg-gray-100 text-gray-600 border border-gray-200",
        icon: AlertCircle,
      };
    default:
      return {
        label: "Không xác định",
        className: "bg-gray-50 text-gray-600 border border-gray-200",
        icon: AlertCircle,
      };
  }
}

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ phê duyệt" },
  { value: "APPROVED", label: "Đã phê duyệt" },
  { value: "REJECTED", label: "Đã từ chối" },
  { value: "DRAFT", label: "Nháp" },
];

export default function AdminCourseList() {
  const navigate = useNavigate();
  const { error } = useToast();

  // ====== DATA STATE ======
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classMap, setClassMap] = useState({}); // { [classId]: classDetail }
  const [sourceCourseMap, setSourceCourseMap] = useState({}); // { [sourceId]: courseDetail }
  const [courseIdToClass, setCourseIdToClass] = useState({}); // { [courseId]: classDetail }

  // ====== FILTERS ======
  const [search, setSearch] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("ALL");
  const [selectedSubjectId, setSelectedSubjectId] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // ====== LOAD SUBJECTS ======
  useEffect(() => {
    (async () => {
      try {
        const data = await subjectService.all();
        setSubjects(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load subjects:", e);
        error("Không thể tải danh sách môn học");
      }
    })();
  }, [error]);

  // ====== LOAD COURSES (ADMIN VIEW) ======
  useEffect(() => {
    let ignore = false;

    async function fetchCourses() {
      setLoading(true);
      try {
        // Gửi subject + status cho BE, các filter khác xử lý ở FE
        const params = {};
        if (selectedSubjectId !== "ALL") {
          params.subjectId = Number(selectedSubjectId);
        }
        if (statusFilter !== "ALL") {
          params.status = statusFilter;
        }

        const data = await courseApi.list(params);
        if (!ignore) {
          setCourses(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Failed to load courses (admin):", e);
        if (!ignore) {
          error("Không thể tải danh sách khóa học");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchCourses();

    return () => {
      ignore = true;
    };
  }, [selectedSubjectId, statusFilter, error]);

  // ====== ENRICH: fetch class names by classId across loaded courses ======
  useEffect(() => {
    const ids = new Set();
    for (const c of courses) {
      const classId = c?.classId || c?.clazzId || c?.classID;
      if (classId != null && classId !== "") ids.add(String(classId));
    }
    const missing = Array.from(ids).filter((id) => !classMap[id]);
    if (missing.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.all(
          missing.map(async (id) => {
            try {
              const detail = await classService.getById(id);
              return { id, detail };
            } catch (e) {
              console.warn(
                "[AdminCourseList] fetch class detail failed id=",
                id,
                e
              );
              return { id, detail: null };
            }
          })
        );
        if (!cancelled && results.length) {
          setClassMap((prev) => {
            const next = { ...prev };
            for (const { id, detail } of results) next[id] = detail;
            return next;
          });
        }
      } catch (e) {
        console.warn("[AdminCourseList] batch class fetch error:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [courses, classMap]);

  // ====== ENRICH: fetch admin/source course titles via [[SOURCE:id]] ======
  useEffect(() => {
    const ids = new Set();
    for (const c of courses) {
      const m = String(c?.description || "").match(/\[\[SOURCE:([^\]]+)\]\]/);
      if (m && m[1]) {
        const sid = m[1].trim();
        if (sid) ids.add(sid);
      }
    }
    const missing = Array.from(ids).filter((id) => !sourceCourseMap[id]);
    if (missing.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.all(
          missing.map(async (id) => {
            try {
              const detail = await courseService.getCourseDetail(id);
              return { id, detail };
            } catch (e) {
              console.warn(
                "[AdminCourseList] fetch source course failed id=",
                id,
                e
              );
              return { id, detail: null };
            }
          })
        );
        if (!cancelled && results.length) {
          setSourceCourseMap((prev) => {
            const next = { ...prev };
            for (const { id, detail } of results) next[id] = detail;
            return next;
          });
        }
      } catch (e) {
        console.warn("[AdminCourseList] batch source course fetch error:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [courses, sourceCourseMap]);

  // ====== FALLBACK: find classes by courseId if classId missing ======
  useEffect(() => {
    const missingCourseIds = [];
    for (const c of courses) {
      const classId = c?.classId || c?.clazzId || c?.classID;
      if (!classId && c?.id && !courseIdToClass[String(c.id)]) {
        missingCourseIds.push(String(c.id));
      }
    }
    if (missingCourseIds.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.all(
          missingCourseIds.map(async (courseId) => {
            try {
              const list = await classService.list({ courseId });
              const first =
                Array.isArray(list) && list.length > 0 ? list[0] : null;
              return { courseId, detail: first };
            } catch (e) {
              console.warn(
                "[AdminCourseList] list classes by courseId failed:",
                courseId,
                e
              );
              return { courseId, detail: null };
            }
          })
        );
        if (!cancelled && results.length) {
          setCourseIdToClass((prev) => {
            const next = { ...prev };
            for (const { courseId, detail } of results) next[courseId] = detail;
            return next;
          });
          setClassMap((prev) => {
            const next = { ...prev };
            for (const { detail } of results) {
              if (detail?.id) next[String(detail.id)] = detail;
            }
            return next;
          });
        }
      } catch (e) {
        console.warn("[AdminCourseList] batch courseId→class error:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [courses, courseIdToClass]);

  // ====== TEACHER OPTIONS (từ dữ liệu course hiện có) ======
  // Chỉ hiển thị khóa học do giáo viên gửi lên (có ownerTeacherId)
  const teacherCourses = useMemo(
    () => courses.filter((c) => !!c.ownerTeacherId),
    [courses]
  );

  const teacherOptions = useMemo(() => {
    const map = new Map();
    teacherCourses.forEach((c) => {
      const id = c.ownerTeacherId ?? c.createdByUserId;
      const name = c.ownerTeacherName ?? c.createdByName ?? "Không rõ";
      if (id && !map.has(id)) {
        map.set(id, { id, name });
      }
    });
    return Array.from(map.values());
  }, [teacherCourses]);

  // ====== VISIBLE COURSES (FILTER CLIENT) ======
  const visibleCourses = useMemo(() => {
    // Module "Khóa học" chỉ hiển thị khóa học do giáo viên tạo/gửi lên
    let list = [...teacherCourses];

    // search: title, code, teacher name
    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      list = list.filter((c) => {
        const title = String(c.title || "").toLowerCase();
        const code = String(c.code || "").toLowerCase();
        const teacherName = String(
          c.ownerTeacherName || c.createdByName || ""
        ).toLowerCase();
        return (
          title.includes(keyword) ||
          code.includes(keyword) ||
          teacherName.includes(keyword)
        );
      });
    }

    // teacher
    if (selectedTeacherId !== "ALL") {
      const tid = Number(selectedTeacherId);
      list = list.filter(
        (c) =>
          c.ownerTeacherId === tid ||
          (!c.ownerTeacherId && c.createdByUserId === tid)
      );
    }

    // status (đã phần nào lọc ở BE, nhưng giữ lại để chắc)
    if (statusFilter !== "ALL") {
      list = list.filter(
        (c) => String(c.status).toUpperCase() === statusFilter
      );
    }

    return list;
  }, [teacherCourses, search, selectedTeacherId, statusFilter]);

  // ====== STATS (theo toàn bộ danh sách) ======
  const stats = useMemo(() => {
    const total = teacherCourses.length;
    const countByStatus = (st) =>
      teacherCourses.filter((c) => String(c.status).toUpperCase() === st)
        .length;

    return {
      total,
      pending: countByStatus("PENDING"),
      approved: countByStatus("APPROVED"),
      rejected: countByStatus("REJECTED"),
      draft: countByStatus("DRAFT"),
      archived: countByStatus("ARCHIVED"),
      teacherCount: teacherOptions.length,
    };
  }, [teacherCourses, teacherOptions]);

  const hasPending = stats.pending > 0;

  // ====== ACTION HANDLERS ======

  const handleResetFilters = () => {
    setSearch("");
    setSelectedTeacherId("ALL");
    setSelectedSubjectId("ALL");
    setStatusFilter("ALL");
  };

  const handleQuickPendingFilter = () => {
    setStatusFilter("PENDING");
  };

  const handleViewDetail = (courseId) => {
    navigate(`/home/admin/courses/${courseId}`);
  };

  // ====== RENDER ======

  return (
    <div className="p-6 min-h-screen">
      {/* ============ HEADER ============ */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-200">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý khóa học
            </h1>
            <p className="text-sm text-gray-500">
              Xem, phê duyệt và quản lý tất cả khóa học do giáo viên biên soạn
            </p>
          </div>
        </div>
      </div>

      {/* ============ STATS CARDS ============ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Tổng khóa học</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Chờ phê duyệt</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.pending}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Đã phê duyệt</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.approved}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Đã từ chối</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.rejected}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Nháp</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.draft}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Giáo viên</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.teacherCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
        </div>
      </div>

      {/* QUICK PENDING BANNER */}
      {hasPending && (
        <div className="mb-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-base font-semibold text-amber-900">
                Có {stats.pending} khóa học đang chờ phê duyệt
              </p>
              <p className="text-sm text-amber-800">
                Hãy xử lý sớm để giáo viên có thể sử dụng trong lớp học.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleQuickPendingFilter}
            className="h-11 px-5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl inline-flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Xem khóa học chờ duyệt
          </Button>
        </div>
      )}

      {/* ============ TOOLBAR ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm khóa học..."
                className="pl-9 h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Teacher filter */}
          <div className="w-full lg:w-48">
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              Giáo viên
            </label>
            <Select
              value={selectedTeacherId}
              onValueChange={setSelectedTeacherId}
            >
              <SelectTrigger className="w-full h-11 rounded-xl">
                <SelectValue placeholder="Lọc theo giáo viên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả giáo viên</SelectItem>
                {teacherOptions.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject filter */}
          <div className="w-full lg:w-48">
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              Môn học
            </label>
            <Select
              value={selectedSubjectId}
              onValueChange={setSelectedSubjectId}
            >
              <SelectTrigger className="w-full h-11 rounded-xl">
                <SelectValue placeholder="Lọc theo môn học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả môn học</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status filter */}
          <div className="w-full lg:w-48">
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              Trạng thái
            </label>
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-full h-11 rounded-xl">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-xl"
                onClick={handleResetFilters}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ============ COURSE LIST ============ */}
      <div className="space-y-4">
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-base text-gray-500">
            Đang tải danh sách khóa học...
          </div>
        )}

        {!loading && visibleCourses.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 py-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full border border-gray-300 flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy khóa học nào
            </p>
            <p className="text-sm text-gray-500 max-w-md">
              Hãy thay đổi bộ lọc hoặc yêu cầu giáo viên tạo thêm khóa học mới.
            </p>
          </div>
        )}

        {!loading &&
          visibleCourses.map((course) => {
            const statusCfg = getStatusConfig(course.status);
            const StatusIcon = statusCfg.icon;

            const chapterCount =
              course.chapterCount ??
              (course.chapters ? course.chapters.length : 0);
            const lessonCount =
              course.lessonCount ??
              (course.chapters
                ? course.chapters.reduce(
                    (sum, ch) => sum + (ch.lessons?.length || 0),
                    0
                  )
                : 0);

            const teacherName =
              course.ownerTeacherName || course.createdByName || "Không rõ";
            const teacherEmail = course.teacherEmail || ""; // hiện BE chưa có

            const isPending = String(course.status).toUpperCase() === "PENDING";
            const isRejected =
              String(course.status).toUpperCase() === "REJECTED";

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all p-6"
              >
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                  {/* LEFT MAIN CONTENT */}
                  <div className="flex-1 flex gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
                      <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {course.title}
                        </h2>
                        {course.code && (
                          <span className="text-sm text-gray-500">
                            Mã: {course.code}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {course.subjectName || "Chưa có môn học"}
                      </p>
                      {course.description && (
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {course.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* MIDDLE INFO */}
                  <div className="flex flex-col gap-3 min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Số chương</p>
                        <p className="text-base font-semibold text-gray-900">
                          {chapterCount}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Số bài học</p>
                        <p className="text-base font-semibold text-gray-900">
                          {lessonCount}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                        <CalendarClock className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Ngày tạo</p>
                        <p className="text-sm text-gray-900">
                          {course.createdAt || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SIDEBAR: TEACHER + STATUS + ACTIONS */}
                  <div className="flex flex-col items-stretch gap-3 min-w-[240px]">
                    {/* Teacher box */}
                    <div className="bg-indigo-50 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-indigo-700" />
                        </div>
                        <div>
                          <p className="text-xs text-indigo-700">
                            Giảng viên phụ trách
                          </p>
                          <p className="text-sm font-semibold text-indigo-900">
                            {teacherName}
                          </p>
                        </div>
                      </div>
                      {teacherEmail && (
                        <div className="flex items-center gap-2 text-xs text-indigo-800 mt-1">
                          <Mail className="w-4 h-4" />
                          <span>{teacherEmail}</span>
                        </div>
                      )}
                    </div>

                    {/* Status + ID */}
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        className={`text-xs px-3 py-1 rounded-full ${statusCfg.className}`}
                      >
                        <StatusIcon className="w-3 h-3 mr-1 inline-block align-middle" />
                        <span className="align-middle">{statusCfg.label}</span>
                      </Badge>
                      <p className="text-xs text-gray-500">ID: {course.id}</p>
                    </div>

                    {/* Rejection reason */}
                    {isRejected && course.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-xs text-red-800">
                        <p className="font-semibold mb-1">Lý do từ chối:</p>
                        <p className="whitespace-pre-line">
                          {course.rejectionReason}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Button
                        type="button"
                        className="h-10 px-4 rounded-xl text-sm inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleViewDetail(course.id)}
                      >
                        <Eye className="w-4 h-4" />
                        Xem chi tiết
                      </Button>
                      {isPending && (
                        <Badge className="h-10 px-4 rounded-xl text-sm inline-flex items-center gap-2 bg-orange-100 text-orange-700 border border-orange-300">
                          <Clock className="w-4 h-4" />
                          Cần phê duyệt
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

/**
 * Card nhỏ cho dashboard statistics
 */
// eslint-disable-next-line no-unused-vars
function StatsCard({ title, value, icon: Icon, className = "" }) {
  return (
    <Card className={`rounded-2xl border-0 shadow-sm ${className}`}>
      <CardContent className="p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/70 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
