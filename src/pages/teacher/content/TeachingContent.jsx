// src/pages/teacher/TeachingContent.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../hooks/use-toast";
import { useAuth } from "../../../hooks/useAuth";

// Chuyển sang dùng teacherService để lấy được subjectIds chuẩn thay vì map tên → id
import { teacherService } from "../../../services/teacher/teacher.service";
import { teacherProfileService } from "../../../services/teacher/teacher.profile.service"; // fallback legacy
import { getAllSubjects } from "../../../services/subject/subject.api"; // fallback legacy
import { courseService } from "../../../services/course/course.service";

import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Input } from "../../../components/ui/Input.jsx";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui/Select.jsx";
import {
  BookOpen,
  Layers,
  FileText,
  CheckCircle2,
  AlertCircle,
  Search,
} from "lucide-react";

function statusCfgOf(status) {
  const s = String(status || "").toUpperCase();
  if (s === "APPROVED")
    return {
      label: "Đang hoạt động",
      className: "bg-green-50 text-green-700 border border-green-200",
      Icon: CheckCircle2,
    };
  if (s === "ARCHIVED")
    return {
      label: "Đã lưu trữ",
      className: "bg-gray-100 text-gray-600 border border-gray-200",
      Icon: AlertCircle,
    };
  return {
    label: "Đang hoạt động",
    className: "bg-green-50 text-green-700 border border-green-200",
    Icon: CheckCircle2,
  };
}

function normalizeText(s = "") {
  // Simple normalize: lower-case and trim; could extend to remove diacritics if needed
  return String(s).toLowerCase().trim();
}

