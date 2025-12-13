// src/pages/student/CourseDetail.jsx
// Trang xem chi tiết khóa học cho student đã đăng ký lớp
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Download,
  Paperclip,
  FileImage,
  FileVideo,
  File,
} from "lucide-react";

import { courseService } from "../../services/course/course.service.js";
import { enrollmentService } from "../../services/enrollment/enrollment.service.js";
import { lessonMaterialService } from "../../services/lesson-material/lesson-material.service.js";
import { useToast } from "../../hooks/use-toast.js";
import { stripHtmlTags } from "../../utils/html-helpers.js";

// Helper format file size
function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Helper get file icon based on type
function getFileIcon(fileType) {
  if (!fileType) return File;
  if (fileType.startsWith("image/")) return FileImage;
  if (fileType.startsWith("video/")) return FileVideo;
  if (fileType === "application/pdf") return FileText;
  return File;
}

export default function StudentCourseDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("classId"); // Có thể truyền classId để lấy sessions
  const navigate = useNavigate();
  const { error } = useToast();

  const [course, setCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [expandedSessions, setExpandedSessions] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});
  const [lessonMaterials, setLessonMaterials] = useState({});
  const [loadingMaterials, setLoadingMaterials] = useState({});
  const [activeTab, setActiveTab] = useState("content"); // "content" | "schedule"

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, classId]);

  async function loadData() {
    try {
      setLoading(true);

      // Load course detail
      const courseData = await courseService.getCourseDetail(id);
      setCourse(courseData);

      // Mở tất cả chapters mặc định
      if (courseData.chapters) {
        const expanded = {};
        courseData.chapters.forEach((ch) => {
          expanded[ch.id] = true;
        });
        setExpandedChapters(expanded);
      }

      // Nếu có classId, load sessions của lớp đó
      if (classId) {
        try {
          const sessionsData = await enrollmentService.getClassSessions(
            classId
          );
          setSessions(sessionsData || []);
          // Mở session đầu tiên có nội dung
          const sessionWithContent = sessionsData?.find(
            (s) =>
              s.lessonContent ||
              s.linkedChapters?.length > 0 ||
              s.linkedLessons?.length > 0
          );
          if (sessionWithContent) {
            setExpandedSessions({ [sessionWithContent.sessionId]: true });
          }
          // Tự động chuyển sang tab schedule nếu có sessions
          if (sessionsData && sessionsData.length > 0) {
            setActiveTab("schedule");
          }
        } catch (e) {
          }
      }
    } catch (e) {
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

  function toggleSession(sessionId) {
    setExpandedSessions((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  }

  async function toggleLesson(lessonId) {
    const isCurrentlyExpanded = expandedLessons[lessonId];

    setExpandedLessons((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));

    // Load materials nếu chưa load
    if (!isCurrentlyExpanded && !lessonMaterials[lessonId]) {
      try {
        setLoadingMaterials((prev) => ({ ...prev, [lessonId]: true }));
        const materials = await lessonMaterialService.getMaterialsByLesson(
          lessonId
        );
        setLessonMaterials((prev) => ({
          ...prev,
          [lessonId]: materials || [],
        }));
      } catch (e) {
        } finally {
        setLoadingMaterials((prev) => ({ ...prev, [lessonId]: false }));
      }
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="rounded-[14px] p-6 text-center text-[#62748e]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
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

  // Đếm số buổi có nội dung
  const sessionsWithContent = sessions.filter(
    (s) =>
      s.lessonContent ||
      s.linkedChapters?.length > 0 ||
      s.linkedLessons?.length > 0 ||
      s.materials?.length > 0
  ).length;

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
            Xem chi tiết các chương, bài học và lịch học theo buổi
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
              <div
                className="text-[13px] text-[#45556c] leading-relaxed rich-text-content"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <p className="text-sm font-semibold text-neutral-950 truncate">
                  {course.ownerTeacherName || course.createdByName || "—"}
                </p>
              </div>
            </div>

            {sessions.length > 0 && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[11px] text-amber-600 font-medium">
                    Buổi có nội dung
                  </p>
                  <p className="text-lg font-semibold text-neutral-950">
                    {sessionsWithContent}/{sessions.length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* TAB NAVIGATION */}
      {sessions.length > 0 && (
        <div className="flex gap-2 border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === "content"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("content")}
          >
            <Layers className="w-4 h-4 inline mr-2" />
            Nội dung khóa học
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === "schedule"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("schedule")}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Lịch học theo buổi ({sessionsWithContent} buổi có nội dung)
          </button>
        </div>
      )}

      {/* CONTENT TAB - CHAPTERS & LESSONS */}
      {activeTab === "content" && (
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
                                {stripHtmlTags(chapter.description)}
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
                          {chapter.lessons.map((lesson, lessonIndex) => {
                            const isLessonExpanded = expandedLessons[lesson.id];
                            const materials = lessonMaterials[lesson.id] || [];
                            const isLoadingMat = loadingMaterials[lesson.id];

                            return (
                              <div key={lesson.id}>
                                <div
                                  className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                  onClick={() => toggleLesson(lesson.id)}
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
                                        {stripHtmlTags(lesson.description)}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Paperclip className="w-4 h-4 text-[#62748e]" />
                                    {isLessonExpanded ? (
                                      <ChevronDown className="w-4 h-4 text-[#62748e]" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-[#62748e]" />
                                    )}
                                  </div>
                                </div>

                                {/* Lesson Materials */}
                                {isLessonExpanded && (
                                  <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                                    {isLoadingMat ? (
                                      <div className="text-center py-4 text-gray-500 text-sm">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                        Đang tải tài liệu...
                                      </div>
                                    ) : materials.length === 0 ? (
                                      <div className="text-center py-4 text-gray-400 text-sm">
                                        <FileText className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                        Bài học này chưa có tài liệu
                                      </div>
                                    ) : (
                                      <div className="space-y-2 pt-3">
                                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                          <Paperclip className="w-4 h-4 text-blue-600" />
                                          Tài liệu bài học ({materials.length}):
                                        </p>
                                        {materials.map((material) => {
                                          const IconComponent = getFileIcon(
                                            material.fileType
                                          );
                                          return (
                                            <a
                                              key={material.id}
                                              href={material.fileUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition group"
                                            >
                                              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                                                <IconComponent className="w-5 h-5 text-blue-600" />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-blue-900 truncate">
                                                  {material.fileName}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-blue-700">
                                                  <span>
                                                    {formatFileSize(
                                                      material.fileSize
                                                    )}
                                                  </span>
                                                  {material.description && (
                                                    <>
                                                      <span>•</span>
                                                      <span className="truncate">
                                                        {material.description}
                                                      </span>
                                                    </>
                                                  )}
                                                </div>
                                              </div>
                                              <Download className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition" />
                                            </a>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
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
      )}

      {/* SCHEDULE TAB - SESSIONS WITH CONTENT */}
      {activeTab === "schedule" && (
        <Card className="rounded-[14px] border border-gray-200">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-base font-semibold text-neutral-950">
              Lịch học theo buổi
            </CardTitle>
            <p className="text-[12px] text-[#62748e] mt-1">
              Xem nội dung bài học và ghi chú của giáo viên cho từng buổi (slot
              nào, hôm nào)
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-[#62748e] text-[13px]">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Chưa có lịch học</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session, index) => {
                  const isExpanded = expandedSessions[session.sessionId];
                  const hasContent =
                    session.lessonContent ||
                    session.linkedChapters?.length > 0 ||
                    session.linkedLessons?.length > 0 ||
                    session.materials?.length > 0;

                  const STATUS_COLORS = {
                    PRESENT: "bg-green-100 text-green-700 border-green-300",
                    ABSENT: "bg-red-100 text-red-700 border-red-300",
                    LATE: "bg-amber-100 text-amber-700 border-amber-300",
                    UNMARKED: "bg-gray-100 text-gray-600 border-gray-300",
                  };
                  const STATUS_LABELS = {
                    PRESENT: "Có mặt",
                    ABSENT: "Vắng",
                    LATE: "Đi trễ",
                    UNMARKED: "Chưa điểm danh",
                  };

                  return (
                    <div
                      key={session.sessionId}
                      className={`border rounded-lg overflow-hidden ${
                        hasContent ? "border-blue-200" : "border-gray-200"
                      }`}
                    >
                      {/* Session Header */}
                      <div
                        className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                          hasContent
                            ? "bg-blue-50 hover:bg-blue-100"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                        onClick={() => toggleSession(session.sessionId)}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              hasContent ? "bg-blue-100" : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`text-sm font-bold ${
                                hasContent ? "text-blue-600" : "text-gray-500"
                              }`}
                            >
                              {index + 1}
                            </span>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-neutral-950">
                                {new Date(session.date).toLocaleDateString(
                                  "vi-VN",
                                  {
                                    weekday: "long",
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                              <Badge variant="outline" className="text-[10px]">
                                <Clock className="w-3 h-3 mr-1" />
                                {session.timeStart?.slice(0, 5)} -{" "}
                                {session.timeEnd?.slice(0, 5)}
                              </Badge>
                              {session.roomName && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {session.roomName}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                className={`text-[10px] border ${
                                  STATUS_COLORS[
                                    session.attendanceStatus || "UNMARKED"
                                  ]
                                }`}
                              >
                                {
                                  STATUS_LABELS[
                                    session.attendanceStatus || "UNMARKED"
                                  ]
                                }
                              </Badge>
                              {hasContent && (
                                <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Có nội dung
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="ml-3">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-[#62748e]" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-[#62748e]" />
                          )}
                        </div>
                      </div>

                      {/* Session Content */}
                      {isExpanded && (
                        <div className="bg-white p-4 space-y-4 border-t">
                          {/* Linked Chapters */}
                          {session.linkedChapters?.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-blue-600" />
                                Chương học:
                              </p>
                              <div className="space-y-2">
                                {session.linkedChapters.map((chapter) => (
                                  <div
                                    key={chapter.id}
                                    className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                                  >
                                    <div className="font-semibold text-blue-900">
                                      {chapter.title}
                                    </div>
                                    {chapter.description && (
                                      <p className="text-sm text-blue-700 mt-1">
                                        {stripHtmlTags(chapter.description)}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Linked Lessons */}
                          {session.linkedLessons?.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-purple-600" />
                                Bài học:
                              </p>
                              <div className="space-y-2">
                                {session.linkedLessons.map((lesson) => (
                                  <div
                                    key={lesson.id}
                                    className="bg-purple-50 border border-purple-200 rounded-lg p-3"
                                  >
                                    {lesson.chapterTitle && (
                                      <div className="text-xs text-purple-600 mb-1">
                                        Thuộc chương: {lesson.chapterTitle}
                                      </div>
                                    )}
                                    <div className="font-semibold text-purple-900">
                                      {lesson.title}
                                    </div>
                                    {lesson.description && (
                                      <p className="text-sm text-purple-700 mt-1">
                                        {stripHtmlTags(lesson.description)}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Lesson Content / Teacher Notes */}
                          {session.lessonContent && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-green-600" />
                                Ghi chú từ giáo viên:
                              </p>
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div
                                  className="prose prose-sm max-w-none text-green-900"
                                  dangerouslySetInnerHTML={{
                                    __html: session.lessonContent,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Session Materials / Tài liệu buổi học */}
                          {session.materials?.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Paperclip className="w-4 h-4 text-amber-600" />
                                Tài liệu buổi học ({session.materials.length}):
                              </p>
                              <div className="space-y-2">
                                {session.materials.map((material) => {
                                  const IconComponent = getFileIcon(
                                    material.fileType
                                  );
                                  return (
                                    <a
                                      key={material.id}
                                      href={material.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition group"
                                    >
                                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                                        <IconComponent className="w-5 h-5 text-amber-600" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-amber-900 truncate">
                                          {material.fileName}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-amber-700">
                                          <span>
                                            {formatFileSize(material.fileSize)}
                                          </span>
                                          {material.description && (
                                            <>
                                              <span>•</span>
                                              <span className="truncate">
                                                {material.description}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      <Download className="w-5 h-5 text-amber-600 opacity-0 group-hover:opacity-100 transition" />
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* No content */}
                          {!hasContent && (
                            <div className="text-center py-4 text-gray-400">
                              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">
                                Buổi học này chưa có nội dung
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
