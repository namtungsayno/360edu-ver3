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
} from "lucide-react";

import { teacherAttendanceService } from "../../services/teacher-attendance/teacher-attendance.service";
import { useToast } from "../../hooks/use-toast.js";

export default function TeacherAttendanceDetail() {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const { error } = useToast();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId, selectedMonth, selectedYear]);

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
      console.error("Load summary error:", e);
      error("Không thể tải thông tin chấm công");
    } finally {
      setLoading(false);
    }
  }

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
          <Button onClick={() => navigate("/home/admin/teacher-attendance")}>
            Quay lại danh sách
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/home/admin/teacher-attendance")}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-neutral-950">
            Chi tiết chấm công
          </h1>
          <p className="text-[13px] text-[#62748e] mt-1">
            Theo dõi tiến độ làm việc và chấm công của giáo viên
          </p>
        </div>
      </div>

      {/* Teacher Info Card */}
      <Card className="rounded-[14px]">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {summary.avatar ? (
                <img
                  src={summary.avatar}
                  alt={summary.teacherName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-3xl">
                  {summary.teacherName?.charAt(0) || "T"}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-neutral-950 mb-2">
                {summary.teacherName}
              </h2>
              <div className="flex flex-wrap gap-4 text-[13px] text-[#62748e]">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {summary.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {summary.phone || "Chưa có SĐT"}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {summary.subjectNames?.map((subj, idx) => (
                  <Badge
                    key={idx}
                    className="bg-blue-100 text-blue-700 border border-blue-200"
                  >
                    <GraduationCap className="w-3.5 h-3.5 mr-1" />
                    {subj}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Overall Rate */}
            <div
              className={`p-4 rounded-xl border ${getAttendanceColor(
                summary.attendanceRate || 0
              )}`}
            >
              <p className="text-3xl font-bold text-center">
                {(summary.attendanceRate || 0).toFixed(1)}%
              </p>
              <p className="text-[11px] text-center mt-1">Tỷ lệ hoàn thành</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Month/Year Filter */}
      <Card className="rounded-[14px]">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-[13px] font-medium text-neutral-950">
              Xem thống kê:
            </span>
            <Select
              value={String(selectedMonth)}
              onValueChange={(v) => setSelectedMonth(Number(v))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
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
              <SelectTrigger className="w-[100px]">
                <SelectValue />
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
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-[14px]">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] text-[#62748e]">Lớp phân công</p>
                <p className="text-xl font-semibold text-neutral-950">
                  {summary.totalAssignedClasses || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[14px]">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-[11px] text-[#62748e]">Tổng slot</p>
                <p className="text-xl font-semibold text-neutral-950">
                  {summary.totalScheduledSlots || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[14px]">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-[11px] text-[#62748e]">Đã điểm danh</p>
                <p className="text-xl font-semibold text-neutral-950">
                  {summary.totalCompletedSlots || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[14px]">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-[11px] text-[#62748e]">Chờ điểm danh</p>
                <p className="text-xl font-semibold text-neutral-950">
                  {summary.totalPendingSlots || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class List */}
      <Card className="rounded-[14px]">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-neutral-950">
            Danh sách lớp được phân công ({summary.classDetails?.length || 0})
          </CardTitle>
          <p className="text-[12px] text-[#62748e] mt-1">
            Click vào lớp để xem chi tiết chấm công từng buổi
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {!summary.classDetails || summary.classDetails.length === 0 ? (
            <div className="text-center py-12 text-[#62748e]">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Giáo viên chưa được phân công lớp nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {summary.classDetails.map((cls) => {
                const statusBadge = getStatusBadge(cls.status);
                const completionRate =
                  cls.totalSlots > 0
                    ? (cls.completedSlots * 100) / cls.totalSlots
                    : 0;

                return (
                  <div
                    key={cls.classId}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() =>
                      navigate(
                        `/home/admin/teacher-attendance/${teacherId}/class/${cls.classId}`
                      )
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-indigo-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-neutral-950 truncate">
                            {cls.className}
                          </h3>
                          <Badge
                            className={`text-[10px] ${statusBadge.className}`}
                          >
                            {statusBadge.label}
                          </Badge>
                        </div>
                        <p className="text-[12px] text-[#62748e]">
                          {cls.subjectName} • {cls.semesterName}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 flex-shrink-0">
                        <div className="text-center">
                          <p className="text-lg font-semibold text-neutral-950">
                            {cls.totalSlots || 0}
                          </p>
                          <p className="text-[11px] text-[#62748e]">
                            Tổng slot
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-green-600">
                            {cls.completedSlots || 0}
                          </p>
                          <p className="text-[11px] text-[#62748e]">
                            Hoàn thành
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-amber-600">
                            {cls.pendingSlots || 0}
                          </p>
                          <p className="text-[11px] text-[#62748e]">Chờ</p>
                        </div>
                        <div className="text-center min-w-[60px]">
                          <Badge
                            className={`text-[11px] border ${getAttendanceColor(
                              completionRate
                            )}`}
                          >
                            {completionRate.toFixed(0)}%
                          </Badge>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Back Button */}
      <div className="flex justify-start">
        <Button
          variant="outline"
          onClick={() => navigate("/home/admin/teacher-attendance")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Button>
      </div>
    </div>
  );
}
