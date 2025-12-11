import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../../hooks/use-toast";
import { attendanceService } from "../../../services/attendance/attendance.service";
import sessionService from "../../../services/class/session.service";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Input } from "../../../components/ui/Input.jsx";
import { Textarea } from "../../../components/ui/Textarea.jsx";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui/Select.jsx";
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
  Paperclip,
  Plus,
  Mail,
  Send,
} from "lucide-react";
import { parentNotificationService } from "../../../services/notification/parent-notification.service";
import { scheduleService } from "../../../services/schedule/schedule.service";
import { courseService } from "../../../services/course/course.service";
import SessionMaterialUpload from "../../../components/teacher/SessionMaterialUpload.jsx";
// Personal course versions flow removed per new business logic
import { useAuth } from "../../../hooks/useAuth";
import { BackButton } from "../../../components/common/BackButton";

export default function ClassDetail() {
  // ═══════════════════════════════════════════════════════════════════════════
  // PHẦN 1: ROUTING & URL PARAMS - Lấy thông tin từ URL
  // ═══════════════════════════════════════════════════════════════════════════
  const navigate = useNavigate(); // Điều hướng giữa các trang
  const { classId } = useParams(); // Lấy classId từ URL path: /class/:classId
  const [searchParams] = useSearchParams(); // Lấy query params từ URL
  useAuth(); // Hook xác thực người dùng

  // Lấy các tham số từ URL query string
  // VD: /class/123?slotId=1&sessionId=456&date=2025-12-04
  const slotId = searchParams.get("slotId"); // ID của slot thời gian (tiết học)
  const slotIdNum = slotId ? parseInt(slotId, 10) : null; // Chuyển slotId sang số
  const sessionIdParam = searchParams.get("sessionId"); // ID của phiên học cụ thể

  // ═══════════════════════════════════════════════════════════════════════════
  // PHẦN 2: XỬ LÝ NGÀY THÁNG - Tránh lỗi UTC timezone
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Chuyển Date object thành chuỗi "YYYY-MM-DD" theo múi giờ local
   * VD: new Date() → "2025-12-04"
   */
  const toLocalYmd = (d) => {
    const dt = new Date(d);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  /**
   * Parse chuỗi "YYYY-MM-DD" thành Date object theo múi giờ local
   * VD: "2025-12-04" → Date object
   */
  const parseLocalDate = (str) => {
    if (!str) return null;
    const parts = String(str).split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return new Date(str);
    const [y, m, d] = parts;
    return new Date(y, m - 1, d);
  };

  // Ngày của buổi học (lấy từ URL hoặc mặc định là hôm nay)
  const sessionDateStr = searchParams.get("date") || toLocalYmd(new Date());
  // Ngày hôm nay
  const todayStr = toLocalYmd(new Date());

  /**
   * Kiểm tra buổi học có phải là buổi học TƯƠNG LAI không
   * - true: Buổi học chưa diễn ra → không cho phép điểm danh
   * - false: Buổi học đã hoặc đang diễn ra → cho phép điểm danh
   */
  const isFutureSession = (() => {
    try {
      const s = parseLocalDate(sessionDateStr); // Ngày buổi học
      const t = parseLocalDate(todayStr); // Ngày hôm nay
      if (!s || !t) return false;
      t.setHours(0, 0, 0, 0);
      s.setHours(0, 0, 0, 0);
      return s > t; // So sánh: ngày buổi học > ngày hôm nay?
    } catch {
      return false;
    }
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // PHẦN 3: TOAST NOTIFICATIONS - Hiển thị thông báo
  // ═══════════════════════════════════════════════════════════════════════════
  const { success, error } = useToast(); // success: thông báo thành công, error: thông báo lỗi

  // ═══════════════════════════════════════════════════════════════════════════
  // PHẦN 4: STATE THÔNG TIN LỚP HỌC & LOADING
  // ═══════════════════════════════════════════════════════════════════════════
  const [classDetail, setClassDetail] = useState(null); // Thông tin chi tiết lớp học (tên, GV, môn, phòng...)
  const [loading, setLoading] = useState(true); // Trạng thái đang tải dữ liệu

  // ═══════════════════════════════════════════════════════════════════════════
  // PHẦN 5: STATE ĐIỂM DANH HỌC SINH
  // ═══════════════════════════════════════════════════════════════════════════
  const [attendanceDetails, setAttendanceDetails] = useState([]); // Danh sách học sinh + trạng thái điểm danh
  const [hasChanges, setHasChanges] = useState(false); // Có thay đổi chưa lưu không?
  const [editMode, setEditMode] = useState(false); // Đang ở chế độ sửa điểm danh?
  const [originalDetails, setOriginalDetails] = useState([]); // Backup dữ liệu gốc để hủy thay đổi
  const [currentSessionId, setCurrentSessionId] = useState(null); // Session ID từ attendance response

  // ═══════════════════════════════════════════════════════════════════════════
  // PHẦN 6: STATE GỬI THÔNG BÁO PHỤ HUYNH
  // ═══════════════════════════════════════════════════════════════════════════
  const [sendingNotification, setSendingNotification] = useState(false); // Đang gửi thông báo?

  // ═══════════════════════════════════════════════════════════════════════════
  // PHẦN 7: STATE NỘI DUNG BUỔI HỌC (CHƯƠNG, BÀI, GHI CHÚ GIẢNG DẠY)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- 7.1: Dữ liệu khóa học ---
  const [courseData, setCourseData] = useState(null); // Khóa học ĐANG HIỂN THỊ (có thể là Admin hoặc Personal)
  const [adminCourseData, setAdminCourseData] = useState(null); // Khóa học GỐC từ Admin (chỉ xem, không sửa được)
  const [personalCourseData, setPersonalCourseData] = useState(null); // Khóa học CÁ NHÂN (clone riêng cho lớp, có thể sửa)

  // --- 7.2: Lựa chọn nguồn khóa học ---
  const [usingPersonalCourse, setUsingPersonalCourse] = useState(false); // Đang dùng khóa học cá nhân? (false = dùng Admin)

  // --- 7.3: Lựa chọn chương & bài học ---
  const [selectedChapterId, setSelectedChapterId] = useState(""); // ID chương đã chọn
  const [selectedLessonId, setSelectedLessonId] = useState(""); // ID bài học đã chọn

  // --- 7.4: Nội dung ghi chú giảng dạy ---
  const [lessonContent, setLessonContent] = useState(""); // Nội dung giáo viên đã giảng (text)
  const [savingContent, setSavingContent] = useState(false); // Đang lưu nội dung?
  const [contentEditMode, setContentEditMode] = useState(true); // Đang ở chế độ sửa nội dung?
  const [hasExistingContent, setHasExistingContent] = useState(false); // Đã có nội dung được lưu trước đó?

  // --- 7.5: Hydration flags (khôi phục dữ liệu từ backend) ---
  const [, setHydratedSelections] = useState(false); // Đánh dấu đã khôi phục chapter/lesson từ DB

  // --- 7.6: ID khóa học để lưu ---
  const [baseCourseIdState, setBaseCourseIdState] = useState(null); // ID khóa học GỐC từ Admin
  const [classCourseIdState, setClassCourseIdState] = useState(null); // ID khóa học CLONE của lớp

  /**
   * Loại nguồn để gửi lên backend khi lưu:
   * - "CLASS_PERSONAL": Đang dùng khóa học cá nhân (clone)
   * - "ADMIN": Đang dùng khóa học gốc từ Admin
   */
  const sourceType = usingPersonalCourse ? "CLASS_PERSONAL" : "ADMIN";
  // Load dữ liệu
  useEffect(() => {
    if (!classId) return;

    (async () => {
      try {
        setLoading(true);
        // Load danh sách điểm danh
        const attendance = sessionIdParam
          ? await attendanceService.getBySession(parseInt(sessionIdParam, 10))
          : await attendanceService.getByClass(
              classId,
              sessionDateStr,
              slotIdNum
            );

        // Handle response format - getByClass returns { sessionId, students }, getBySession returns array
        const attendanceList = Array.isArray(attendance)
          ? attendance
          : attendance.students || [];
        const fetchedSessionId = sessionIdParam
          ? parseInt(sessionIdParam, 10)
          : attendance.sessionId;

        console.log(
          "🎯 ClassDetail: slotId=",
          slotIdNum,
          "fetchedSessionId=",
          fetchedSessionId
        );

        setAttendanceDetails(attendanceList);
        setOriginalDetails(attendanceList);
        if (fetchedSessionId) {
          setCurrentSessionId(fetchedSessionId);
        }

        // Auto-enter edit mode if nothing marked yet
        if (
          attendanceList.every((a) => !a.status || a.status === "-") &&
          !isFutureSession
        ) {
          setEditMode(true);
        }

        // Load thông tin lớp học từ lịch học
        const allSchedule = await scheduleService.getScheduleBySemester("all");
        const classInfo = allSchedule.find(
          (item) => String(item.classId) === String(classId)
        );

        if (classInfo) {
          setClassDetail({
            ...classInfo,
            studentCount: attendanceList.length,
          });

          // Capture classCourseId from schedule.originalClass if provided
          const ccIdFromSchedule =
            classInfo?.originalClass?.classCourseId ||
            classInfo?.classCourseId ||
            null;
          if (ccIdFromSchedule) {
            setClassCourseIdState(String(ccIdFromSchedule));
          }

          // Load BOTH courses: Personal course (clone) và Admin course (gốc)
          // LƯU Ý: classInfo.courseId hiện tại là classCourseId (course clone) do backend đã ghi đè
          // Cần tìm baseCourseId từ course clone's description hoặc từ Subject

          let loadedPersonalCourse = null;
          let loadedAdminCourse = null;
          let baseCourseId = null;

          // 1. Load Course từ classInfo.courseId (đây là course clone - Personal Course)
          if (classInfo.courseId) {
            try {
              loadedPersonalCourse = await courseService.getCourseDetail(
                classInfo.courseId
              );
              setPersonalCourseData(loadedPersonalCourse);
              setClassCourseIdState(String(classInfo.courseId));

              // Try to extract baseCourseId from description tag [[SOURCE:xxx]]
              const sourceMatch =
                loadedPersonalCourse?.description?.match(
                  /\[\[SOURCE:(\d+)\]\]/
                );
              if (sourceMatch) {
                baseCourseId = parseInt(sourceMatch[1], 10);
              }
            } catch (err) {
              console.error("Load personal course failed:", err);
            }
          }

          // 2. Load Course gốc Admin - từ baseCourseId (nếu tìm được) hoặc từ Subject
          if (baseCourseId) {
            try {
              loadedAdminCourse = await courseService.getCourseDetail(
                baseCourseId
              );
              setAdminCourseData(loadedAdminCourse);
              setBaseCourseIdState(baseCourseId);
            } catch (err) {
              console.error("Load admin course from SOURCE failed:", err);
            }
          }

          // 3. Fallback: Nếu không tìm được từ SOURCE tag, thử lấy từ Subject's courses
          if (!loadedAdminCourse && classInfo.subjectId) {
            try {
              const subjectCourses = await courseService.getCoursesBySubject(
                classInfo.subjectId
              );
              // Tìm course KHÔNG phải clone (không chứa " - " theo pattern clone title)
              const adminCourse = subjectCourses.find((c) => {
                // Course clone có title format: "BaseCourseTitle - ClassName"
                // Course gốc không có pattern này
                const isClone = c.title?.includes(" - ") && c.ownerTeacher;
                return !isClone;
              });
              if (adminCourse) {
                loadedAdminCourse = await courseService.getCourseDetail(
                  adminCourse.id
                );
                setAdminCourseData(loadedAdminCourse);
                setBaseCourseIdState(adminCourse.id);
              }
            } catch (err) {
              console.error("Load admin course from Subject failed:", err);
            }
          }

          // Default: hiển thị course gốc Admin (nếu có), hoặc Personal course
          if (loadedAdminCourse) {
            setCourseData(loadedAdminCourse);
            setUsingPersonalCourse(false);
          } else if (loadedPersonalCourse) {
            setCourseData(loadedPersonalCourse);
            setUsingPersonalCourse(true);
          }

          // load nội dung buổi học đã lưu
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
              // lưu id khóa học gốc
              if (savedContent.baseCourseId) {
                setBaseCourseIdState(savedContent.baseCourseId);
              }
              // Chọn nguồn khóa học
              if (savedContent.sourceType === "CLASS_PERSONAL") {
                setUsingPersonalCourse(true);
                if (loadedPersonalCourse) {
                  setCourseData(loadedPersonalCourse);
                }
              } else {
                setUsingPersonalCourse(false);
                if (loadedAdminCourse) {
                  setCourseData(loadedAdminCourse);
                }
              }
              // Hydration: set chapter/lesson selections
              // Lưu ID khóa học cá nhân
              const classCourseId = savedContent.classCourseId;
              if (classCourseId) {
                setClassCourseIdState(String(classCourseId));
              }

              // Set chapter/lesson selections from saved content
              if (savedContent.chapterId) {
                setSelectedChapterId(String(savedContent.chapterId));
              } else if (
                Array.isArray(savedContent.linkedChapterIds) &&
                savedContent.linkedChapterIds.length > 0
              ) {
                setSelectedChapterId(String(savedContent.linkedChapterIds[0]));
              }
              if (savedContent.lessonId) {
                setSelectedLessonId(String(savedContent.lessonId));
              } else if (
                Array.isArray(savedContent.linkedLessonIds) &&
                savedContent.linkedLessonIds.length > 0
              ) {
                setSelectedLessonId(String(savedContent.linkedLessonIds[0]));
              }
              setHydratedSelections(true);

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
          } catch {
            // No saved content found yet - allow editing
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
    slotIdNum,
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

      // Handle response format - getByClass returns { sessionId, students }, getBySession returns array
      const refreshedList = Array.isArray(refreshed)
        ? refreshed
        : refreshed.students || [];
      const refreshedSessionId = sessionIdParam
        ? parseInt(sessionIdParam, 10)
        : refreshed.sessionId;

      setAttendanceDetails(refreshedList);
      setOriginalDetails(refreshedList);
      if (refreshedSessionId) {
        setCurrentSessionId(refreshedSessionId);
      }
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

  // Handler gửi thông báo cho phụ huynh
  const handleSendParentNotification = async () => {
    try {
      setSendingNotification(true);

      let result;
      if (sessionIdParam) {
        result = await parentNotificationService.sendBySession(
          parseInt(sessionIdParam, 10)
        );
      } else {
        result = await parentNotificationService.sendByClassAndDate(
          classId,
          sessionDateStr,
          slotIdNum
        );
      }

      if (result.success) {
        success(
          result.message ||
            `Đã gửi thông báo thành công cho ${result.data || 0} phụ huynh!`
        );
      } else {
        error(result.message || "Có lỗi xảy ra khi gửi thông báo");
      }
    } catch (err) {
      console.error("Error sending parent notification:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Có lỗi xảy ra khi gửi thông báo";
      error(errorMsg);
    } finally {
      setSendingNotification(false);
    }
  };

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
        <BackButton onClick={() => navigate(-1)} showLabel={false} />
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Không tìm thấy thông tin lớp học</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <BackButton onClick={() => navigate(-1)} showLabel={false} />
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết buổi học
            </h1>
            <p className="text-sm text-gray-500">{classDetail.subjectName}</p>
          </div>
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

        {/* Lesson Content Section - Duolingo Style */}
        {courseData ? (
          <div className="relative">
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-[20px] -z-10" />

            <div className="bg-white/80 backdrop-blur-sm border-2 border-indigo-100 rounded-[20px] shadow-xl shadow-indigo-100/50 overflow-hidden">
              {/* Header with Mascot */}
              <div className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 overflow-hidden">
                {/* Animated Background Circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
                <div className="absolute bottom-0 left-10 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 animate-pulse delay-150" />

                <div className="relative flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center transform hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer">
                    <span className="text-3xl">📚</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      Ghi nội dung buổi học
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-400 rounded-full animate-bounce">
                        <span className="text-sm">✨</span>
                      </span>
                    </h2>
                    <p className="text-white/80 text-sm mt-1">
                      Chọn nguồn nội dung và ghi nhận bài học đã giảng dạy
                    </p>
                  </div>
                  {/* Progress indicator */}
                  <div className="hidden sm:flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        selectedChapterId ? "bg-green-400" : "bg-white/40"
                      } transition-colors`}
                    />
                    <div
                      className={`w-3 h-3 rounded-full ${
                        selectedLessonId ? "bg-green-400" : "bg-white/40"
                      } transition-colors`}
                    />
                    <div
                      className={`w-3 h-3 rounded-full ${
                        lessonContent.trim() ? "bg-green-400" : "bg-white/40"
                      } transition-colors`}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Step 1: Course Source Selection - Card Style */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200">
                      1
                    </span>
                    <span className="font-semibold text-gray-800">
                      Chọn nguồn khóa học
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Personal Course Card */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!contentEditMode) return;
                        if (personalCourseData) {
                          console.log(
                            "🔄 Switching to Personal Course:",
                            personalCourseData?.title,
                            "| Chapters:",
                            personalCourseData?.chapters?.length
                          );
                          setUsingPersonalCourse(true);
                          setCourseData(personalCourseData);
                          setSelectedChapterId("");
                          setSelectedLessonId("");
                          setHydratedSelections(false);
                        } else {
                          error("Không có khóa học cá nhân cho lớp này");
                        }
                      }}
                      disabled={!contentEditMode || !personalCourseData}
                      className={`relative group p-5 rounded-2xl border-2 transition-all duration-300 text-left ${
                        !contentEditMode || !personalCourseData
                          ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
                          : usingPersonalCourse
                          ? "border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg shadow-emerald-100 scale-[1.02]"
                          : "border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md hover:scale-[1.01]"
                      }`}
                    >
                      {/* Selection Indicator */}
                      {usingPersonalCourse && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            usingPersonalCourse
                              ? "bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg"
                              : "bg-emerald-100 group-hover:bg-emerald-200"
                          }`}
                        >
                          <span className="text-2xl">
                            {usingPersonalCourse ? "🎯" : "📝"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${
                                usingPersonalCourse
                                  ? "text-emerald-700"
                                  : "text-gray-700"
                              }`}
                            >
                              Khóa học cá nhân
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-semibold rounded-full">
                              CÓ THỂ SỬA
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {personalCourseData?.title || "Chưa có khóa học"}
                          </p>
                          {personalCourseData && (
                            <div className="flex items-center gap-3 mt-2">
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                <Layers className="w-3 h-3" />
                                {personalCourseData.chapters?.length || 0}{" "}
                                chương
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Admin Course Card */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!contentEditMode) return;
                        if (adminCourseData) {
                          console.log(
                            "🔄 Switching to Admin Course:",
                            adminCourseData?.title,
                            "| Chapters:",
                            adminCourseData?.chapters?.length
                          );
                          setUsingPersonalCourse(false);
                          setCourseData(adminCourseData);
                          setSelectedChapterId("");
                          setSelectedLessonId("");
                          setHydratedSelections(false);
                        } else {
                          error("Không có khóa học gốc từ Admin");
                        }
                      }}
                      disabled={!contentEditMode || !adminCourseData}
                      className={`relative group p-5 rounded-2xl border-2 transition-all duration-300 text-left ${
                        !contentEditMode || !adminCourseData
                          ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
                          : !usingPersonalCourse
                          ? "border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-100 scale-[1.02]"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:scale-[1.01]"
                      }`}
                    >
                      {/* Selection Indicator */}
                      {!usingPersonalCourse && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            !usingPersonalCourse
                              ? "bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg"
                              : "bg-blue-100 group-hover:bg-blue-200"
                          }`}
                        >
                          <span className="text-2xl">
                            {!usingPersonalCourse ? "🎓" : "📘"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${
                                !usingPersonalCourse
                                  ? "text-blue-700"
                                  : "text-gray-700"
                              }`}
                            >
                              Khóa học từ môn
                            </span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded-full">
                              CHỈ XEM
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {adminCourseData?.title || "Chưa có khóa học"}
                          </p>
                          {adminCourseData && (
                            <div className="flex items-center gap-3 mt-2">
                              <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                                <Layers className="w-3 h-3" />
                                {adminCourseData.chapters?.length || 0} chương
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Step 2: Chapter Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex items-center justify-center w-8 h-8 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 ${
                        courseData
                          ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-indigo-200"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      2
                    </span>
                    <span
                      className={`font-semibold ${
                        courseData ? "text-gray-800" : "text-gray-400"
                      }`}
                    >
                      Chọn chương học
                    </span>
                    {selectedChapterId && (
                      <span className="text-emerald-500 animate-pulse">✓</span>
                    )}
                  </div>

                  {courseData?.chapters && courseData.chapters.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {courseData.chapters.map((chapter, index) => (
                        <button
                          key={chapter.id}
                          type="button"
                          onClick={() => {
                            if (!contentEditMode) return;
                            setSelectedChapterId(String(chapter.id));
                            setSelectedLessonId("");
                          }}
                          disabled={!contentEditMode}
                          className={`group relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                            !contentEditMode
                              ? "opacity-50 cursor-not-allowed"
                              : String(chapter.id) === selectedChapterId
                              ? `border-transparent shadow-lg scale-[1.02] ${
                                  usingPersonalCourse
                                    ? "bg-gradient-to-br from-emerald-400 to-green-500"
                                    : "bg-gradient-to-br from-blue-400 to-indigo-500"
                                }`
                              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:scale-[1.01]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                                String(chapter.id) === selectedChapterId
                                  ? "bg-white/30 text-white"
                                  : usingPersonalCourse
                                  ? "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200"
                                  : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`font-medium text-sm truncate ${
                                  String(chapter.id) === selectedChapterId
                                    ? "text-white"
                                    : "text-gray-700"
                                }`}
                              >
                                {chapter.title}
                              </p>
                              <p
                                className={`text-xs mt-0.5 ${
                                  String(chapter.id) === selectedChapterId
                                    ? "text-white/70"
                                    : "text-gray-400"
                                }`}
                              >
                                {chapter.lessons?.length || 0} bài học
                              </p>
                            </div>
                            {String(chapter.id) === selectedChapterId && (
                              <Check className="w-5 h-5 text-white flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 text-center">
                      <span className="text-4xl">📭</span>
                      <p className="text-gray-500 mt-2">
                        Chưa có chương học nào
                      </p>
                    </div>
                  )}
                </div>

                {/* Step 3: Lesson Selection */}
                {selectedChapterId && selectedChapter && (
                  <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200">
                        3
                      </span>
                      <span className="font-semibold text-gray-800">
                        Chọn bài học
                      </span>
                      {selectedLessonId && (
                        <span className="text-emerald-500 animate-pulse">
                          ✓
                        </span>
                      )}
                    </div>

                    {selectedChapter.lessons &&
                    selectedChapter.lessons.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedChapter.lessons.map((lesson, index) => (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() =>
                              contentEditMode &&
                              setSelectedLessonId(String(lesson.id))
                            }
                            disabled={!contentEditMode}
                            className={`group relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                              !contentEditMode
                                ? "opacity-50 cursor-not-allowed"
                                : String(lesson.id) === selectedLessonId
                                ? "border-transparent bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-200 scale-[1.02]"
                                : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md hover:scale-[1.01]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                  String(lesson.id) === selectedLessonId
                                    ? "bg-white/30"
                                    : "bg-purple-100 group-hover:bg-purple-200"
                                }`}
                              >
                                <span className="text-lg">
                                  {String(lesson.id) === selectedLessonId
                                    ? "🎯"
                                    : "📄"}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`font-medium text-sm truncate ${
                                    String(lesson.id) === selectedLessonId
                                      ? "text-white"
                                      : "text-gray-700"
                                  }`}
                                >
                                  Bài {index + 1}: {lesson.title}
                                </p>
                              </div>
                              {String(lesson.id) === selectedLessonId && (
                                <Check className="w-5 h-5 text-white flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 text-center">
                        <span className="text-4xl">📝</span>
                        <p className="text-gray-500 mt-2">
                          Chương này chưa có bài học
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Lesson Content Input */}
                {selectedLessonId && (
                  <div
                    className={`space-y-3 animate-in slide-in-from-bottom-4 duration-300 transition-opacity ${
                      !contentEditMode && hasExistingContent ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200">
                        4
                      </span>
                      <span className="font-semibold text-gray-800">
                        Ghi nội dung đã giảng
                      </span>
                      {lessonContent.trim() && (
                        <span className="text-emerald-500 animate-pulse">
                          ✓
                        </span>
                      )}
                      {!contentEditMode && hasExistingContent && (
                        <span className="text-xs text-gray-400 ml-2">
                          (Nhấn "Sửa nội dung" để chỉnh sửa)
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 rounded-2xl opacity-20 blur-sm" />
                      <div className="relative bg-white rounded-xl border-2 border-purple-100 p-4 space-y-3">
                        <Textarea
                          value={lessonContent}
                          onChange={(e) =>
                            contentEditMode && setLessonContent(e.target.value)
                          }
                          readOnly={!contentEditMode}
                          placeholder="✍️ Ví dụ: Giảng lý thuyết về cú pháp if-else, thực hành bài tập 1-5, hướng dẫn làm bài tập về nhà..."
                          rows={4}
                          className={`text-sm resize-none border-0 focus:ring-0 p-0 placeholder:text-gray-400 ${
                            !contentEditMode
                              ? "bg-gray-50 cursor-not-allowed"
                              : ""
                          }`}
                        />
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>💡 Mô tả ngắn gọn nội dung đã giảng dạy</span>
                          <span>{lessonContent.length} ký tự</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload tài liệu buổi học */}
                {currentSessionId && (
                  <div
                    className={`mt-6 mb-6 transition-opacity ${
                      !contentEditMode && hasExistingContent ? "opacity-60" : ""
                    }`}
                  >
                    <SessionMaterialUpload
                      sessionId={currentSessionId}
                      readOnly={
                        isFutureSession ||
                        (!contentEditMode && hasExistingContent)
                      }
                    />
                    {!contentEditMode && hasExistingContent && (
                      <p className="text-xs text-gray-400 mt-2 text-center">
                        Nhấn "Sửa nội dung buổi học" để thêm/xóa tài liệu
                      </p>
                    )}
                  </div>
                )}

                {/* Nút lưu nội dung */}
                {(selectedChapterId || selectedLessonId || lessonContent) && (
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100 animate-in slide-in-from-bottom-4 duration-300">
                    {hasExistingContent && !contentEditMode ? (
                      <Button
                        onClick={() => setContentEditMode(true)}
                        className="h-12 px-8 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                      >
                        <FileText className="w-5 h-5 mr-2" />
                        Sửa nội dung buổi học
                      </Button>
                    ) : (
                      <>
                        {hasExistingContent && (
                          <Button
                            onClick={() => setContentEditMode(false)}
                            variant="outline"
                            className="h-12 px-6 rounded-xl border-2 hover:bg-gray-50 transition-all duration-300"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Hủy
                          </Button>
                        )}
                        <Button
                          onClick={handleSaveLessonContent}
                          disabled={savingContent || !lessonContent.trim()}
                          className={`h-12 px-8 rounded-xl shadow-lg transition-all duration-300 ${
                            savingContent || !lessonContent.trim()
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-emerald-200 hover:shadow-xl hover:scale-[1.02]"
                          } text-white`}
                        >
                          {savingContent ? (
                            <>
                              <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Đang lưu...
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5 mr-2" />
                              Lưu nội dung 🎉
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : classDetail?.courseId ? (
          <div className="bg-white rounded-2xl border-2 border-indigo-100 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-gray-600">Đang tải chương trình học...</p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <p className="text-lg font-bold text-orange-900">
                  Lớp học chưa có chương trình học
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  Vui lòng liên hệ Admin để gán chương trình học cho lớp này
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Send Parent Notification Button */}
        <Card className="border border-gray-200 rounded-[14px] bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Gửi thông báo cho phụ huynh
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Gửi email thông báo về điểm danh và nội dung buổi học cho
                    phụ huynh học viên
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSendParentNotification}
                disabled={sendingNotification || isFutureSession}
                className={`h-12 px-6 rounded-xl shadow-lg transition-all duration-300 ${
                  sendingNotification || isFutureSession
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-200 hover:shadow-xl hover:scale-[1.02]"
                } text-white font-medium`}
              >
                {sendingNotification ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Gửi thông báo
                  </>
                )}
              </Button>
            </div>
            {isFutureSession && (
              <p className="text-xs text-orange-600 mt-3 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Chưa đến ngày diễn ra buổi học, không thể gửi thông báo
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
