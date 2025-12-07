// src/pages/admin/TeacherAttendanceList.jsx
// Trang danh sách giáo viên và chấm công

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select.jsx";
import {
  Search,
  Users,
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Calendar,
  AlertCircle,
} from "lucide-react";

import { teacherAttendanceService } from "../../services/teacher-attendance/teacher-attendance.service";
import { useToast } from "../../hooks/use-toast.js";
import useDebounce from "../../hooks/useDebounce";

export default function TeacherAttendanceList() {
  const navigate = useNavigate();
  const { error } = useToast();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Server-side pagination state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Debounced search
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Reset page when search changes
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const loadTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size,
      };
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      const data = await teacherAttendanceService.getTeacherList(params);
      setTeachers(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (e) {
      console.error("Load teachers error:", e);
      error("Không thể tải danh sách giáo viên");
      setTeachers([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, size, debouncedSearch, error]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  // Stats (calculate from current page data - for display only)
  const totalTeachers = totalElements;
  const teachersWithClasses = teachers.filter(
    (t) => t.assignedClasses > 0
  ).length;
  const avgAttendanceRate =
    teachers.length > 0
      ? teachers.reduce((sum, t) => sum + (t.attendanceRateThisMonth || 0), 0) /
        teachers.length
      : 0;

  function getAttendanceColor(rate) {
    if (rate >= 90) return "text-green-600 bg-green-50";
    if (rate >= 70) return "text-amber-600 bg-amber-50";
    if (rate >= 50) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  }

  function getAttendanceBadge(rate) {
    if (rate >= 90)
      return {
        label: "Xuất sắc",
        className: "bg-green-100 text-green-700 border-green-200",
      };
    if (rate >= 70)
      return {
        label: "Tốt",
        className: "bg-amber-100 text-amber-700 border-amber-200",
      };
    if (rate >= 50)
      return {
        label: "Trung bình",
        className: "bg-orange-100 text-orange-700 border-orange-200",
      };
    return {
      label: "Cần cải thiện",
      className: "bg-red-100 text-red-700 border-red-200",
    };
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header với gradient */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-200">
          <Clock className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chấm công Giáo viên
          </h1>
          <p className="text-gray-500 text-sm">
            Quản lý và theo dõi chấm công làm việc của giáo viên theo lớp học
          </p>
        </div>
      </div>

      {/* Stats Cards với gradient */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tổng giáo viên */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-blue-100 text-sm font-medium">
                Tổng giáo viên
              </p>
              <p className="text-3xl font-bold mt-1">{totalTeachers}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Đang có lớp */}
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-violet-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-violet-100 text-sm font-medium">Đang có lớp</p>
              <p className="text-3xl font-bold mt-1">{teachersWithClasses}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Tỷ lệ TB tháng này */}
        <div
          className={`bg-gradient-to-br ${
            avgAttendanceRate >= 70
              ? "from-emerald-500 to-teal-600 shadow-emerald-200"
              : "from-rose-500 to-pink-600 shadow-rose-200"
          } rounded-2xl p-5 text-white shadow-lg relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p
                className={`${
                  avgAttendanceRate >= 70 ? "text-emerald-100" : "text-rose-100"
                } text-sm font-medium`}
              >
                Tỷ lệ TB tháng này
              </p>
              <p className="text-3xl font-bold mt-1">
                {avgAttendanceRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <Select
            value={String(size)}
            onValueChange={(v) => {
              setSize(Number(v));
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 / trang</SelectItem>
              <SelectItem value="10">10 / trang</SelectItem>
              <SelectItem value="20">20 / trang</SelectItem>
              <SelectItem value="50">50 / trang</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên, email, số điện thoại hoặc môn học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl border-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Teacher List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            Danh sách giáo viên ({totalElements})
          </h2>
        </div>
        <div className="p-0">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              Đang tải danh sách giáo viên...
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Không tìm thấy giáo viên nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {teachers.map((teacher) => {
                const badge = getAttendanceBadge(
                  teacher.attendanceRateThisMonth || 0
                );
                return (
                  <div
                    key={teacher.teacherId}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() =>
                      navigate(
                        `/home/admin/teacher-attendance/${teacher.teacherId}`
                      )
                    }
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {teacher.avatar ? (
                          <img
                            src={teacher.avatar}
                            alt={teacher.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-semibold text-lg">
                            {teacher.fullName?.charAt(0) || "T"}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {teacher.fullName}
                          </h3>
                          {teacher.degree && (
                            <Badge variant="outline" className="text-[10px]">
                              {teacher.degree}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[12px] text-gray-500 truncate">
                          {teacher.email} • {teacher.phone || "Chưa có SĐT"}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {teacher.subjectNames?.map((subj, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-[10px] bg-blue-50 text-blue-700 border-blue-200"
                            >
                              <GraduationCap className="w-3 h-3 mr-1" />
                              {subj}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 flex-shrink-0">
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-900">
                            {teacher.assignedClasses || 0}
                          </p>
                          <p className="text-[11px] text-gray-500">Lớp</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-900">
                            {teacher.completedSlotsThisMonth || 0}/
                            {teacher.totalSlotsThisMonth || 0}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Slot tháng
                          </p>
                        </div>
                        <div className="text-center min-w-[80px]">
                          <Badge
                            className={`text-[11px] border ${badge.className}`}
                          >
                            {(teacher.attendanceRateThisMonth || 0).toFixed(1)}%
                          </Badge>
                          <p className="text-[11px] text-gray-500 mt-1">
                            {badge.label}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Hiển thị {teachers.length} / {totalElements} giáo viên
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 px-3">
                Trang {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
