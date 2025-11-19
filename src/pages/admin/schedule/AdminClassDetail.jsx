import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/Table.jsx";
import { ExternalLink, ArrowLeft, AlertCircle } from "lucide-react";
import { scheduleService } from "../../../services/schedule/schedule.service";
import { attendanceService } from "../../../services/attendance/attendance.service";
import { toast } from "../../../hooks/use-toast";

function AdminClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [classDetail, setClassDetail] = useState(null);
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!classId) {
      console.error("❌ classId is missing!");
      setError("Class ID không hợp lệ");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy date từ location state, nếu không có thì dùng hôm nay
        const date =
          location.state?.date || new Date().toISOString().split("T")[0];

        console.log("🔍 Loading class detail:", {
          classId,
          date,
          type: typeof classId,
        });

        // Load attendance from backend by class + date (admin endpoint)
        const slotId = location.state?.slotId;
        const attendance = await attendanceService.getByClassForAdmin(
          classId,
          date,
          slotId
        );
        console.log("✅ Attendance loaded:", attendance.length, "students");
        setAttendanceDetails(attendance);

        // Get class info from schedule
        const allSchedule = await scheduleService.getScheduleBySemester("all");
        const classInfo = allSchedule.find(
          (item) => String(item.classId) === String(classId)
        );

        if (classInfo) {
          setClassDetail({
            ...classInfo,
            studentCount: attendance.length,
            viewDate: date, // Lưu ngày đang xem
          });
        }
      } catch (e) {
        console.error("Failed to load class details:", e);
        if (e?.response?.status === 404) {
          setError(
            e.response.data?.message ||
              "Không có buổi học nào cho lớp này vào ngày đã chọn."
          );
          toast.error(
            e.response.data?.message ||
              "Không có buổi học nào cho lớp này vào ngày đã chọn."
          );
        } else {
          setError("Không thể tải thông tin lớp học");
          toast.error("Không thể tải thông tin lớp học");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [classId, location.state]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-100 text-green-800">Có mặt</Badge>;
      case "absent":
        return <Badge className="bg-red-100 text-red-800">Vắng</Badge>;
      case "late":
        return <Badge className="bg-yellow-100 text-yellow-800">Muộn</Badge>;
      case "-":
      case "":
      case null:
      case undefined:
        return (
          <Badge className="bg-slate-100 text-slate-800">Chưa điểm danh</Badge>
        );
      default:
        return <Badge className="bg-slate-100 text-slate-800">-</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-16 w-16 text-orange-500 mb-4" />
          <p className="text-lg font-semibold text-gray-700 mb-2">
            Không tìm thấy buổi học
          </p>
          <p className="text-gray-500 max-w-md">{error}</p>
          <p className="text-sm text-gray-400 mt-4">
            Có thể buổi học này chưa được tạo trong hệ thống, hoặc đã bị hủy.
          </p>
        </div>
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Không tìm thấy thông tin lớp học</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Chi tiết lớp {classDetail.className}
            </h1>
            <p className="text-slate-600 mt-1">
              {classDetail.subjectName} - {classDetail.teacherName}
            </p>
          </div>
        </div>
        {classDetail.meetLink && (
          <Button onClick={() => window.open(classDetail.meetLink, "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Vào lớp học
          </Button>
        )}
      </div>

      {/* Class Info */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin lớp học</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Môn học:</span>
                <p className="font-medium">{classDetail.subjectName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Giáo viên:</span>
                <p className="font-medium">{classDetail.teacherName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Địa điểm:</span>
                <p className="font-medium">
                  {classDetail.isOnline ? (
                    <Badge className="bg-purple-100 text-purple-800">
                      Online
                    </Badge>
                  ) : (
                    classDetail.room || "Chưa có phòng"
                  )}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Số học viên:</span>
                <p className="font-medium">{classDetail.studentCount}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Thời gian:</span>
                <p className="font-medium">
                  {classDetail.startTime} - {classDetail.endTime}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Ngày học:</span>
                <p className="font-medium">{classDetail.dayName}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Danh sách học viên</h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">
                Tổng:{" "}
                <span className="font-bold">{attendanceDetails.length}</span>
              </span>
              <span className="text-green-600">
                {attendanceDetails.filter((a) => a.status === "present").length}{" "}
                có mặt
              </span>
              <span className="text-red-600">
                {attendanceDetails.filter((a) => a.status === "absent").length}{" "}
                vắng
              </span>
              <span className="text-yellow-600">
                {attendanceDetails.filter((a) => a.status === "late").length}{" "}
                muộn
              </span>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">STT</TableHead>
                <TableHead>Học viên</TableHead>
                <TableHead className="w-48">Trạng thái</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceDetails.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">
                    Chưa có học viên nào trong lớp
                  </TableCell>
                </TableRow>
              ) : (
                attendanceDetails.map((record, index) => (
                  <TableRow key={record.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {record.student}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {record.note || ""}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminClassDetail;
