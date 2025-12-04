// src/pages/admin/course/AdminCourseDetail.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/Card.jsx";

import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Textarea } from "../../../components/ui/Textarea.jsx";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "../../../components/ui/Dialog.jsx";

import {
  BookOpen,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  User,
  Mail,
  Layers,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  EyeOff,
} from "lucide-react";

import { courseService } from "../../../services/course/course.service.js";
import { classService } from "../../../services/class/class.service.js";
import { useToast } from "../../../hooks/use-toast.js";

// =========================
// STATUS CONFIG
// =========================
function getStatusConfig(status) {
  const st = String(status).toUpperCase();

  switch (st) {
    case "APPROVED":
      return {
        label: "Đã phê duyệt",
        className: "bg-green-50 border border-green-200 text-green-700",
        icon: CheckCircle2,
      };
    case "PENDING":
      return {
        label: "Chờ phê duyệt",
        className: "bg-yellow-50 border border-yellow-200 text-yellow-700",
        icon: Clock,
      };
    case "REJECTED":
      return {
        label: "Đã từ chối",
        className: "bg-red-50 border border-red-200 text-red-700",
        icon: XCircle,
      };
    case "DRAFT":
      return {
        label: "Nháp",
        className: "bg-gray-100 border border-gray-300 text-gray-600",
        icon: FileText,
      };
    default:
      return {
        label: "Không xác định",
        className: "bg-gray-100 border border-gray-200 text-gray-600",
        icon: FileText,
      };
  }
}

