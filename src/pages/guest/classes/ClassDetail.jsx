import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Calendar,
  MapPin,
  Users,
  Star,
  CheckCircle,
  Video,
  Award,
} from "lucide-react";
import { classService } from "../../../services/class/class.service";
import { enrollmentService } from "../../../services/enrollment/enrollment.service";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import AuthContext from "../../../context/AuthContext";
import { useToast } from "../../../hooks/use-toast";

export default function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { success, error: showError, warning } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  const classId = Number(id);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const list = await classService.list();
        const cls = Array.isArray(list)
          ? list.find((c) => c.id === classId)
          : null;
        setData(cls || null);
        if (!cls) setError("Không tìm thấy lớp.");
      } catch (e) {
        console.error(e);
        setError("Không tải được dữ liệu lớp.");
      } finally {
        setLoading(false);
      }
    })();
  }, [classId]);

  const handleEnroll = async () => {
    // Helper to parse a YYYY-MM-DD as LOCAL date (avoid UTC shift)
    const parseLocalDate = (dateStr) => {
      if (!dateStr) return null;
      const parts = String(dateStr).split("-").map(Number);
      if (parts.length !== 3 || parts.some(Number.isNaN)) return new Date(dateStr);
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
      await enrollmentService.selfEnroll(classId);
      success(
        "Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.",
        "Thành công"
      );
    } catch (e) {
      console.error(e);
      const status = e?.response?.status;
      const msg =
        e?.response?.data?.message || e?.message || "Đăng ký thất bại";

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
      } else if (msg.includes("already enrolled")) {
        warning("Bạn đã đăng ký lớp học này", "Thông báo");
      } else {
        showError(msg, "Lỗi");
      }
    } finally {
      setEnrolling(false);
    }
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
    if (parts.length !== 3 || parts.some(Number.isNaN)) return new Date(dateStr);
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
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-100 text-green-800">
                  Online - Offline
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {data.subjectName || "Toán học"} - {data.name || "Học kỳ 1"}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">THPT</span>
                <span>•</span>
                <span>36 buổi học</span>
              </div>
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
                <p className="text-gray-700 leading-relaxed">
                  {data.description ||
                    "Khóa học Toán 10 học kỳ 1 bao gồm toán bổ trợ kiến thức cơ bản từ Đại số, Hình học phẳng và Lượng giác. Phương pháp giảng dạy kết hợp lý thuyết với thực hành; giúp học sinh nắm vững kiến thức và phát triển tư duy toán học."}
                </p>
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
                        data.schedule.map((s, idx) => (
                          <div key={idx}>
                            Thứ {s.dayOfWeek}, {s.startTime?.slice(0, 5)} -{" "}
                            {s.endTime?.slice(0, 5)}
                          </div>
                        ))
                      ) : (
                        <div>Thứ 2, 4, 6 • 19:00 - 21:00</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Khai giảng</span>
                    </div>
                    <div className="ml-7 text-gray-600">
                      {data.startDate || "01/11/2024"}
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
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                    {(data.teacherFullName || "Nguyễn Văn A").charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {data.teacherFullName || "Thầy Nguyễn Văn A"}
                    </h3>
                    <div className="flex items-center gap-1 text-yellow-500 mb-2">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-gray-700 text-sm font-medium">
                        4.9
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      15 năm kinh nghiệm
                      <br />
                      Trực tổ Toán học - Đại học phạm HN
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Award className="w-4 h-4" />
                        <span>Giáo viên xuất sắc 2023</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>500+ học sinh đã học</span>
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
                  <button className="text-blue-600 text-sm font-medium hover:underline">
                    Lời ích
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Week 1-6 */}
                  <div className="border-l-4 border-blue-600 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Tuần 1-6</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Mệnh đề - Tập hợp</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Hàm số bậc nhất, bậc hai</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Phương trình và bất phương trình</span>
                      </li>
                    </ul>
                  </div>

                  {/* Week 7-12 */}
                  <div className="border-l-4 border-gray-300 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Tuần 7-12</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>Thống kê</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>Hình học: Góc và đường thẳng song</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>Tích vô hướng của hai vector</span>
                      </li>
                    </ul>
                  </div>

                  {/* Week 13-18 */}
                  <div className="border-l-4 border-gray-300 pl-4">
                    <h3 className="font-bold text-gray-900 mb-2">Tuần 13-18</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="text-gray-500">
                        Nội dung sẽ được cập nhật
                      </li>
                    </ul>
                  </div>
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
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-700">Tổng học phí:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {data.fee
                          ? `${data.fee.toLocaleString()}đ`
                          : "2.500.000đ"}
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

                    <a
                      href="tel:0123456789"
                      className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 h-11 text-sm font-medium"
                    >
                      Liên hệ với chúng tôi
                    </a>

                    <p className="text-xs text-gray-500 text-center mt-3">
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
