// src/pages/admin/course/AdminCourseDetail.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import {
  BookOpen,
  CheckCircle2,
  FileText,
  User,
  Mail,
  Layers,
  ChevronDown,
  ChevronRight,
  EyeOff,
  Calendar,
  Clock,
} from "lucide-react";
import { courseService } from "../../../services/course/course.service.js";
import { classService } from "../../../services/class/class.service.js";
import { useToast } from "../../../hooks/use-toast.js";
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

// =========================
// STATUS CONFIG
// =========================
function getStatusConfig(status) {
  const st = String(status).toUpperCase();

  switch (st) {
    case "APPROVED":
      return {
        label: "Đang hoạt động",
        variant: "success",
        icon: CheckCircle2,
      };
    case "DRAFT":
      return {
        label: "Nháp",
        variant: "secondary",
        icon: FileText,
      };
    case "ARCHIVED":
      return {
        label: "Đã lưu trữ",
        variant: "secondary",
        icon: FileText,
      };
    default:
      return {
        label: "Đang hoạt động",
        variant: "success",
        icon: CheckCircle2,
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

  // load course
  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const data = await courseService.getCourseDetail(id);
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

  // Loading state
  if (loading) {
    return <DetailLoading message="Đang tải thông tin khóa học..." />;
  }

  // Error/Empty state
  if (!course) {
    return (
      <DetailError
        title="Không tìm thấy khóa học"
        message="Khóa học này không tồn tại hoặc đã bị xóa."
        onBack={() => navigate(-1)}
        backLabel="Quay lại"
      />
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

  const handleHide = () => {
    setCourse((prev) => ({ ...prev, status: "ARCHIVED" }));
    success("Đã lưu trữ khóa học");
  };

  // Stats data
  const chapterCount = course.chapters?.length || 0;
  const lessonCount =
    course.chapters?.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0) ||
    0;

  const statsData = [
    {
      icon: Layers,
      label: "Số chương",
      value: chapterCount,
      color: "blue",
    },
    {
      icon: FileText,
      label: "Số bài học",
      value: lessonCount,
      color: "purple",
    },
  ];

  // ======================
  // RENDER
  // ======================

  return (
    <DetailPageWrapper>
      {/* Header */}
      <DetailHeader
        title={displayTitle}
        subtitle="Xem thông tin đầy đủ về khóa học"
        onBack={() => navigate(-1)}
        icon={BookOpen}
        iconColor="blue"
        status={{
          label: statusCfg.label,
          variant: statusCfg.variant,
        }}
        actions={
          <div className="flex gap-3">
            {course.status !== "ARCHIVED" && (
              <Button variant="outline" onClick={handleHide}>
                <EyeOff className="w-4 h-4 mr-2" />
                Lưu trữ
              </Button>
            )}
          </div>
        }
      />

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
        <DetailHighlightCard
          icon={BookOpen}
          label="Môn học"
          value={course.subjectName || "—"}
          color="green"
        />
        <DetailHighlightCard
          icon={User}
          label="Người tạo"
          value={course.createdByName || "—"}
          color="orange"
        />
      </div>

      {/* Course Info */}
      <DetailSection title="Thông tin khóa học">
        <DetailFieldGrid columns={2}>
          <DetailField label="ID khóa học" value={course.id} />
          <DetailField label="Tên khóa học" value={displayTitle} />
          <DetailField label="Môn học" value={course.subjectName || "—"} />
          <DetailField
            label="Trạng thái"
            value={
              <Badge variant={statusCfg.variant}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusCfg.label}
              </Badge>
            }
          />
          <DetailField
            label="Mô tả"
            value={course.description || "Chưa có mô tả"}
            className="md:col-span-2"
            isHtml={true}
          />
        </DetailFieldGrid>
      </DetailSection>

      {/* Teacher Info */}
      <DetailSection title="Thông tin giảng viên">
        <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <User className="w-6 h-6 text-indigo-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-indigo-600">Giảng viên phụ trách</p>
              <p className="text-lg font-semibold text-indigo-900">
                {course.ownerTeacherName || course.createdByName || "—"}
              </p>
              {course.teacherEmail && (
                <div className="flex items-center gap-2 text-sm text-indigo-700 mt-1">
                  <Mail className="w-4 h-4" />
                  {course.teacherEmail}
                </div>
              )}
            </div>
          </div>
        </div>
      </DetailSection>

      {/* Timeline */}
      <DetailSection title="Lịch sử">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Calendar className="w-4 h-4" />
              Ngày tạo
            </div>
            <p className="font-medium text-gray-900">
              {course.createdAt || "—"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Clock className="w-4 h-4" />
              Ngày gửi duyệt
            </div>
            <p className="font-medium text-gray-900">
              {course.submittedAt || "—"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              Ngày duyệt
            </div>
            <p className="font-medium text-gray-900">
              {course.reviewedAt || "—"}
            </p>
          </div>
        </div>
      </DetailSection>

      {/* Chapters + Lessons */}
      <DetailSection
        title="Nội dung khóa học"
        subtitle={`${chapterCount} chương · ${lessonCount} bài học`}
      >
        {chapterCount === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Khóa học chưa có nội dung</p>
          </div>
        ) : (
          <div className="space-y-3">
            {course.chapters.map((ch, idx) => (
              <ChapterItem key={ch.id} chapter={ch} index={idx + 1} />
            ))}
          </div>
        )}
      </DetailSection>
    </DetailPageWrapper>
  );
}

// ===========================
// CHAPTER ITEM COMPONENT
// ===========================

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
