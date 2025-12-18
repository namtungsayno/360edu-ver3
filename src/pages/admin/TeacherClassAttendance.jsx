// src/pages/admin/TeacherClassAttendance.jsx
// Trang chi tiết chấm công theo lớp của giáo viên

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
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  MapPin,
  Users,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Target,
} from "lucide-react";

import { teacherAttendanceService } from "../../services/teacher-attendance/teacher-attendance.service";
import { useToast } from "../../hooks/use-toast.js";
import { BackButton } from "../../components/common/BackButton";

const DAYS_OF_WEEK = [
  "",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];

export default function TeacherClassAttendance() {
  const { teacherId, classId } = useParams();
  const navigate = useNavigate();
  const { error } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState({});

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId, classId]);

  async function loadData() {
    try {
      setLoading(true);
      const result = await teacherAttendanceService.getTeacherClassAttendance(
        teacherId,
        classId
      );
      setData(result);
    } catch (e) {
      error("Không thể tải thông tin chấm công lớp");
    } finally {
      setLoading(false);
    }
  }

  function toggleSession(sessionId) {
    setExpandedSessions((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  }

  function getSessionStatusBadge(session) {
    if (session.isAttendanceSubmitted) {
      return {
        icon: CheckCircle2,
        label: "Đã điểm danh",
        className: "bg-green-100 text-green-700 border-green-200",
      };
    }

    const sessionDate = new Date(session.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (sessionDate < today) {
      return {
        icon: AlertCircle,
        label: "Chưa điểm danh",
        className: "bg-amber-100 text-amber-700 border-amber-200",
      };
    }

    if (sessionDate.getTime() === today.getTime()) {
      return {
        icon: Clock,
        label: "Hôm nay",
        className: "bg-blue-100 text-blue-700 border-blue-200",
      };
    }

    return {
      icon: Calendar,
      label: "Sắp tới",
      className: "bg-gray-100 text-gray-600 border-gray-200",
    };
  }

  function getAttendanceColor(rate) {
    if (rate >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (rate >= 70) return "text-amber-600 bg-amber-50 border-amber-200";
    if (rate >= 50) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  }

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

  if (!data) {
    return (
      <div className="p-6">
        <Card className="rounded-[14px] p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
          <p className="text-red-600 mb-4">Không tìm thấy thông tin lớp học</p>
          <BackButton
            to={`/home/admin/teacher-attendance/${teacherId}`}
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
        <BackButton
          to={`/home/admin/teacher-attendance/${teacherId}`}
          showLabel={false}
        />
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
          <BookOpen className="h-7 w-7 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Chi tiết chấm công lớp
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Xem chi tiết điểm danh từng buổi học của lớp
          </p>
        </div>
      </div>

      {/* Class Info Card - Redesigned */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Class Icon & Info */}
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200/50 flex-shrink-0">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {data.className}
                </h2>
                <Badge
                  className={`text-xs px-2.5 py-0.5 ${
                    data.classStatus === "ACTIVE" ||
                    data.classStatus === "PUBLIC"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  {data.classStatus === "ACTIVE" ||
                  data.classStatus === "PUBLIC"
                    ? "PUBLIC"
                    : data.classStatus}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {data.subjectName} • {data.semesterName}
              </p>
            </div>
          </div>

          {/* Completion Rate Circle */}
          <div className="flex-shrink-0">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="relative w-20 h-20">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke={
                      (data.completionRate || 0) >= 90
                        ? "#22c55e"
                        : (data.completionRate || 0) >= 70
                        ? "#f59e0b"
                        : "#ef4444"
                    }
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${
                      ((data.completionRate || 0) / 100) * 263.89
                    } 263.89`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className={`text-lg font-bold ${
                      (data.completionRate || 0) >= 90
                        ? "text-green-600"
                        : (data.completionRate || 0) >= 70
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  >
                    {(data.completionRate || 0).toFixed(1)}%
                  </span>
                  <span className="text-[9px] text-gray-500 font-medium">
                    Hoàn thành
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Redesigned */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              Tổng
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {data.totalSlots || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Tổng buổi học</p>
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
          <p className="text-2xl font-bold text-green-600">
            {data.completedSlots || 0}
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
          <p className="text-2xl font-bold text-amber-600">
            {data.pendingSlots || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Chờ điểm danh</p>
        </div>
      </div>

      {/* Sessions List - Redesigned */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Danh sách buổi học
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {data.sessions?.length || 0} buổi • Click để xem chi tiết
              </p>
            </div>
          </div>
        </div>

        {!data.sessions || data.sessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Chưa có buổi học nào</p>
            <p className="text-sm text-gray-400 mt-1">
              Các buổi học sẽ xuất hiện ở đây
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.sessions.map((session, index) => {
              const statusBadge = getSessionStatusBadge(session);
              const StatusIcon = statusBadge.icon;
              const isExpanded = expandedSessions[session.sessionId];

              return (
                <div key={session.sessionId}>
                  {/* Session Header */}
                  <div
                    className="group px-6 py-4 hover:bg-gray-50/80 cursor-pointer transition-all duration-200"
                    onClick={() => toggleSession(session.sessionId)}
                  >
                    <div className="flex items-center gap-5">
                      {/* Index number */}
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          session.isAttendanceSubmitted
                            ? "bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-200/50"
                            : "bg-gray-100"
                        }`}
                      >
                        <span
                          className={`text-base font-bold ${
                            session.isAttendanceSubmitted
                              ? "text-white"
                              : "text-gray-500"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </div>

                      {/* Session info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-semibold text-gray-900">
                            {new Date(session.date).toLocaleDateString(
                              "vi-VN",
                              {
                                weekday: "long",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}
                          </span>
                          <Badge
                            className={`text-[10px] px-2 py-0.5 border ${statusBadge.className}`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusBadge.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {session.timeSlot}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {session.roomName || "Online"}
                          </span>
                        </div>
                      </div>

                      {/* Attendance stats - only show if submitted */}
                      {session.isAttendanceSubmitted && (
                        <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                          <div className="text-center min-w-[50px]">
                            <p className="text-lg font-bold text-green-600">
                              {session.presentCount}
                            </p>
                            <p className="text-[10px] text-gray-500">Có mặt</p>
                          </div>
                          <div className="text-center min-w-[50px]">
                            <p className="text-lg font-bold text-amber-600">
                              {session.lateCount}
                            </p>
                            <p className="text-[10px] text-gray-500">Trễ</p>
                          </div>
                          <div className="text-center min-w-[50px]">
                            <p className="text-lg font-bold text-red-600">
                              {session.absentCount}
                            </p>
                            <p className="text-[10px] text-gray-500">Vắng</p>
                          </div>
                        </div>
                      )}

                      {/* Arrow */}
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Session Details - Expanded */}
                  {isExpanded && (
                    <div className="px-6 pb-5 bg-gray-50/50">
                      <div className="ml-[68px] space-y-4">
                        {/* Attendance Stats */}
                        {session.isAttendanceSubmitted ? (
                          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                            <p className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <Users className="w-4 h-4 text-indigo-600" />
                              Thống kê điểm danh ({session.totalStudents} học
                              sinh)
                            </p>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                                <p className="text-3xl font-bold text-green-600">
                                  {session.presentCount}
                                </p>
                                <p className="text-xs text-green-700 mt-1 font-medium">
                                  Có mặt
                                </p>
                              </div>
                              <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100">
                                <p className="text-3xl font-bold text-amber-600">
                                  {session.lateCount}
                                </p>
                                <p className="text-xs text-amber-700 mt-1 font-medium">
                                  Đi trễ
                                </p>
                              </div>
                              <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
                                <p className="text-3xl font-bold text-red-600">
                                  {session.absentCount}
                                </p>
                                <p className="text-xs text-red-700 mt-1 font-medium">
                                  Vắng mặt
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                              <AlertCircle className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-medium text-amber-800">
                                Chưa điểm danh
                              </p>
                              <p className="text-sm text-amber-600">
                                Buổi học này chưa được giáo viên điểm danh
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Lesson Content */}
                        {session.lessonContent && (
                          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                            <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-purple-600" />
                              Nội dung buổi học
                            </p>
                            <div
                              className="text-sm text-gray-600 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: session.lessonContent,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
