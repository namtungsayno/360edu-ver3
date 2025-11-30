// src/pages/teacher/TeacherCourseList.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/Select.jsx";

import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Layers,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { courseService } from "../../services/course/course.service.js";
import { useToast } from "../../hooks/use-toast.js";
import { useAuth } from "../../hooks/useAuth.js";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "APPROVED", label: "Đã phê duyệt" },
  { value: "PENDING", label: "Chờ phê duyệt" },
  { value: "REJECTED", label: "Bị từ chối" },
];

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
        className: "bg-orange-50 text-orange-700 border border-orange-200",
        icon: Clock,
      };
    case "REJECTED":
      return {
        label: "Bị từ chối",
        className: "bg-red-50 text-red-700 border border-red-200",
        icon: AlertCircle,
      };
    case "DISABLED":
    case "ARCHIVED":
      return {
        label: "Ngừng sử dụng",
        className: "bg-gray-50 text-gray-600 border border-gray-200",
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

export default function TeacherCourseList() {
  const navigate = useNavigate();
  const { error } = useToast();
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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
        console.error("Failed to load courses:", e);
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

  // ====== DERIVED STATS ======
  const stats = useMemo(() => {
    const total = courses.length;
    const approved = courses.filter(
      (c) => String(c.status).toUpperCase() === "APPROVED"
    ).length;
    const pending = courses.filter(
      (c) => String(c.status).toUpperCase() === "PENDING"
    ).length;

    return { total, approved, pending };
  }, [courses]);

  // Filtered courses on FE (search by title/subject)
  const visibleCourses = useMemo(() => {
    let list = [...courses];

    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      list = list.filter((c) => {
        const title = String(c.title || "").toLowerCase();
        const subject = String(c.subjectName || "").toLowerCase();
        return title.includes(keyword) || subject.includes(keyword);
      });
    }

    if (statusFilter !== "ALL") {
      list = list.filter(
        (c) => String(c.status).toUpperCase() === statusFilter
      );
    }

    return list;
  }, [courses, search, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-950">
            Quản lý khóa học cá nhân
          </h1>
          <p className="text-[12px] text-[#62748e] mt-1">
            Xem và quản lý các khóa học cá nhân mà bạn trực tiếp biên soạn.
          </p>
        </div>
        {/* Theo nghiệp vụ mới: bỏ tính năng tạo khóa học tại đây */}
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
              <p className="text-[12px] text-[#62748e]">Đã phê duyệt</p>
              <p className="text-neutral-950 text-base font-semibold">
                {stats.approved}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-[14px]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-[12px] text-[#62748e]">Chờ phê duyệt</p>
              <p className="text-neutral-950 text-base font-semibold">
                {stats.pending}
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

        {!loading && visibleCourses.length === 0 && (
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
          visibleCourses.length > 0 &&
          visibleCourses.map((course) => {
            const statusConfig = getStatusConfig(course.status);
            const StatusIcon = statusConfig.icon;

            const hasSourceTag = String(course.description || "").includes(
              "[[SOURCE:"
            );
            const cleanedDescription = String(course.description || "")
              .replace(/\n?\[\[SOURCE:[^\]]+\]\]/, "")
              .replace(/\n?\[\[OWNER:[^\]]+\]\]/, "")
              .trim();

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

            return (
              <Card
                key={course.id}
                className="rounded-[14px] border border-gray-200 hover:border-blue-300 hover:shadow-md transition-colors cursor-pointer"
                onClick={() => navigate(`/home/teacher/courses/${course.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* LEFT */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-sm font-semibold text-neutral-950">
                            {course.title}
                          </h2>
                          <p className="text-[11px] text-[#62748e]">
                            {course.subjectName || "Chưa có môn học"}
                          </p>
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
