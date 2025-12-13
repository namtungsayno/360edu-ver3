// src/pages/student/StudentSchedule.jsx
// Màn hình lịch học cho học sinh - Modern Calendar Design

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card.jsx";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Video,
  ExternalLink,
} from "lucide-react";
import { studentScheduleService } from "../../services/student-schedule/student-schedule.service.js";
import { useToast } from "../../hooks/use-toast";
import { stripHtmlTags } from "../../utils/html-helpers";
import ModernWeekCalendar, {
  CalendarEventCard,
  CalendarStatusBadge,
} from "../../components/common/ModernWeekCalendar";
import { startOfWeek, addDays, addWeeks, fmt } from "../../utils/date-helpers";

// Week days configuration
const WEEK_DAYS = [
  { id: 1, name: "MON", label: "Thứ 2" },
  { id: 2, name: "TUE", label: "Thứ 3" },
  { id: 3, name: "WED", label: "Thứ 4" },
  { id: 4, name: "THU", label: "Thứ 5" },
  { id: 5, name: "FRI", label: "Thứ 6" },
  { id: 6, name: "SAT", label: "Thứ 7" },
  { id: 7, name: "SUN", label: "Chủ nhật" },
];

// Time slots (chỉ hiển thị khung 16:00 - 22:00 theo yêu cầu)
const TIME_SLOTS = [
  { id: 1, label: "Slot 1", time: "16:00 - 18:00" },
  { id: 2, label: "Slot 2", time: "18:00 - 20:00" },
  { id: 3, label: "Slot 3", time: "20:00 - 22:00" },
];

