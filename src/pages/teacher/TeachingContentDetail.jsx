// src/pages/teacher/TeachingContentDetail.jsx
// content gốc của admin không thể chỉnh sửa.
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, Layers, FileText, Loader2 } from "lucide-react";

import { Card, CardContent } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { useToast } from "../../hooks/use-toast.js";
import { courseService } from "../../services/course/course.service.js";

export default function TeachingContentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { error } = useToast();

  const [loading, setLoading] = useState(true);
  // No async clone here; we just navigate to edit under content
  const [course, setCourse] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourseDetail(id);
        if (!ignore) setCourse(data || null);
      } catch (e) {
        console.error("Failed to load course detail", e);
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
      <div className="max-w-6xl mx-auto p-8">
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
      <div className="max-w-6xl mx-auto p-8">
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
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-950">
            {course.title}
          </h1>
          <p className="text-[12px] text-[#62748e]">
            {course.subjectName || ""}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </div>
      </div>

      {/* Summary */}
      <Card className="rounded-xl border border-gray-200">
        <CardContent className="p-5">
          {course.description && (
            <p className="text-sm text-[#45556c] mb-4">{course.description}</p>
          )}
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
          <CardContent className="p-5 space-y-4">
            {course.chapters.map((ch, idx) => (
              <div
                key={ch.id || idx}
                className="border border-gray-200 rounded-lg p-4"
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
                    {ch.description}
                  </p>
                )}
                {Array.isArray(ch.lessons) && ch.lessons.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {ch.lessons.map((ls, j) => (
                      <div
                        key={ls.id || j}
                        className="border border-gray-200 rounded-md p-3"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded bg-purple-50 flex items-center justify-center">
                            <FileText className="w-3 h-3 text-purple-600" />
                          </div>
                          <span className="text-sm font-medium text-neutral-950">
                            {ls.title}
                          </span>
                        </div>
                        {ls.description && (
                          <p className="text-[12px] text-[#45556c] whitespace-pre-line">
                            {ls.description}
                          </p>
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
