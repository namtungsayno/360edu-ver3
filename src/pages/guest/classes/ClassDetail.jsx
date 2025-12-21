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
  ChevronDown,
  ChevronRight,
  FileText,
  Layers,
  BookOpen,
} from "lucide-react";
import { classService } from "../../../services/class/class.service";
import { enrollmentService } from "../../../services/enrollment/enrollment.service";
import {
  buildScheduleIndex,
  hasConflict,
  buildIndexByFetchingDetails,
} from "../../../helper/schedule-conflicts";
import { dayLabelVi, formatDateVN } from "../../../helper/formatters";
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

        // Check if user is already enrolled in this class
        if (user) {
          try {
            const myClasses = await enrollmentService.listMyClasses();
            const alreadyEnrolled = (myClasses || []).some(
              (c) => (c.classId || c.id) === classId
            );
            setIsEnrolled(alreadyEnrolled);
          } catch {
            // Ignore error - user might not have any classes
          }
        }
      } catch (e) {
        setError("Không tải được dữ liệu lớp.");
      } finally {
        setLoading(false);
      }
    })();
  }, [classId, user]);

  const handleEnroll = async () => {
    // Kiểm tra nếu lớp đã đầy
    const currentStudentsCount = data?.currentStudents || 0;
    const maxStudentsCount = data?.maxStudents || 30;
    if (currentStudentsCount >= maxStudentsCount) {
      showError(
        "Lớp học này đã đầy, vui lòng chọn lớp khác!",
        "Không thể đăng ký"
      );
      return;
    }

    // Nếu đã enrolled trong session này, báo toast
    if (isEnrolled) {
      info("Bạn đã đăng ký lớp học này rồi!", "Thông báo");
      return;
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
  const isFull = currentStudents >= maxStudents; // Check if class is full
  // Helper to parse a YYYY-MM-DD as LOCAL date (avoid UTC shift)
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = String(dateStr).split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN))
      return new Date(dateStr);
    const [y, m, d] = parts;
    return new Date(y, m - 1, d);
  };

  // Khi lớp được PUBLIC, học sinh có thể đăng ký ngay lập tức
  // Không còn chặn đăng ký dựa trên startDate nữa
  const notOpened = false;

  // Chỉ hiển thị thông báo ngày bắt đầu (không block đăng ký)
  const isUpcoming = (() => {
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

            {/* Opening notice - Chỉ hiển thị thông tin ngày bắt đầu */}
            {isUpcoming && (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 px-3 py-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Lớp sẽ bắt đầu vào ngày{" "}
                  <span className="font-semibold">
                    {formatDateVN(data.startDate)}
                  </span>
                  . Đăng ký ngay để giữ chỗ!
                </span>
              </div>
            )}

            {/* Description */}
            <Card>
              <CardContent className="p-6 pt-5">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Giới thiệu lớp học
                </h2>
                <div
                  className="text-gray-700 leading-relaxed rich-text-content"
                  dangerouslySetInnerHTML={{
                    __html:
                      data.description ||
                      "Khóa học Toán 10 học kỳ 1 bao gồm toán bổ trợ kiến thức cơ bản từ Đại số, Hình học phẳng và Lượng giác. Phương pháp giảng dạy kết hợp lý thuyết với thực hành; giúp học sinh nắm vững kiến thức và phát triển tư duy toán học.",
                  }}
                />
              </CardContent>
            </Card>

            {/* Schedule Info */}
            <Card>
              <CardContent className="p-6 pt-5">
                <h2 className="text-xl font-bold text-gray-900 mb-5">
                  Lịch học
                </h2>
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
              <CardContent className="p-6 pt-5">
                <h2 className="text-xl font-bold text-gray-900 mb-5">
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

            {/* Curriculum - Dynamic from Course Chapters */}
            <Card>
              <CardContent className="p-6 pt-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-5 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                      <Layers className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Nội dung khóa học
                      </h2>
                      {data.courseChapters &&
                        data.courseChapters.length > 0 && (
                          <p className="text-sm text-gray-500 mt-1">
                            {data.courseChapters.length} chương ·{" "}
                            {data.courseLessons?.length || 0} bài học
                          </p>
                        )}
                    </div>
                  </div>
                  {data.courseTitle && (
                    <div className="sm:text-right mt-2 sm:mt-0">
                      <span className="inline-flex items-center gap-2 text-blue-600 text-sm font-medium bg-blue-50 px-4 py-2 rounded-full shadow-sm">
                        <BookOpen className="w-4 h-4 flex-shrink-0" />
                        <span className="max-w-[220px] truncate">
                          {data.courseTitle}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Chapters with Lessons - Expandable */}
                {data.courseChapters && data.courseChapters.length > 0 ? (
                  <div className="space-y-3">
                    {data.courseChapters.map((chapter, idx) => (
                      <ChapterItem
                        key={chapter.id}
                        chapter={chapter}
                        index={idx + 1}
                      />
                    ))}
                  </div>
                ) : data.courseLessons && data.courseLessons.length > 0 ? (
                  // Fallback: flat lessons list if no chapters
                  <div className="space-y-3">
                    {data.courseLessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-blue-600">
                            {idx + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">
                            {lesson.title}
                          </span>
                          {lesson.description && (
                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                              {stripHtmlTags(lesson.description)}
                            </p>
                          )}
                        </div>
                        <FileText className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <Layers className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">
                      Nội dung sẽ được cập nhật bởi giáo viên
                    </p>
                  </div>
                )}
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

                  {isUpcoming && (
                    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 p-3 text-sm">
                      Lớp sẽ bắt đầu vào ngày{" "}
                      <span className="font-semibold">
                        {formatDateVN(data.startDate)}
                      </span>
                      . Đăng ký ngay để giữ chỗ!
                    </div>
                  )}

                  {/* Enrollment Progress */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span
                        className={
                          isFull ? "text-red-600 font-medium" : "text-gray-600"
                        }
                      >
                        {isFull ? "🚫 Lớp đã đầy" : `Còn ${availableSlots} chỗ`}
                      </span>
                      <span
                        className={`font-bold ${
                          isFull ? "text-red-600" : "text-blue-600"
                        }`}
                      >
                        {currentStudents}/{maxStudents}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isFull ? "bg-red-600" : "bg-blue-600"
                        }`}
                        style={{ width: `${enrollmentPercentage}%` }}
                      ></div>
                    </div>
                    {isFull && (
                      <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Lớp đã hết chỗ, vui lòng chọn lớp khác!</span>
                      </div>
                    )}
                    {!isFull && availableSlots <= 5 && availableSlots > 0 && (
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
                        {data.pricePerSession === 0 ? (
                          <span className="text-green-600 font-bold">
                            Miễn phí
                          </span>
                        ) : data.pricePerSession ? (
                          `${data.pricePerSession.toLocaleString()} VNĐ`
                        ) : (
                          "Liên hệ"
                        )}
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
                          // Nếu price = 0 thì miễn phí
                          if (price === 0) {
                            return (
                              <span className="text-green-600">Miễn phí</span>
                            );
                          }
                          return total > 0
                            ? `${total.toLocaleString()}đ`
                            : "Liên hệ";
                        })()}
                      </span>
                    </div>

                    <Button
                      onClick={handleEnroll}
                      disabled={enrolling || isFull || isEnrolled}
                      className={`w-full text-lg py-6 ${
                        isEnrolled
                          ? "bg-green-600 hover:bg-green-600 cursor-not-allowed text-white"
                          : isFull
                          ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {isEnrolled
                        ? "Đã Đăng Ký"
                        : isFull
                        ? "Lớp đã đầy - Không thể đăng ký"
                        : enrolling
                        ? "Đang xử lý..."
                        : user
                        ? "Đăng ký ngay"
                        : "Đăng nhập để đăng ký"}
                    </Button>

                    {isEnrolled && (
                      <p className="mt-2 text-center text-sm text-green-600 font-medium">
                        Bạn đã đăng ký lớp học này
                      </p>
                    )}

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

// ===========================
// CHAPTER ITEM COMPONENT
// ===========================
function ChapterItem({ chapter, index }) {
  const [open, setOpen] = useState(false);
  const lessonCount = chapter.lessons?.length || 0;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Chapter Header */}
      <div
        className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-blue-600">{index}</span>
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-neutral-900">
              {chapter.title}
            </h4>
            {chapter.description && (
              <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">
                {stripHtmlTags(chapter.description)}
              </p>
            )}
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {lessonCount} bài học
          </span>
        </div>
        <div className="ml-3">
          {open ? (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          )}
        </div>
      </div>

      {/* Lessons */}
      {open && (
        <div className="bg-white">
          {lessonCount === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              Chương này chưa có bài học
            </div>
          )}

          {lessonCount > 0 && (
            <div className="divide-y divide-gray-100">
              {chapter.lessons.map((lesson, lessonIdx) => (
                <div
                  key={lesson.id}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-md bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-purple-600">
                      {lessonIdx + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">
                      {lesson.title}
                    </p>
                    {lesson.description && (
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                        {stripHtmlTags(lesson.description)}
                      </p>
                    )}
                  </div>
                  <FileText className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
