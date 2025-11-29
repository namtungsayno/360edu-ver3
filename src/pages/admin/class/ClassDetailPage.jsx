import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { classService } from "../../../services/class/class.service";
import { dayLabelVi } from "../../../helper/formatters";

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

  function derivedRuntimeStatus(c) {
    const today = new Date();
    const sd = c?.startDate ? new Date(c.startDate) : null;
    const ed = c?.endDate ? new Date(c.endDate) : null;
    if (sd && sd > today)
      return { label: "Sắp mở", style: "bg-sky-100 text-sky-700" };
    if (sd && ed && sd <= today && today <= ed)
      return { label: "Đang diễn ra", style: "bg-violet-100 text-violet-700" };
    return null;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Chi tiết lớp học
          </h1>
          <p className="text-gray-500">Xem và quản lý thông tin lớp học</p>
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
          {/* Summary Card */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {cls.name}
                </h2>
                <p className="text-sm text-gray-600">{cls.subjectName}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {cls.status && (
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      cls.status === "DRAFT"
                        ? "bg-amber-200 text-amber-900"
                        : cls.status === "PUBLIC"
                        ? "bg-emerald-200 text-emerald-900"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {cls.status === "DRAFT"
                      ? "Draft"
                      : cls.status === "PUBLIC"
                      ? "Public"
                      : "Archived"}
                  </span>
                )}
                {(() => {
                  const d = derivedRuntimeStatus(cls);
                  return d ? (
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${d.style}`}
                    >
                      {d.label}
                    </span>
                  ) : null;
                })()}
                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    cls.online
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {cls.online ? "Online" : "Offline"}
                </span>
              </div>
            </div>
            <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-medium">
                  Giáo viên
                </div>
                <div className="font-semibold text-gray-800">
                  {cls.teacherFullName || "-"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-medium">
                  Loại lớp
                </div>
                <div className="font-semibold text-gray-800">
                  {cls.online ? "Học Online" : "Học tại trung tâm"}
                </div>
              </div>
              {cls.online ? (
                <div className="space-y-1 md:col-span-2">
                  <div className="text-xs text-gray-500 font-medium">
                    Link học
                  </div>
                  {cls.meetingLink ? (
                    <a
                      href={cls.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-blue-600 hover:underline break-all"
                    >
                      {cls.meetingLink}
                    </a>
                  ) : (
                    <div className="text-gray-600">Chưa có link</div>
                  )}
                </div>
              ) : (
                <div className="space-y-1 md:col-span-2">
                  <div className="text-xs text-gray-500 font-medium">
                    Phòng học
                  </div>
                  <div className="font-semibold text-gray-800">
                    {cls.roomName || "-"}
                  </div>
                </div>
              )}
              {(cls.startDate || cls.endDate) && (
                <div className="space-y-1 md:col-span-2">
                  <div className="text-xs text-gray-500 font-medium">
                    Thời gian
                  </div>
                  <div className="font-semibold text-gray-800">
                    {cls.startDate && cls.endDate
                      ? `${cls.startDate} → ${cls.endDate}`
                      : cls.startDate || cls.endDate}
                  </div>
                </div>
              )}
              {typeof cls.maxStudents === "number" && (
                <div className="space-y-1 md:col-span-2">
                  <div className="text-xs text-gray-500 font-medium">
                    Sĩ số tối đa
                  </div>
                  <div className="font-semibold text-gray-800">
                    {cls.maxStudents} học sinh
                  </div>
                </div>
              )}
              {cls.totalSessions && (
                <div className="space-y-1 md:col-span-2">
                  <div className="text-xs text-gray-500 font-medium">
                    Tổng số buổi
                  </div>
                  <div className="font-semibold text-gray-800">
                    {cls.totalSessions} buổi
                  </div>
                </div>
              )}
              {cls.description && (
                <div className="space-y-1 md:col-span-2">
                  <div className="text-xs text-gray-500 font-medium">Mô tả</div>
                  <div className="text-gray-700 whitespace-pre-line">
                    {cls.description}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Schedule */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Lịch học
            </h3>
            {Array.isArray(cls.schedule) && cls.schedule.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {cls.schedule.map((s, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 border text-xs text-gray-700"
                  >
                    {dayLabelVi(s.dayOfWeek)} • {s.startTime?.slice(0, 5)}-
                    {s.endTime?.slice(0, 5)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">Chưa có lịch học.</div>
            )}
          </div>

          {/* Future: Enrollment / Students list could be added here */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Hành động
            </h3>
            <p className="text-xs text-gray-500">
              Bạn có thể Publish lớp để học sinh nhìn thấy hoặc chuyển về Draft
              để chỉnh sửa thêm.
            </p>
            <div className="mt-3 flex gap-3">
              {cls.status === "DRAFT" && (
                <Button onClick={handlePublish} disabled={updatingStatus}>
                  {updatingStatus ? "Đang cập nhật..." : "Publish lớp"}
                </Button>
              )}
              {cls.status === "PUBLIC" && (
                <Button
                  variant="outline"
                  onClick={handleRevertDraft}
                  disabled={updatingStatus}
                >
                  {updatingStatus ? "Đang cập nhật..." : "Chuyển về Draft"}
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
