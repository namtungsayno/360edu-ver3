// src/pages/teacher/TeacherCourseDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import {
  BookOpen,
  Layers,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
  User,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import {
  DetailPageWrapper,
  DetailHeader,
  DetailSection,
  DetailHighlightCard,
  DetailStatusBanner,
  DetailLoading,
  DetailError,
} from "../../../components/common/DetailPageLayout";

import { courseService } from "../../../services/course/course.service.js";
import { useToast } from "../../../hooks/use-toast.js";

function getStatusConfig(status) {
  const normalized = String(status || "").toUpperCase();

  switch (normalized) {
    case "APPROVED":
      return {
        label: "Đang hoạt động",
        className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        icon: CheckCircle2,
        type: "success",
      };
    case "DRAFT":
      return {
        label: "Nháp",
        className: "bg-gray-50 text-gray-600 border border-gray-200",
        icon: Edit,
        type: "info",
      };
    case "ARCHIVED":
      return {
        label: "Đã lưu trữ",
        className: "bg-gray-50 text-gray-600 border border-gray-200",
        icon: AlertCircle,
        type: "info",
      };
    default:
      return {
        label: "Đang hoạt động",
        className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        icon: CheckCircle2,
        type: "success",
      };
  }
}

export default function TeacherCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { error } = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState({});

  useEffect(() => {
    loadCourseDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadCourseDetail() {
    try {
      setLoading(true);
      const data = await courseService.getCourseDetail(id);
      setCourse(data);

      // Mở tất cả chapters mặc định
      if (data.chapters) {
        const expanded = {};
        data.chapters.forEach((ch) => {
          expanded[ch.id] = true;
        });
        setExpandedChapters(expanded);
      }
    } catch (e) {
      console.error("Load course detail error:", e);
      error("Không thể tải thông tin khóa học");
    } finally {
      setLoading(false);
    }
  }

  function toggleChapter(chapterId) {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  }

  if (loading) {
    return <DetailLoading message="Đang tải thông tin khóa học..." />;
  }

  if (!course) {
    return (
      <DetailError
        message="Không tìm thấy khóa học"
        onBack={() => navigate("/home/teacher/courses")}
      />
    );
  }

  const statusConfig = getStatusConfig(course.status);
  const StatusIcon = statusConfig.icon;

  const totalLessons = course.chapters
    ? course.chapters.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0)
    : 0;

  const displayTitle = String(course.title || "");

  return (
    <DetailPageWrapper>
      {/* Header */}
      <DetailHeader
        title={displayTitle || "Chi tiết khóa học"}
        subtitle={course.subjectName || "Chưa có môn học"}
        onBack={() => navigate("/home/teacher/courses")}
        status={{
          label: statusConfig.label,
          className: statusConfig.className,
          icon: StatusIcon,
        }}
        actions={
          <Button
            onClick={() => navigate(`/home/teacher/courses/${id}/edit`)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DetailHighlightCard
          icon={Layers}
          label="Số chương"
          value={course.chapters?.length || 0}
          colorScheme="blue"
        />
        <DetailHighlightCard
          icon={FileText}
          label="Số bài học"
          value={totalLessons}
          colorScheme="purple"
        />
        <DetailHighlightCard
          icon={User}
          label="Giáo viên"
          value={course.ownerTeacherName || course.createdByName || "—"}
          colorScheme="green"
        />
      </div>

      {/* Description */}
      {course.description && (
        <DetailSection title="Mô tả khóa học" icon={FileText}>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {course.description}
          </p>
        </DetailSection>
      )}

      {/* Chapters & Lessons */}
      <DetailSection
        title="Nội dung khóa học"
        icon={BookOpen}
        description={`${
          course.chapters?.length || 0
        } chương • ${totalLessons} bài học`}
      >
        {!course.chapters || course.chapters.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Khóa học chưa có nội dung</p>
            <p className="text-sm mt-1">
              Hãy thêm chương và bài học cho khóa học
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {course.chapters.map((chapter, chapterIndex) => {
              const isExpanded = expandedChapters[chapter.id];
              const lessonCount = chapter.lessons?.length || 0;

              return (
                <div
                  key={chapter.id}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  {/* Chapter Header */}
                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-600">
                          {chapterIndex + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {chapter.title}
                        </h4>
                        {chapter.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {chapter.description}
                          </p>
                        )}
                      </div>
                      <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                        {lessonCount} bài học
                      </Badge>
                    </div>
                    <div className="ml-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Lessons */}
                  {isExpanded && lessonCount > 0 && (
                    <div className="bg-white divide-y divide-gray-100">
                      {chapter.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-purple-600">
                              {lessonIndex + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {lesson.title}
                            </p>
                            {lesson.description && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                          <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}

                  {isExpanded && lessonCount === 0 && (
                    <div className="p-4 bg-white text-center text-sm text-gray-500">
                      Chương này chưa có bài học
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DetailSection>
    </DetailPageWrapper>
  );
}
