import { useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Input } from "../../../components/ui/Input.jsx";
import RichTextEditor from "../../../components/ui/RichTextEditor";
import {
  BookOpen,
  Save,
  Plus,
  Trash2,
  Layers,
  FileText,
  Info,
} from "lucide-react";
import { courseService } from "../../../services/course/course.service";
import { BackButton } from "../../../components/common/BackButton";
import { useToast } from "../../../hooks/use-toast";

export default function CourseOfSubjectCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: subjectId } = useParams();
  const { success, error: showError } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Lấy tên môn học từ state được truyền từ SubjectDetail
  const subjectName = location.state?.subjectName || "";
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
        { title: "", orderIndex: ch.lessons.length },
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
        // Hiển thị toast thành công
        success("Tạo khóa học thành công!", "Thành công");
        // quay lại chi tiết môn học
        setTimeout(() => {
          navigate(`/home/admin/subject/${subjectId}`, { replace: true });
        }, 1000);
      } else {
        setErrorMsg("Không thể tạo khóa học. Vui lòng thử lại.");
        showError("Không thể tạo khóa học. Vui lòng thử lại.", "Lỗi");
      }
    } catch (e) {
      setErrorMsg("Có lỗi khi tạo khóa học. Vui lòng thử lại.");
      showError("Có lỗi khi tạo khóa học. Vui lòng thử lại.", "Lỗi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackButton onClick={handleBack} showLabel={false} />
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tạo khóa học mới
            </h1>
            <p className="text-sm text-gray-500">
              Thuộc môn {subjectName || "đang tải..."}
            </p>
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
                  <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    placeholder="Mô tả chi tiết nội dung và mục tiêu khóa học..."
                    simple
                    minHeight="150px"
                    maxHeight="300px"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Program (Chương & Bài học) - UI giống "Chỉnh sửa nội dung" */}
            <Card className="rounded-[14px]">
              <CardHeader className="px-6 pt-5 pb-4 flex items-center justify-between">
                <CardTitle className="text-base text-neutral-950">
                  Chương & Bài học
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                {/* Danh sách Chương */}
                {chapters.map((ch, chapterIndex) => (
                  <div key={chapterIndex} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-neutral-950">
                        Tiêu đề chương #{chapterIndex + 1}
                      </p>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeChapter(chapterIndex)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Nhập tiêu đề chương"
                      value={ch.title}
                      onChange={(e) =>
                        changeChapterField(
                          chapterIndex,
                          "title",
                          e.target.value
                        )
                      }
                    />
                    <div className="mt-4">
                      <p className="text-sm font-medium text-neutral-950 mb-2">
                        Mô tả chương
                      </p>
                      <RichTextEditor
                        value={ch.description}
                        onChange={(value) =>
                          changeChapterField(chapterIndex, "description", value)
                        }
                        placeholder="Nhập mô tả cho chương (không bắt buộc)"
                        simple={true}
                        minHeight="100px"
                        maxHeight="180px"
                      />
                    </div>

                    {/* Bài học */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-neutral-950">
                          Bài học
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => addLesson(chapterIndex)}
                        >
                          <Plus className="w-4 h-4" /> Thêm bài
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {(ch.lessons || []).map((ls, lessonIndex) => (
                          <div
                            key={lessonIndex}
                            className="flex items-center gap-2"
                          >
                            <Input
                              placeholder={`Bài ${lessonIndex + 1}`}
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
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                removeLesson(chapterIndex, lessonIndex)
                              }
                              className="text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Trạng thái trống + nút Thêm chương ở cuối */}
                {chapters.length === 0 && (
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-medium text-neutral-950 mb-2 text-center">
                      Chưa có chương nào
                    </p>
                    <p className="text-[12px] text-[#62748e] mb-3 text-center">
                      Hãy bắt đầu bằng việc thêm chương đầu tiên.
                    </p>
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={addChapter}
                      >
                        <Plus className="w-4 h-4" /> Thêm chương
                      </Button>
                    </div>
                  </div>
                )}

                {/* Nút Thêm chương luôn ở cuối danh sách khi đã có chương */}
                {chapters.length > 0 && (
                  <div className="pt-2 flex justify-center">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={addChapter}
                    >
                      <Plus className="w-4 h-4" /> Thêm chương
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Footer hành động: luôn dưới cùng của form chính */}
            <div className="mt-6 border-t pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
              <Button variant="outline" onClick={handleBack} disabled={saving}>
                Hủy
              </Button>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center"
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />{" "}
                {saving ? "Đang lưu..." : "Tạo khóa học"}
              </Button>
            </div>
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
                  <li>Mỗi chương cần có ít nhất 1 bài học (chỉ tiêu đề).</li>
                  <li>
                    Khóa học tạo trong Môn học sẽ không xuất hiện trong mục Khóa
                    học.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
