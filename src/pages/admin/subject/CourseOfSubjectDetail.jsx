import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import {
  BookOpen,
  Layers,
  FileText,
  Plus,
  X,
  Save,
  Pencil,
} from "lucide-react";
import { courseService } from "../../../services/course/course.service";
import { Input } from "../../../components/ui/Input.jsx";
import { Textarea } from "../../../components/ui/Textarea.jsx";
import RichTextEditor from "../../../components/ui/RichTextEditor";
import { BackButton } from "../../../components/common/BackButton";
import { useToast } from "../../../hooks/use-toast";
import { stripHtmlTags } from "../../../utils/html-helpers.js";

export default function CourseOfSubjectDetail() {
  const { id: subjectId, courseId } = useParams();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [editableCourse, setEditableCourse] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourseDetail(courseId);
        if (!ignore) {
          setCourse(data);
          setEditableCourse(deepCloneCourse(data));
        }
      } catch (e) {
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-500">Đang tải khóa học...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <BackButton
            to={`/home/admin/subject/${subjectId}`}
            variant="outline"
            showLabel={false}
          />
          <div className="mt-6 text-gray-500">Không tìm thấy khóa học</div>
        </div>
      </div>
    );
  }

  // Trong chế độ preview sẽ dùng editableCourse (nếu đang edit) để realtime
  const previewSource = editMode && editableCourse ? editableCourse : course;
  const chapterCount = previewSource.chapters
    ? previewSource.chapters.length
    : previewSource.chapterCount || 0;
  const lessonCount = previewSource.chapters
    ? previewSource.chapters.reduce(
        (sum, ch) => sum + (ch.lessons?.length || 0),
        0
      )
    : previewSource.lessonCount || 0;

  // ---------- Helpers ----------
  function deepCloneCourse(c) {
    if (!c) return null;
    return {
      ...c,
      chapters: (c.chapters || []).map((ch) => ({
        ...ch,
        lessons: (ch.lessons || []).map((ls) => ({ ...ls })),
      })),
    };
  }

  const handleEnterEdit = () => {
    setEditableCourse(deepCloneCourse(course));
    setEditMode(true);
    setErrorMsg("");
  };

  const handleCancel = () => {
    setEditableCourse(deepCloneCourse(course));
    setEditMode(false);
    setErrorMsg("");
  };

  const handleDescriptionChange = (e) => {
    setEditableCourse((prev) => ({ ...prev, description: e.target.value }));
  };

  const addChapter = () => {
    setEditableCourse((prev) => ({
      ...prev,
      chapters: [
        ...(prev.chapters || []),
        { id: undefined, title: "Chương mới", description: "", lessons: [] },
      ],
    }));
  };

  const updateChapterTitle = (index, value) => {
    setEditableCourse((prev) => {
      const chapters = [...(prev.chapters || [])];
      chapters[index] = { ...chapters[index], title: value };
      return { ...prev, chapters };
    });
  };

  const updateChapterDescription = (index, value) => {
    setEditableCourse((prev) => {
      const chapters = [...(prev.chapters || [])];
      chapters[index] = { ...chapters[index], description: value };
      return { ...prev, chapters };
    });
  };

  const removeChapter = (index) => {
    setEditableCourse((prev) => {
      const chapters = [...(prev.chapters || [])];
      chapters.splice(index, 1);
      return { ...prev, chapters };
    });
  };

  const addLesson = (chapterIdx) => {
    setEditableCourse((prev) => {
      const chapters = [...(prev.chapters || [])];
      const chapter = { ...chapters[chapterIdx] };
      chapter.lessons = [
        ...(chapter.lessons || []),
        { id: undefined, title: "Bài mới", description: "" },
      ];
      chapters[chapterIdx] = chapter;
      return { ...prev, chapters };
    });
  };

  const updateLessonTitle = (chapterIdx, lessonIdx, value) => {
    setEditableCourse((prev) => {
      const chapters = [...(prev.chapters || [])];
      const chapter = { ...chapters[chapterIdx] };
      const lessons = [...(chapter.lessons || [])];
      lessons[lessonIdx] = { ...lessons[lessonIdx], title: value };
      chapter.lessons = lessons;
      chapters[chapterIdx] = chapter;
      return { ...prev, chapters };
    });
  };

  const removeLesson = (chapterIdx, lessonIdx) => {
    setEditableCourse((prev) => {
      const chapters = [...(prev.chapters || [])];
      const chapter = { ...chapters[chapterIdx] };
      const lessons = [...(chapter.lessons || [])];
      lessons.splice(lessonIdx, 1);
      chapter.lessons = lessons;
      chapters[chapterIdx] = chapter;
      return { ...prev, chapters };
    });
  };

  const handleSave = async () => {
    if (!editableCourse || saving) return;
    setSaving(true);
    setErrorMsg("");
    try {
      // (A) Cập nhật mô tả nếu thay đổi
      if (editableCourse.description !== course.description) {
        await courseService.updateCourse(course.id, {
          description: editableCourse.description,
        });
      }

      // (B) So sánh cấu trúc chương/bài xem có thay đổi không
      const serialize = (chapters) =>
        JSON.stringify(
          (chapters || []).map((ch) => ({
            title: ch.title,
            description: ch.description || "",
            lessons: (ch.lessons || []).map((ls) => ({
              title: ls.title,
              description: ls.description || "",
            })),
          }))
        );
      const originalStructure = serialize(course.chapters);
      const editedStructure = serialize(editableCourse.chapters);
      const structureChanged = originalStructure !== editedStructure;

      if (structureChanged) {
        // Xoá toàn bộ chương cũ (sẽ xoá luôn lessons theo cascade BE nếu có)
        for (const ch of course.chapters || []) {
          if (ch.id) {
            try {
              await courseService.removeChapter(ch.id);
            } catch (e) {}
          }
        }
        // Tạo lại toàn bộ chương + bài học với orderIndex mới
        for (let i = 0; i < (editableCourse.chapters || []).length; i++) {
          const ch = editableCourse.chapters[i];
          const createdChapter = await courseService.addChapter(course.id, {
            title: ch.title,
            description: ch.description || "",
            orderIndex: i,
          });
          ch.id = createdChapter.id;
          // Tạo lessons
          for (let li = 0; li < (ch.lessons || []).length; li++) {
            const ls = ch.lessons[li];
            const createdLesson = await courseService.addLesson(ch.id, {
              title: ls.title,
              description: ls.description || "",
              orderIndex: li,
            });
            ls.id = createdLesson.id;
          }
        }
      }

      // (C) Refetch cuối cùng
      const refreshed = await courseService.getCourseDetail(course.id);
      setCourse(refreshed);
      setEditableCourse(deepCloneCourse(refreshed));
      setEditMode(false);
      // Hiển thị toast thành công
      success("Cập nhật khóa học thành công!", "Thành công");
    } catch (e) {
      setErrorMsg("Có lỗi khi lưu thay đổi. Vui lòng thử lại.");
      showError("Có lỗi khi lưu thay đổi. Vui lòng thử lại.", "Lỗi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div
        className="mx-auto"
        style={{ maxWidth: editMode ? "1600px" : "1280px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <BackButton
              to={`/home/admin/subject/${subjectId}`}
              showLabel={false}
            />
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Chi tiết khóa học
              </h1>
            </div>
          </div>
          {!editMode && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center"
              onClick={handleEnterEdit}
            >
              <Pencil className="w-4 h-4 mr-2" /> Chỉnh sửa nội dung
            </Button>
          )}
        </div>

        {errorMsg && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {errorMsg}
          </div>
        )}

        {/* Split layout khi edit */}
        <div
          className={
            editMode ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "space-y-6"
          }
        >
          {/* Preview */}
          <div className="space-y-6">
            <Card className="border border-gray-200 rounded-[14px] bg-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <h2 className="text-xl font-semibold text-neutral-950">
                      {previewSource.title}
                    </h2>
                    {previewSource.description && (
                      <div
                        className="text-sm text-[#45556c] rich-text-content"
                        dangerouslySetInnerHTML={{
                          __html: previewSource.description,
                        }}
                      />
                    )}
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
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
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
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
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Chapters preview */}
            {previewSource.chapters && previewSource.chapters.length > 0 ? (
              <Card className="border border-gray-200 rounded-[14px] bg-white">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-bold text-neutral-950">
                    Chương & Bài học
                  </h3>
                  <div className="space-y-4">
                    {previewSource.chapters.map((ch, idx) => (
                      <div
                        key={ch.id || idx}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Layers className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold">
                            Chương {idx + 1}: {ch.title}
                          </span>
                        </div>
                        {ch.lessons && ch.lessons.length > 0 ? (
                          <ul className="list-disc pl-6 text-sm text-[#45556c]">
                            {ch.lessons.map((ls, i) => (
                              <li key={ls.id || i}>
                                Bài {i + 1}: {ls.title}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-[#62748e]">
                            Chương này chưa có bài học
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-gray-200 rounded-[14px] bg-white">
                <CardContent className="p-6 text-sm text-[#62748e]">
                  Khóa học chưa có dữ liệu chương/bài học.
                </CardContent>
              </Card>
            )}
          </div>
          {/* Edit form */}
          {editMode && (
            <div className="space-y-6">
              {/* Khóa học info (title readonly) */}
              <Card className="border border-gray-200 rounded-[14px] bg-white">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-neutral-950">
                    Chỉnh sửa nội dung
                  </h3>
                  <div>
                    <label className="block text-xs font-medium text-[#62748e] mb-1">
                      Tên khóa học (không thay đổi)
                    </label>
                    <Input
                      value={course.title}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#62748e] mb-1">
                      Mô tả khóa học
                    </label>
                    <RichTextEditor
                      value={editableCourse.description || ""}
                      onChange={(content) => {
                        setEditableCourse((prev) => ({
                          ...prev,
                          description: content,
                        }));
                      }}
                      placeholder="Nhập mô tả khóa học"
                      simple
                      minHeight="150px"
                      maxHeight="300px"
                    />
                  </div>
                </CardContent>
              </Card>
              {/* Chapters editor */}
              <Card className="border border-gray-200 rounded-[14px] bg-white">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-neutral-950">
                      Chương & Bài học
                    </h4>
                    <Button
                      type="button"
                      className="bg-green-600 hover:bg-green-700 text-white h-9 px-3"
                      onClick={addChapter}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Thêm chương
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {(editableCourse.chapters || []).map((ch, idx) => (
                      <div
                        key={ch.id || idx}
                        className="border border-gray-200 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 space-y-2">
                            <label className="block text-[11px] font-medium text-[#62748e]">
                              Tiêu đề chương #{idx + 1}
                            </label>
                            <Input
                              value={ch.title}
                              onChange={(e) =>
                                updateChapterTitle(idx, e.target.value)
                              }
                            />
                            <label className="block text-[11px] font-medium text-[#62748e] mt-2">
                              Mô tả chương
                            </label>
                            <Textarea
                              rows={3}
                              value={stripHtmlTags(ch.description || "")}
                              onChange={(e) =>
                                updateChapterDescription(idx, e.target.value)
                              }
                              placeholder="Nhập mô tả chương..."
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => removeChapter(idx)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        {/* Lessons */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-[#62748e]">
                              Bài học
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-8 px-2 text-xs"
                              onClick={() => addLesson(idx)}
                            >
                              <Plus className="w-3 h-3 mr-1" /> Thêm bài
                            </Button>
                          </div>
                          {(ch.lessons || []).map((ls, li) => (
                            <div
                              key={ls.id || li}
                              className="flex items-center gap-2"
                            >
                              <Input
                                value={ls.title}
                                onChange={(e) =>
                                  updateLessonTitle(idx, li, e.target.value)
                                }
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                className="h-8 px-2 text-red-600 border-red-300 hover:bg-red-50"
                                onClick={() => removeLesson(idx, li)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                          {(!ch.lessons || ch.lessons.length === 0) && (
                            <p className="text-[11px] text-[#62748e] italic">
                              Chưa có bài học nào.
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {(editableCourse.chapters || []).length === 0 && (
                      <p className="text-xs text-[#62748e] italic">
                        Chưa có chương nào. Nhấn "Thêm chương" để bắt đầu.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center"
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />{" "}
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
