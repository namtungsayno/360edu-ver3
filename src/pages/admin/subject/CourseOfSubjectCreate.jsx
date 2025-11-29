import { useMemo, useState } from "react";
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
  BookOpen,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Layers,
  FileText,
  Info,
} from "lucide-react";
import { courseService } from "../../../services/course/course.service";

export default function CourseOfSubjectCreate() {
  const navigate = useNavigate();
  const { id: subjectId } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  // Chương & bài học
  const [chapters, setChapters] = useState([]);
  const totalChapters = chapters.length;
  const totalLessons = useMemo(
    () => chapters.reduce((sum, ch) => sum + ch.lessons.length, 0),
    [chapters]
  );

  const addChapter = () => {
    setChapters((prev) => [
      ...prev,
      { title: "", description: "", orderIndex: prev.length, lessons: [] },
    ]);
  };
  const removeChapter = (index) => {
    setChapters((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((ch, i) => ({ ...ch, orderIndex: i }))
    );
  };
  const changeChapterField = (index, field, value) => {
    setChapters((prev) => {
      const arr = [...prev];
      arr[index] = { ...arr[index], [field]: value };
      return arr;
    });
  };
  const addLesson = (chapterIdx) => {
    setChapters((prev) => {
      const arr = [...prev];
      const ch = { ...arr[chapterIdx] };
      ch.lessons = [
        ...(ch.lessons || []),
        { title: "", description: "", orderIndex: ch.lessons.length },
      ];
      arr[chapterIdx] = ch;
      return arr;
    });
  };
  const removeLesson = (chapterIdx, lessonIdx) => {
    setChapters((prev) => {
      const arr = [...prev];
      const ch = { ...arr[chapterIdx] };
      ch.lessons = (ch.lessons || [])
        .filter((_, i) => i !== lessonIdx)
        .map((ls, i) => ({ ...ls, orderIndex: i }));
      arr[chapterIdx] = ch;
      return arr;
    });
  };
  const changeLessonField = (chapterIdx, lessonIdx, field, value) => {
    setChapters((prev) => {
      const arr = [...prev];
      const ch = { ...arr[chapterIdx] };
      const lessons = [...(ch.lessons || [])];
      lessons[lessonIdx] = { ...lessons[lessonIdx], [field]: value };
      ch.lessons = lessons;
      arr[chapterIdx] = ch;
      return arr;
    });
  };

  const handleBack = () => navigate(`/home/admin/subject/${subjectId}`);

  const validateForm = () => {
    if (!title.trim()) {
      setErrorMsg("Vui lòng nhập tên khóa học");
      return false;
    }
    if (!description.trim()) {
      setErrorMsg("Vui lòng nhập mô tả khóa học");
      return false;
    }
    if (chapters.length === 0) {
      setErrorMsg("Vui lòng thêm ít nhất một chương học");
      return false;
    }
    for (const ch of chapters) {
      if (!ch.title.trim()) {
        setErrorMsg("Mỗi chương cần có tiêu đề");
        return false;
      }
      if ((ch.lessons || []).length === 0) {
        setErrorMsg("Mỗi chương cần có ít nhất 1 bài học");
        return false;
      }
      for (const ls of ch.lessons || []) {
        if (!ls.title.trim()) {
          setErrorMsg("Mỗi bài học cần có tiêu đề");
          return false;
        }
      }
    }
    setErrorMsg("");
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    setErrorMsg("");
    try {
      // Tạo khóa học trong phạm vi môn học, không đi qua module phê duyệt
      const created = await courseService.createCourse({
        subjectId: Number(subjectId),
        title: title.trim(),
        description: description.trim(),
        status: "APPROVED", // Admin tạo: approved ngay (phù hợp nghiệp vụ nội bộ môn học)
      });
      if (created?.id) {
        // Tạo chương & bài học
        for (let i = 0; i < chapters.length; i++) {
          const ch = chapters[i];
          const createdChapter = await courseService.addChapter(created.id, {
            title: ch.title.trim(),
            description: (ch.description || "").trim(),
            orderIndex: i,
          });
          const chapterId = createdChapter?.id;
          if (!chapterId) continue;
          for (let li = 0; li < (ch.lessons || []).length; li++) {
            const ls = ch.lessons[li];
            await courseService.addLesson(chapterId, {
              title: ls.title.trim(),
              description: (ls.description || "").trim(),
              orderIndex: li,
            });
          }
        }
        // quay lại chi tiết môn học
        navigate(`/home/admin/subject/${subjectId}`, { replace: true });
      } else {
        setErrorMsg("Không thể tạo khóa học. Vui lòng thử lại.");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Có lỗi khi tạo khóa học. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-[#45556c] hover:text-neutral-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại môn học</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-950">
              Tạo khóa học mới
            </h1>
            <p className="text-sm text-[#45556c]">Thuộc môn ID #{subjectId}</p>
          </div>
        </div>

        {errorMsg && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {errorMsg}
          </div>
        )}

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
                Tạo khóa học cho môn đang xem
              </p>
              <p className="text-[12px] text-[#45556c]">
                Khóa học sẽ trực thuộc môn này và quản lý trong khu vực Môn học.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 2 columns layout like AdminCourseCreate */}
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
                  Thiết lập các thông tin chính cho khóa học
                </p>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-[12px] text-[#62748e] font-medium">
                    Tên khóa học <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="VD: Toán học THCS - Lớp 6"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] text-[#62748e] font-medium">
                    Mô tả khóa học <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    rows={4}
                    placeholder="Mô tả chi tiết nội dung và mục tiêu khóa học..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
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
                  onClick={addChapter}
                >
                  <Plus className="w-4 h-4" /> Thêm chương
                </Button>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
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
                      onClick={addChapter}
                    >
                      <Plus className="w-4 h-4" /> Thêm chương đầu tiên
                    </Button>
                  </div>
                )}

                {/* Chapters list */}
                <div className="space-y-4">
                  {chapters.map((ch, chapterIndex) => (
                    <Card
                      key={chapterIndex}
                      className="border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                    >
                      <CardContent className="p-5 space-y-4">
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
                              </div>
                              <Input
                                placeholder="Tiêu đề chương"
                                value={ch.title}
                                onChange={(e) =>
                                  changeChapterField(
                                    chapterIndex,
                                    "title",
                                    e.target.value
                                  )
                                }
                              />
                              <Textarea
                                rows={2}
                                placeholder="Mô tả ngắn về nội dung chương này..."
                                value={ch.description}
                                onChange={(e) =>
                                  changeChapterField(
                                    chapterIndex,
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
                            onClick={() => removeChapter(chapterIndex)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Lessons */}
                        <div className="space-y-3">
                          {(ch.lessons || []).map((ls, lessonIndex) => (
                            <div
                              key={lessonIndex}
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
                                  value={ls.title}
                                  onChange={(e) =>
                                    changeLessonField(
                                      chapterIndex,
                                      lessonIndex,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                />
                                <Textarea
                                  rows={2}
                                  placeholder="Giới thiệu ngắn gọn về bài học..."
                                  value={ls.description}
                                  onChange={(e) =>
                                    changeLessonField(
                                      chapterIndex,
                                      lessonIndex,
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
                                  removeLesson(chapterIndex, lessonIndex)
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
                            onClick={() => addLesson(chapterIndex)}
                          >
                            <Plus className="w-4 h-4" /> Thêm bài học
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
                    Khóa học tạo trong Môn học sẽ không xuất hiện trong mục Khóa
                    học.
                  </li>
                </ul>
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
                {saving ? "Đang lưu..." : "Tạo khóa học"}
              </Button>
              <Button variant="outline" onClick={handleBack} disabled={saving}>
                Hủy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
