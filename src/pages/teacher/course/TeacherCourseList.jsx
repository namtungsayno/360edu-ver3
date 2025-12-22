// src/pages/teacher/TeacherCourseList.jsx
// QUản lý khóa học theo lớp - "Quản lý khóa học theo lớp"
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "../../../components/ui/Card.jsx";
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
  Layers,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { courseService } from "../../../services/course/course.service.js";
import { classService } from "../../../services/class/class.service.js";
import { stripHtmlTags } from "../../../utils/html-helpers.js";
import { useToast } from "../../../hooks/use-toast.js";
import { useAuth } from "../../../hooks/useAuth.js";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "APPROVED", label: "Đang hoạt động" },
  { value: "ARCHIVED", label: "Đã lưu trữ" },
];

function getStatusConfig(status) {
  const normalized = String(status || "").toUpperCase();

  switch (normalized) {
    case "APPROVED":
      return {
        label: "Đang hoạt động",
        className: "bg-green-50 text-green-700 border border-green-200",
        icon: CheckCircle2,
      };
    case "DISABLED":
    case "ARCHIVED":
      return {
        label: "Đã lưu trữ",
        className: "bg-gray-50 text-gray-600 border border-gray-200",
        icon: AlertCircle,
      };
    default:
      return {
        label: "Đang hoạt động",
        className: "bg-green-50 text-green-700 border border-green-200",
        icon: CheckCircle2,
      };
  }
}

