import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
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
} from "lucide-react";

/**
 * Trang chi tiết lớp học (Admin)
 * - Hiển thị toàn bộ thông tin lớp (online/offline)
 * - Cho phép Publish / Revert Draft
 * - Điều hướng tới trang sửa (edit) – sẽ triển khai sau
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
      return { label: "Chưa bắt đầu", color: "sky", icon: PauseCircle };
    }
    if (sd && ed && sd <= today && today <= ed) {
      return { label: "Đang diễn ra", color: "emerald", icon: PlayCircle };
    }
    if (ed && ed < today) {
      return { label: "Đã kết thúc", color: "gray", icon: CheckCircle };
    }
    return null;
  }

  // Hỗ trợ các tên trường thay thế từ backend (nếu khác biệt)
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

  const timeStatus = cls ? getTimeStatus(cls) : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Chi tiết lớp học
          </h1>
          <p className="text-gray-500 text-sm">
            Xem và quản lý thông tin lớp học
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
          {cls && (
            <Button
              variant="outline"
              onClick={() => navigate(`/home/admin/class/${cls.id}/edit`)}
            >
              Sửa
            </Button>
          )}
          {cls && cls.status === "DRAFT" && (
            <Button
              onClick={handlePublish}
              disabled={updatingStatus}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {updatingStatus ? "Đang cập nhật..." : "Publish"}
            </Button>
          )}
          {cls && cls.status === "PUBLIC" && (
            <Button
              variant="outline"
              onClick={handleRevertDraft}
              disabled={updatingStatus}
            >
              {updatingStatus ? "Đang cập nhật..." : "Revert Draft"}
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      {loading && <div className="text-sm text-gray-500">Đang tải...</div>}
      {error && !loading && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && !cls && (
        <div className="text-sm text-gray-500">Không tìm thấy lớp học.</div>
      )}

      {cls && (
        <div className="space-y-6">
          {/* ═══════════════════════════════════════════════════════════════════
              CARD 1: THÔNG TIN CHÍNH & TRẠNG THÁI
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            {/* Header với tên lớp */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{cls.name}</h2>
                  <p className="text-blue-100 text-sm mt-1 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {cls.subjectName || "Chưa gán môn học"}
                  </p>
                </div>
              </div>
            </div>

            {/* Các badge trạng thái - với label rõ ràng */}
            <div className="px-6 py-4 bg-gray-50 border-b">
              <div className="flex flex-wrap gap-4">
                {/* Trạng thái xuất bản */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">
                    Trạng thái:
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${
                      cls.status === "DRAFT"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : cls.status === "PUBLIC"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}
                  >
                    {cls.status === "DRAFT" ? (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        Bản nháp
                      </>
                    ) : cls.status === "PUBLIC" ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        Đã xuất bản
                      </>
                    ) : (
                      "Đã lưu trữ"
                    )}
                  </span>
                </div>

                {/* Trạng thái thời gian */}
                {timeStatus && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">
                      Tiến độ:
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-${timeStatus.color}-100 text-${timeStatus.color}-800 border border-${timeStatus.color}-200`}
                    >
                      <timeStatus.icon className="w-3.5 h-3.5" />
                      {timeStatus.label}
                    </span>
                  </div>
                )}

                {/* Hình thức học */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">
                    Hình thức:
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${
                      cls.online
                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                        : "bg-teal-100 text-teal-800 border border-teal-200"
                    }`}
                  >
                    {cls.online ? (
                      <>
                        <Video className="w-3.5 h-3.5" />
                        Học Online
                      </>
                    ) : (
                      <>
                        <Building className="w-3.5 h-3.5" />
                        Học Offline
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Thông tin chi tiết - Grid layout */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Giáo viên */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Giáo viên phụ trách
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      {cls.teacherFullName || "Chưa phân công"}
                    </p>
                  </div>
                </div>

                {/* Phòng học / Link học */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      cls.online ? "bg-purple-100" : "bg-teal-100"
                    }`}
                  >
                    {cls.online ? (
                      <Video className="w-5 h-5 text-purple-600" />
                    ) : (
                      <MapPin className="w-5 h-5 text-teal-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 font-medium">
                      {cls.online ? "Link học Online" : "Phòng học"}
                    </p>
                    {cls.online ? (
                      cls.meetingLink ? (
                        <a
                          href={cls.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1 mt-0.5 truncate"
                        >
                          <span className="truncate">{cls.meetingLink}</span>
                          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                        </a>
                      ) : (
                        <p className="text-sm text-gray-500 mt-0.5">
                          Chưa có link
                        </p>
                      )
                    ) : (
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">
                        {cls.roomName || "Chưa xếp phòng"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Thời gian học */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Thời gian khóa học
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      {cls.startDate && cls.endDate
                        ? `${cls.startDate} → ${cls.endDate}`
                        : cls.startDate || cls.endDate || "Chưa xác định"}
                    </p>
                  </div>
                </div>

                {/* Sĩ số */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Sĩ số tối đa
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      {cls.maxStudents != null
                        ? `${cls.currentStudents || 0}/${
                            cls.maxStudents
                          } học sinh`
                        : "Chưa giới hạn"}
                    </p>
                  </div>
                </div>

                {/* Tổng số buổi */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Tổng số buổi học
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      {totalSessionsValue != null
                        ? `${totalSessionsValue} buổi`
                        : "Chưa xác định"}
                    </p>
                  </div>
                </div>

                {/* Giá mỗi buổi */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Banknote className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Học phí / buổi
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      {priceValue != null
                        ? formatCurrency(priceValue)
                        : "Chưa xác định"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tổng học phí - Highlight */}
              {totalPrice != null && (
                <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
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
                          {totalSessionsValue} buổi ×{" "}
                          {formatCurrency(priceValue)}
                        </p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700">
                      {formatCurrency(totalPrice)}
                    </p>
                  </div>
                </div>
              )}

              {/* Mô tả */}
              {cls.description && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <p className="text-xs text-gray-500 font-medium">Mô tả</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {cls.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              CARD 2: LỊCH HỌC
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-700" />
              <h3 className="text-base font-semibold text-gray-900">
                Lịch học hàng tuần
              </h3>
            </div>
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
                Chưa thiết lập lịch học
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              CARD 3: HÀNH ĐỘNG
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Hành động quản lý
            </h3>
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
                Sửa thông tin
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