export default function StudentSchedule() {
  const { error } = useToast();

  // Week navigation state
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const weekStart = useMemo(() => startOfWeek(currentWeek), [currentWeek]);
  const weekKey = useMemo(() => fmt(weekStart, "yyyy-MM-dd"), [weekStart]);
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Cache state for smooth navigation
  const [cache, setCache] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Normalize API items
  const normalize = (raw) =>
    (raw || []).map((item) => ({
      ...item,
      timeDisplay:
        item.timeStart && item.timeEnd
          ? `${item.timeStart.slice(0, 5)} - ${item.timeEnd.slice(0, 5)}`
          : "",
    }));

  // Fetch a specific week and update cache
  const fetchWeek = async (ws) => {
    const key = fmt(ws, "yyyy-MM-dd");
    try {
      const raw = await studentScheduleService.getScheduleByWeek(key);
      const data = normalize(raw);
      setCache((prev) => ({ ...prev, [key]: data }));
    } catch (e) {
      error("Không thể tải dữ liệu lịch học");
      setCache((prev) => ({ ...prev, [key]: [] }));
    }
  };

  // Main effect: fetch current week, keep previous content to avoid flicker
  useEffect(() => {
    let mounted = true;
    (async () => {
      // If already cached, render immediately and refresh in background
      const hasCache = cache[weekKey] !== undefined;
      setIsFetching(true);
      if (!hasCache && initialLoading) setInitialLoading(true);
      await fetchWeek(weekStart);
      if (mounted) {
        setIsFetching(false);
        setInitialLoading(false);
      }
      // Prefetch neighbors for smoother next/prev transitions
      fetchWeek(addWeeks(weekStart, 1));
      fetchWeek(addWeeks(weekStart, -1));
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekKey]);

  // Helper function to get classes for a specific day and slot
  const getClassesForSlot = (dayId, slotId) => {
    const dayDate = addDays(weekStart, dayId - 1);
    const dayStr = fmt(dayDate, "yyyy-MM-dd");
    const display = cache[weekKey] || [];
    return display.filter((session) => {
      if (!session.date || !session.timeStart) return false;
      const sessionDate = fmt(new Date(session.date), "yyyy-MM-dd");
      if (sessionDate !== dayStr) return false;

      const timeStart = session.timeStart.slice(0, 5); // HH:MM lấy từ HH:MM:SS
      const slotMapping = { "16:00": 1, "18:00": 2, "20:00": 3 };
      return slotMapping[timeStart] === slotId;
    });
  };

  // Navigation handlers
  const handlePreviousWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, -1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  if (initialLoading && !cache[weekKey]) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải lịch học...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Stats calculation
  const scheduleData = cache[weekKey] || [];
  const stats = {
    totalSessions: scheduleData.length,
    totalClasses: new Set(scheduleData.map((s) => s.classId)).size,
    present: scheduleData.filter((s) => s.attendanceStatus === "PRESENT")
      .length,
    absent: scheduleData.filter((s) => s.attendanceStatus === "ABSENT").length,
  };

  // Render event card
  const renderScheduleEvent = (classData, dayId, slotId) => {
    const st = classData.attendanceStatus || "UNMARKED";

    const variantMap = {
      PRESENT: "success",
      ABSENT: "danger",
      LATE: "warning",
      UNMARKED: "default",
    };

    const statusMap = {
      PRESENT: {
        icon: <CheckCircle2 className="h-3 w-3" />,
        text: "Có mặt",
        type: "success",
      },
      ABSENT: {
        icon: <XCircle className="h-3 w-3" />,
        text: "Vắng",
        type: "danger",
      },
      LATE: {
        icon: <AlertCircle className="h-3 w-3" />,
        text: "Trễ",
        type: "warning",
      },
      UNMARKED: {
        icon: <Clock className="h-3 w-3" />,
        text: "Chờ ĐD",
        type: "default",
      },
    };

    const statusInfo = statusMap[st] || statusMap.UNMARKED;
    const hasContent =
      classData.lessonContent ||
      (classData.linkedChapters && classData.linkedChapters.length > 0) ||
      (classData.linkedLessons && classData.linkedLessons.length > 0);

    return (
      <StudentClassCardModern
        key={classData.sessionId}
        classData={classData}
        variant={variantMap[st] || "default"}
        statusInfo={statusInfo}
        hasContent={hasContent}
      />
    );
  };

  // Stats content
  const StatsContent = (
    <div className="grid grid-cols-4 gap-4">
      <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-xs text-blue-600 font-medium">Buổi học</div>
          <div className="text-xl font-bold text-blue-700">
            {stats.totalSessions}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-200">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-xs text-purple-600 font-medium">Lớp học</div>
          <div className="text-xl font-bold text-purple-700">
            {stats.totalClasses}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200">
          <CheckCircle2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-xs text-emerald-600 font-medium">Có mặt</div>
          <div className="text-xl font-bold text-emerald-700">
            {stats.present}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100">
        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-200">
          <XCircle className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-xs text-red-600 font-medium">Vắng</div>
          <div className="text-xl font-bold text-red-700">{stats.absent}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-200">
          <GraduationCap className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch học của tôi</h1>
          <p className="text-sm text-gray-500">
            Xem lịch học các lớp đã đăng ký theo tuần
          </p>
        </div>
      </div>

      {/* Modern Calendar */}
      <ModernWeekCalendar
        currentWeek={currentWeek}
        onWeekChange={setCurrentWeek}
        timeSlots={TIME_SLOTS}
        getEventsForSlot={getClassesForSlot}
        renderEvent={renderScheduleEvent}
        accentColor="emerald"
        showStats={true}
        statsContent={StatsContent}
      />

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <span className="font-semibold text-gray-700">Chú thích:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
          <span className="text-gray-600">Có mặt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
          <span className="text-gray-600">Vắng</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full shadow-sm"></div>
          <span className="text-gray-600">Đi trễ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-300 rounded-full shadow-sm"></div>
          <span className="text-gray-600">Chờ điểm danh</span>
        </div>
      </div>
    </div>
  );
}

// Modern Student Class Card
function StudentClassCardModern({
  classData,
  variant,
  statusInfo,
  hasContent,
}) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <CalendarEventCard variant={variant} onClick={() => setShowDetail(true)}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="font-bold text-sm text-gray-800 leading-tight line-clamp-1">
            {classData.className}
          </div>
          <CalendarStatusBadge status={statusInfo.type}>
            {statusInfo.icon}
            <span>{statusInfo.text}</span>
          </CalendarStatusBadge>
        </div>

        {/* Subject */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
          <BookOpen className="h-3 w-3 flex-shrink-0" />
          <span className="line-clamp-1">{classData.subjectName}</span>
        </div>

        {/* Info Row */}
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className="truncate max-w-[70px]">
              {classData.teacherName}
            </span>
          </span>
          {classData.roomName && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[50px]">
                {classData.roomName}
              </span>
            </span>
          )}
        </div>

        {/* Content indicator */}
        {hasContent && (
          <div className="mt-2 pt-2 border-t border-current/10 text-[10px] text-blue-600 font-medium flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            Có nội dung bài học
          </div>
        )}
      </CalendarEventCard>

      {/* Modal */}
      {showDetail && (
        <SessionDetailModal
          classData={classData}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}

// Modal hiển thị chi tiết buổi học với nội dung bài học
function SessionDetailModal({ classData, onClose }) {
  const navigate = useNavigate();
  const STATUS_LABELS = {
    PRESENT: "Có mặt",
    ABSENT: "Vắng",
    LATE: "Đi trễ",
    UNMARKED: "Chưa điểm danh",
  };
  const STATUS_STYLES = {
    PRESENT: "bg-green-100 text-green-800 border-green-300",
    ABSENT: "bg-red-100 text-red-800 border-red-300",
    LATE: "bg-amber-100 text-amber-800 border-amber-300",
    UNMARKED: "bg-gray-100 text-gray-800 border-gray-300",
  };
  const st = classData.attendanceStatus || "UNMARKED";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">{classData.className}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>
          <p className="text-sm opacity-90 mt-1">{classData.subjectName}</p>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-medium">
                {new Date(classData.date).toLocaleDateString("sv-SE")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{classData.timeDisplay}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-blue-600" />
              <span>{classData.teacherName}</span>
            </div>
            {classData.roomName && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{classData.roomName}</span>
              </div>
            )}
          </div>

          {/* Link Google Meet cho lớp online */}
          {classData.isOnline && classData.meetingLink && (
            <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Lớp học Online
                  </span>
                </div>
                <a
                  href={classData.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Video className="w-4 h-4" />
                  Vào lớp học
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-xs text-green-600 mt-2 truncate">
                {classData.meetingLink}
              </p>
            </div>
          )}

          {/* Trạng thái điểm danh */}
          <div className={`px-3 py-2 rounded-lg border ${STATUS_STYLES[st]}`}>
            <span className="font-semibold">
              Điểm danh: {STATUS_LABELS[st]}
            </span>
          </div>

          {/* Nội dung bài học */}
          <div className="border-t pt-4">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Nội dung buổi học
            </h4>

            {/* Danh sách chapters được gán */}
            {classData.linkedChapters &&
              classData.linkedChapters.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Chương:
                  </p>
                  <div className="space-y-2">
                    {classData.linkedChapters.map((chapter) => (
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

            {/* Danh sách lessons được gán */}
            {classData.linkedLessons && classData.linkedLessons.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Bài học:
                </p>
                <div className="space-y-2">
                  {classData.linkedLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="bg-purple-50 border border-purple-200 rounded-lg p-3"
                    >
                      <div className="text-xs text-purple-600 mb-1">
                        {lesson.chapterTitle &&
                          `Chương: ${lesson.chapterTitle}`}
                      </div>
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

            {/* Nội dung ghi chú từ giáo viên */}
            {classData.lessonContent && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Ghi chú từ giáo viên:
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div
                    className="text-sm text-gray-700 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: classData.lessonContent,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Nếu không có nội dung */}
            {!classData.lessonContent &&
              (!classData.linkedChapters ||
                classData.linkedChapters.length === 0) &&
              (!classData.linkedLessons ||
                classData.linkedLessons.length === 0) && (
                <div className="text-center py-6 text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Chưa có nội dung bài học cho buổi này</p>
                </div>
              )}
          </div>

          {/* Xem khóa học đầy đủ */}
          {classData.courseId && (
            <div className="border-t pt-4">
              <button
                onClick={() => {
                  onClose();
                  const classId = classData.classId || classData.clazzId;
                  const url = classId
                    ? `/home/courses/${classData.courseId}?classId=${classId}`
                    : `/home/courses/${classData.courseId}`;
                  navigate(url);
                }}
                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition"
              >
                <BookOpen className="w-4 h-4" />
                Xem toàn bộ khóa học
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
