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
} from "lucide-react";

import { courseApi } from "../../../services/course/course.api.js";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-950">
            Quản lý khóa học (Admin)
          </h1>
          <p className="text-base text-[#62748e] mt-2 max-w-2xl">
            Xem, phê duyệt và quản lý tất cả khóa học do giáo viên biên soạn.
          </p>
        </div>
      </div>

      {/* QUICK PENDING BANNER */}
      {hasPending && (
        <Card className="rounded-2xl border-2 border-yellow-300 bg-yellow-50">
          <CardContent className="py-4 px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-700" />
              </div>
              <div>
                <p className="text-lg font-semibold text-yellow-900">
                  Có {stats.pending} khóa học đang chờ phê duyệt
                </p>
                <p className="text-sm text-yellow-800">
                  Hãy xử lý sớm để giáo viên có thể sử dụng trong lớp học.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleQuickPendingFilter}
              className="h-12 px-6 bg-yellow-500 hover:bg-yellow-600 text-white text-base rounded-xl inline-flex items-center gap-2"
            >
              <Clock className="w-5 h-5" />
              Xem khóa học chờ duyệt
            </Button>
          </CardContent>
        </Card>
      )}

      {/* DASHBOARD STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatsCard
          title="Tổng khóa học"
          value={stats.total}
          icon={BookOpen}
          className="bg-blue-50 text-blue-900"
        />
        <StatsCard
          title="Chờ phê duyệt"
          value={stats.pending}
          icon={Clock}
          className="bg-yellow-50 text-yellow-900"
        />
        <StatsCard
          title="Đã phê duyệt"
          value={stats.approved}
          icon={CheckCircle2}
          className="bg-green-50 text-green-900"
        />
        <StatsCard
          title="Đã từ chối"
          value={stats.rejected}
          icon={XCircle}
          className="bg-red-50 text-red-900"
        />
        <StatsCard
          title="Nháp"
          value={stats.draft}
          icon={FileText}
          className="bg-gray-100 text-gray-800"
        />
        <StatsCard
          title="Giáo viên"
          value={stats.teacherCount}
          icon={Users}
          className="bg-indigo-50 text-indigo-900"
        />
      </div>

      {/* FILTER BAR */}
      <Card className="rounded-2xl border-2 border-gray-200">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-end gap-6">
            {/* Search */}
            <div className="flex-1">
              <label className="text-sm font-medium text-[#62748e] mb-2 block">
                Tìm kiếm
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#62748e]" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm theo tên khóa học, mã khóa, hoặc tên giáo viên..."
                  className="pl-10 h-12 text-base rounded-xl"
                />
              </div>
            </div>

            {/* Teacher filter */}
            <div className="w-full lg:w-56">
              <label className="text-sm font-medium text-[#62748e] mb-2 block">
                Giáo viên
              </label>
              <Select
                value={selectedTeacherId}
                onValueChange={setSelectedTeacherId}
              >
                <SelectTrigger className="w-full h-12 rounded-xl text-base">
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
            <div className="w-full lg:w-56">
              <label className="text-sm font-medium text-[#62748e] mb-2 block">
                Môn học
              </label>
              <Select
                value={selectedSubjectId}
                onValueChange={setSelectedSubjectId}
              >
                <SelectTrigger className="w-full h-12 rounded-xl text-base">
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
            <div className="w-full lg:w-56">
              <label className="text-sm font-medium text-[#62748e] mb-2 block">
                Trạng thái
              </label>
              <div className="flex items-center gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-full h-12 rounded-xl text-base">
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
                  className="h-12 w-12 rounded-xl"
                  onClick={handleResetFilters}
                >
                  <Filter className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* COURSE LIST */}
      <div className="space-y-4">
        {loading && (
          <Card className="rounded-2xl border-2 border-gray-200 p-6 text-base text-[#62748e]">
            Đang tải danh sách khóa học...
          </Card>
        )}

        {!loading && visibleCourses.length === 0 && (
          <Card className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 py-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full border border-gray-300 flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-[#62748e]" />
            </div>
            <p className="text-lg font-semibold text-neutral-950 mb-2">
              Không tìm thấy khóa học nào
            </p>
            <p className="text-sm text-[#45556c] max-w-md">
              Hãy thay đổi bộ lọc hoặc yêu cầu giáo viên tạo thêm khóa học mới.
            </p>
          </Card>
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
              <Card
                key={course.id}
                className="rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-colors"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                    {/* LEFT MAIN CONTENT */}
                    <div className="flex-1 flex gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h2 className="text-xl font-semibold text-neutral-950">
                            {course.title}
                          </h2>
                          {course.code && (
                            <span className="text-sm text-gray-500">
                              Mã: {course.code}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#62748e]">
                          {course.subjectName || "Chưa có môn học"}
                        </p>
                        {course.description && (
                          <p className="text-sm text-[#45556c] line-clamp-3">
                            {course.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* MIDDLE INFO */}
                    <div className="flex flex-col gap-3 min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                          <Layers className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-[#62748e]">Số chương</p>
                          <p className="text-lg font-semibold text-neutral-950">
                            {chapterCount}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-[#62748e]">Số bài học</p>
                          <p className="text-lg font-semibold text-neutral-950">
                            {lessonCount}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                          <CalendarClock className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs text-[#62748e]">
                            Ngày tạo (FE demo)
                          </p>
                          <p className="text-sm text-neutral-950">
                            {course.createdAt || "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT SIDEBAR: TEACHER + STATUS + ACTIONS */}
                    <div className="flex flex-col items-stretch gap-3 min-w-[260px]">
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
                          <span className="align-middle">
                            {statusCfg.label}
                          </span>
                        </Badge>
                        <p className="text-xs text-[#62748e]">
                          ID: {course.id}
                        </p>
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
                          className="h-11 px-4 rounded-xl text-sm inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleViewDetail(course.id)}
                        >
                          <Eye className="w-4 h-4" />
                          Xem chi tiết
                        </Button>
                        {isPending && (
                          <Badge className="h-11 px-4 rounded-xl text-sm inline-flex items-center gap-2 bg-orange-100 text-orange-700 border border-orange-300">
                            <Clock className="w-4 h-4" />
                            Cần phê duyệt
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
