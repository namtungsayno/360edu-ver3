// src/pages/student/CourseDetail.jsx
// Trang xem chi tiết khóa học cho student đã đăng ký lớp
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import {
  ArrowLeft,
  BookOpen,
  Layers,
  FileText,
  User,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

import { courseService } from "../../services/course/course.service.js";
import { useToast } from "../../hooks/use-toast.js";

export default function StudentCourseDetail() {
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
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="rounded-[14px] p-6 text-center text-[#62748e]">
          Đang tải thông tin khóa học...
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="rounded-[14px] p-6 text-center">
          <p className="text-red-600 mb-4">Không tìm thấy khóa học</p>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </Card>
      </div>
    );
  }

  const totalLessons = course.chapters
    ? course.chapters.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0)
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-neutral-950">
            Nội dung khóa học
          </h1>
          <p className="text-[12px] text-[#62748e] mt-1">
            Xem chi tiết các chương và bài học
          </p>
        </div>
      </div>

      {/* COURSE INFO CARD */}
      <Card className="rounded-[14px] border border-gray-200">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-neutral-950 mb-1">
                {course.title}
              </CardTitle>
              <p className="text-[12px] text-[#62748e]">
                {course.subjectName || "Khóa học"}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Description */}
          {course.description && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-950 mb-2">
                Mô tả khóa học
              </h3>
              <p className="text-[13px] text-[#45556c] leading-relaxed">
                {course.description}
              </p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Layers className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] text-blue-600 font-medium">
                  Số chương
                </p>
                <p className="text-lg font-semibold text-neutral-950">
                  {course.chapters?.length || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-[11px] text-purple-600 font-medium">
                  Số bài học
                </p>
                <p className="text-lg font-semibold text-neutral-950">
                  {totalLessons}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-[11px] text-green-600 font-medium">
                  Giáo viên
                </p>
                <p className="text-sm font-semibold text-neutral-950">
                  {course.ownerTeacherName || course.createdByName || "—"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CHAPTERS & LESSONS */}
      <Card className="rounded-[14px] border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-neutral-950">
            Nội dung chi tiết
          </CardTitle>
          <p className="text-[12px] text-[#62748e] mt-1">
            Danh sách chương và bài học trong khóa học
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          {!course.chapters || course.chapters.length === 0 ? (
            <div className="text-center py-8 text-[#62748e] text-[13px]">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Khóa học chưa có nội dung</p>
            </div>
          ) : (
            <div className="space-y-3">
              {course.chapters.map((chapter, chapterIndex) => {
                const isExpanded = expandedChapters[chapter.id];
                const lessonCount = chapter.lessons?.length || 0;

                return (
                  <div
                    key={chapter.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Chapter Header */}
                    <div
                      className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => toggleChapter(chapter.id)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-blue-600">
                            {chapterIndex + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-neutral-950">
                            {chapter.title}
                          </h4>
                          {chapter.description && (
                            <p className="text-[12px] text-[#62748e] mt-0.5 line-clamp-1">
                              {chapter.description}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[11px] px-2 py-0.5"
                        >
                          {lessonCount} bài học
                        </Badge>
                      </div>
                      <div className="ml-3">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-[#62748e]" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-[#62748e]" />
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
                            <div className="w-7 h-7 rounded-md bg-purple-50 flex items-center justify-center flex-shrink-0">
                              <span className="text-[11px] font-medium text-purple-600">
                                {lessonIndex + 1}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-[13px] font-medium text-neutral-950">
                                {lesson.title}
                              </p>
                              {lesson.description && (
                                <p className="text-[11px] text-[#62748e] mt-0.5 line-clamp-1">
                                  {lesson.description}
                                </p>
                              )}
                            </div>
                            <FileText className="w-4 h-4 text-[#62748e]" />
                          </div>
                        ))}
                      </div>
                    )}

                    {isExpanded && lessonCount === 0 && (
                      <div className="p-4 bg-white text-center text-[12px] text-[#62748e]">
                        Chương này chưa có bài học
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* BACK BUTTON */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    </div>
  );
}
