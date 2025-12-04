// src/pages/admin/TeacherAttendanceList.jsx
// Trang danh sách giáo viên và chấm công

import { useEffect, useState } from "react";
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
  Search,
  Users,
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  ChevronRight,
  GraduationCap,
  Calendar,
  AlertCircle,
} from "lucide-react";

import { teacherAttendanceService } from "../../services/teacher-attendance/teacher-attendance.service";
import { useToast } from "../../hooks/use-toast.js";

export default function TeacherAttendanceList() {
  const navigate = useNavigate();
  const { error } = useToast();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadTeachers();
  }, []);

  async function loadTeachers() {
    try {
      setLoading(true);
      const data = await teacherAttendanceService.getTeacherList();
      setTeachers(data);
    } catch (e) {
      console.error("Load teachers error:", e);
      error("Không thể tải danh sách giáo viên");
    } finally {
      setLoading(false);
    }
  }

  // Filter teachers by search
  const filteredTeachers = teachers.filter((t) => {
    if (!searchTerm) return true;
    const kw = searchTerm.toLowerCase();
    return (
      t.fullName?.toLowerCase().includes(kw) ||
      t.email?.toLowerCase().includes(kw) ||
      t.phone?.includes(kw) ||
      t.subjectNames?.some((s) => s.toLowerCase().includes(kw))
    );
  });

  // Stats
  const totalTeachers = teachers.length;
  const teachersWithClasses = teachers.filter((t) => t.assignedClasses > 0).length;
  const avgAttendanceRate =
    teachers.length > 0
      ? teachers.reduce((sum, t) => sum + (t.attendanceRateThisMonth || 0), 0) / teachers.length
      : 0;

  function getAttendanceColor(rate) {
    if (rate >= 90) return "text-green-600 bg-green-50";
    if (rate >= 70) return "text-amber-600 bg-amber-50";
    if (rate >= 50) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  }

  function getAttendanceBadge(rate) {
    if (rate >= 90) return { label: "Xuất sắc", className: "bg-green-100 text-green-700 border-green-200" };
    if (rate >= 70) return { label: "Tốt", className: "bg-amber-100 text-amber-700 border-amber-200" };
    if (rate >= 50) return { label: "Trung bình", className: "bg-orange-100 text-orange-700 border-orange-200" };
    return { label: "Cần cải thiện", className: "bg-red-100 text-red-700 border-red-200" };
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="rounded-[14px] p-6 text-center text-[#62748e]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          Đang tải danh sách giáo viên...
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-neutral-950">
          Chấm công Giáo viên
        </h1>
        <p className="text-[13px] text-[#62748e] mt-1">
          Quản lý và theo dõi chấm công làm việc của giáo viên theo lớp học
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-[14px]">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-[12px] text-[#62748e]">Tổng giáo viên</p>
                <p className="text-2xl font-semibold text-neutral-950">{totalTeachers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[14px]">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-[12px] text-[#62748e]">Đang có lớp</p>
                <p className="text-2xl font-semibold text-neutral-950">{teachersWithClasses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[14px]">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getAttendanceColor(avgAttendanceRate)}`}>
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[12px] text-[#62748e]">Tỷ lệ TB tháng này</p>
                <p className="text-2xl font-semibold text-neutral-950">
                  {avgAttendanceRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="rounded-[14px]">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên, email, số điện thoại hoặc môn học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Teacher List */}
      <Card className="rounded-[14px]">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-neutral-950">
            Danh sách giáo viên ({filteredTeachers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTeachers.length === 0 ? (
            <div className="text-center py-12 text-[#62748e]">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Không tìm thấy giáo viên nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTeachers.map((teacher) => {
                const badge = getAttendanceBadge(teacher.attendanceRateThisMonth || 0);
                return (
                  <div
                    key={teacher.teacherId}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/home/admin/teacher-attendance/${teacher.teacherId}`)}
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
                          <h3 className="font-semibold text-neutral-950 truncate">
                            {teacher.fullName}
                          </h3>
                          {teacher.degree && (
                            <Badge variant="outline" className="text-[10px]">
                              {teacher.degree}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[12px] text-[#62748e] truncate">
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
                          <p className="text-lg font-semibold text-neutral-950">
                            {teacher.assignedClasses || 0}
                          </p>
                          <p className="text-[11px] text-[#62748e]">Lớp</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-neutral-950">
                            {teacher.completedSlotsThisMonth || 0}/{teacher.totalSlotsThisMonth || 0}
                          </p>
                          <p className="text-[11px] text-[#62748e]">Slot tháng</p>
                        </div>
                        <div className="text-center min-w-[80px]">
                          <Badge className={`text-[11px] border ${badge.className}`}>
                            {(teacher.attendanceRateThisMonth || 0).toFixed(1)}%
                          </Badge>
                          <p className="text-[11px] text-[#62748e] mt-1">{badge.label}</p>
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
    </div>
  );
}
