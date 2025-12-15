// pages/parent/classes/ClassDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BookOpen,
  User,
  Calendar,
  Clock,
  MapPin,
  GraduationCap,
  FileText,
  Download,
  ArrowLeft,
  CheckCircle,
  List,
  ChevronDown,
  ChevronUp,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import PageTitle from "../../../components/common/PageTitle";
import { Card } from "../../../components/ui/Card";
import BackButton from "../../../components/common/BackButton";
import { parentApi } from "../../../services/parent/parent.api";

const ClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classDetail, setClassDetail] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview | sessions | materials
  const [expandedSession, setExpandedSession] = useState(null);
  const [sessionDetails, setSessionDetails] = useState({});

  useEffect(() => {
    fetchClassDetail();
  }, [classId]);

  const fetchClassDetail = async () => {
    try {
      setLoading(true);
      const response = await parentApi.getClassDetail(classId);
      setClassDetail(response);
    } catch (error) {
      console.error("Error fetching class detail:", error);
      setClassDetail(null);
    } finally {
      setLoading(false);
    }
  };

  const getDayLabel = (dayOfWeek) => {
    const dayLabels = {
      MONDAY: "Thứ 2",
      TUESDAY: "Thứ 3",
      WEDNESDAY: "Thứ 4",
      THURSDAY: "Thứ 5",
      FRIDAY: "Thứ 6",
      SATURDAY: "Thứ 7",
      SUNDAY: "Chủ nhật",
    };
    return dayLabels[dayOfWeek] || dayOfWeek;
  };

  const getSessionStatusBadge = (status) => {
    const statusConfig = {
      COMPLETED: { label: "Đã học", className: "bg-green-100 text-green-800" },
      UPCOMING: {
        label: "Sắp diễn ra",
        className: "bg-blue-100 text-blue-800",
      },
      CANCELLED: { label: "Đã hủy", className: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status] || statusConfig.UPCOMING;

    return (
      <span
        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const downloadMaterial = (materialId, materialName) => {
    // TODO: Implement download functionality
    console.log("Download material:", materialId, materialName);
  };

  const toggleSessionDetail = async (sessionId) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
    } else {
      setExpandedSession(sessionId);
      // Fetch session detail if not already loaded
      if (!sessionDetails[sessionId]) {
        await fetchSessionDetail(sessionId);
      }
    }
  };

  const fetchSessionDetail = async (sessionId) => {
    try {
      const response = await parentApi.getSessionDetail(sessionId);
      setSessionDetails((prev) => ({
        ...prev,
        [sessionId]: response,
      }));
    } catch (error) {
      console.error("Error fetching session detail:", error);
    }
  };

  const getAttendanceStatusBadge = (status) => {
    const statusConfig = {
      PRESENT: { label: "Có mặt", className: "bg-green-100 text-green-800" },
      ABSENT: { label: "Vắng", className: "bg-red-100 text-red-800" },
      LATE: { label: "Muộn", className: "bg-yellow-100 text-yellow-800" },
      EXCUSED: { label: "Có phép", className: "bg-blue-100 text-blue-800" },
    };

    const config = statusConfig[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Không tìm thấy lớp học</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />

      <PageTitle title={classDetail.name} subtitle={classDetail.subject} />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "overview"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Tổng quan
        </button>
        <button
          onClick={() => setActiveTab("sessions")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "sessions"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Nội dung buổi học
        </button>
        <button
          onClick={() => setActiveTab("materials")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "materials"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Tài liệu
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Class Info */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Thông tin lớp học</h2>
            <div
              className="text-gray-700 mb-4 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: classDetail.description }}
            />

            {classDetail.objectives && classDetail.objectives.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Mục tiêu khóa học:
                </h3>
                <ul className="space-y-2">
                  {classDetail.objectives.map((objective, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-gray-700"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <span className="font-medium text-gray-700">Ngày bắt đầu:</span>
                <p className="text-gray-900">
                  {new Date(classDetail.startDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Ngày kết thúc:
                </span>
                <p className="text-gray-900">
                  {new Date(classDetail.endDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Tổng số buổi:</span>
                <p className="text-gray-900">
                  {classDetail.totalSessions} buổi
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Đã hoàn thành:
                </span>
                <p className="text-gray-900">
                  {classDetail.completedSessions} buổi
                </p>
              </div>
            </div>
          </Card>

          {/* Teacher Info */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-purple-600" />
              Thông tin giáo viên
            </h2>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {classDetail.teacher.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">
                  {classDetail.teacher.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {classDetail.teacher.bio}
                </p>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>Email: {classDetail.teacher.email}</p>
                  <p>Điện thoại: {classDetail.teacher.phone}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Schedule */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-green-600" />
              Lịch học
            </h2>
            <div className="space-y-3">
              {classDetail.schedule && classDetail.schedule.length > 0 ? (
                classDetail.schedule.map((schedule, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium text-gray-900 w-24">
                      {getDayLabel(schedule.dayOfWeek)}
                    </span>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4" />
                      <span>
                        {schedule.startTime} - {schedule.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4" />
                      <span>Phòng {schedule.room}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Chưa có lịch học cụ thể
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "sessions" && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Nội dung các buổi học</h2>
          <div className="space-y-4">
            {classDetail.sessions && classDetail.sessions.length > 0 ? (
              classDetail.sessions.map((session) => {
                const isExpanded = expandedSession === session.id;
                const detail = sessionDetails[session.id];

                return (
                  <div
                    key={session.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Session Header */}
                    <div
                      className="p-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => toggleSessionDetail(session.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900">
                              {session.title}
                            </h3>
                            {getSessionStatusBadge(session.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(session.date).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {session.startTime} - {session.endTime}
                            </span>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Session Detail - Expanded */}
                    {isExpanded && (
                      <div className="p-4 bg-gray-50 border-t border-gray-200">
                        {/* Content */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            Nội dung buổi học:
                          </h4>
                          <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
                            {session.content || "Chưa có nội dung"}
                          </p>
                        </div>

                        {/* Attendance */}
                        {detail && detail.attendance && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-green-600" />
                              Điểm danh:
                            </h4>
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-700">
                                    Học sinh:{" "}
                                    <strong>
                                      {detail.attendance.studentName}
                                    </strong>
                                  </span>
                                </div>
                                {getAttendanceStatusBadge(
                                  detail.attendance.status
                                )}
                              </div>
                              {detail.attendance.note && (
                                <div className="mt-2 text-xs text-gray-600 flex items-start gap-1">
                                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  <span>{detail.attendance.note}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Materials */}
                        {session.materials && session.materials.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-purple-600" />
                              Tài liệu:
                            </h4>
                            <div className="space-y-2">
                              {session.materials.map((material) => (
                                <div
                                  key={material.id}
                                  className="flex items-center justify-between p-3 bg-white rounded border border-gray-200"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-gray-700">
                                      {material.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      ({material.size})
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadMaterial(
                                        material.id,
                                        material.name
                                      );
                                    }}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Loading state */}
                        {!detail && (
                          <div className="text-center py-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-xs text-gray-500 mt-2">
                              Đang tải chi tiết...
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">
                Chưa có nội dung buổi học
              </p>
            )}
          </div>
        </Card>
      )}

      {activeTab === "materials" && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Tài liệu khóa học</h2>
          {classDetail.materials && classDetail.materials.length > 0 ? (
            <div className="space-y-3">
              {classDetail.materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {material.name}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{material.type}</span>
                        <span>•</span>
                        <span>{material.size}</span>
                        <span>•</span>
                        <span>
                          {new Date(material.uploadDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadMaterial(material.id, material.name)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Tải xuống
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Chưa có tài liệu nào
            </p>
          )}
        </Card>
      )}
    </div>
  );
};

export default ClassDetail;