export default function TeacherCourseList() {
  const navigate = useNavigate();
  const { error } = useToast();
  const { user: _user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classMap, setClassMap] = useState({}); // { [classId]: classDetail }
  const [sourceCourseMap, setSourceCourseMap] = useState({}); // { [sourceId]: courseDetail }
  const [courseIdToClass] = useState({}); // { [courseId]: classDetail } - read-only fallback map

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // ====== LOAD DATA ======
  useEffect(() => {
    let ignore = false;

    async function fetchCourses() {
      try {
        setLoading(true);
        const data = await courseService.listMyCourses({
          search: search || undefined,
          status: statusFilter === "ALL" ? undefined : statusFilter,
        });
        if (!ignore) {
          const list = Array.isArray(data) ? data : [];
          // Hiển thị tất cả khóa học cá nhân (bỏ ràng buộc SOURCE/OWNER)
          setCourses(list);
        }
      } catch (e) {
        if (!ignore) {
          error("Không thể tải danh sách khóa học");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchCourses();

    return () => {
      ignore = true;
    };
  }, [search, statusFilter, error]);

  // ====== ENRICH WITH LIVE CLASS NAMES ======
  useEffect(() => {
    // Collect unique class IDs from loaded courses
    const ids = new Set();
    for (const c of courses) {
      const classId = c?.classId || c?.clazzId || c?.classID;
      if (classId != null && classId !== "") ids.add(String(classId));
    }

    // Determine which IDs we still need to fetch
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
        }
    })();

    return () => {
      cancelled = true;
    };
  }, [courses, classMap]);

  // ====== ENRICH WITH ADMIN (SOURCE) COURSE TITLES ======
  useEffect(() => {
    // Find unique SOURCE ids from course descriptions
    const ids = new Set();
    for (const c of courses) {
      const desc = String(c?.description || "");
      const m = desc.match(/\[\[SOURCE:([^\]]+)\]\]/);
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
        }
    })();

    return () => {
      cancelled = true;
    };
  }, [courses, sourceCourseMap]);

  // (ĐÃ BỎ fallback tìm lớp theo courseId để tránh gọi API liên tục khi không xác định được lớp)

  // ====== DERIVED STATS ======
  const stats = useMemo(() => {
    const total = courses.length;
    const approved = courses.filter(
      (c) => String(c.status).toUpperCase() === "APPROVED" || !c.status
    ).length;
    const archived = courses.filter(
      (c) => String(c.status).toUpperCase() === "ARCHIVED"
    ).length;

    return { total, approved, archived };
  }, [courses]);

  // NOTE: Search and status filter are now handled by the BE API (courseService.listMyCourses)
  // No additional FE filtering needed - just use 'courses' directly

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
          <BookOpen className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý khóa học theo lớp
          </h1>
          <p className="text-sm text-gray-500">
            Xem và quản lý các khóa học cá nhân mà bạn trực tiếp biên soạn.
          </p>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 rounded-[14px]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-[12px] text-[#62748e]">Tổng số khóa học</p>
              <p className="text-neutral-950 text-base font-semibold">
                {stats.total}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-[14px]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-[12px] text-[#62748e]">Đang hoạt động</p>
              <p className="text-neutral-950 text-base font-semibold">
                {stats.approved}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-[14px]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-[12px] text-[#62748e]">Đã lưu trữ</p>
              <p className="text-neutral-950 text-base font-semibold">
                {stats.archived}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* FILTER BAR */}
      <Card className="p-4 rounded-[14px] border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Search */}
          <div className="flex-1 w-full">
            <label className="text-[12px] text-[#62748e] mb-1 block">
              Tìm kiếm khóa học
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#62748e]" />
              <Input
                placeholder="Nhập tên khóa học hoặc môn học..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Status filter */}
          <div className="w-full md:w-60">
            <label className="text-[12px] text-[#62748e] mb-1 block">
              Trạng thái
            </label>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="mt-5"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* COURSE LIST */}
      <div className="space-y-4">
        {loading && (
          <Card className="rounded-[14px] p-6 text-[13px] text-[#62748e]">
            Đang tải danh sách khóa học...
          </Card>
        )}

        {!loading && courses.length === 0 && (
          <Card className="rounded-[14px] border-2 border-dashed border-gray-200 bg-gray-50 py-10 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-[#62748e]" />
            </div>
            <p className="text-sm font-medium text-neutral-950 mb-1">
              Chưa có khóa học nào
            </p>
            <p className="text-[12px] text-[#45556c] mb-4 max-w-md">
              Hiện chưa có khóa học cá nhân nào.
            </p>
          </Card>
        )}

        {!loading &&
          courses.length > 0 &&
          courses.map((course) => {
            const statusConfig = getStatusConfig(course.status);
            const StatusIcon = statusConfig.icon;

            const hasSourceTag = String(course.description || "").includes(
              "[[SOURCE:"
            );
            const cleanedDescription = stripHtmlTags(
              String(course.description || "")
                .replace(/\n?\[\[SOURCE:[^\]]+\]\]/, "")
                .replace(/\n?\[\[OWNER:[^\]]+\]\]/, "")
                .replace(/\n?\[\[CLASS_ID:[^\]]+\]\]/, "")
                .replace(/\n?\[\[CLASS_NAME:[^\]]+\]\]/, "")
                .trim()
            );

            // Try to identify linked class from known fields or tags
            const classIdFromField =
              course.classId || course.clazzId || course.classID;
            let classIdFromTag = null;
            const desc = String(course.description || "");
            const m = desc.match(/\[\[CLASS_ID:([^\]]+)\]\]/);
            if (m && m[1]) {
              classIdFromTag = m[1].trim();
            }
            let linkedClassId = classIdFromField || classIdFromTag || null;
            // Use courseId->class fallback only when it is unambiguous (exactly one match)
            if (!linkedClassId && course?.id) {
              const byCourse = courseIdToClass[String(course.id)];
              if (byCourse?.id) linkedClassId = byCourse.id;
            }

            let classNameFromTag = null;
            const mn = desc.match(/\[\[CLASS_NAME:([^\]]+)\]\]/);
            if (mn && mn[1]) {
              classNameFromTag = mn[1].trim();
            }

            // Prefer live class name from DB if available; fallback to tag
            const liveClassName = linkedClassId
              ? classMap[String(linkedClassId)]?.name || null
              : null;
            const effectiveClassName = liveClassName || classNameFromTag;

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

            // Render DB title directly for consistency with Admin
            const displayTitle = String(course.title || "");

            return (
              <Card
                key={course.id}
                className="rounded-[14px] border border-gray-200 hover:border-blue-300 hover:shadow-md transition-colors cursor-pointer"
                onClick={() => navigate(`/home/teacher/courses/${course.id}`)}
              >
                <CardContent className="px-5 py-7">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* LEFT */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-sm font-semibold text-neutral-950">
                            {displayTitle}
                          </h2>
                          <p className="text-[11px] text-[#62748e]">
                            {course.subjectName || "Chưa có môn học"}
                          </p>
                          {linkedClassId && (
                            <div className="mt-1">
                              <Badge className="text-[11px] px-2 py-0.5 bg-green-50 text-green-700 border border-green-200">
                                Thuộc lớp:{" "}
                                {effectiveClassName
                                  ? `${effectiveClassName} (ID: ${linkedClassId})`
                                  : `ID: ${linkedClassId}`}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      {cleanedDescription && (
                        <p className="text-[12px] text-[#45556c] line-clamp-2">
                          {cleanedDescription}
                        </p>
                      )}
                    </div>

                    {/* MIDDLE: stats */}
                    <div className="flex flex-row md:flex-col gap-4 md:gap-3 text-[12px] text-[#45556c]">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Layers className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-[11px] text-[#62748e]">
                            Số chương
                          </p>
                          <p className="text-sm text-neutral-950 font-medium">
                            {chapterCount}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-[11px] text-[#62748e]">
                            Số bài học
                          </p>
                          <p className="text-sm text-neutral-950 font-medium">
                            {lessonCount}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: status */}
                    <div className="flex flex-col items-start md:items-end gap-2">
                      {hasSourceTag && (
                        <Badge className="text-[11px] px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200">
                          Nguồn: Nội dung giảng dạy
                        </Badge>
                      )}
                      {linkedClassId && (
                        <Badge className="text-[11px] px-3 py-1 bg-green-50 text-green-700 border border-green-200">
                          Lớp: {linkedClassId}
                        </Badge>
                      )}
                      <Badge
                        className={`text-[11px] px-3 py-1 ${statusConfig.className}`}
                      >
                        <StatusIcon className="w-3 h-3 mr-1 inline-block align-middle" />
                        <span className="align-middle">
                          {statusConfig.label}
                        </span>
                      </Badge>
                      <p className="text-[11px] text-[#62748e]">
                        ID: {course.id}
                      </p>
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
