// src/pages/admin/TeacherAttendanceDetail.jsx
// Trang chi tiết chấm công của một giáo viên

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select.jsx";
import {
  ArrowLeft,
  Users,
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  ChevronRight,
  GraduationCap,
  Calendar,
  AlertCircle,
  Mail,
  Phone,
  Award,
  Briefcase,
  BarChart3,
  Target,
} from "lucide-react";

import { teacherAttendanceService } from "../../services/teacher-attendance/teacher-attendance.service";
import { useToast } from "../../hooks/use-toast.js";
import { BackButton } from "../../components/common/BackButton";
import { getImageUrl } from "../../utils/image";

export default function TeacherAttendanceDetail() {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const { error } = useToast();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        const data = await teacherAttendanceService.getTeacherSummary(
          teacherId,
          selectedMonth,
          selectedYear
        );
        setSummary(data);
      } catch (e) {
        error("Không thể tải thông tin chấm công");
      } finally {
        setLoading(false);
      }
    }
    
    if (teacherId) {
      loadSummary();
    }
  }, [teacherId, selectedMonth, selectedYear, error]);

  function getAttendanceColor(rate) {
    if (rate >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (rate >= 70) return "text-amber-600 bg-amber-50 border-amber-200";
    if (rate >= 50) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  }

  function getStatusBadge(status) {
    switch (status) {
      case "ACTIVE":
        return { label: "Đang học", className: "bg-green-100 text-green-700" };
      case "COMPLETED":
        return { label: "Đã kết thúc", className: "bg-blue-100 text-blue-700" };
      case "CANCELLED":
        return { label: "Đã hủy", className: "bg-red-100 text-red-700" };
      default:
        return { label: status, className: "bg-gray-100 text-gray-700" };
    }
  }

  const months = [
    { value: 1, label: "Tháng 1" },
    { value: 2, label: "Tháng 2" },
    { value: 3, label: "Tháng 3" },
    { value: 4, label: "Tháng 4" },
    { value: 5, label: "Tháng 5" },
    { value: 6, label: "Tháng 6" },
    { value: 7, label: "Tháng 7" },
    { value: 8, label: "Tháng 8" },
    { value: 9, label: "Tháng 9" },
    { value: 10, label: "Tháng 10" },
    { value: 11, label: "Tháng 11" },
    { value: 12, label: "Tháng 12" },
  ];

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  if (loading) {
    return (
      <div className="p-6">
        <Card className="rounded-[14px] p-6 text-center text-[#62748e]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          Đang tải thông tin chấm công...
        </Card>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-6">
        <Card className="rounded-[14px] p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
          <p className="text-red-600 mb-4">
            Không tìm thấy thông tin giáo viên
          </p>
          <BackButton
            to="/home/admin/teacher-attendance"
            variant="outline"
            showLabel={false}
            className="ml-0"
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        <BackButton to="/home/admin/teacher-attendance" showLabel={false} />
        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200">
          <CheckCircle2 className="h-7 w-7 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Chi tiết chấm công
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi tiến độ làm việc và chấm công của giáo viên
          </p>
        </div>
      </div>

      {/* Teacher Profile Card - Redesigned */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative">
          {/* Profile content */}
          <div className="px-6 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-white/20 p-1 shadow-lg backdrop-blur-sm">
                  <div className="w-full h-full rounded-xl bg-white/30 flex items-center justify-center overflow-hidden">
                    {summary.avatar ? (
                      <img
                        src={getImageUrl(summary.avatar)}
                        alt={summary.teacherName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-2xl">
                        {summary.teacherName?.charAt(0) || "T"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">
                  {summary.teacherName}
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-white/80">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {summary.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    {summary.phone || "Chưa có SĐT"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {summary.subjectNames?.map((subj, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white rounded-full text-xs font-medium backdrop-blur-sm"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      {subj}
                    </span>
                  ))}
                </div>
              </div>

              {/* Attendance Rate - Moved outside gradient area */}
              {/* Attendance Rate */}
              <div className="flex-shrink-0">
                <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="relative w-24 h-24">
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke={
                          (summary.attendanceRate || 0) >= 90
                            ? "#4ade80"
                            : (summary.attendanceRate || 0) >= 70
                            ? "#fbbf24"
                            : "#f87171"
                        }
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${
                          ((summary.attendanceRate || 0) / 100) * 263.89
                        } 263.89`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span
                        className={`text-xl font-bold ${
                          (summary.attendanceRate || 0) >= 90
                            ? "text-green-300"
                            : (summary.attendanceRate || 0) >= 70
                            ? "text-amber-300"
                            : "text-red-300"
                        }`}
                      >
                        {(summary.attendanceRate || 0).toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-white/70 font-medium">
                        Hoàn thành
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Month/Year Filter */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Thời gian</h3>
                <p className="text-xs text-gray-500">Chọn tháng/năm thống kê</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={String(selectedMonth)}
                onValueChange={(v) => setSelectedMonth(Number(v))}
              >
                <SelectTrigger className="bg-gray-50 border-gray-200">
                  <SelectValue placeholder={months.find(m => m.value === selectedMonth)?.label || `Tháng ${selectedMonth}`} />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={String(selectedYear)}
                onValueChange={(v) => setSelectedYear(Number(v))}
              >
                <SelectTrigger className="bg-gray-50 border-gray-200">
                  <SelectValue placeholder={String(selectedYear)} />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  Lớp
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {summary.totalAssignedClasses || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Lớp phân công</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                  Slot
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {summary.totalScheduledSlots || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Tổng slot</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-200">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  Done
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {summary.totalCompletedSlots || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Đã điểm danh</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-200">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  Chờ
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {summary.totalPendingSlots || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Chưa điểm danh</p>
            </div>
          </div>
        </div>
      </div>

      {/* Class List - Redesigned */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Danh sách lớp được phân công
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {summary.classDetails?.length || 0} lớp • Click để xem chi
                  tiết chấm công
                </p>
              </div>
            </div>
          </div>
        </div>

        {!summary.classDetails || summary.classDetails.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              Không có lịch dạy trong tháng {selectedMonth}/{selectedYear}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Vui lòng chọn tháng khác để xem lịch chấm công
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {summary.classDetails.map((cls, index) => {
              const statusBadge = getStatusBadge(cls.status);
              const completionRate =
                cls.totalSlots > 0
                  ? (cls.completedSlots * 100) / cls.totalSlots
                  : 0;

              return (
                <div
                  key={cls.classId}
                  className="group px-6 py-4 hover:bg-gray-50/80 cursor-pointer transition-all duration-200"
                  onClick={() =>
                    navigate(
                      `/home/admin/teacher-attendance/${teacherId}/class/${cls.classId}`
                    )
                  }
                >
                  <div className="flex items-center gap-5">
                    {/* Class icon with index */}
                    <div className="relative">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200/50">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full text-[10px] font-bold text-indigo-600 flex items-center justify-center shadow border border-gray-100">
                        {index + 1}
                      </span>
                    </div>

                    {/* Class info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                          {cls.className}
                        </h4>
                        <Badge
                          className={`text-[10px] px-2 py-0.5 ${statusBadge.className}`}
                        >
                          {statusBadge.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {cls.subjectName} • {cls.semesterName}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">
                          {cls.totalSlots || 0}
                        </p>
                        <p className="text-[11px] text-gray-500">Tổng slot</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">
                          {cls.completedSlots || 0}
                        </p>
                        <p className="text-[11px] text-gray-500">Hoàn thành</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-amber-600">
                          {cls.pendingSlots || 0}
                        </p>
                        <p className="text-[11px] text-gray-500">Chờ</p>
                      </div>
                    </div>

                    {/* Completion rate badge */}
                    <div
                      className={`min-w-[64px] px-3 py-2 rounded-xl text-center ${
                        completionRate >= 90
                          ? "bg-green-50 border border-green-200"
                          : completionRate >= 70
                          ? "bg-amber-50 border border-amber-200"
                          : completionRate >= 50
                          ? "bg-orange-50 border border-orange-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <p
                        className={`text-lg font-bold ${
                          completionRate >= 90
                            ? "text-green-600"
                            : completionRate >= 70
                            ? "text-amber-600"
                            : completionRate >= 50
                            ? "text-orange-600"
                            : "text-red-600"
                        }`}
                      >
                        {completionRate.toFixed(0)}%
                      </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
