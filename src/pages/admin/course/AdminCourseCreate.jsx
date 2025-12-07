// src/pages/admin/course/AdminCourseCreate.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Input } from "../../../components/ui/Input.jsx";
import { Textarea } from "../../../components/ui/Textarea.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import RichTextEditor from "../../../components/ui/RichTextEditor";

import { Info, Plus, Trash2, BookOpen, Layers, FileText } from "lucide-react";

import { getSubjectById } from "../../../services/subject/subject.api";
import { courseService } from "../../../services/course/course.service.js";
import { useToast } from "../../../hooks/use-toast.js";
import { BackButton } from "../../../components/common/BackButton";

function createLocalId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function AdminCourseCreate() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [searchParams] = useSearchParams();

  // ====== BASIC FORM STATE ======
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [description, setDescription] = useState("");

  // ====== CHAPTERS & LESSONS (LOCAL ONLY) ======
  const [chapters, setChapters] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Derived counts
  const totalChapters = chapters.length;
  const totalLessons = useMemo(
    () => chapters.reduce((sum, ch) => sum + ch.lessons.length, 0),
    [chapters]
  );

  // ====== INIT: LOAD SUBJECT BY subjectId QUERY ======
  useEffect(() => {
    const sid = searchParams.get("subjectId");
    if (!sid) return;
    setSubjectId(String(sid));

    (async () => {
      try {
        const subject = await getSubjectById(sid);
        const name =
          subject?.name ||
          subject?.subjectName ||
          subject?.tenMon ||
          String(sid);
        setSubjectName(name);
      } catch (e) {
        console.error("Failed to load subject", e);
      }
    })();
  }, [searchParams]);

  // ====== CHAPTER / LESSON HANDLERS ======
  const handleAddFirstChapter = () => {
    if (chapters.length === 0) {
      handleAddChapter();
    }
  };

  const handleAddChapter = () => {
    const newChapter = {
      _id: createLocalId(),
      title: "",
      description: "",
      orderIndex: chapters.length + 1,
      lessons: [],
    };
    setChapters((prev) => [...prev, newChapter]);
  };

  const handleRemoveChapter = (_id) => {
    setChapters((prev) =>
      prev
        .filter((ch) => ch._id !== _id)
        .map((ch, index) => ({ ...ch, orderIndex: index + 1 }))
    );
  };

  const handleChangeChapterField = (_id, field, value) => {
    setChapters((prev) =>
      prev.map((ch) => (ch._id === _id ? { ...ch, [field]: value } : ch))
    );
  };

  const handleAddLesson = (chapterId) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch._id === chapterId
          ? {
              ...ch,
              lessons: [
                ...ch.lessons,
                {
                  _id: createLocalId(),
                  title: "",
                  description: "",
                  orderIndex: ch.lessons.length + 1,
                },
              ],
            }
          : ch
      )
    );
  };

  const handleRemoveLesson = (chapterId, lessonId) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch._id === chapterId
          ? {
              ...ch,
              lessons: ch.lessons
                .filter((ls) => ls._id !== lessonId)
                .map((ls, idx) => ({ ...ls, orderIndex: idx + 1 })),
            }
          : ch
      )
    );
  };

  const handleChangeLessonField = (chapterId, lessonId, field, value) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch._id === chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map((ls) =>
                ls._id === lessonId ? { ...ls, [field]: value } : ls
              ),
            }
          : ch
      )
    );
  };

  // ====== SUBMIT ======
  const validateForm = () => {
    if (!title.trim()) {
      error("Vui lòng nhập tên khóa học");
      return false;
    }
    if (!subjectId) {
      error("Thiếu subjectId. Vui lòng quay lại từ trang Môn học");
      return false;
    }
    if (!description.trim()) {
      error("Vui lòng nhập mô tả khóa học");
      return false;
    }
    if (chapters.length === 0) {
      error("Vui lòng thêm ít nhất một chương học");
      return false;
    }
    for (const ch of chapters) {
      if (!ch.title.trim()) {
        error("Mỗi chương cần có tiêu đề");
        return false;
      }
      if (ch.lessons.length === 0) {
        error("Mỗi chương cần có ít nhất 1 bài học");
        return false;
      }
      for (const ls of ch.lessons) {
        if (!ls.title.trim()) {
          error("Mỗi bài học cần có tiêu đề");
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const course = await courseService.createCourse({
        subjectId: Number(subjectId),
        title: title.trim(),
        description: description.trim(),
      });

      const courseId = course?.id;
      if (!courseId) throw new Error("Không nhận được ID khóa học sau khi tạo");

      for (const ch of chapters) {
        const createdChapter = await courseService.addChapter(courseId, {
          title: ch.title.trim(),
          description: ch.description.trim(),
          orderIndex: ch.orderIndex,
        });
        const chapterId = createdChapter?.id;
        if (!chapterId) continue;
        for (const ls of ch.lessons) {
          await courseService.addLesson(chapterId, {
            title: ls.title.trim(),
            description: ls.description.trim(),
            orderIndex: ls.orderIndex,
          });
        }
      }

      success("Đã tạo khóa học thành công", "Thành công");
      navigate(`/home/admin/courses/${courseId}`);
    } catch (err) {
      console.error("Admin create course failed:", err);
      error(
        err?.displayMessage || err?.message || "Có lỗi xảy ra khi tạo khóa học"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ====== RENDER ======
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton showLabel={false} />
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tạo khóa học mới
            </h1>
            <p className="text-sm text-gray-500">
              Điền thông tin để tạo khóa học mới cho học viên
            </p>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 bg-[#155dfc] hover:bg-[#0f4ad1]"
        >
          {submitting ? (
            <span className="text-sm">Đang tạo...</span>
          ) : (
            <>
              <BookOpen className="w-4 h-4" />
              <span>Tạo khóa học</span>
            </>
          )}
        </Button>
      </div>

      {/* Info box */}
      <Card className="border-blue-100 bg-blue-50/60">
        <CardContent className="py-4 flex items-start gap-3">
          <div className="mt-0.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-950 mb-1">
              Tạo khóa học cho môn đã chọn
            </p>
            <p className="text-[12px] text-[#45556c]">
              Khóa học sẽ hiển thị theo môn học được chọn ở trang trước.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 2 columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: MAIN FORM */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <Card className="rounded-[14px]">
            <CardHeader className="px-6 pt-5 pb-4">
              <CardTitle className="text-base text-neutral-950">
                Thông tin cơ bản
              </CardTitle>
              <p className="text-[12px] text-[#62748e]">
                Thiết lập các thông tin chính cho khóa học của bạn
              </p>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-5">
              {/* Course title */}
              <div className="space-y-2">
                <label className="text-[12px] text-[#62748e] font-medium">
                  Tên khóa học <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="VD: Toán học THPT - Khối 10"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="placeholder:text-[#b0b8c4]"
                />
                <p className="text-[11px] text-[#45556c]">
                  Tên khóa học nên ngắn gọn, dễ hiểu và mô tả chính xác nội
                  dung.
                </p>
              </div>

              {/* Subject (readonly) */}
              <div className="space-y-2">
                <label className="text-[12px] text-[#62748e] font-medium">
                  Môn học <span className="text-red-500">*</span>
                </label>
                <Input
                  readOnly
                  value={
                    subjectName
                      ? `${subjectName} (ID: ${subjectId})`
                      : subjectId
                  }
                  className="bg-gray-50 text-gray-700"
                />
                <p className="text-[11px] text-[#45556c]">
                  Môn học được chọn từ trang trước và không thể thay đổi tại
                  đây.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[12px] text-[#62748e] font-medium">
                  Mô tả khóa học <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Mô tả chi tiết về khóa học: nội dung, mục tiêu, đối tượng học viên, phương pháp giảng dạy..."
                  simple
                  minHeight="150px"
                  maxHeight="300px"
                />
                <div className="text-[11px] text-[#45556c]">
                  Mô tả chi tiết giúp học viên hiểu rõ hơn về khóa học của bạn.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Program (chapters & lessons) */}
          <Card className="rounded-[14px]">
            <CardHeader className="px-6 pt-5 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-neutral-950">
                  Chương trình học
                </CardTitle>
                <p className="text-[12px] text-[#62748e] mt-1">
                  Tổ chức nội dung khóa học theo chương và bài học
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={handleAddChapter}
              >
                <Plus className="w-4 h-4" />
                Thêm chương
              </Button>
            </CardHeader>

            <CardContent className="px-6 pb-6 space-y-4">
              {/* Empty state */}
              {chapters.length === 0 && (
                <div className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 py-10 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center mb-4">
                    <Plus className="w-6 h-6 text-[#62748e]" />
                  </div>
                  <p className="text-sm font-medium text-neutral-950 mb-1">
                    Chưa có chương học nào
                  </p>
                  <p className="text-[12px] text-[#45556c] mb-4">
                    Hãy thêm chương đầu tiên để bắt đầu xây dựng khóa học.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={handleAddFirstChapter}
                  >
                    <Plus className="w-4 h-4" />
                    Thêm chương đầu tiên
                  </Button>
                </div>
              )}

              {/* Chapters list */}
              <div className="space-y-4">
                {chapters.map((chapter, chapterIndex) => (
                  <Card
                    key={chapter._id}
                    className="border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                  >
                    <CardContent className="p-5 space-y-4">
                      {/* Chapter header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mt-1">
                            <Layers className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[12px] text-[#62748e]">
                                Chương {chapterIndex + 1}
                              </p>
                              <Badge className="bg-gray-100 text-[11px] text-[#45556c]">
                                {chapter.lessons.length} bài học
                              </Badge>
                            </div>
                            <Input
                              placeholder="Tiêu đề chương"
                              value={chapter.title}
                              onChange={(e) =>
                                handleChangeChapterField(
                                  chapter._id,
                                  "title",
                                  e.target.value
                                )
                              }
                            />
                            <Textarea
                              rows={2}
                              placeholder="Mô tả ngắn về nội dung chương này..."
                              value={chapter.description}
                              onChange={(e) =>
                                handleChangeChapterField(
                                  chapter._id,
                                  "description",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveChapter(chapter._id)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Lessons */}
                      <div className="space-y-3">
                        {chapter.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson._id}
                            className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3"
                          >
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mt-0.5">
                              <FileText className="w-4 h-4 text-[#62748e]" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[12px] text-[#62748e]">
                                  Bài {lessonIndex + 1}
                                </p>
                              </div>
                              <Input
                                placeholder="Tiêu đề bài học"
                                value={lesson.title}
                                onChange={(e) =>
                                  handleChangeLessonField(
                                    chapter._id,
                                    lesson._id,
                                    "title",
                                    e.target.value
                                  )
                                }
                              />
                              <Textarea
                                rows={2}
                                placeholder="Giới thiệu ngắn gọn về bài học..."
                                value={lesson.description}
                                onChange={(e) =>
                                  handleChangeLessonField(
                                    chapter._id,
                                    lesson._id,
                                    "description",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                handleRemoveLesson(chapter._id, lesson._id)
                              }
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-1 gap-2"
                          onClick={() => handleAddLesson(chapter._id)}
                        >
                          <Plus className="w-4 h-4" />
                          Thêm bài học
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: OVERVIEW + NOTES */}
        <div className="space-y-4">
          <Card className="rounded-[14px]">
            <CardHeader className="px-6 pt-5 pb-3">
              <CardTitle className="text-base text-neutral-950">
                Tổng quan khóa học
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[12px] text-[#62748e]">Số chương</p>
                    <p className="text-sm text-neutral-950 font-medium">
                      {totalChapters}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[12px] text-[#62748e]">Số bài học</p>
                    <p className="text-sm text-neutral-950 font-medium">
                      {totalLessons}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[14px] border-blue-100 bg-blue-50/60">
            <CardHeader className="px-6 pt-5 pb-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Info className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-sm text-neutral-950">
                Lưu ý quan trọng
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-5">
              <ul className="list-disc list-inside text-[12px] text-[#45556c] space-y-1">
                <li>Các trường có dấu (*) là bắt buộc.</li>
                <li>Mỗi chương cần có ít nhất 1 bài học.</li>
                <li>Admin có thể chỉnh sửa/phê duyệt sau khi tạo.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
