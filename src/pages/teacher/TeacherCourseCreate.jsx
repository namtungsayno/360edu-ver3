// src/pages/teacher/TeacherCourseCreate.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Textarea } from "../../components/ui/Textarea.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select.jsx";
import { Badge } from "../../components/ui/Badge.jsx";

import {
  ArrowLeft,
  Info,
  Plus,
  Trash2,
  BookOpen,
  Layers,
  FileText,
} from "lucide-react";

import { subjectService } from "../../services/subject/subject.service.js";
import { courseService } from "../../services/course/course.service.js";
import { teacherApi } from "../../services/teacher/teacher.api.js";
import { useToast } from "../../hooks/use-toast.js";
import { useAuth } from "../../hooks/useAuth.js";

function createLocalId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function TeacherCourseCreate() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { user } = useAuth();

  // ====== BASIC FORM STATE ======
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [description, setDescription] = useState("");

  // ====== SUBJECTS ======
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // ====== CHAPTERS & LESSONS (LOCAL ONLY) ======
  const [chapters, setChapters] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Derived counts
  const totalChapters = chapters.length;
  const totalLessons = useMemo(
    () => chapters.reduce((sum, ch) => sum + ch.lessons.length, 0),
    [chapters]
  );

  // ====== LOAD SUBJECTS - CHỈ CỦA GIÁO VIÊN ======
  useEffect(() => {
    (async () => {
      try {
        if (!user?.id) {
          error("Không tìm thấy thông tin người dùng");
          setLoadingSubjects(false);
          return;
        }

        // Lấy thông tin teacher để biết họ dạy môn nào
        const teacherInfo = await teacherApi.getByUserId(user.id);

        if (!teacherInfo) {
          error("Không tìm thấy thông tin giáo viên");
          setLoadingSubjects(false);
          return;
        }

        // Lấy tất cả môn học của giáo viên này
        // Backend trả về subjectIds (array) và subjectNames (array)
        const teacherSubjects = [];

        if (teacherInfo.subjectIds && teacherInfo.subjectNames) {
          for (let i = 0; i < teacherInfo.subjectIds.length; i++) {
            teacherSubjects.push({
              id: teacherInfo.subjectIds[i],
              name: teacherInfo.subjectNames[i],
              status: "AVAILABLE",
            });
          }
        } else if (teacherInfo.subjectId && teacherInfo.subjectName) {
          // Fallback nếu chỉ có 1 môn chính
          teacherSubjects.push({
            id: teacherInfo.subjectId,
            name: teacherInfo.subjectName,
            status: "AVAILABLE",
          });
        }

        console.log("Teacher subjects:", teacherSubjects);
        setSubjects(teacherSubjects);

        if (teacherSubjects.length === 0) {
          error(
            "Giáo viên chưa được phân công môn học nào. Vui lòng liên hệ Admin."
          );
        }
      } catch (e) {
        console.error("Failed to load teacher subjects:", e);
        error("Không thể tải danh sách môn học của bạn");
      } finally {
        setLoadingSubjects(false);
      }
    })();
  }, [user, error]);

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
      prev.map((ch) =>
        ch._id === _id
          ? {
              ...ch,
              [field]: value,
            }
          : ch
      )
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
                ls._id === lessonId
                  ? {
                      ...ls,
                      [field]: value,
                    }
                  : ls
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
      error("Vui lòng chọn môn học");
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
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // 1) Tạo course
      const course = await courseService.createCourse({
        subjectId: Number(subjectId),
        title: title.trim(),
        description: description.trim(),
      });

      const courseId = course?.id;
      if (!courseId) {
        throw new Error("Không nhận được ID khóa học sau khi tạo");
      }

      // 2) Tạo chapters + lessons (theo thứ tự)
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

      success(
        "Đã tạo khóa học thành công! Khóa học sẽ cần Admin phê duyệt trước khi hiển thị.",
        "Thành công"
      );
      navigate("/home/teacher/courses");
    } catch (err) {
      console.error("Create course failed:", err);
      error(
        err?.displayMessage || err?.message || "Có lỗi xảy ra khi tạo khóa học"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ====== RENDER ======

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-[#62748e] hover:text-neutral-950"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <div>
            <h1 className="text-xl font-semibold text-neutral-950">
              Tạo khóa học mới
            </h1>
            <p className="text-[12px] text-[#62748e] mt-1">
              Điền thông tin để tạo khóa học mới cho học viên của bạn
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
              Quy trình phê duyệt khóa học
            </p>
            <p className="text-[12px] text-[#45556c]">
              Sau khi bạn tạo khóa học, Admin sẽ xem xét và phê duyệt nội dung
              trong vòng 24–48 giờ. Bạn sẽ nhận được thông báo khi khóa học được
              phê duyệt và có thể hiển thị công khai.
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

              {/* Subject */}
              <div className="space-y-2">
                <label className="text-[12px] text-[#62748e] font-medium">
                  Môn học <span className="text-red-500">*</span>
                </label>
                <Select
                  value={subjectId}
                  onValueChange={setSubjectId}
                  disabled={loadingSubjects || subjects.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        loadingSubjects
                          ? "Đang tải..."
                          : subjects.length === 0
                          ? "Chưa có môn học được phân công"
                          : "Chọn môn học"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.length === 0 ? (
                      <div className="px-2 py-3 text-center text-sm text-[#62748e]">
                        Bạn chưa được phân công môn học nào.
                        <br />
                        Vui lòng liên hệ Admin.
                      </div>
                    ) : (
                      subjects.map((subject) => (
                        <SelectItem key={subject.id} value={String(subject.id)}>
                          {subject.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {subjects.length > 0 && (
                  <p className="text-[11px] text-[#45556c]">
                    Chỉ hiển thị các môn bạn được phân công giảng dạy
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[12px] text-[#62748e] font-medium">
                  Mô tả khóa học <span className="text-red-500">*</span>
                </label>
                <Textarea
                  rows={4}
                  placeholder="Mô tả chi tiết về khóa học: nội dung, mục tiêu, đối tượng học viên, phương pháp giảng dạy..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="placeholder:text-[#b0b8c4]"
                />
                <p className="text-[11px] text-[#45556c]">
                  Mô tả chi tiết giúp học viên hiểu rõ hơn về khóa học của bạn.
                </p>
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
                <li>
                  Khóa học cần được Admin phê duyệt trước khi hiển thị cho học
                  viên.
                </li>
                <li>Thời gian phê duyệt trung bình: 24–48 giờ.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