export default function TeachingContent() {
  const { error } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [subjectOptions, setSubjectOptions] = useState([]); // {id, name}
  const [courses, setCourses] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [q, setQ] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Lấy teacher response để có subjectIds & subjectNames chính xác
        const teacherResp = await teacherService.getByUserId(user.id);
        if (ignore) return;

        let subjectIds = Array.isArray(teacherResp?.subjectIds)
          ? teacherResp.subjectIds
          : teacherResp?.subjectId
          ? [teacherResp.subjectId]
          : [];
        const subjectNames = Array.isArray(teacherResp?.subjectNames)
          ? teacherResp.subjectNames
          : teacherResp?.subjectName
          ? [teacherResp.subjectName]
          : [];

        // Nếu không lấy được subjectIds (legacy hoặc dữ liệu còn thiếu) → fallback map theo tên
        let opts = subjectIds.map((id, idx) => ({
          id,
          name: subjectNames[idx] || `Môn ${id}`,
        }));

        if (subjectIds.length === 0) {
          try {
            const [legacyProfile, allSubjects] = await Promise.all([
              teacherProfileService.getProfile(),
              getAllSubjects(),
            ]);
            const rawSubjects = allSubjects?.data || allSubjects || [];
            const list = rawSubjects.map((s) => ({
              id: s.id ?? s.subjectId,
              name:
                s.name ??
                s.subjectName ??
                s.tenMon ??
                s.code ??
                s.subjectCode ??
                "",
            }));
            const legacyNames = String(legacyProfile?.subject || "")
              .split(",")
              .map((x) => normalizeText(x))
              .filter(Boolean);
            subjectIds = list
              .filter((s) => legacyNames.includes(normalizeText(s.name)))
              .map((s) => s.id);
            opts = list.filter((s) => subjectIds.includes(s.id));
          } catch (legacyErr) {}
        }
        setSubjectOptions(opts);

        // Fetch courses theo từng subjectId song song
        const results = await Promise.all(
          subjectIds.map((sid) => courseService.getCoursesBySubject(sid))
        );

        const merged = [];
        results.forEach((arr, idx) => {
          const sid = subjectIds[idx];
          const sname = opts.find((s) => s.id === sid)?.name || "";
          (Array.isArray(arr) ? arr : []).forEach((c) => {
            const hasSourceTag = String(c.description || "").includes(
              "[[SOURCE:"
            );
            const isPersonal = c && c.ownerTeacherId != null;
            if (!hasSourceTag && !isPersonal) {
              merged.push({
                ...c,
                _subjectId: sid,
                subjectName: c.subjectName || sname,
              });
            }
          });
        });
        setCourses(merged);
      } catch (e) {
        if (!ignore) error("Không thể tải nội dung giảng dạy");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [error, user]);

  const visible = useMemo(() => {
    let list = [...courses];
    if (subjectFilter !== "ALL") {
      list = list.filter((c) => String(c._subjectId) === String(subjectFilter));
    }
    if (q.trim()) {
      const kw = normalizeText(q);
      list = list.filter(
        (c) =>
          normalizeText(c.title).includes(kw) ||
          normalizeText(c.subjectName).includes(kw)
      );
    }
    return list;
  }, [courses, subjectFilter, q]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-200">
          <BookOpen className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Nội dung giảng dạy
          </h1>
          <p className="text-sm text-gray-500">
            Xem các khóa học đã được admin phê duyệt cho bộ môn bạn phụ trách.
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <Card className="p-4 rounded-[14px] border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex-1 w-full">
            <label className="text-[12px] text-[#62748e] mb-1 block">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#62748e]" />
              <Input
                placeholder="Nhập tên khóa học hoặc môn học..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <label className="text-[12px] text-[#62748e] mb-1 block">
              Bộ môn
            </label>
            <Select
              value={subjectFilter}
              onValueChange={(v) => setSubjectFilter(v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Lọc theo bộ môn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả bộ môn</SelectItem>
                {subjectOptions
                  .filter((s) =>
                    courses.some((c) => String(c._subjectId) === String(s.id))
                  )
                  .map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* LIST */}
      {loading && (
        <Card className="rounded-[14px] p-6 text-[13px] text-[#62748e]">
          Đang tải nội dung giảng dạy...
        </Card>
      )}

      {!loading && visible.length === 0 && (
        <Card className="rounded-[14px] border-2 border-dashed border-gray-200 bg-gray-50 py-10 text-center">
          <CardContent>
            <div className="w-16 h-16 rounded-full border border-gray-300 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 text-[#62748e]" />
            </div>
            <p className="text-sm font-medium text-neutral-950 mb-1">
              Chưa có khóa học phù hợp
            </p>
            <p className="text-[12px] text-[#45556c]">
              Hãy cập nhật bộ môn tại trang "Quản lý hồ sơ" nếu chưa thiết lập.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && visible.length > 0 && (
        <div className="space-y-4">
          {visible.map((course) => {
            const cfg = statusCfgOf(course.status);
            const ChapterIcon = Layers;
            const LessonIcon = FileText;
            const StatusIcon = cfg.Icon;

            const chapterCount =
              course.chapterCount ??
              (course.chapters ? course.chapters.length : 0);
            const lessonCount =
              course.lessonCount ??
              (course.chapters
                ? course.chapters.reduce(
                    (sum, ch) => sum + (ch.lessons?.length || 0),
                    0
                  )
                : 0);

            return (
              <Card
                key={course.id}
                className="rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors"
              >
                <CardContent className="p-6 pt-7 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-neutral-950">
                        {course.title}
                      </h3>
                      <p className="text-[12px] text-[#62748e]">
                        {course.subjectName || ""}
                      </p>
                      {course.description && (
                        <div
                          className="text-sm text-[#45556c] line-clamp-2 rich-text-content"
                          dangerouslySetInnerHTML={{
                            __html: course.description,
                          }}
                        />
                      )}
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${cfg.className}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        <span>{cfg.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                        <ChapterIcon className="w-4 h-4 text-blue-600" />
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
                        <LessonIcon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-[#62748e]">Số bài học</p>
                        <p className="text-sm font-semibold text-neutral-950">
                          {lessonCount}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      className="bg-[#155dfc] hover:bg-[#0f4ad1] text-white"
                      onClick={() =>
                        navigate(`/home/teacher/content/${course.id}`)
                      }
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
