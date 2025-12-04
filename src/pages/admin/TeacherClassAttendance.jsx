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
} from "lucide-react";

import { teacherAttendanceService } from "../../services/teacher-attendance/teacher-attendance.service";
import { useToast } from "../../hooks/use-toast.js";

const DAYS_OF_WEEK = ["", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

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
      console.error("Load class attendance error:", e);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="rounded-[14px] p-6 text-center text-[#62748e]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          Đang tải thông tin chấm công...
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="rounded-[14px] p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
          <p className="text-red-600 mb-4">Không tìm thấy thông tin lớp học</p>
          <Button onClick={() => navigate(`/home/admin/teacher-attendance/${teacherId}`)}>
            Quay lại
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/home/admin/teacher-attendance/${teacherId}`)}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-neutral-950">
            Chi tiết chấm công lớp
          </h1>
          <p className="text-[13px] text-[#62748e] mt-1">
            Xem chi tiết điểm danh từng buổi học của lớp
          </p>
        </div>
      </div>

      {/* Class Info Card */}
      <Card className="rounded-[14px]">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-8 h-8 text-indigo-600" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold text-neutral-950">
                  {data.className}
                </h2>
                <Badge className={
                  data.classStatus === "ACTIVE" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-gray-100 text-gray-600"
                }>
                  {data.classStatus === "ACTIVE" ? "Đang học" : data.classStatus}
                </Badge>
              </div>
              <p className="text-[13px] text-[#62748e]">
                {data.subjectName} • {data.semesterName}
              </p>
            </div>

            <div className={`p-4 rounded-xl border ${getAttendanceColor(data.completionRate || 0)}`}>
              <p className="text-3xl font-bold text-center">
                {(data.completionRate || 0).toFixed(1)}%
              </p>
              <p className="text-[11px] text-center mt-1">Hoàn thành</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="rounded-[14px]">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] text-[#62748e]">Tổng buổi học</p>
                <p className="text-xl font-semibold text-neutral-950">
                  {data.totalSlots || 0}
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
                <p className="text-xl font-semibold text-green-600">
                  {data.completedSlots || 0}
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
                <p className="text-xl font-semibold text-amber-600">
                  {data.pendingSlots || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card className="rounded-[14px]">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-neutral-950">
            Danh sách buổi học ({data.sessions?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!data.sessions || data.sessions.length === 0 ? (
            <div className="text-center py-12 text-[#62748e]">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Chưa có buổi học nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.sessions.map((session, index) => {
                const statusBadge = getSessionStatusBadge(session);
                const StatusIcon = statusBadge.icon;
                const isExpanded = expandedSessions[session.sessionId];

                return (
                  <div key={session.sessionId} className="border-b last:border-b-0">
                    {/* Session Header */}
                    <div
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => toggleSession(session.sessionId)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          session.isAttendanceSubmitted ? "bg-green-100" : "bg-gray-100"
                        }`}>
                          <span className={`text-sm font-bold ${
                            session.isAttendanceSubmitted ? "text-green-600" : "text-gray-500"
                          }`}>
                            {index + 1}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-neutral-950">
                              {new Date(session.date).toLocaleDateString("vi-VN", {
                                weekday: "long",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </span>
                            <Badge className={`text-[10px] border ${statusBadge.className}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusBadge.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-[12px] text-[#62748e]">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {session.timeSlot}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {session.roomName || "Online"}
                            </span>
                          </div>
                        </div>

                        {session.isAttendanceSubmitted && (
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="text-center">
                              <span className="text-green-600 font-semibold">{session.presentCount}</span>
                              <p className="text-[10px] text-[#62748e]">Có mặt</p>
                            </div>
                            <div className="text-center">
                              <span className="text-amber-600 font-semibold">{session.lateCount}</span>
                              <p className="text-[10px] text-[#62748e]">Trễ</p>
                            </div>
                            <div className="text-center">
                              <span className="text-red-600 font-semibold">{session.absentCount}</span>
                              <p className="text-[10px] text-[#62748e]">Vắng</p>
                            </div>
                          </div>
                        )}

                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Session Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 bg-gray-50 border-t">
                        <div className="pt-4 space-y-3">
                          {/* Attendance Stats */}
                          {session.isAttendanceSubmitted ? (
                            <div className="bg-white rounded-lg p-4 border">
                              <p className="text-sm font-medium text-neutral-950 mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-600" />
                                Thống kê điểm danh ({session.totalStudents} học sinh)
                              </p>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                  <p className="text-2xl font-bold text-green-600">{session.presentCount}</p>
                                  <p className="text-[11px] text-green-700">Có mặt</p>
                                </div>
                                <div className="text-center p-3 bg-amber-50 rounded-lg">
                                  <p className="text-2xl font-bold text-amber-600">{session.lateCount}</p>
                                  <p className="text-[11px] text-amber-700">Đi trễ</p>
                                </div>
                                <div className="text-center p-3 bg-red-50 rounded-lg">
                                  <p className="text-2xl font-bold text-red-600">{session.absentCount}</p>
                                  <p className="text-[11px] text-red-700">Vắng mặt</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                              <div className="flex items-center gap-2 text-amber-700">
                                <AlertCircle className="w-5 h-5" />
                                <span className="font-medium">Buổi học này chưa được điểm danh</span>
                              </div>
                            </div>
                          )}

                          {/* Lesson Content */}
                          {session.lessonContent && (
                            <div className="bg-white rounded-lg p-4 border">
                              <p className="text-sm font-medium text-neutral-950 mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-purple-600" />
                                Nội dung buổi học
                              </p>
                              <div 
                                className="text-[13px] text-[#45556c] prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: session.lessonContent }}
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
        </CardContent>
      </Card>

      {/* Back Button */}
      <div className="flex justify-start">
        <Button
          variant="outline"
          onClick={() => navigate(`/home/admin/teacher-attendance/${teacherId}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    </div>
  );
}
