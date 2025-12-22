// src/pages/teacher/TeachingContentDetail.jsx
// content gốc của admin không thể chỉnh sửa.
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  Layers,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { useToast } from "../../../hooks/use-toast.js";
import { courseService } from "../../../services/course/course.service.js";
import { BackButton } from "../../../components/common/BackButton";
import { stripHtmlTags } from "../../../utils/html-helpers.js";
import LessonMaterialUpload from "../../../components/teacher/LessonMaterialUpload.jsx";

export default function TeachingContentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { error } = useToast();

  const [loading, setLoading] = useState(true);
  // No async clone here; we just navigate to edit under content
  const [course, setCourse] = useState(null);
  // State để track bài học nào đang mở rộng hiển thị tài liệu
  const [expandedLessons, setExpandedLessons] = useState({});

  // Toggle mở rộng/thu gọn tài liệu của bài học
  const toggleLessonExpand = (lessonId) => {
    setExpandedLessons((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourseDetail(id);
        if (!ignore) setCourse(data || null);
      } catch (e) {
        if (!ignore) error("Không thể tải chi tiết khóa học");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [id, error]);

  const chapterCount = useMemo(() => {
    if (!course) return 0;
    return (
      course.chapterCount ?? (course.chapters ? course.chapters.length : 0)
    );
  }, [course]);

  const lessonCount = useMemo(() => {
    if (!course) return 0;
    if (course.lessonCount != null) return course.lessonCount;
    if (!course.chapters) return 0;
    return course.chapters.reduce(
      (sum, ch) => sum + (ch.lessons?.length || 0),
      0
    );
  }, [course]);

  if (loading) {
    return (
      <div className="p-6">
        <Card className="rounded-xl border border-gray-200">
          <CardContent className="p-6 text-[#62748e]">
            Đang tải chi tiết...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6">
        <Card className="rounded-xl border border-dashed border-gray-300 bg-gray-50">
          <CardContent className="p-10 text-center">
            <div className="w-16 h-16 rounded-full border border-gray-300 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 text-[#62748e]" />
            </div>
            <p className="text-sm font-semibold text-neutral-950 mb-1">
              Không tìm thấy khóa học
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton onClick={() => navigate(-1)} showLabel={false} />
          <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-200">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-sm text-gray-500">{course.subjectName || ""}</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <Card className="rounded-xl border border-gray-200">
        <CardContent className="p-5 pt-6">
          {(() => {
            const cleanDesc = (course.description || "").replace(/\n?\[\[SOURCE:[^\]]+\]\]/g, "").trim();
            return cleanDesc ? (
              <div
                className="text-sm text-[#45556c] mb-4 rich-text-content pt-1"
                dangerouslySetInnerHTML={{ __html: cleanDesc }}
              />
            ) : null;
          })()}
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Layers className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-[#62748e]">Số chương</p>
                <p className="text-sm font-semibold text-neutral-950">
                  {chapterCount}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-[#62748e]">Số bài học</p>
                <p className="text-sm font-semibold text-neutral-950">
                  {lessonCount}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outline (simple) */}
      {Array.isArray(course.chapters) && course.chapters.length > 0 && (
        <Card className="rounded-xl border border-gray-200">
          <CardContent className="p-5 pt-6 space-y-4">
            {course.chapters.map((ch, idx) => (
              <div
                key={ch.id || idx}
                className="border border-gray-200 rounded-lg p-4 pt-5"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-950">
                    {ch.title}
                  </p>
                </div>
                {ch.description && (
                  <p className="text-[12px] text-[#45556c] mb-2">
                    {stripHtmlTags(ch.description)}
                  </p>
                )}
                {Array.isArray(ch.lessons) && ch.lessons.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {ch.lessons.map((ls, j) => (
                      <div
                        key={ls.id || j}
                        className="border border-gray-200 rounded-md overflow-hidden"
                      >
                        {/* Lesson Header - Click để mở rộng */}
                        <div
                          className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleLessonExpand(ls.id)}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-6 h-6 rounded bg-purple-50 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-3 h-3 text-purple-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-sm font-medium text-neutral-950 block truncate">
                                {ls.title}
                              </span>
                              {ls.description && (
                                <p className="text-[12px] text-[#45556c] truncate">
                                  {stripHtmlTags(ls.description)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            <span className="text-xs text-gray-400">
                              {expandedLessons[ls.id]
                                ? "Thu gọn"
                                : "Xem tài liệu"}
                            </span>
                            {expandedLessons[ls.id] ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Lesson Materials - Hiển thị khi mở rộng */}
                        {expandedLessons[ls.id] && (
                          <div className="border-t border-gray-200 p-3 bg-gray-50/50">
                            <LessonMaterialUpload
                              lessonId={ls.id}
                              lessonTitle={ls.title}
                              readOnly={true}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
