// src/pages/teacher/TeacherCourseEdit.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Input } from "../../../components/ui/Input.jsx";
import { Textarea } from "../../../components/ui/Textarea.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/Select.jsx";

import {
  ArrowLeft,
  Info,
  Plus,
  Trash2,
  Layers,
  FileText,
  Save,
  Paperclip,
  ChevronDown,
  ChevronRight,
  BookOpen,
} from "lucide-react";

import { courseService } from "../../../services/course/course.service.js";
import { teacherApi } from "../../../services/teacher/teacher.api.js";
import { useToast } from "../../../hooks/use-toast.js";
import { useAuth } from "../../../hooks/useAuth.js";
import LessonMaterialUpload from "../../../components/teacher/LessonMaterialUpload.jsx";
import { BackButton } from "../../../components/common/BackButton";

function createLocalId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function TeacherCourseEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { user } = useAuth();

  // ====== LOADING STATE ======
  const [loading, setLoading] = useState(true);
  const [sourceTagInOriginal, setSourceTagInOriginal] = useState("");

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
  const [expandedLessonMaterials, setExpandedLessonMaterials] = useState({});
  // Không còn ráp title ở FE; hiển thị trực tiếp từ DB

  // Derived counts
  const totalChapters = chapters.length;
  const totalLessons = useMemo(
    () => chapters.reduce((sum, ch) => sum + ch.lessons.length, 0),
    [chapters]
  );

  // ====== LOAD COURSE DETAIL ======
  useEffect(() => {
    loadCourseDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadCourseDetail() {
    try {
      setLoading(true);
      const course = await courseService.getCourseDetail(id);

      // Populate form
      setTitle(course.title || "");
      setSubjectId(String(course.subjectId || ""));
      // Strip internal clone source tag if present to avoid showing it in UI
      const rawDesc = course.description || "";
      const sourceMatch = rawDesc.match(/\[\[SOURCE:[^\]]+\]\]/);
      setSourceTagInOriginal(sourceMatch ? sourceMatch[0] : "");
      const cleanedDescription = rawDesc
        .replace(/\n?\[\[SOURCE:[^\]]+\]\]/, "")
        .trim();
      setDescription(cleanedDescription);

      // Convert chapters/lessons to local format
      if (course.chapters && course.chapters.length > 0) {
        const localChapters = course.chapters.map((ch) => ({
          _id: createLocalId(),
          id: ch.id, // Keep backend ID for update
          title: ch.title || "",
          description: ch.description || "",
          orderIndex: ch.orderIndex || 0,
          lessons:
            ch.lessons?.map((ls) => ({
              _id: createLocalId(),
              id: ls.id, // Keep backend ID for update
              title: ls.title || "",
              description: ls.description || "",
              orderIndex: ls.orderIndex || 0,
            })) || [],
        }));
        setChapters(localChapters);
      }

      setLoading(false);

      // Không cần enrich: UI dùng trực tiếp `course.title`
    } catch (err) {
      error("Không thể tải thông tin khóa học");
      setLoading(false);
      navigate("/home/teacher/courses");
    }
  }

  // ====== LOAD SUBJECTS - CHỈ CỦA GIÁO VIÊN ======
  useEffect(() => {
    (async () => {
      try {
        if (!user?.id) {
          error("Không tìm thấy thông tin người dùng");
          setLoadingSubjects(false);
          return;
        }

        const teacherInfo = await teacherApi.getByUserId(user.id);

        if (!teacherInfo) {
          error("Không tìm thấy thông tin giáo viên");
          setLoadingSubjects(false);
          return;
        }

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
          teacherSubjects.push({
            id: teacherInfo.subjectId,
            name: teacherInfo.subjectName,
            status: "AVAILABLE",
          });
        }

        setSubjects(teacherSubjects);
        setLoadingSubjects(false);
      } catch (err) {
        error("Không thể tải danh sách môn học");
        setLoadingSubjects(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ====== CHAPTER HANDLERS ======
  const handleAddChapter = () => {
    setChapters((prev) => [
      ...prev,
      {
        _id: createLocalId(),
        title: "",
        description: "",
        orderIndex: prev.length + 1,
        lessons: [],
      },
    ]);
  };

  const handleRemoveChapter = (_id) => {
    setChapters((prev) =>
      prev
        .filter((ch) => ch._id !== _id)
        .map((ch, idx) => ({ ...ch, orderIndex: idx + 1 }))
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

  // Toggle lesson materials panel
  const toggleLessonMaterials = (lessonId) => {
    setExpandedLessonMaterials((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  // ====== SUBMIT ======

  const validateForm = () => {
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
    if (submitting) return; // Prevent double submit

    setSubmitting(true);
    try {
      // EDIT existing personal course: update and re-create content
      const latest = await courseService.getCourseDetail(id);
      // Ensure OWNER tag exists for legacy items, và giữ lại SOURCE tag nếu khóa học gốc là bản cá nhân hóa
      const ownerTag = `[[OWNER:${user?.id}]]`;
      let nextDescription = description.trim();
      if (!nextDescription.includes(ownerTag)) {
        nextDescription += `\n${ownerTag}`;
      }
      if (
        sourceTagInOriginal &&
        !nextDescription.includes(sourceTagInOriginal)
      ) {
        nextDescription += `\n${sourceTagInOriginal}`;
      }

      await courseService.updateCourse(id, {
        subjectId: Number(subjectId),
        title: title.trim(),
        description: nextDescription,
      });

      // Collect existing chapter/lesson IDs that we want to KEEP
      const keepChapterIds = new Set();
      const keepLessonIds = new Set();
      for (const ch of chapters) {
        if (ch.id) keepChapterIds.add(ch.id);
        for (const ls of ch.lessons) {
          if (ls.id) keepLessonIds.add(ls.id);
        }
      }

      // Delete lessons and chapters that are NOT in our current list
      if (latest?.chapters && latest.chapters.length > 0) {
        for (const ch of latest.chapters) {
          if (ch.lessons && ch.lessons.length > 0) {
            for (const ls of ch.lessons) {
              if (!keepLessonIds.has(ls.id)) {
                try {
                  await courseService.removeLesson(ls.id);
                } catch (lessonErr) {
                  }
              }
            }
          }
          if (!keepChapterIds.has(ch.id)) {
            try {
              await courseService.removeChapter(ch.id);
            } catch (chapterErr) {
              }
          }
        }
      }

      // Update existing chapters/lessons OR create new ones
      for (const ch of chapters) {
        let chapterId = ch.id;

        if (chapterId) {
          // Update existing chapter
          await courseService.updateChapter(chapterId, {
            title: ch.title.trim(),
            description: ch.description.trim(),
            orderIndex: ch.orderIndex,
          });
        } else {
          // Create new chapter
          const createdChapter = await courseService.addChapter(id, {
            title: ch.title.trim(),
            description: ch.description.trim(),
            orderIndex: ch.orderIndex,
          });
          chapterId = createdChapter?.id;
        }

        if (!chapterId) continue;

        for (const ls of ch.lessons) {
          if (ls.id) {
            // Update existing lesson
            await courseService.updateLesson(ls.id, {
              title: ls.title.trim(),
              description: ls.description.trim(),
              orderIndex: ls.orderIndex,
            });
          } else {
            // Create new lesson
            await courseService.addLesson(chapterId, {
              title: ls.title.trim(),
              description: ls.description.trim(),
              orderIndex: ls.orderIndex,
            });
          }
        }
      }

      success("Đã cập nhật khóa học thành công!", "Thành công");
      navigate(`/home/teacher/courses/${id}`);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.displayMessage ||
        err?.message ||
        "Có lỗi xảy ra khi cập nhật khóa học";
      error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel edit without sending for approval
  const handleCancel = () => {
    navigate(-1);
  };

  // ====== RENDER ======

  if (loading) {
    return (
      <div className="p-6">
        <Card className="rounded-[14px] p-6 text-center text-[#62748e]">
          Đang tải thông tin khóa học...
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton
            onClick={() => navigate(`/home/teacher/courses/${id}`)}
            showLabel={false}
          />
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chỉnh sửa nội dung khóa học
            </h1>
            <p className="text-sm text-gray-500">
              Chỉ được sửa chương học và bài học. Thay đổi sẽ được áp dụng ngay.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-[#155dfc] hover:bg-[#0f4ad1]"
          >
            {submitting ? (
              <span className="text-sm">Đang lưu...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={submitting}
            className="inline-flex items-center gap-2"
          >
            Hủy
          </Button>
        </div>
      </div>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: FORM */}
        <div className="lg:col-span-2 space-y-4">
          {/* Basic Info */}
          <Card className="rounded-[14px]">
            <CardHeader className="px-6 pt-5 pb-3 border-b border-gray-100">
              <CardTitle className="text-base text-neutral-950">
                Thông tin cơ bản (Chỉ xem)
              </CardTitle>
              <p className="text-[11px] text-gray-500 mt-1">
                Các thông tin này không thể chỉnh sửa
              </p>
            </CardHeader>
            <CardContent className="px-6 pb-5 space-y-4 pt-5">
              <div>
                <label className="block text-[13px] font-medium text-neutral-950 mb-1.5">
                  Tên khóa học
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-neutral-950">
                  {title || ""}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  ℹ️ Không thể thay đổi tên khóa học
                </p>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-neutral-950 mb-1.5">
                  Môn học
                </label>
                <Select value={subjectId} onValueChange={setSubjectId} disabled>
                  <SelectTrigger className="bg-gray-100 cursor-not-allowed">
                    <SelectValue placeholder="Chọn môn học..." />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingSubjects && (
                      <SelectItem value="loading" disabled>
                        Đang tải...
                      </SelectItem>
                    )}
                    {!loadingSubjects && subjects.length === 0 && (
                      <SelectItem value="none" disabled>
                        Không có môn học
                      </SelectItem>
                    )}
                    {!loadingSubjects &&
                      subjects.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-orange-600 mt-1">
                  ⚠️ Không thể thay đổi môn học sau khi tạo khóa học
                </p>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-neutral-950 mb-1.5">
                  Mô tả khóa học
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-neutral-950 min-h-[100px] whitespace-pre-wrap">
                  {description || "Chưa có mô tả"}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  ℹ️ Không thể thay đổi mô tả khóa học
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Chapters */}
          <Card className="rounded-[14px]">
            <CardHeader className="px-6 pt-5 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-neutral-950">
                  Chương học
                </CardTitle>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddChapter}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Thêm chương
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-5 pt-5 space-y-4">
              {chapters.length === 0 && (
                <p className="text-center text-[#62748e] text-sm py-4">
                  Chưa có chương học nào. Nhấn "Thêm chương" để bắt đầu.
                </p>
              )}

              <div className="space-y-4">
                {chapters.map((chapter, idx) => (
                  <Card
                    key={chapter._id}
                    className="rounded-[12px] border-gray-200"
                  >
                    <CardHeader className="px-4 pt-4 pb-3 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                            <span className="text-xs font-semibold text-blue-600">
                              {idx + 1}
                            </span>
                          </div>
                          <span className="text-[13px] font-medium text-neutral-950">
                            Chương {idx + 1}
                          </span>
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
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-3 space-y-3">
                      <div>
                        <label className="block text-[12px] font-medium text-neutral-950 mb-1">
                          Tiêu đề chương <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="VD: Hàm số bậc nhất"
                          value={chapter.title}
                          onChange={(e) =>
                            handleChangeChapterField(
                              chapter._id,
                              "title",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-[12px] font-medium text-neutral-950 mb-1">
                          Mô tả chương
                        </label>
                        <Textarea
                          rows={2}
                          placeholder="Giới thiệu ngắn gọn về chương..."
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

                      {/* Lessons */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[12px] font-medium text-neutral-950">
                            Bài học <span className="text-red-500">*</span>
                          </label>
                        </div>

                        {chapter.lessons.map((lesson, lIdx) => {
                          const isExpanded = expandedLessonMaterials[lesson.id];
                          const hasBackendId = !!lesson.id; // Chỉ có id nếu đã lưu vào DB

                          return (
                            <div
                              key={lesson._id}
                              className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                                  <span className="text-[11px] font-medium text-purple-600">
                                    {lIdx + 1}
                                  </span>
                                </div>
                                <div className="flex-1 space-y-2">
                                  <Input
                                    placeholder="Tên bài học"
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

                                  {/* Button to toggle materials */}
                                  {hasBackendId && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleLessonMaterials(lesson.id)
                                      }
                                      className="flex items-center gap-2 text-[12px] text-blue-600 hover:text-blue-700 font-medium mt-2"
                                    >
                                      <Paperclip className="w-3.5 h-3.5" />
                                      <span>Quản lý tài liệu bài học</span>
                                      {isExpanded ? (
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      ) : (
                                        <ChevronRight className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  )}

                                  {!hasBackendId && (
                                    <p className="text-[11px] text-amber-600 mt-2 flex items-center gap-1">
                                      <Info className="w-3.5 h-3.5" />
                                      Lưu khóa học trước để thêm tài liệu cho
                                      bài học này
                                    </p>
                                  )}
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

                              {/* Lesson Materials Upload Panel */}
                              {hasBackendId && isExpanded && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <LessonMaterialUpload lessonId={lesson.id} />
                                </div>
                              )}
                            </div>
                          );
                        })}

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

          <Card className="rounded-[14px] border-orange-100 bg-orange-50/60">
            <CardHeader className="px-6 pt-5 pb-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Info className="w-4 h-4 text-orange-600" />
              </div>
              <CardTitle className="text-sm text-neutral-950">
                Lưu ý khi chỉnh sửa
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-5">
              <ul className="list-disc list-inside text-[12px] text-[#45556c] space-y-1">
                <li>CHỈ được sửa nội dung chương học và bài học.</li>
                <li>KHÔNG được đổi: tên khóa học, môn học, mô tả.</li>
                <li>
                  Sau khi lưu, khóa học được cập nhật ngay (không cần Admin phê
                  duyệt lại).
                </li>
                <li>Mọi thay đổi sẽ thay thế hoàn toàn nội dung cũ.</li>
                <li>Mỗi chương cần có ít nhất 1 bài học.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
