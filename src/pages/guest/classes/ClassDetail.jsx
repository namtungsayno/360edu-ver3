import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Calendar,
  MapPin,
  Star,
  CheckCircle,
  Video,
  Award,
} from "lucide-react";
import { classService } from "../../../services/class/class.service";
import { enrollmentService } from "../../../services/enrollment/enrollment.service";
import {
  buildScheduleIndex,
  hasConflict,
  buildIndexByFetchingDetails,
} from "../../../helper/schedule-conflicts";
import { dayLabelVi } from "../../../helper/formatters";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { RichTextContent } from "../../../components/ui/RichTextEditor";
import { stripHtmlTags } from "../../../utils/html-helpers";
import AuthContext from "../../../context/AuthContext";
import { useToast } from "../../../hooks/use-toast";
import PaymentQRModal from "../../../components/payment/PaymentQRModal";

export default function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { success, error: showError, warning, info } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false); // Track if already enrolled

  const classId = Number(id);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        // Use new public API to get class detail with course info
        const cls = await classService.getPublicDetail(classId);
        setData(cls || null);
        if (!cls) setError("Không tìm thấy lớp.");
      } catch (e) {
        setError("Không tải được dữ liệu lớp.");
      } finally {
        setLoading(false);
      }
    })();
  }, [classId]);

  const handleEnroll = async () => {
    // Nếu đã enrolled trong session này, báo toast
    if (isEnrolled) {
      info("Bạn đã đăng ký lớp học này rồi!", "Thông báo");
      return;
    }

    // Helper to parse a YYYY-MM-DD as LOCAL date (avoid UTC shift)
    const parseLocalDate = (dateStr) => {
      if (!dateStr) return null;
      const parts = String(dateStr).split("-").map(Number);
      if (parts.length !== 3 || parts.some(Number.isNaN))
        return new Date(dateStr);
      const [y, m, d] = parts;
      return new Date(y, m - 1, d);
    };

    // Block enroll only if start date is strictly after today (not same-day)
    if (data?.startDate) {
      const start = parseLocalDate(data.startDate);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      if (start > todayStart) {
        warning(
          `Lớp sẽ mở vào ngày ${data.startDate}. Vui lòng liên hệ với chúng tôi để được tư vấn.`
        );
        return;
      }
    }
    // Check authentication trước
    if (!user) {
      // Chưa đăng nhập -> redirect về login
      warning("Vui lòng đăng nhập để đăng ký lớp học!", "Yêu cầu đăng nhập");
      setTimeout(() => {
        navigate("/home/login", {
          state: { from: `/home/classes/${classId}` },
        });
      }, 1500);
      return;
    }

    if (!data) return;

    setEnrolling(true);
    try {
      // 1. Load current enrolled classes (may not include schedule data)
      const myClasses = await enrollmentService.listMyClasses();

      // 1.1 Already enrolled check
      const already = (myClasses || []).some(
        (c) => (c.classId || c.id) === classId
      );
      if (already) {
        setIsEnrolled(true);
        info("Bạn đã đăng ký lớp học này rồi!", "Thông báo");
        return;
      }

      // 2. Build index: if schedule missing, fetch details per class
      let scheduleIndex = buildScheduleIndex(myClasses || []);
      const hasAnySchedule = scheduleIndex.length > 0;
      if (!hasAnySchedule) {
        scheduleIndex = await buildIndexByFetchingDetails(
          myClasses || [],
          classService.getById
        );
      }
      // 3. Check conflict
      const conflict = hasConflict(data, scheduleIndex);
      if (conflict) {
        warning(
          "Lịch học lớp này bị trùng với lớp bạn đã đăng ký.",
          "Trùng lịch"
        );
        return;
      }

      // 4. Try enrollment - if needs payment, show QR modal
      const res = await enrollmentService.selfEnroll(classId);
      setIsEnrolled(true);
      success(
        "Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.",
        "Thành công"
      );
    } catch (e) {
      const status = e?.response?.status;
      const msg =
        e?.response?.data?.message || e?.message || "Đăng ký thất bại";

      // 402 Payment Required -> show QR payment modal
      if (
        status === 402 ||
        String(msg).toLowerCase().includes("payment required") ||
        String(msg).toLowerCase().includes("thanh toán")
      ) {
        info("Vui lòng thanh toán để hoàn tất đăng ký", "Yêu cầu thanh toán");
        setShowPaymentModal(true);
        return;
      }

      if (status === 403) {
        showError(
          "Chỉ học sinh mới có thể đăng ký lớp học. Vui lòng đăng nhập bằng tài khoản học sinh hoặc đăng ký tài khoản mới.",
          "Không có quyền"
        );
        setTimeout(() => {
          navigate("/home/login", {
            state: { from: `/home/classes/${classId}` },
          });
        }, 2000);
      } else if (
        String(msg).toLowerCase().includes("already enrolled") ||
        String(msg).toLowerCase().includes("đã đăng ký")
      ) {
        setIsEnrolled(true);
        info("Bạn đã đăng ký lớp học này rồi!", "Thông báo");
      } else {
        showError(msg, "Lỗi");
      }
    } finally {
      setEnrolling(false);
    }
  };

  // Handler to open payment modal directly (for "Thanh toán ngay" button)
  const handlePaymentClick = () => {
    if (!user) {
      warning("Vui lòng đăng nhập để thanh toán!", "Yêu cầu đăng nhập");
      navigate("/home/login", { state: { from: `/home/classes/${classId}` } });
      return;
    }
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const currentStudents = data.currentStudents || 0;
  const maxStudents = data.maxStudents || 30;
  const availableSlots = maxStudents - currentStudents;
  const enrollmentPercentage = (currentStudents / maxStudents) * 100;
  // Helper to parse a YYYY-MM-DD as LOCAL date (avoid UTC shift)
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = String(dateStr).split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN))
      return new Date(dateStr);
    const [y, m, d] = parts;
    return new Date(y, m - 1, d);
  };

  // Consider class "not opened" only when start date is after today (strictly future),
  // so same-day is allowed for registration.
  const notOpened = (() => {
    if (!data?.startDate) return false;
    const start = parseLocalDate(data.startDate);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return start > todayStart;
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại Toán học</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Class Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Class Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {data.subjectName || "Toán học"} - {data.name || "Học kỳ 1"}
              </h1>
            </div>

            {/* Opening notice */}
            {notOpened && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Lớp sẽ mở vào ngày{" "}
                  <span className="font-semibold">{data.startDate}</span>. Hiện
                  chưa thể đăng ký.
                </span>
              </div>
            )}

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <div
                  className="text-gray-700 leading-relaxed rich-text-content"
                  dangerouslySetInnerHTML={{
                    __html:
                      (data.description || "Khóa học Toán 10 học kỳ 1 bao gồm toán bổ trợ kiến thức cơ bản từ Đại số, Hình học phẳng và Lượng giác. Phương pháp giảng dạy kết hợp lý thuyết với thực hành; giúp học sinh nắm vững kiến thức và phát triển tư duy toán học.")
                        .replace(/\[\[(SOURCE|OWNER):\d+\]\]/g, ""),
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
                      {Array.isArray(data.schedule) &&
                      data.schedule.length > 0 ? (
                        (() => {
                          // Group slots by dayOfWeek
                          const grouped = data.schedule.reduce((acc, s) => {
                            const day = s.dayOfWeek;
                            if (!acc[day]) acc[day] = [];
                            acc[day].push(
                              `${s.startTime?.slice(0, 5)} - ${s.endTime?.slice(
                                0,
                                5
                              )}`
                            );
                            return acc;
                          }, {});
                          // Sort by dayOfWeek and render
                          return Object.keys(grouped)
                            .sort((a, b) => Number(a) - Number(b))
                            .map((day) => (
                              <div key={day}>
                                {dayLabelVi(Number(day))}:{" "}
                                {grouped[day].join(", ")}
                              </div>
                            ));
                        })()
                      ) : (
                        <div>Thứ 2, 4, 6 • 19:00 - 21:00</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Ngày bắt đầu học</span>
                    </div>
                    <div className="ml-7 text-gray-600">
                      {(() => {
                        // Tính ngày học đầu tiên từ startDate + schedule
                        if (!data.startDate) return "Chưa xác định";

                        const startDate = new Date(data.startDate);
                        const schedules = Array.isArray(data.schedule)
                          ? data.schedule
                          : [];

                        if (schedules.length === 0) {
                          return data.startDate;
                        }

                        // dayOfWeek trong schedule: 2=Thứ 2, 3=Thứ 3, ..., 8=CN
                        // JS getDay(): 0=CN, 1=Thứ 2, ..., 6=Thứ 7
                        const scheduleDays = schedules.map((s) => s.dayOfWeek);

                        // Tìm ngày học đầu tiên (trong 7 ngày kể từ startDate)
                        let firstClassDate = null;
                        let firstSlot = null;

                        for (let i = 0; i < 7; i++) {
                          const checkDate = new Date(startDate);
                          checkDate.setDate(startDate.getDate() + i);
                          const jsDay = checkDate.getDay(); // 0=CN, 1-6=T2-T7
                          const scheduleDay = jsDay === 0 ? 8 : jsDay + 1; // Convert to schedule format

                          if (scheduleDays.includes(scheduleDay)) {
                            firstClassDate = checkDate;
                            // Lấy slot đầu tiên của ngày này
                            const daySlots = schedules
                              .filter((s) => s.dayOfWeek === scheduleDay)
                              .sort((a, b) =>
                                (a.startTime || "").localeCompare(
                                  b.startTime || ""
                                )
                              );
                            firstSlot = daySlots[0];
                            break;
                          }
                        }

                        if (!firstClassDate) return data.startDate;

                        const dateStr = firstClassDate.toLocaleDateString(
                          "vi-VN",
                          {
                            weekday: "long",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        );

                        const timeStr = firstSlot?.startTime
                          ? ` • ${firstSlot.startTime.slice(0, 5)} - ${
                              firstSlot.endTime?.slice(0, 5) || ""
                            }`
                          : "";

                        return dateStr + timeStr;
                      })()}
                    </div>
                  </div>

                  {/* Hiển thị hình thức học theo DB */}
                  {data.online === true && (
                    <div>
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <Video className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Học Online</span>
                      </div>
                      <div className="ml-7 text-gray-600">Qua Google Meet</div>
                    </div>
                  )}

                  {data.online === false && (
                    <div>
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">
                          Phòng {data.roomName || "301 - Tòa A"}
                        </span>
                      </div>
                      <div className="ml-7 text-gray-600">
                        Học tại trung tâm
                      </div>
                    </div>
                  )}

                  {(data.online === null || data.online === undefined) && (
                    <>
                      <div>
                        <div className="flex items-center gap-2 text-gray-700 mb-2">
                          <Video className="w-5 h-5 text-green-600" />
                          <span className="font-medium">Học Online</span>
                        </div>
                        <div className="ml-7 text-gray-600">
                          Qua Google Meet
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-gray-700 mb-2">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">
                            Phòng {data.roomName || "301 - Tòa A"}
                          </span>
                        </div>
                        <div className="ml-7 text-gray-600">
                          Học tại trung tâm
                        </div>
                      </div>
                    </>
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
                  {data.teacherAvatarUrl ? (
                    <img
                      src={data.teacherAvatarUrl}
                      alt={data.teacherFullName}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                      {(data.teacherFullName || "G").charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {data.teacherFullName || "Giáo viên"}
                    </h3>
                    <div className="flex items-center gap-1 text-yellow-500 mb-2">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-gray-700 text-sm font-medium">
                        4.9
                      </span>
                    </div>
                    {data.teacherBio && (
                      <div className="text-gray-600 text-sm mb-3 line-clamp-4">
                        <RichTextContent content={data.teacherBio} />
                      </div>
                    )}
                    {data.teacherDepartment && (
                      <p className="text-gray-600 text-sm mb-3">
                        {data.teacherDepartment}
                      </p>
                    )}
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Award className="w-4 h-4" />
                        <span>Giáo viên chuyên nghiệp</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Giảng dạy môn {data.subjectName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Curriculum - Dynamic from Course Lessons */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Chương trình học
                  </h2>
                  {data.courseTitle && (
                    <span className="text-blue-600 text-sm font-medium">
                      {data.courseTitle}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {data.courseLessons && data.courseLessons.length > 0 ? (
                    data.courseLessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
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
                                {stripHtmlTags(lesson.description)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="border-l-4 border-gray-300 pl-4">
                      <p className="text-gray-500">
                        Nội dung sẽ được cập nhật bởi giáo viên
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Enrollment Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card className="shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Đăng ký học
                  </h2>

                  {notOpened && (
                    <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 p-3 text-sm">
                      Lớp sẽ mở vào ngày{" "}
                      <span className="font-semibold">{data.startDate}</span>.
                      Hiện chưa thể đăng ký trực tuyến.
                    </div>
                  )}

                  {/* Enrollment Progress */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">
                        Còn {availableSlots} chỗ
                      </span>
                      <span className="font-bold text-blue-600">
                        {currentStudents}/{maxStudents}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${enrollmentPercentage}%` }}
                      ></div>
                    </div>
                    {availableSlots <= 5 && availableSlots > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-orange-600 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Chỉ còn {availableSlots} chỗ trống!</span>
                      </div>
                    )}
                  </div>

                  {/* Learning Mode Display */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hình thức học
                    </label>
                    <div className="p-3 border-2 border-blue-600 bg-blue-50 rounded-lg">
                      {data.online === true && (
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
                      )}
                      {data.online === false && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-sm text-gray-900">
                              Offline
                            </div>
                            <div className="text-xs text-gray-600">
                              Phòng {data.roomName || "301 - Tòa A"}
                            </div>
                          </div>
                        </div>
                      )}
                      {data.online === null && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-purple-600" />
                          <div>
                            <div className="font-medium text-sm text-gray-900">
                              Cả hai
                            </div>
                            <div className="text-xs text-gray-600">
                              Linh hoạt online & offline
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Hình thức học được xác định bởi lớp học
                    </p>
                  </div>

                  {/* Enrollment Section */}
                  <div className="pt-4 border-t">
                    {/* Giá mỗi buổi */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 text-sm">
                        Giá mỗi buổi:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {data.pricePerSession
                          ? `${data.pricePerSession.toLocaleString()}đ`
                          : "Liên hệ"}
                      </span>
                    </div>

                    {/* Số buổi học */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-600 text-sm">
                        Số buổi học:
                      </span>
                      <span className="text-gray-900 font-medium">
                        {data.totalSessions || data.sessionsGenerated || 0} buổi
                      </span>
                    </div>

                    {/* Tổng học phí = pricePerSession * totalSessions */}
                    <div className="flex items-center justify-between mb-4 pt-3 border-t border-dashed">
                      <span className="text-gray-700 font-medium">
                        Tổng học phí:
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {(() => {
                          const price = data.pricePerSession || 0;
                          const sessions =
                            data.totalSessions || data.sessionsGenerated || 0;
                          const total = price * sessions;
                          return total > 0
                            ? `${total.toLocaleString()}đ`
                            : "Liên hệ";
                        })()}
                      </span>
                    </div>

                    <Button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className={`w-full text-lg py-6 ${
                        notOpened
                          ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {enrolling
                        ? "Đang xử lý..."
                        : notOpened
                        ? "Chưa mở - Liên hệ tư vấn"
                        : user
                        ? "Đăng ký ngay"
                        : "Đăng nhập để đăng ký"}
                    </Button>

                    <div className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-gray-600 h-11 text-sm font-medium cursor-not-allowed">
                      Liên hệ: 0963398714 để được tư vấn
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Payment QR Modal */}
      <PaymentQRModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        classId={classId}
        className={data?.name}
      />
    </div>
  );
}
