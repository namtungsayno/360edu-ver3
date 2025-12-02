import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../hooks/use-toast";
import { attendanceService } from "../../services/attendance/attendance.service";
import sessionService from "../../services/class/session.service";
import { Card, CardContent } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Textarea } from "../../components/ui/Textarea.jsx";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/Select.jsx";
import {
  ArrowLeft,
  Save,
  Calendar,
  Users,
  Check,
  X,
  Clock,
  MapPin,
  BookOpen,
  User as UserIcon,
  FileText,
  Layers,
  Plus,
} from "lucide-react";
import { scheduleService } from "../../services/schedule/schedule.service";
import { courseService } from "../../services/course/course.service";
import { classService } from "../../services/class/class.service";
// Personal course versions flow removed per new business logic
import { useAuth } from "../../hooks/useAuth";

export default function ClassDetail() {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [searchParams] = useSearchParams();
  useAuth();
  const slotId = searchParams.get("slotId");
  const slotIdNum = slotId ? parseInt(slotId, 10) : null;
  const sessionIdParam = searchParams.get("sessionId");
  // Local date helpers to avoid UTC shift
  const toLocalYmd = (d) => {
    const dt = new Date(d);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
  const parseLocalDate = (str) => {
    if (!str) return null;
    const parts = String(str).split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return new Date(str);
    const [y, m, d] = parts;
    return new Date(y, m - 1, d);
  };
  const sessionDateStr = searchParams.get("date") || toLocalYmd(new Date());
  const todayStr = toLocalYmd(new Date());
  const isFutureSession = (() => {
    try {
      const s = parseLocalDate(sessionDateStr);
      const t = parseLocalDate(todayStr);
      if (!s || !t) return false;
      t.setHours(0, 0, 0, 0);
      s.setHours(0, 0, 0, 0);
      return s > t;
    } catch {
      return false;
    }
  })();
  const { success, error } = useToast();
  const [classDetail, setClassDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [originalDetails, setOriginalDetails] = useState([]);

  // Lesson content states
  const [courseData, setCourseData] = useState(null); // always the class's assigned (admin) course used for chapter/lesson selection
  const [usingPersonalCourse, setUsingPersonalCourse] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [savingContent, setSavingContent] = useState(false);
  const [contentEditMode, setContentEditMode] = useState(true);
  const [hasExistingContent, setHasExistingContent] = useState(false);
  // Flag to prevent clearing hydrated selections on initial personal course load
  const [hydratedSelections, setHydratedSelections] = useState(false);
  // Fields to hydrate from backend
  const [baseCourseIdState, setBaseCourseIdState] = useState(null);
  const [classCourseIdState, setClassCourseIdState] = useState(null);
  // Track explicit source type for saving
  const sourceType = usingPersonalCourse ? "CLASS_PERSONAL" : "ADMIN";
  useEffect(() => {
    if (!classId) return;

    (async () => {
      try {
        setLoading(true);
        // Load attendance theo ngày phiên học (từ URL) + slotId
        console.log("ClassDetail loading:", {
          classId,
          date: sessionDateStr,
          slotId,
          slotIdNum,
        });

        const attendance = sessionIdParam
          ? await attendanceService.getBySession(parseInt(sessionIdParam, 10))
          : await attendanceService.getByClass(
              classId,
              sessionDateStr,
              slotIdNum
            );
        setAttendanceDetails(attendance);
        setOriginalDetails(attendance);
        // Auto-enter edit mode if nothing marked yet
        if (
          attendance.every((a) => !a.status || a.status === "-") &&
          !isFutureSession
        ) {
          setEditMode(true);
        }

        // Get class info from schedule (we need to fetch schedule to get class details)
        // For now, we'll get it from URL state or fetch all schedule
        const allSchedule = await scheduleService.getScheduleBySemester("all");
        const classInfo = allSchedule.find(
          (item) => String(item.classId) === String(classId)
        );

        if (classInfo) {
          console.log("📚 Class Info Loaded:", classInfo);
          setClassDetail({
            ...classInfo,
            studentCount: attendance.length,
          });

          // Capture classCourseId from schedule.originalClass if provided
          const ccIdFromSchedule =
            classInfo?.originalClass?.classCourseId ||
            classInfo?.classCourseId ||
            null;
          if (ccIdFromSchedule) {
            setClassCourseIdState(String(ccIdFromSchedule));
          }

          // Chuẩn bị nguồn course: course gốc admin làm mặc định
          if (classInfo.courseId) {
            try {
              const adminCourse = await courseService.getCourseDetail(
                classInfo.courseId
              );
              setCourseData(adminCourse);
              setUsingPersonalCourse(false);
            } catch (err) {
              console.error("Prepare course sources failed:", err);
            }
          }

          // Load saved lesson content if exists (and hydrate UI state)
          try {
            const savedContent = sessionIdParam
              ? await sessionService.getSessionContent(
                  parseInt(sessionIdParam, 10)
                )
              : await sessionService.getSessionContentByClassDate(
                  classId,
                  sessionDateStr,
                  slotIdNum
                );

            if (savedContent) {
              console.log("📝 Saved Content Loaded:", savedContent);
              // Base course id
              if (savedContent.baseCourseId) {
                setBaseCourseIdState(savedContent.baseCourseId);
              }
              // Source toggle
              if (savedContent.sourceType === "CLASS_PERSONAL") {
                setUsingPersonalCourse(true);
              } else {
                setUsingPersonalCourse(false);
              }
              // Hydration: prefer explicit ids for CLASS_PERSONAL; else fallback
              const classCourseId = savedContent.classCourseId;
              setClassCourseIdState(classCourseId || null);
              const selectedCourseId =
                savedContent.selectedCourseId ||
                (savedContent.sourceType === "CLASS_PERSONAL"
                  ? classCourseId
                  : savedContent.baseCourseId);

              if (
                savedContent.sourceType === "CLASS_PERSONAL" &&
                classCourseId
              ) {
                try {
                  const detail = await courseService.getCourseDetail(
                    classCourseId
                  );
                  setCourseData(detail);
                  // After loading chapters/lessons, set explicit selections
                  if (savedContent.chapterId) {
                    setSelectedChapterId(String(savedContent.chapterId));
                  } else if (
                    Array.isArray(savedContent.linkedChapterIds) &&
                    savedContent.linkedChapterIds.length > 0
                  ) {
                    setSelectedChapterId(
                      String(savedContent.linkedChapterIds[0])
                    );
                  }
                  if (savedContent.lessonId) {
                    setSelectedLessonId(String(savedContent.lessonId));
                  } else if (
                    Array.isArray(savedContent.linkedLessonIds) &&
                    savedContent.linkedLessonIds.length > 0
                  ) {
                    setSelectedLessonId(
                      String(savedContent.linkedLessonIds[0])
                    );
                  }
                  setHydratedSelections(true);
                  console.log("Hydrated CLASS_PERSONAL selections", {
                    classCourseId,
                    chapterId:
                      savedContent.chapterId ||
                      savedContent.linkedChapterIds?.[0],
                    lessonId:
                      savedContent.lessonId ||
                      savedContent.linkedLessonIds?.[0],
                  });
                } catch (e) {
                  console.error("Failed to load personal course detail:", e);
                  error(
                    "Khóa học lớp đã bị xóa hoặc không khả dụng. Chuyển về khóa học gốc."
                  );
                  setUsingPersonalCourse(false);
                  const baseId =
                    savedContent.baseCourseId || classDetail?.courseId;
                  if (baseId) {
                    try {
                      const adminDetail = await courseService.getCourseDetail(
                        baseId
                      );
                      setCourseData(adminDetail);
                      setSelectedChapterId("");
                      setSelectedLessonId("");
                    } catch (err) {
                      console.error("Fallback load base course failed:", err);
                    }
                  }
                }
              } else if (
                savedContent.sourceType === "CLASS_PERSONAL" &&
                !classCourseId
              ) {
                // Backend chưa trả classCourseId: tự resolve từ lớp
                try {
                  let resolvedCcId =
                    classInfo?.originalClass?.classCourseId ||
                    classInfo?.classCourseId ||
                    null;
                  if (!resolvedCcId && classId) {
                    const cls = await classService.getById(classId);
                    resolvedCcId =
                      cls?.classCourseId || cls?.classCourse?.id || null;
                  }
                  if (resolvedCcId) {
                    setClassCourseIdState(String(resolvedCcId));
                    const detail = await courseService.getCourseDetail(
                      resolvedCcId
                    );
                    setCourseData(detail);
                    if (savedContent.chapterId) {
                      setSelectedChapterId(String(savedContent.chapterId));
                    } else if (
                      Array.isArray(savedContent.linkedChapterIds) &&
                      savedContent.linkedChapterIds.length > 0
                    ) {
                      setSelectedChapterId(
                        String(savedContent.linkedChapterIds[0])
                      );
                    }
                    if (savedContent.lessonId) {
                      setSelectedLessonId(String(savedContent.lessonId));
                    } else if (
                      Array.isArray(savedContent.linkedLessonIds) &&
                      savedContent.linkedLessonIds.length > 0
                    ) {
                      setSelectedLessonId(
                        String(savedContent.linkedLessonIds[0])
                      );
                    }
                    setHydratedSelections(true);
                    console.log(
                      "Hydrated CLASS_PERSONAL (resolved classCourseId) selections",
                      {
                        classCourseId: resolvedCcId,
                        chapterId:
                          savedContent.chapterId ||
                          savedContent.linkedChapterIds?.[0],
                        lessonId:
                          savedContent.lessonId ||
                          savedContent.linkedLessonIds?.[0],
                      }
                    );
                  }
                } catch (e) {
                  console.error(
                    "Resolve/load classCourseId for CLASS_PERSONAL failed:",
                    e
                  );
                }
              } else if (selectedCourseId) {
                try {
                  const detail = await courseService.getCourseDetail(
                    selectedCourseId
                  );
                  setCourseData(detail);
                  // Restore chapter/lesson selections from admin-linked IDs
                  if (
                    Array.isArray(savedContent.linkedChapterIds) &&
                    savedContent.linkedChapterIds.length > 0
                  ) {
                    setSelectedChapterId(
                      String(savedContent.linkedChapterIds[0])
                    );
                  }
                  if (
                    Array.isArray(savedContent.linkedLessonIds) &&
                    savedContent.linkedLessonIds.length > 0
                  ) {
                    setSelectedLessonId(
                      String(savedContent.linkedLessonIds[0])
                    );
                  }
                  setHydratedSelections(true);
                  console.log("Hydrated ADMIN selections", {
                    chapterId: savedContent.linkedChapterIds?.[0],
                    lessonId: savedContent.linkedLessonIds?.[0],
                  });
                } catch (e) {
                  console.error("Failed to load selected course detail:", e);
                }
              }
              // Set lesson content text
              if (savedContent.content) {
                setLessonContent(savedContent.content);
                setHasExistingContent(true);
                // After reload, default to VIEW mode
                setContentEditMode(false);
              }
            } else {
              setContentEditMode(true); // Edit mode if no content
            }
          } catch (err) {
            // No saved content found yet - allow editing
            console.log("No saved content for date:", err.message);
            setContentEditMode(true);
          }
        }
      } catch (e) {
        console.error("Failed to load class details:", e);
        error("Không thể tải thông tin lớp học");
      } finally {
        setLoading(false);
      }
    })();
  }, [
    classId,
    error,
    sessionDateStr,
    slotId,
    sessionIdParam,
    isFutureSession,
    classDetail?.courseId,
  ]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceDetails((prev) =>
      prev.map((record) =>
        record.id === studentId ? { ...record, status } : record
      )
    );
    setHasChanges(true);
  };

  const handleNoteChange = (studentId, note) => {
    setAttendanceDetails((prev) =>
      prev.map((record) =>
        record.id === studentId ? { ...record, note } : record
      )
    );
    setHasChanges(true);
  };

  const handleSaveAttendance = async () => {
    try {
      if (isFutureSession) {
        error("Chưa đến ngày diễn ra buổi học, không thể điểm danh.");
        return;
      }
      // Filter students that have attendance marked (status not "-")
      const attendanceData = attendanceDetails
        .filter((record) => record.status && record.status !== "-")
        .map((record) => ({
          studentId: record.id,
          status: record.status,
          note: record.note || "",
        }));

      if (attendanceData.length === 0) {
        error(
          "Vui l\u00f2ng \u0111i\u1ec3m danh \u00edt nh\u1ea5t m\u1ed9t h\u1ecdc vi\u00ean"
        );
        return;
      }

      const date = sessionDateStr;
      const slotIdNum = slotId ? parseInt(slotId, 10) : null;
      console.log("Saving attendance:", {
        classId,
        date,
        slotId,
        slotIdNum,
        sessionIdParam,
      });

      if (sessionIdParam) {
        await attendanceService.saveBySession(
          parseInt(sessionIdParam, 10),
          attendanceData
        );
      } else {
        await attendanceService.saveAttendance(
          classId,
          date,
          attendanceData,
          slotIdNum
        );
      }

      setHasChanges(false);
      success("Lưu điểm danh thành công!");

      // Reload to reflect persisted statuses
      const refreshed = sessionIdParam
        ? await attendanceService.getBySession(parseInt(sessionIdParam, 10))
        : await attendanceService.getByClass(classId, date, slotIdNum);
      setAttendanceDetails(refreshed);
      setOriginalDetails(refreshed);
      setEditMode(false);
    } catch (err) {
      console.error("Error saving attendance:", err);
      const backendMsg =
        (typeof err.response?.data === "string" && err.response.data) ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message;
      error(backendMsg || "Có lỗi xảy ra khi lưu điểm danh");
    }
  };

  const handleSaveLessonContent = async () => {
    try {
      // Validate
      if (!selectedChapterId) {
        error("Vui lòng chọn chương học");
        return;
      }
      if (!selectedLessonId) {
        error("Vui lòng chọn bài học");
        return;
      }
      if (!lessonContent.trim()) {
        error("Vui lòng nhập nội dung buổi học");
        return;
      }

      setSavingContent(true);
      const body = {
        chapterIds: [parseInt(selectedChapterId, 10)],
        lessonIds: [parseInt(selectedLessonId, 10)],
        content: lessonContent.trim(),
        // include source metadata so BE can persist selection source
        sourceType,
        ...(sourceType === "CLASS_PERSONAL" && classCourseIdState
          ? { classCourseId: parseInt(classCourseIdState, 10) }
          : {}),
        ...(sourceType === "ADMIN"
          ? { courseId: baseCourseIdState || classDetail?.courseId }
          : {}),
        chapterId: parseInt(selectedChapterId, 10),
        lessonId: parseInt(selectedLessonId, 10),
      };

      if (sessionIdParam) {
        await sessionService.saveSessionContentBySessionId(
          parseInt(sessionIdParam, 10),
          body
        );
      } else {
        await sessionService.saveSessionContent({
          classId,
          date: sessionDateStr,
          slotId: slotIdNum,
          chapterIds: body.chapterIds,
          lessonIds: body.lessonIds,
          content: body.content,
          sourceType,
          classCourseId:
            sourceType === "CLASS_PERSONAL" && classCourseIdState
              ? parseInt(classCourseIdState, 10)
              : undefined,
          courseId:
            sourceType === "ADMIN"
              ? baseCourseIdState || classDetail?.courseId
              : undefined,
          chapterId: parseInt(selectedChapterId, 10),
          lessonId: parseInt(selectedLessonId, 10),
        });
      }

      success("Đã lưu nội dung buổi học thành công!");
      setHasExistingContent(true);
      setContentEditMode(false); // Lock after save
    } catch (err) {
      console.error("Error saving lesson content:", err);
      error("Có lỗi xảy ra khi lưu nội dung buổi học");
    } finally {
      setSavingContent(false);
    }
  };

  const selectedChapter = courseData?.chapters?.find(
    (ch) => String(ch.id) === String(selectedChapterId)
  );

  // When toggling to CLASS_PERSONAL, try to load class course if known
  useEffect(() => {
    const loadClassCourse = async () => {
      if (!usingPersonalCourse) return;
      if (!classCourseIdState) return;
      try {
        const detail = await courseService.getCourseDetail(classCourseIdState);
        setCourseData(detail);
        if (!hydratedSelections) {
          setSelectedChapterId("");
          setSelectedLessonId("");
        }
      } catch (e) {
        console.error("Load class course detail failed:", e);
      }
    };
    loadClassCourse();
  }, [usingPersonalCourse, classCourseIdState, hydratedSelections]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Không tìm thấy thông tin lớp học</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-[#45556c] hover:text-neutral-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
        </div>

        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-950">
            Chi tiết buổi học
          </h1>
          <p className="text-sm text-[#45556c] mt-1">
            {classDetail.subjectName}
          </p>
        </div>

        {/* Class Info Card */}
        <Card className="border border-gray-200 rounded-[14px] bg-white">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-neutral-950 mb-4">
              Thông tin buổi học
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tên lớp */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[12px] text-[#62748e] font-medium">
                    Tên lớp
                  </p>
                  <p className="text-[14px] text-neutral-950 font-semibold mt-1">
                    {classDetail.classFullName || classDetail.className}
                  </p>
                </div>
              </div>

              {/* Giáo viên */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[12px] text-[#62748e] font-medium">
                    Giáo viên
                  </p>
                  <p className="text-[14px] text-neutral-950 font-semibold mt-1">
                    {classDetail.teacherName}
                  </p>
                </div>
              </div>

              {/* Môn học */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[12px] text-[#62748e] font-medium">
                    Môn học
                  </p>
                  <p className="text-[14px] text-neutral-950 font-semibold mt-1">
                    {classDetail.subjectName}
                  </p>
                  {/* Course Info */}
                  {classDetail.courseTitle && (
                    <div className="flex items-center gap-1 mt-1">
                      <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                        📚 {classDetail.courseTitle}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Loại lớp */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    classDetail.isOnline ? "bg-purple-100" : "bg-green-100"
                  }`}
                >
                  <MapPin
                    className={`w-5 h-5 ${
                      classDetail.isOnline
                        ? "text-purple-600"
                        : "text-green-600"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-[12px] text-[#62748e] font-medium">
                    Loại lớp
                  </p>
                  <Badge
                    className={`mt-1 border-0 font-semibold ${
                      classDetail.isOnline
                        ? "bg-purple-100 text-purple-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {classDetail.isOnline ? "Online" : "Offline"}
                  </Badge>
                </div>
              </div>

              {/* Phòng học */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-[12px] text-[#62748e] font-medium">
                    Phòng học
                  </p>
                  <p className="text-[14px] text-neutral-950 font-semibold mt-1">
                    {classDetail.isOnline
                      ? "Phòng Online"
                      : classDetail.room ||
                        classDetail.roomName ||
                        "Chưa xếp phòng"}
                  </p>
                </div>
              </div>

              {/* Sĩ số */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-[12px] text-[#62748e] font-medium">
                    Sĩ số
                  </p>
                  <p className="text-[14px] text-neutral-950 font-semibold mt-1">
                    {classDetail.studentCount || 0}/
                    {classDetail.maxStudents || 0}
                  </p>
                </div>
              </div>

              {/* Thời gian */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[12px] text-[#62748e] font-medium">
                    Thời gian
                  </p>
                  <p className="text-[14px] text-neutral-950 font-semibold mt-1">
                    {classDetail.startTime} - {classDetail.endTime}
                  </p>
                </div>
              </div>

              {/* Lịch học */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-[12px] text-[#62748e] font-medium">
                    Lịch học
                  </p>
                  <p className="text-[14px] text-neutral-950 font-semibold mt-1">
                    {classDetail.dayName}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Tổng số */}
          <div className="bg-white border border-gray-200 rounded-[14px] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] text-[#62748e] font-medium">
                  Tổng số
                </p>
                <p className="text-2xl font-bold text-neutral-950 mt-1">
                  {attendanceDetails.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Có mặt */}
          <div className="bg-white border border-gray-200 rounded-[14px] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] text-[#62748e] font-medium">Có mặt</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {
                    attendanceDetails.filter((a) => a.status === "present")
                      .length
                  }
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          {/* Vắng mặt */}
          <div className="bg-white border border-gray-200 rounded-[14px] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] text-[#62748e] font-medium">
                  Vắng mặt
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {
                    attendanceDetails.filter((a) => a.status === "absent")
                      .length
                  }
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>

          {/* Muộn */}
          <div className="bg-white border border-gray-200 rounded-[14px] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] text-[#62748e] font-medium">Muộn</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {attendanceDetails.filter((a) => a.status === "late").length}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Student Attendance List */}
        <Card className="border border-gray-200 rounded-[14px] bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-neutral-950">
                  Danh sách điểm danh ({attendanceDetails.length} học viên)
                </h2>
                <p className="text-[12px] text-[#62748e] mt-1">
                  <span className="text-green-600 font-semibold">
                    {
                      attendanceDetails.filter((a) => a.status === "present")
                        .length
                    }{" "}
                    có mặt
                  </span>
                  ,{" "}
                  <span className="text-red-600 font-semibold">
                    {
                      attendanceDetails.filter((a) => a.status === "absent")
                        .length
                    }{" "}
                    vắng
                  </span>
                  ,{" "}
                  <span className="text-orange-600 font-semibold">
                    {
                      attendanceDetails.filter((a) => a.status === "late")
                        .length
                    }{" "}
                    muộn
                  </span>
                </p>
              </div>
              {editMode ? (
                <div className="flex gap-3">
                  {hasChanges && (
                    <Button
                      onClick={handleSaveAttendance}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Lưu điểm danh
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAttendanceDetails(originalDetails);
                      setHasChanges(false);
                      setEditMode(false);
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => !isFutureSession && setEditMode(true)}
                  disabled={isFutureSession}
                  className={`text-white ${
                    isFutureSession
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isFutureSession ? "Chưa đến ngày học" : "Sửa điểm danh"}
                </Button>
              )}
            </div>

            {/* Student List */}
            <div className="space-y-3">
              {attendanceDetails.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">Chưa có học viên nào trong lớp</p>
                </div>
              ) : (
                attendanceDetails.map((record, index) => (
                  <div
                    key={record.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* STT & Avatar */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500 w-6">
                          {index + 1}
                        </span>
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-6 h-6 text-gray-500" />
                        </div>
                      </div>

                      {/* Student Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-neutral-950">
                          {record.student}
                        </p>
                        <p className="text-[12px] text-[#62748e]">
                          {record.studentCode || `HS00${index + 1}`}
                        </p>
                      </div>

                      {/* Attendance Status Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            editMode &&
                            handleAttendanceChange(record.id, "present")
                          }
                          disabled={!editMode}
                          className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-colors ${
                            record.status === "present"
                              ? "bg-green-100 text-green-700 border-2 border-green-600"
                              : editMode
                              ? "bg-gray-100 hover:bg-green-50 text-gray-600 border border-gray-200"
                              : "bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed"
                          }`}
                        >
                          <Check className="w-4 h-4 inline mr-1" />
                          Có mặt
                        </button>

                        <button
                          onClick={() =>
                            editMode &&
                            handleAttendanceChange(record.id, "absent")
                          }
                          disabled={!editMode}
                          className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-colors ${
                            record.status === "absent"
                              ? "bg-red-100 text-red-700 border-2 border-red-600"
                              : editMode
                              ? "bg-gray-100 hover:bg-red-50 text-gray-600 border border-gray-200"
                              : "bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed"
                          }`}
                        >
                          <X className="w-4 h-4 inline mr-1" />
                          Vắng
                        </button>

                        <button
                          onClick={() =>
                            editMode &&
                            handleAttendanceChange(record.id, "late")
                          }
                          disabled={!editMode}
                          className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-colors ${
                            record.status === "late"
                              ? "bg-orange-100 text-orange-700 border-2 border-orange-600"
                              : editMode
                              ? "bg-gray-100 hover:bg-orange-50 text-gray-600 border border-gray-200"
                              : "bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed"
                          }`}
                        >
                          <Clock className="w-4 h-4 inline mr-1" />
                          Muộn
                        </button>
                      </div>

                      {/* Note Input */}
                      <div className="w-48">
                        {editMode ? (
                          <input
                            type="text"
                            value={record.note || ""}
                            onChange={(e) =>
                              handleNoteChange(record.id, e.target.value)
                            }
                            placeholder="Ghi chú..."
                            className="w-full px-3 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <span className="text-[12px] text-[#62748e]">
                            {record.note || ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-[12px] text-[#45556c] font-medium mb-2">
            Chú thích:
          </p>
          <div className="flex items-center gap-6 text-[12px]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-[#45556c]">Có mặt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-[#45556c]">Vắng mặt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-[#45556c]">Muộn</span>
            </div>
          </div>
        </div>

        {/* Lesson Content Section */}
        {courseData ? (
          <Card className="border border-gray-200 rounded-[14px] bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-neutral-950 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Ghi nội dung buổi học
                  </h2>
                  <p className="text-[12px] text-[#62748e] mt-1">
                    Chọn chương và bài học đang giảng dạy, sau đó ghi rõ nội
                    dung
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Course Info */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-[12px] text-purple-700 font-medium">
                        Chương trình học
                      </p>
                      <p className="text-[14px] text-purple-900 font-semibold mt-0.5">
                        {courseData.title}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant={usingPersonalCourse ? "default" : "outline"}
                          className={`h-9 ${
                            usingPersonalCourse
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : ""
                          }`}
                          disabled={!contentEditMode}
                          title={
                            !contentEditMode
                              ? "Nhấn 'Sửa nội dung buổi học' để thay đổi nguồn"
                              : undefined
                          }
                          onClick={async () => {
                            if (!contentEditMode) return;
                            // Switching source: ensure fresh selections
                            setHydratedSelections(false);
                            setUsingPersonalCourse(true);
                            // If classCourseId is not known yet, resolve from schedule or fetch class detail
                            let ccId = classCourseIdState;
                            try {
                              if (!ccId) {
                                const fromSchedule =
                                  classDetail?.originalClass?.classCourseId ||
                                  classDetail?.classCourseId ||
                                  null;
                                if (fromSchedule) {
                                  ccId = String(fromSchedule);
                                } else if (classId) {
                                  const cls = await classService.getById(
                                    classId
                                  );
                                  ccId = String(
                                    cls?.classCourseId ||
                                      cls?.classCourse?.id ||
                                      ""
                                  );
                                }
                              }
                            } catch (e) {
                              console.error(
                                "Failed to resolve classCourseId:",
                                e
                              );
                            }

                            if (ccId) {
                              setClassCourseIdState(ccId);
                              try {
                                const detail =
                                  await courseService.getCourseDetail(
                                    parseInt(ccId, 10)
                                  );
                                setCourseData(detail);
                                if (!hydratedSelections) {
                                  setSelectedChapterId("");
                                  setSelectedLessonId("");
                                }
                              } catch (e) {
                                console.error(
                                  "Load class course detail failed:",
                                  e
                                );
                              }
                            }
                          }}
                        >
                          Upload tài liệu từ khóa học cá nhân
                        </Button>
                        <Button
                          type="button"
                          variant={!usingPersonalCourse ? "default" : "outline"}
                          className={`h-9 ${
                            !usingPersonalCourse
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : ""
                          }`}
                          disabled={!contentEditMode}
                          title={
                            !contentEditMode
                              ? "Nhấn 'Sửa nội dung buổi học' để thay đổi nguồn"
                              : undefined
                          }
                          onClick={() => {
                            if (!contentEditMode) return;
                            // Switching source: ensure fresh selections
                            setHydratedSelections(false);
                            // Switch to ADMIN source: always load base course chapters/lessons
                            setUsingPersonalCourse(false);
                            if (classDetail?.courseId) {
                              courseService
                                .getCourseDetail(
                                  parseInt(classDetail.courseId, 10)
                                )
                                .then((adminCourse) => {
                                  setCourseData(adminCourse);
                                  // Reset selections; will be hydrated from saved config on reload
                                  setSelectedChapterId("");
                                  setSelectedLessonId("");
                                })
                                .catch((e) =>
                                  console.error("Load base course failed:", e)
                                );
                            }
                          }}
                        >
                          Upload tài liệu từ Admin đã cung cấp
                        </Button>
                      </div>
                      {/* Personal version selection removed per new flow */}
                      <p className="text-[11px] text-purple-600 mt-0.5">
                        {courseData.chapters?.length || 0} chương ·{" "}
                        {courseData.chapters?.reduce(
                          (sum, ch) => sum + (ch.lessons?.length || 0),
                          0
                        ) || 0}{" "}
                        bài học (nguồn chính)
                      </p>
                      {usingPersonalCourse && classCourseIdState && (
                        <p className="text-[11px] text-green-700 mt-0.5">
                          Đang dùng khóa học lớp (ID: {classCourseIdState})
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chapter Selection */}
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-neutral-950 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Chương học <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedChapterId}
                    onValueChange={(value) => {
                      if (!contentEditMode) return;
                      setSelectedChapterId(value);
                      setSelectedLessonId(""); // Reset lesson when chapter changes
                    }}
                    disabled={!contentEditMode}
                  >
                    <SelectTrigger
                      className={`w-full h-11 text-[13px] ${
                        !contentEditMode ? "pointer-events-none opacity-60" : ""
                      }`}
                    >
                      <SelectValue placeholder="Chọn chương đang học..." />
                    </SelectTrigger>
                    <SelectContent>
                      {courseData.chapters && courseData.chapters.length > 0 ? (
                        courseData.chapters.map((chapter, index) => (
                          <SelectItem
                            key={chapter.id}
                            value={String(chapter.id)}
                            className="text-[13px]"
                          >
                            Chương {index + 1}: {chapter.title}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          Không có chương học
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lesson Selection */}
                {selectedChapterId && selectedChapter && (
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-neutral-950 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      Bài học <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={selectedLessonId}
                      onValueChange={(v) =>
                        contentEditMode && setSelectedLessonId(v)
                      }
                      disabled={!contentEditMode}
                    >
                      <SelectTrigger
                        className={`w-full h-11 text-[13px] ${
                          !contentEditMode
                            ? "pointer-events-none opacity-60"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Chọn bài học đang dạy..." />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedChapter.lessons &&
                        selectedChapter.lessons.length > 0 ? (
                          selectedChapter.lessons.map((lesson, index) => (
                            <SelectItem
                              key={lesson.id}
                              value={String(lesson.id)}
                              className="text-[13px]"
                            >
                              Bài {index + 1}: {lesson.title}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            Chương này chưa có bài học
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Lesson Content Input */}
                {selectedLessonId && (
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-neutral-950 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-purple-600" />
                      Nội dung buổi học <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={lessonContent}
                      onChange={(e) =>
                        contentEditMode && setLessonContent(e.target.value)
                      }
                      readOnly={!contentEditMode}
                      placeholder="Ví dụ: Giảng lý thuyết về cú pháp if-else, thực hành bài tập 1-5, hướng dẫn làm bài tập về nhà..."
                      rows={6}
                      className={`text-[13px] resize-none ${
                        !contentEditMode ? "bg-gray-50" : ""
                      }`}
                    />
                    <p className="text-[11px] text-[#62748e]">
                      Mô tả ngắn gọn về nội dung đã giảng dạy trong buổi học này
                    </p>
                    {!contentEditMode && (
                      <p className="text-[11px] text-[#62748e]">
                        Đang ở chế độ xem. Nhấn "Sửa nội dung buổi học" để thay
                        đổi.
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                {selectedLessonId && (
                  <div className="flex justify-end gap-3 pt-2">
                    {hasExistingContent && !contentEditMode ? (
                      // View mode - show Edit button
                      <Button
                        onClick={() => setContentEditMode(true)}
                        className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Sửa nội dung buổi học
                      </Button>
                    ) : (
                      // Edit mode - show Save and Cancel buttons
                      <>
                        {hasExistingContent && (
                          <Button
                            onClick={() => {
                              setContentEditMode(false);
                              // Optionally reload original content here
                            }}
                            variant="outline"
                            className="h-11 px-6"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Hủy
                          </Button>
                        )}
                        <Button
                          onClick={handleSaveLessonContent}
                          disabled={savingContent}
                          className="h-11 px-6 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          {savingContent ? (
                            <>
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                              Đang lưu...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Lưu nội dung buổi học
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : classDetail?.courseId ? (
          <Card className="border border-gray-200 rounded-[14px] bg-white">
            <CardContent className="p-6 text-center">
              <div className="text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p>Đang tải chương trình học...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-orange-200 rounded-[14px] bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-orange-900">
                    Lớp học chưa có chương trình học
                  </p>
                  <p className="text-[12px] text-orange-700 mt-1">
                    Vui lòng liên hệ Admin để gán chương trình học cho lớp này
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
