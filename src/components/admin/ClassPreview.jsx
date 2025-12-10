/**
 * ClassPreview - Component hiển thị xem trước lớp học
 * Giao diện tương tự ClassDetail.jsx (Guest view)
 * Dùng cho cả tạo lớp mới và chỉnh sửa lớp
 */
import React from "react";
import {
  Clock,
  Calendar,
  MapPin,
  Star,
  CheckCircle,
  Video,
  Award,
  Users,
  DollarSign,
  BookOpen,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card, CardContent } from "../../components/ui/Card";
import { formatCurrency } from "../../helper/formatters";

// Helper to convert day index to Vietnamese label
const dayLabelVi = (dayOfWeek) => {
  const labels = {
    0: "CN",
    1: "T2",
    2: "T3",
    3: "T4",
    4: "T5",
    5: "T6",
    6: "T7",
    7: "CN",
  };
  return labels[dayOfWeek] || `Thứ ${dayOfWeek}`;
};

export default function ClassPreview({
  // Class info
  name,
  description,
  isOnline,
  // Subject & Course
  subjectName,
  courseName,
  courseLessons = [],
  // Teacher
  teacherFullName,
  teacherAvatarUrl,
  teacherBio,
  // Schedule
  pickedSlots = [],
  startDate,
  endDate,
  totalSessions,
  // Capacity & Price
  maxStudents,
  pricePerSession,
  // Online/Offline specific
  meetingLink,
  roomName,
}) {
  // Convert pickedSlots to schedule format for display
  const scheduleDisplay = React.useMemo(() => {
    if (!pickedSlots.length) return [];

    // Group slots by day
    const grouped = {};
    pickedSlots.forEach((slot) => {
      const d = new Date(slot.isoStart);
      const e = new Date(slot.isoEnd);
      const dayOfWeek = d.getDay();
      const startTime = d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const endTime = e.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (!grouped[dayOfWeek]) grouped[dayOfWeek] = [];
      const timeRange = `${startTime} - ${endTime}`;
      if (!grouped[dayOfWeek].includes(timeRange)) {
        grouped[dayOfWeek].push(timeRange);
      }
    });

    return Object.keys(grouped)
      .sort((a, b) => Number(a) - Number(b))
      .map((day) => ({
        day: Number(day),
        times: grouped[day],
      }));
  }, [pickedSlots]);

  const totalPrice =
    pricePerSession && totalSessions
      ? parseInt(pricePerSession) * parseInt(totalSessions)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preview Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-lg">👁️</span>
          <span className="font-medium">
            Chế độ xem trước - Đây là giao diện học sinh sẽ nhìn thấy
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Class Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Class Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge
                  className={
                    isOnline
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }
                >
                  {isOnline ? "Online" : "Offline"}
                </Badge>
                {courseName && (
                  <Badge className="bg-purple-100 text-purple-800">
                    {courseName}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {name || "Tên lớp học"}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">{subjectName || "Môn học"}</span>
                <span>•</span>
                <span>{totalSessions || 0} buổi học</span>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <div
                  className="text-gray-700 leading-relaxed rich-text-content"
                  dangerouslySetInnerHTML={{
                    __html:
                      description ||
                      "Mô tả lớp học sẽ hiển thị ở đây. Giáo viên có thể thêm mô tả chi tiết về nội dung và phương pháp giảng dạy.",
                  }}
                />
              </CardContent>
            </Card>

            {/* Schedule Info */}
            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Thời gian học</span>
                    </div>
                    <div className="ml-7 text-gray-600">
                      {scheduleDisplay.length > 0 ? (
                        scheduleDisplay.map(({ day, times }) => (
                          <div key={day}>
                            {dayLabelVi(day)}: {times.join(", ")}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 italic">
                          Chưa có lịch học
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Khai giảng</span>
                    </div>
                    <div className="ml-7 text-gray-600">
                      {startDate || "Chưa xác định"}
                    </div>
                    {endDate && (
                      <div className="ml-7 text-gray-500 text-sm mt-1">
                        Kết thúc: {endDate}
                      </div>
                    )}
                  </div>

                  {/* Online/Offline specific info */}
                  {isOnline ? (
                    <div>
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <Video className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Học Online</span>
                      </div>
                      <div className="ml-7 text-gray-600">
                        {meetingLink ? (
                          <a
                            href={meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            Qua Google Meet
                          </a>
                        ) : (
                          "Qua Google Meet"
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">
                          Phòng {roomName || "---"}
                        </span>
                      </div>
                      <div className="ml-7 text-gray-600">
                        Học tại trung tâm
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Teacher Info */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Giáo viên giảng dạy
                </h2>
                <div className="flex items-start gap-4">
                  {teacherAvatarUrl ? (
                    <img
                      src={teacherAvatarUrl}
                      alt={teacherFullName}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                      {(teacherFullName || "G").charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {teacherFullName || "Giáo viên"}
                    </h3>
                    <div className="flex items-center gap-1 text-yellow-500 mb-2">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-gray-700 text-sm font-medium">
                        4.9
                      </span>
                    </div>
                    {teacherBio && (
                      <p className="text-gray-600 text-sm mb-3">{teacherBio}</p>
                    )}
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Award className="w-4 h-4" />
                        <span>Giáo viên chuyên nghiệp</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Giảng dạy môn {subjectName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Curriculum */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Chương trình học
                  </h2>
                  {courseName && (
                    <span className="text-blue-600 text-sm font-medium">
                      {courseName}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {courseLessons && courseLessons.length > 0 ? (
                    courseLessons.map((lesson, idx) => (
                      <div
                        key={lesson.id || idx}
                        className={`border-l-4 ${
                          idx < 3 ? "border-blue-600" : "border-gray-300"
                        } pl-4`}
                      >
                        <div className="flex items-start gap-2">
                          <CheckCircle
                            className={`w-4 h-4 ${
                              idx < 3 ? "text-blue-600" : "text-gray-400"
                            } mt-0.5 flex-shrink-0`}
                          />
                          <div>
                            <span className="font-medium text-gray-900">
                              {lesson.title}
                            </span>
                            {lesson.description && (
                              <p className="text-sm text-gray-500 mt-1">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="border-l-4 border-gray-300 pl-4">
                      <p className="text-gray-500">
                        Nội dung sẽ được cập nhật bởi giáo viên sau khi lớp được
                        tạo
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Enrollment Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card className="shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Đăng ký học
                  </h2>

                  {/* Enrollment Progress Preview */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">
                        Còn {maxStudents || 0} chỗ
                      </span>
                      <span className="font-bold text-blue-600">
                        0/{maxStudents || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: "0%" }}
                      ></div>
                    </div>
                  </div>

                  {/* Learning Mode Display */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hình thức học
                    </label>
                    <div className="p-3 border-2 border-blue-600 bg-blue-50 rounded-lg">
                      {isOnline ? (
                        <div className="flex items-center gap-2">
                          <Video className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="font-medium text-sm text-gray-900">
                              Online
                            </div>
                            <div className="text-xs text-gray-600">
                              Học qua Google Meet
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-sm text-gray-900">
                              Offline
                            </div>
                            <div className="text-xs text-gray-600">
                              Phòng {roomName || "---"}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Hình thức học được xác định bởi lớp học
                    </p>
                  </div>

                  {/* Price Section */}
                  <div className="pt-4 border-t">
                    {/* Giá mỗi buổi */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 text-sm">
                        Giá mỗi buổi:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {pricePerSession
                          ? formatCurrency(parseInt(pricePerSession))
                          : "Liên hệ"}
                      </span>
                    </div>

                    {/* Số buổi học */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-600 text-sm">
                        Số buổi học:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {totalSessions || 0} buổi
                      </span>
                    </div>

                    {/* Tổng học phí */}
                    <div className="flex items-center justify-between mb-4 pt-3 border-t border-dashed">
                      <span className="text-gray-700 font-medium">
                        Tổng học phí:
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {totalPrice ? formatCurrency(totalPrice) : "Liên hệ"}
                      </span>
                    </div>

                    {/* Preview buttons - disabled */}
                    <button
                      disabled
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium opacity-50 cursor-not-allowed"
                    >
                      Đăng ký ngay
                    </button>

                    <button
                      disabled
                      className="w-full mt-3 border border-blue-600 text-blue-600 py-3 rounded-lg font-medium opacity-50 cursor-not-allowed"
                    >
                      Liên hệ với chúng tôi
                    </button>

                    <p className="text-center text-xs text-gray-500 mt-4">
                      Hoặc liên hệ: 0123 456 789
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
