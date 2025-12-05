import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { classService } from "../../../services/class/class.service";
import { dayLabelVi, formatCurrency } from "../../../helper/formatters";
import {
  User,
  MapPin,
  Calendar,
  Clock,
  Users,
  Banknote,
  FileText,
  Video,
  Building,
  BookOpen,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Edit,
} from "lucide-react";
import {
  DetailPageWrapper,
  DetailHeader,
  DetailSection,
  DetailField,
  DetailFieldGrid,
  DetailHighlightCard,
  DetailLoading,
  DetailError,
  DetailEmpty,
} from "../../../components/common/DetailPageLayout";

/**
 * Trang chi tiết lớp học (Admin)
 */
export default function ClassDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadClass = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await classService.getById(id);
      setCls(data || null);
    } catch (e) {
      console.error(e);
      setError("Không tải được thông tin lớp học.");
      setCls(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadClass();
  }, [loadClass]);

  async function handlePublish() {
    if (!cls) return;
    setUpdatingStatus(true);
    try {
      await classService.publish(cls.id);
      await loadClass();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleRevertDraft() {
    if (!cls) return;
    setUpdatingStatus(true);
    try {
      await classService.revertDraft(cls.id);
      await loadClass();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingStatus(false);
    }
  }

  // Tính trạng thái thời gian của lớp học
  function getTimeStatus(c) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sd = c?.startDate ? new Date(c.startDate) : null;
    const ed = c?.endDate ? new Date(c.endDate) : null;
    if (sd) sd.setHours(0, 0, 0, 0);
    if (ed) ed.setHours(0, 0, 0, 0);

    if (sd && sd > today) {
      return { label: "Chưa bắt đầu", variant: "secondary", icon: PauseCircle };
    }
    if (sd && ed && sd <= today && today <= ed) {
      return { label: "Đang diễn ra", variant: "success", icon: PlayCircle };
    }
    if (ed && ed < today) {
      return { label: "Đã kết thúc", variant: "secondary", icon: CheckCircle };
    }
    return null;
  }

  // Hỗ trợ các tên trường thay thế từ backend
  const priceValue = (() => {
    const v =
      cls?.pricePerSession ??
      cls?.price ??
      cls?.sessionPrice ??
      cls?.price_per_session ??
      null;
    return v;
  })();

  const totalSessionsValue = (() => {
    const v =
      cls?.totalSessions ??
      cls?.numberOfSessions ??
      cls?.sessionCount ??
      cls?.total_sessions ??
      null;
    return v;
  })();

  const totalPrice =
    priceValue != null && totalSessionsValue != null
      ? Number(priceValue) * Number(totalSessionsValue)
      : null;

  // Loading state
  if (loading) {
    return <DetailLoading message="Đang tải thông tin lớp học..." />;
  }

  // Error state
  if (error) {
    return (
      <DetailError
        title="Không thể tải thông tin lớp học"
        message={error}
        onBack={() => navigate(-1)}
        backLabel="Quay lại"
      />
    );
  }

  // Empty state
  if (!cls) {
    return (
      <DetailEmpty
        title="Không tìm thấy lớp học"
        message="Lớp học này không tồn tại hoặc đã bị xóa."
        onAction={() => navigate(-1)}
        actionLabel="Quay lại"
      />
    );
  }

  const timeStatus = getTimeStatus(cls);

  // Get status info
  const getStatusInfo = () => {
    if (cls.status === "DRAFT") {
      return { label: "Bản nháp", variant: "warning", icon: AlertCircle };
    }
    if (cls.status === "PUBLIC") {
      return { label: "Đã xuất bản", variant: "success", icon: CheckCircle };
    }
    return { label: "Đã lưu trữ", variant: "secondary", icon: FileText };
  };

  const statusInfo = getStatusInfo();

  // Stats data
  const statsData = [
    {
      icon: Users,
      label: "Sĩ số",
      value:
        cls.maxStudents != null
          ? `${cls.currentStudents || 0}/${cls.maxStudents}`
          : "—",
      color: "pink",
    },
    {
      icon: Clock,
      label: "Tổng buổi",
      value: totalSessionsValue != null ? `${totalSessionsValue} buổi` : "—",
      color: "indigo",
    },
    {
      icon: Banknote,
      label: "Học phí/buổi",
      value: priceValue != null ? formatCurrency(priceValue) : "—",
      color: "green",
    },
    {
      icon: cls.online ? Video : Building,
      label: "Hình thức",
      value: cls.online ? "Online" : "Offline",
      color: cls.online ? "purple" : "teal",
    },
  ];

  return (
    <DetailPageWrapper>
      {/* Header */}
      <DetailHeader
        title={cls.name}
        subtitle={cls.subjectName || "Chưa gán môn học"}
        onBack={() => navigate(-1)}
        icon={BookOpen}
        iconColor="purple"
        status={{
          label: statusInfo.label,
          variant: statusInfo.variant,
        }}
        actions={
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/home/admin/class/${cls.id}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Sửa
            </Button>
            {cls.status === "DRAFT" && (
              <Button
                onClick={handlePublish}
                disabled={updatingStatus}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {updatingStatus ? "Đang xử lý..." : "Xuất bản"}
              </Button>
            )}
            {cls.status === "PUBLIC" && (
              <Button
                variant="outline"
                onClick={handleRevertDraft}
                disabled={updatingStatus}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                {updatingStatus ? "Đang xử lý..." : "Chuyển về nháp"}
              </Button>
            )}
          </div>
        }
      />

      {/* Status Badges */}
      <div className="flex flex-wrap gap-3">
        {timeStatus && (
          <Badge variant={timeStatus.variant} className="text-sm px-3 py-1">
            <timeStatus.icon className="w-4 h-4 mr-1" />
            Tiến độ: {timeStatus.label}
          </Badge>
        )}
        <Badge
          variant={cls.online ? "default" : "secondary"}
          className="text-sm px-3 py-1"
        >
          {cls.online ? (
            <>
              <Video className="w-4 h-4 mr-1" />
              Học Online
            </>
          ) : (
            <>
              <Building className="w-4 h-4 mr-1" />
              Học Offline
            </>
          )}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <DetailHighlightCard
            key={index}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            color={stat.color}
          />
        ))}
      </div>

      {/* Total Price Highlight */}
      {totalPrice != null && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Banknote className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-emerald-700 font-medium">
                  Tổng học phí cả khóa
                </p>
                <p className="text-xs text-emerald-600">
                  {totalSessionsValue} buổi × {formatCurrency(priceValue)}
                </p>
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-700">
              {formatCurrency(totalPrice)}
            </p>
          </div>
        </div>
      )}

      {/* Class Information */}
      <DetailSection title="Thông tin lớp học">
        <DetailFieldGrid columns={2}>
          <DetailField
            label="Giáo viên phụ trách"
            value={
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                {cls.teacherFullName || "Chưa phân công"}
              </div>
            }
          />
          <DetailField
            label={cls.online ? "Link học Online" : "Phòng học"}
            value={
              cls.online ? (
                cls.meetingLink ? (
                  <a
                    href={cls.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span className="truncate max-w-xs">{cls.meetingLink}</span>
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  </a>
                ) : (
                  "Chưa có link"
                )
              ) : (
                cls.roomName || "Chưa xếp phòng"
              )
            }
          />
          <DetailField
            label="Thời gian khóa học"
            value={
              cls.startDate && cls.endDate
                ? `${cls.startDate} → ${cls.endDate}`
                : cls.startDate || cls.endDate || "Chưa xác định"
            }
          />
          <DetailField label="Môn học" value={cls.subjectName || "Chưa gán"} />
        </DetailFieldGrid>
        {cls.description && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <p className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Mô tả
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {cls.description}
            </p>
          </div>
        )}
      </DetailSection>

      {/* Schedule */}
      <DetailSection title="Lịch học hàng tuần">
        {Array.isArray(cls.schedule) && cls.schedule.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {cls.schedule.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {dayLabelVi(s.dayOfWeek)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {s.startTime?.slice(0, 5)} - {s.endTime?.slice(0, 5)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 text-center">
            <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            Chưa thiết lập lịch học
          </div>
        )}
      </DetailSection>

      {/* Actions */}
      <DetailSection title="Hành động quản lý">
        <p className="text-sm text-gray-500 mb-4">
          {cls.status === "DRAFT"
            ? "Lớp học đang ở trạng thái Bản nháp. Xuất bản để học sinh có thể nhìn thấy và đăng ký."
            : "Lớp học đã được xuất bản. Bạn có thể chuyển về Bản nháp để chỉnh sửa thêm."}
        </p>
        <div className="flex flex-wrap gap-3">
          {cls.status === "DRAFT" && (
            <Button
              onClick={handlePublish}
              disabled={updatingStatus}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {updatingStatus ? "Đang xử lý..." : "Xuất bản lớp học"}
            </Button>
          )}
          {cls.status === "PUBLIC" && (
            <Button
              variant="outline"
              onClick={handleRevertDraft}
              disabled={updatingStatus}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              {updatingStatus ? "Đang xử lý..." : "Chuyển về Bản nháp"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate(`/home/admin/class/${cls.id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Sửa thông tin
          </Button>
        </div>
      </DetailSection>
    </DetailPageWrapper>
  );
}
