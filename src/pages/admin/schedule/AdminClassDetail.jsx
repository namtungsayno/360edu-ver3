import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
import {
  ExternalLink,
  Users,
  BookOpen,
  User,
  MapPin,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  Video,
} from "lucide-react";
import {
  DetailPageWrapper,
  DetailHeader,
  DetailSection,
  DetailFieldGrid,
  DetailField,
  DetailHighlightCard,
  DetailLoading,
  DetailError,
} from "../../../components/common/DetailPageLayout";
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
      setError("Class ID không hợp lệ");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const date =
          location.state?.date || new Date().toISOString().split("T")[0];
        const slotId = location.state?.slotId;

        // Load attendance
        const attendance = await attendanceService.getByClassForAdmin(
          classId,
          date,
          slotId
        );
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
            viewDate: date,
          });
        }
      } catch (e) {
        console.error("Failed to load class details:", e);
        if (e?.response?.status === 404) {
          setError(
            e.response.data?.message ||
              "Không có buổi học nào cho lớp này vào ngày đã chọn."
          );
        } else {
          setError("Không thể tải thông tin lớp học");
        }
        toast.error("Không thể tải thông tin lớp học");
      } finally {
        setLoading(false);
      }
    })();
  }, [classId, location.state]);

  // Thống kê điểm danh
  const stats = {
    total: attendanceDetails.length,
    present: attendanceDetails.filter((a) => a.status === "present").length,
    absent: attendanceDetails.filter((a) => a.status === "absent").length,
    late: attendanceDetails.filter((a) => a.status === "late").length,
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "present":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Có mặt
          </Badge>
        );
      case "absent":
        return (
          <Badge className="bg-red-100 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Vắng
          </Badge>
        );
      case "late":
        return (
          <Badge className="bg-amber-100 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            Muộn
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-600 border border-gray-200">
            Chưa điểm danh
          </Badge>
        );
    }
  };

  if (loading) {
    return <DetailLoading message="Đang tải thông tin lớp học..." />;
  }

  if (error) {
    return (
      <DetailError
        message={error}
        onBack={() => navigate(-1)}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!classDetail) {
    return (
      <DetailError
        message="Không tìm thấy thông tin lớp học"
        onBack={() => navigate(-1)}
      />
    );
  }

  return (
    <DetailPageWrapper>
      {/* Header */}
      <DetailHeader
        title={`Chi tiết lớp ${classDetail.className}`}
        subtitle={`${classDetail.subjectName} • ${classDetail.teacherName}`}
        onBack={() => navigate(-1)}
        actions={
          classDetail.meetLink && (
            <Button
              onClick={() => window.open(classDetail.meetLink, "_blank")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Video className="w-4 h-4 mr-2" />
              Vào lớp học
            </Button>
          )
        }
      />

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DetailHighlightCard
          icon={Users}
          label="Tổng học viên"
          value={stats.total}
          colorScheme="blue"
        />
        <DetailHighlightCard
          icon={CheckCircle}
          label="Có mặt"
          value={stats.present}
          colorScheme="green"
        />
        <DetailHighlightCard
          icon={XCircle}
          label="Vắng"
          value={stats.absent}
          colorScheme="red"
        />
        <DetailHighlightCard
          icon={Clock}
          label="Muộn"
          value={stats.late}
          colorScheme="orange"
        />
      </div>

      {/* Thông tin lớp học */}
      <DetailSection title="Thông tin lớp học" icon={BookOpen}>
        <DetailFieldGrid cols={3}>
          <DetailField
            icon={BookOpen}
            label="Môn học"
            value={classDetail.subjectName}
          />
          <DetailField
            icon={User}
            label="Giáo viên"
            value={classDetail.teacherName}
          />
          <DetailField
            icon={MapPin}
            label="Địa điểm"
            value={
              classDetail.isOnline ? (
                <Badge className="bg-purple-100 text-purple-700">Online</Badge>
              ) : (
                classDetail.room || "Chưa có phòng"
              )
            }
          />
          <DetailField
            icon={Clock}
            label="Thời gian"
            value={`${classDetail.startTime} - ${classDetail.endTime}`}
          />
          <DetailField
            icon={Calendar}
            label="Ngày học"
            value={classDetail.dayName}
          />
          <DetailField
            icon={Users}
            label="Số học viên"
            value={`${classDetail.studentCount} học viên`}
          />
        </DetailFieldGrid>

        {classDetail.meetLink && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-600 font-medium mb-1">
              Link học Online
            </p>
            <a
              href={classDetail.meetLink}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-700 hover:underline flex items-center gap-1"
            >
              {classDetail.meetLink}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </DetailSection>

      {/* Danh sách học viên */}
      <DetailSection
        title="Danh sách học viên"
        icon={Users}
        description={`Tổng ${stats.total} học viên • ${stats.present} có mặt • ${stats.absent} vắng • ${stats.late} muộn`}
      >
        {attendanceDetails.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Chưa có học viên nào trong lớp</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-16 text-center font-semibold">
                    STT
                  </TableHead>
                  <TableHead className="font-semibold">Học viên</TableHead>
                  <TableHead className="w-40 font-semibold">
                    Trạng thái
                  </TableHead>
                  <TableHead className="font-semibold">Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceDetails.map((record, index) => (
                  <TableRow
                    key={record.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="text-center text-gray-500">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {record.student}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {record.note || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DetailSection>
    </DetailPageWrapper>
  );
}

export default AdminClassDetail;
