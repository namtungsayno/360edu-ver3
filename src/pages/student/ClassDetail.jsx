import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, MapPin, Users, Star, CheckCircle, Video, Award, BookOpen } from "lucide-react";
import { enrollmentService } from "../../services/enrollment/enrollment.service";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card, CardContent } from "../../components/ui/Card.jsx";

export default function StudentClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const classId = Number(id);

  useEffect(() => {
    (async () => {
      console.log(" Loading student class detail for classId:", classId);
      setLoading(true);
      setError("");
      try {
        // Lấy danh sách lớp đã đăng ký
        const enrolledClasses = await enrollmentService.listMyClasses();
        console.log(" Enrolled classes:", enrolledClasses);
        
        // Tìm lớp có classId tương ứng
        const cls = Array.isArray(enrolledClasses) 
          ? enrolledClasses.find((c) => c.classId === classId) 
          : null;
        
        if (!cls) {
          console.error(" Class not found in enrolled classes");
          setError("Không tìm thấy lớp hoặc bạn chưa đăng ký lớp này.");
        } else {
          console.log(" Class found:", cls);
          console.log("📖 Course info - courseId:", cls.courseId, "courseTitle:", cls.courseTitle);
          setData(cls);
        }
      } catch (e) {
        console.error(" Failed to load class detail:", e);
        setError("Không tải được dữ liệu lớp.");
      } finally {
        setLoading(false);
      }
    })();
  }, [classId]);

  if (loading) {
    return (
      <div className="bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <Button onClick={() => navigate("/home/my-classes")} className="mt-4">
            Quay lại danh sách lớp
          </Button>
        </div>
      </div>
    );
  }
  
  if (!data) return null;

  return (
    <div className="bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate("/home/my-classes")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại danh sách lớp</span>
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
                <Badge className={
                  data.status === 'ACTIVE' 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                }>
                  {data.status === 'ACTIVE' ? '✓ Đang học' : data.status}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {data.className}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">{data.subjectName}</span>
                {data.semesterName && (
                  <>
                    <span>•</span>
                    <span>{data.semesterName}</span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Thông tin lớp học
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Bạn đã đăng ký lớp học này. Hãy tham gia đầy đủ các buổi học và hoàn thành bài tập được giao để đạt kết quả tốt nhất.
                </p>
              </CardContent>
            </Card>

            {/* Schedule Info */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Thời gian học</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {data.roomName && (
                    <div>
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Phòng học</span>
                      </div>
                      <div className="ml-7 text-gray-600">
                        {data.roomName}
                      </div>
                    </div>
                  )}

                  {data.startDate && data.endDate && (
                    <div>
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Thời gian</span>
                      </div>
                      <div className="ml-7 text-gray-600">
                        {data.startDate} → {data.endDate}
                      </div>
                    </div>
                  )}

                  {data.semesterName && (
                    <div>
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">Học kỳ</span>
                      </div>
                      <div className="ml-7 text-gray-600">
                        {data.semesterName}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Teacher Info */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Giáo viên giảng dạy</h2>
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {(data.teacherName || "G").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {data.teacherName || "Giáo viên"}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Giáo viên giảng dạy môn {data.subjectName}
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-blue-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Giáo viên chuyên nghiệp</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Resources */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Tài liệu học tập</h2>
                </div>

                {/* Course Info */}
                {data.courseId && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">
                          {data.courseTitle || "Khóa học"}
                        </div>
                        <div className="text-sm text-gray-600">
                          Nội dung khóa học của lớp
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => navigate(`/home/courses/${data.courseId}?classId=${data.classId}`)}
                      >
                        Xem khóa học
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Class Status */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card className="shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Trạng thái đăng ký</h2>

                  {/* Status Badge */}
                  <div className="mb-6 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span className="font-bold text-green-800 text-lg">
                        {data.status === 'ACTIVE' ? 'Đang học' : 'Đã đăng ký'}
                      </span>
                    </div>
                    <p className="text-sm text-green-700">
                      Bạn đã đăng ký lớp học này thành công
                    </p>
                  </div>

                  {/* Class Info Summary */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Môn học
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{data.subjectName}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giáo viên
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{data.teacherName}</span>
                      </div>
                    </div>

                    {data.roomName && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phòng học
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{data.roomName}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        // TODO: Navigate to attendance or materials
                        console.log("View attendance/materials");
                      }}
                    >
                      Xem điểm danh
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/home/my-classes")}
                    >
                      Quay lại danh sách
                    </Button>
                  </div>

                  {/* Support Info */}
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-xs text-gray-500 text-center">
                      Liên hệ hỗ trợ: 0123 456 789
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
