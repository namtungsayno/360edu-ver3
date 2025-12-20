import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MinusCircle,
  TrendingUp,
} from "lucide-react";
import { attendanceApi } from "../../services/attendance/attendance.api";
import { formatDateVN } from "../../helper/formatters";
import { Card, CardContent } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";

export default function StudentAttendance() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const result = await attendanceApi.getMyAttendanceForClass(classId);
        setData(result);
      } catch (err) {
        setError(
          err.response?.data?.message || "Không thể tải dữ liệu điểm danh"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [classId]);

  const getStatusInfo = (status) => {
    switch (status) {
      case "PRESENT":
        return {
          label: "Có mặt",
          icon: CheckCircle2,
          bgColor: "bg-green-100",
          textColor: "text-green-700",
          borderColor: "border-green-200",
        };
      case "ABSENT":
        return {
          label: "Vắng",
          icon: XCircle,
          bgColor: "bg-red-100",
          textColor: "text-red-700",
          borderColor: "border-red-200",
        };
      case "LATE":
        return {
          label: "Đi muộn",
          icon: AlertCircle,
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-700",
          borderColor: "border-yellow-200",
        };
      default:
        return {
          label: "Chưa điểm danh",
          icon: MinusCircle,
          bgColor: "bg-gray-100",
          textColor: "text-gray-500",
          borderColor: "border-gray-200",
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại chi tiết lớp</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Class Info */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Điểm danh - {data.className}
          </h1>
          <p className="text-gray-600">
            {data.subjectName} • Giáo viên: {data.teacherName}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Session List */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Danh sách buổi học ({data.totalSessions} buổi)
                </h2>

                {data.sessions && data.sessions.length > 0 ? (
                  <div className="space-y-3">
                    {data.sessions.map((session, index) => {
                      const statusInfo = getStatusInfo(session.status);
                      const StatusIcon = statusInfo.icon;

                      return (
                        <div
                          key={session.sessionId}
                          className={`p-4 rounded-lg border ${statusInfo.borderColor} ${statusInfo.bgColor}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-gray-700 border">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {formatDateVN(session.date)}
                                </div>
                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {session.timeStart} - {session.timeEnd}
                                  {session.roomName && (
                                    <span className="text-gray-500">
                                      • {session.roomName}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusInfo.bgColor} ${statusInfo.textColor} font-medium`}
                            >
                              <StatusIcon className="w-4 h-4" />
                              {statusInfo.label}
                            </div>
                          </div>

                          {session.note && (
                            <div className="mt-2 ml-14 text-sm text-gray-600 italic">
                              Ghi chú: {session.note}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Chưa có buổi học nào được tạo
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right - Statistics */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Attendance Rate Card */}
              <Card className="shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Thống kê điểm danh
                  </h2>

                  {/* Rate Circle */}
                  <div className="flex justify-center mb-6">
                    <div className="relative w-32 h-32">
                      <svg
                        className="w-full h-full transform -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#e5e7eb"
                          strokeWidth="10"
                          fill="none"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke={
                            data.attendanceRate >= 80
                              ? "#22c55e"
                              : data.attendanceRate >= 60
                              ? "#eab308"
                              : "#ef4444"
                          }
                          strokeWidth="10"
                          fill="none"
                          strokeDasharray={`${data.attendanceRate * 2.51} 251`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">
                          {data.attendanceRate}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-green-50 rounded-lg text-center border border-green-200">
                      <div className="text-2xl font-bold text-green-700">
                        {data.attendedSessions}
                      </div>
                      <div className="text-xs text-green-600">Có mặt</div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg text-center border border-red-200">
                      <div className="text-2xl font-bold text-red-700">
                        {data.absentSessions}
                      </div>
                      <div className="text-xs text-red-600">Vắng</div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg text-center border border-yellow-200">
                      <div className="text-2xl font-bold text-yellow-700">
                        {data.lateSessions}
                      </div>
                      <div className="text-xs text-yellow-600">Đi muộn</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-200">
                      <div className="text-2xl font-bold text-gray-700">
                        {data.unmarkedSessions}
                      </div>
                      <div className="text-xs text-gray-600">
                        Chưa điểm danh
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700">
                        Tổng buổi học
                      </span>
                      <span className="font-bold text-blue-900">
                        {data.totalSessions}
                      </span>
                    </div>
                  </div>

                  {/* Warning */}
                  {data.attendanceRate < 80 && data.totalSessions > 0 && (
                    <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-orange-700">
                          Tỷ lệ tham gia của bạn đang dưới 80%. Hãy cố gắng tham
                          gia đầy đủ các buổi học để đạt kết quả tốt nhất.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Back Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại chi tiết lớp
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