export default function AdminCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminTitle, setAdminTitle] = useState(null);
  const [className, setClassName] = useState(null);

  // reject dialog
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  // load course
  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const data = await courseService.getCourseDetail(id);
        console.log("📚 Course Detail Loaded:", data);
        if (!ignore) setCourse(data);
        // Enrich title parts
        try {
          const desc = String(data?.description || "");
          const sm = desc.match(/\[\[SOURCE:([^\]]+)\]\]/);
          if (sm && sm[1]) {
            const sid = sm[1].trim();
            if (sid) {
              const src = await courseService.getCourseDetail(sid);
              if (src?.title) setAdminTitle(src.title);
            }
          }
        } catch (e) {
          console.warn("[AdminCourseDetail] fetch SOURCE title failed:", e);
        }

        try {
          const classId = data?.classId || data?.clazzId || data?.classID;
          if (classId) {
            const cls = await classService.getById(classId);
            if (cls?.name) setClassName(cls.name);
          } else if (id) {
            // Fallback: find by courseId
            const list = await classService.list({ courseId: id });
            if (Array.isArray(list) && list.length > 0) {
              const first = list[0];
              if (first?.name) setClassName(first.name);
            }
          }
        } catch (e) {
          console.warn("[AdminCourseDetail] fetch class name failed:", e);
        }
      } catch (e) {
        console.error("❌ Error loading course:", e);
        error("Không tải được thông tin khóa học");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();

    return () => (ignore = true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-lg text-neutral-600">
        Đang tải thông tin khóa học...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8 text-lg text-red-600">Không tìm thấy khóa học.</div>
    );
  }

  const statusCfg = getStatusConfig(course.status);
  const StatusIcon = statusCfg.icon;

  // Compose display title
  const rawTitle = String(course.title || "");
  const idx = rawTitle.indexOf(" - ");
  const sliced = idx > -1 ? rawTitle.slice(0, idx) : rawTitle;
  const displayTitle = className
    ? `${adminTitle || sliced} - ${className}`
    : adminTitle || sliced;

  const handleApprove = async () => {
    try {
      await courseService.approveCourse(course.id);
      success("Đã phê duyệt khoá học!");

      setCourse((prev) => ({ ...prev, status: "APPROVED" }));
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      error("Không thể phê duyệt khóa học");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      error("Bạn phải nhập lý do từ chối!");
      return;
    }

    setRejecting(true);
    try {
      await courseService.rejectCourse(course.id);

      success("Đã gửi từ chối khóa học");
      setCourse((prev) => ({
        ...prev,
        status: "REJECTED",
        rejectionReason: rejectReason,
      }));

      setRejectOpen(false);
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      error("Không thể từ chối khóa học");
    } finally {
      setRejecting(false);
    }
  };

  const handleHide = () => {
    // CHƯA CÓ BE, DEMO FE
    setCourse((prev) => ({ ...prev, status: "ARCHIVED" }));
    success("Đã ẩn khóa học (demo)");
  };

  // ======================
  // RENDER
  // ======================

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-950">
            Chi tiết khóa học
          </h1>
          <p className="text-base text-neutral-600 mt-2">
            Xem thông tin đầy đủ về khóa học và phê duyệt nội dung.
          </p>
        </div>

        <div className="flex gap-3">
          {/* back */}
          <Button
            variant="outline"
            className="h-12 px-6 rounded-xl text-base"
            onClick={() => navigate(-1)}
          >
            ← Quay lại
          </Button>

          {/* actions based on status */}
          {course.status === "PENDING" && (
            <>
              <Button
                className="h-12 px-6 rounded-xl bg-green-600 text-white text-base hover:bg-green-700"
                onClick={handleApprove}
              >
                ✔ Phê duyệt
              </Button>
              <Button
                className="h-12 px-6 rounded-xl bg-red-600 text-white text-base hover:bg-red-700"
                onClick={() => setRejectOpen(true)}
              >
                ✖ Từ chối
              </Button>
            </>
          )}

          {course.status === "APPROVED" && (
            <Button
              variant="outline"
              className="h-12 px-6 rounded-xl text-base"
              onClick={handleHide}
            >
              <EyeOff className="w-5 h-5" /> Ẩn khóa học
            </Button>
          )}
        </div>
      </div>

      {/* STATUS */}
      <Badge
        className={`${statusCfg.className} px-4 py-2 text-sm rounded-full`}
      >
        <StatusIcon className="w-4 h-4 inline-block mr-1" />
        {statusCfg.label}
      </Badge>

      {/* MAIN INFO */}
      <Card className="rounded-2xl border-2">
        <CardHeader>
          <CardTitle className="text-2xl">{displayTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white">
              <BookOpen className="w-8 h-8" />
            </div>

            <div className="flex-1 space-y-3">
              <p className="text-base text-neutral-700">
                {course.description || "Chưa có mô tả"}
              </p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">Môn học:</span>
                  <span className="font-semibold text-neutral-900">
                    {course.subjectName || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">Người tạo:</span>
                  <span className="font-semibold text-neutral-900">
                    {course.createdByName || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">ID:</span>
                  <span className="font-mono text-blue-600">{course.id}</span>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="flex gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span className="text-neutral-600">
                    {course.chapters?.length || 0} chương
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="text-neutral-600">
                    {course.chapters?.reduce(
                      (sum, ch) => sum + (ch.lessons?.length || 0),
                      0
                    ) || 0}{" "}
                    bài học
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* teacher info */}
          <div className="bg-indigo-50 rounded-2xl p-5 space-y-2 border border-indigo-100">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-700" />
              </div>
              <div>
                <p className="text-sm text-indigo-700">Giảng viên phụ trách</p>
                <p className="text-lg font-semibold text-indigo-900">
                  {course.ownerTeacherName || course.createdByName}
                </p>
              </div>
            </div>

            {course.teacherEmail && (
              <div className="flex items-center gap-2 text-sm text-indigo-800">
                <Mail className="w-4 h-4" />
                {course.teacherEmail}
              </div>
            )}
          </div>

          {/* timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <Timeline label="Ngày tạo" value={course.createdAt} />
            <Timeline label="Ngày gửi duyệt" value={course.submittedAt} />
            <Timeline label="Ngày duyệt" value={course.reviewedAt} />
          </div>

          {course.status === "REJECTED" && course.rejectionReason && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
              <p className="text-red-900 font-semibold mb-1">Lý do từ chối:</p>
              <p className="text-red-800 text-sm whitespace-pre-line">
                {course.rejectionReason}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CHAPTERS + LESSONS */}
      <Card className="rounded-2xl border-2">
        <CardHeader>
          <CardTitle className="text-xl">Nội dung khóa học</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            {course.chapters?.length || 0} chương ·{" "}
            {course.chapters?.reduce(
              (sum, ch) => sum + (ch.lessons?.length || 0),
              0
            ) || 0}{" "}
            bài học
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {(!course.chapters || course.chapters.length === 0) && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Khóa học chưa có nội dung</p>
            </div>
          )}

          {course.chapters && course.chapters.length > 0 && (
            <div className="space-y-3">
              {course.chapters.map((ch, idx) => (
                <ChapterItem key={ch.id} chapter={ch} index={idx + 1} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* REJECT MODAL */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader className="flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Từ chối khóa học</DialogTitle>
          </DialogHeader>

          <div className="mt-3 space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl text-sm flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-700" />
              Giáo viên sẽ nhận thông báo với lý do từ chối. Hãy ghi rõ ràng và
              mang tính góp ý.
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Lý do từ chối <span className="text-red-600">*</span>
              </label>
              <Textarea
                rows={6}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Chương 2 chưa đủ nội dung, cần bổ sung thêm ví dụ..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setRejectOpen(false)}>
                Hủy
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleReject}
                disabled={rejecting}
              >
                {rejecting ? "Đang gửi..." : "Gửi từ chối"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===========================
// SMALL COMPONENTS
// ===========================

function Timeline({ label, value }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-neutral-600">{label}</p>
      <p className="text-base font-medium">{value || "—"}</p>
    </div>
  );
}

function ChapterItem({ chapter, index }) {
  const [open, setOpen] = useState(true);
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
                {chapter.description}
              </p>
            )}
          </div>
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            {lessonCount} bài học
          </Badge>
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
                        {lesson.description}
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
