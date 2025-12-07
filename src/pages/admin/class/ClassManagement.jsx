// src/pages/admin/class/ClassManagement.jsx
// ✨ MASTER-DETAIL SPLIT VIEW - Xem list và chi tiết cùng lúc
// 🔄 SERVER-SIDE PAGINATION
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { dayLabelVi, formatCurrency } from "../../../helper/formatters";
import { classService } from "../../../services/class/class.service";
import { classApi } from "../../../services/class/class.api";
import { useToast } from "../../../hooks/use-toast";
import useDebounce from "../../../hooks/useDebounce";
import {
  Search,
  Plus,
  Filter,
  ChevronRight,
  ChevronLeft,
  Users,
  Clock,
  MapPin,
  Video,
  Building,
  Calendar,
  Banknote,
  BookOpen,
  User,
  ExternalLink,
  Edit,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  X,
  Globe,
  Home,
  FileText,
  GraduationCap,
  Layers,
  ChevronDown,
} from "lucide-react";

// ============ HELPER FUNCTIONS ============
function getDerivedStatus(cls) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sd = cls?.startDate ? new Date(cls.startDate) : null;
  const ed = cls?.endDate ? new Date(cls.endDate) : null;
  if (sd) sd.setHours(0, 0, 0, 0);
  if (ed) ed.setHours(0, 0, 0, 0);

  if (sd && sd > today) {
    return { label: "Sắp mở", color: "sky", icon: PauseCircle };
  }
  if (sd && ed && sd <= today && today <= ed) {
    return { label: "Đang diễn ra", color: "emerald", icon: PlayCircle };
  }
  if (ed && ed < today) {
    return { label: "Đã kết thúc", color: "gray", icon: CheckCircle };
  }
  return null;
}

function getStatusBadge(status) {
  if (status === "DRAFT") {
    return {
      label: "Bản nháp",
      bg: "bg-amber-100",
      text: "text-amber-700",
      icon: AlertCircle,
    };
  }
  if (status === "PUBLIC") {
    return {
      label: "Đã xuất bản",
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      icon: CheckCircle,
    };
  }
  return {
    label: "Lưu trữ",
    bg: "bg-gray-100",
    text: "text-gray-600",
    icon: FileText,
  };
}

// ============ STAT CARD COMPONENT ============
function StatCard({ icon: Icon, label, value, gradient, iconBg }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${gradient} p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {/* Decorative circles */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-2 w-16 h-16 rounded-full bg-white/10" />
    </div>
  );
}

// ============ CLASS LIST ITEM ============
function ClassListItem({ cls, isSelected, onClick }) {
  const timeStatus = getDerivedStatus(cls);
  const statusBadge = getStatusBadge(cls.status);

  return (
    <div
      onClick={onClick}
      className={`
        group relative p-4 rounded-xl cursor-pointer transition-all duration-200
        ${
          isSelected
            ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-md"
            : "bg-white hover:bg-gray-50 border border-gray-100 hover:border-gray-200 hover:shadow-sm"
        }
      `}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-blue-500 rounded-r-full" />
      )}

      <div className="flex items-start gap-3">
        {/* Type Icon */}
        <div
          className={`
          w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
          ${
            cls.online
              ? "bg-gradient-to-br from-blue-500 to-indigo-600"
              : "bg-gradient-to-br from-emerald-500 to-teal-600"
          }
        `}
        >
          {cls.online ? (
            <Globe className="w-5 h-5 text-white" />
          ) : (
            <Home className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {cls.name}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {cls.subjectName}
              </p>
            </div>
            <ChevronRight
              className={`w-5 h-5 flex-shrink-0 transition-colors ${
                isSelected
                  ? "text-blue-500"
                  : "text-gray-300 group-hover:text-gray-400"
              }`}
            />
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {cls.teacherFullName?.split(" ").slice(-2).join(" ") || "—"}
            </span>
            {!cls.online && cls.roomName && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {cls.roomName}
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
            >
              {statusBadge.label}
            </span>
            {timeStatus && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-${timeStatus.color}-100 text-${timeStatus.color}-700`}
              >
                {timeStatus.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ DETAIL PANEL ============
function DetailPanel({ cls, onClose, onPublish, onRevert, updating }) {
  const navigate = useNavigate();
  const timeStatus = getDerivedStatus(cls);
  const statusBadge = getStatusBadge(cls.status);

  // DEBUG: Log dữ liệu từ API
  console.log("🔍 DetailPanel cls data - ALL KEYS:", Object.keys(cls));
  console.log("🔍 DetailPanel cls data - FULL OBJECT:", cls);
  console.log("🔍 Checking session fields:", {
    pricePerSession: cls?.pricePerSession,
    price: cls?.price,
    sessionPrice: cls?.sessionPrice,
    price_per_session: cls?.price_per_session,
    totalSessions: cls?.totalSessions,
    numberOfSessions: cls?.numberOfSessions,
    sessionCount: cls?.sessionCount,
    total_sessions: cls?.total_sessions,
    sessions: cls?.sessions,
    totalSessionCount: cls?.totalSessionCount,
    sessionNumber: cls?.sessionNumber,
  });

  // Hỗ trợ các tên trường thay thế từ backend (giống ClassDetailPage)
  const priceValue = (() => {
    const v =
      cls?.pricePerSession ??
      cls?.price ??
      cls?.sessionPrice ??
      cls?.price_per_session ??
      null;
    console.log("💰 priceValue:", v);
    return v;
  })();

  const totalSessions = (() => {
    // Thử lấy từ backend trước
    let v =
      cls?.totalSessions ??
      cls?.numberOfSessions ??
      cls?.sessionCount ??
      cls?.total_sessions ??
      null;

    // Nếu backend trả về 0 hoặc null, thử tính từ schedule + duration
    if (!v || v === 0) {
      const scheduleLength = Array.isArray(cls?.schedule)
        ? cls.schedule.length
        : 0;
      if (scheduleLength > 0 && cls?.startDate && cls?.endDate) {
        try {
          const start = new Date(cls.startDate);
          const end = new Date(cls.endDate);
          const diffTime = Math.abs(end - start);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const weeks = Math.ceil(diffDays / 7);
          v = scheduleLength * weeks;
          console.log(
            `📊 Calculated totalSessions from schedule: ${scheduleLength} sessions/week × ${weeks} weeks = ${v}`
          );
        } catch (e) {
          console.error("Error calculating sessions:", e);
        }
      }
    }

    console.log("📊 totalSessions:", v);
    return v;
  })();

  const totalPrice =
    priceValue != null && totalSessions != null && totalSessions > 0
      ? Number(priceValue) * Number(totalSessions)
      : null;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            {/* Type badge */}
            <div
              className={`
              w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0
              ${
                cls.online
                  ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200"
                  : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200"
              }
            `}
            >
              {cls.online ? (
                <Globe className="w-7 h-7 text-white" />
              ) : (
                <Building className="w-7 h-7 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">
                {cls.name}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {cls.subjectName || "Chưa gán môn học"}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}
                >
                  <statusBadge.icon className="w-3.5 h-3.5" />
                  {statusBadge.label}
                </span>
                {timeStatus && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-${timeStatus.color}-100 text-${timeStatus.color}-700`}
                  >
                    <timeStatus.icon className="w-3.5 h-3.5" />
                    {timeStatus.label}
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    cls.online
                      ? "bg-blue-100 text-blue-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {cls.online ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-100">
            <div className="flex items-center gap-2 text-pink-600 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">Sĩ số</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {cls.currentStudents || 0}/{cls.maxStudents || "—"}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Tổng buổi</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {totalSessions || "—"} buổi
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Banknote className="w-4 h-4" />
              <span className="text-xs font-medium">Học phí/buổi</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {priceValue ? formatCurrency(priceValue) : "—"}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <Banknote className="w-4 h-4" />
              <span className="text-xs font-medium">Tổng học phí</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {totalPrice ? formatCurrency(totalPrice) : "—"}
            </p>
          </div>
        </div>

        {/* Class Info */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-400" />
            Thông tin lớp học
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Giáo viên</p>
                <p className="text-sm font-medium text-gray-900">
                  {cls.teacherFullName || "Chưa phân công"}
                </p>
              </div>
            </div>

            {cls.online ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Video className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Link học Online</p>
                  {cls.meetingLink ? (
                    <a
                      href={cls.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span className="truncate">{cls.meetingLink}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  ) : (
                    <p className="text-sm text-gray-400">Chưa có link</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phòng học</p>
                  <p className="text-sm font-medium text-gray-900">
                    {cls.roomName || "Chưa xếp phòng"}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Thời gian khóa học</p>
                <p className="text-sm font-medium text-gray-900">
                  {cls.startDate && cls.endDate
                    ? `${cls.startDate} → ${cls.endDate}`
                    : cls.startDate || cls.endDate || "Chưa xác định"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Môn học</p>
                <p className="text-sm font-medium text-gray-900">
                  {cls.subjectName || "Chưa gán"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            Lịch học hàng tuần
          </h3>
          {Array.isArray(cls.schedule) && cls.schedule.length > 0 ? (
            <div className="space-y-2">
              {cls.schedule.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {dayLabelVi(s.dayOfWeek)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {s.startTime?.slice(0, 5)} - {s.endTime?.slice(0, 5)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-center">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chưa thiết lập lịch học</p>
            </div>
          )}
        </div>

        {/* Description */}
        {cls.description && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              Mô tả
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed p-4 bg-gray-50 rounded-xl whitespace-pre-line">
              {cls.description}
            </p>
          </div>
        )}

        {/* Action Info */}
        <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
          <p className="text-sm text-gray-600">
            {cls.status === "DRAFT"
              ? "💡 Lớp học đang ở trạng thái Bản nháp. Xuất bản để học sinh có thể nhìn thấy và đăng ký."
              : "✅ Lớp học đã được xuất bản. Bạn có thể chuyển về Bản nháp nếu cần chỉnh sửa thêm."}
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/home/admin/class/${cls.id}/edit`)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Sửa
          </button>
          {cls.status === "DRAFT" ? (
            <button
              onClick={onPublish}
              disabled={updating}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl hover:shadow-lg hover:shadow-emerald-200 disabled:opacity-50 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              {updating ? "Đang xử lý..." : "Xuất bản"}
            </button>
          ) : (
            <button
              onClick={onRevert}
              disabled={updating}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 disabled:opacity-50 transition-colors"
            >
              <AlertCircle className="w-4 h-4" />
              {updating ? "Đang xử lý..." : "Về nháp"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ EMPTY DETAIL STATE ============
function EmptyDetail() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-gray-50 to-white">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-6">
        <Layers className="w-12 h-12 text-blue-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Chọn một lớp học
      </h3>
      <p className="text-sm text-gray-500 max-w-xs">
        Click vào một lớp học từ danh sách bên trái để xem thông tin chi tiết
        tại đây
      </p>
    </div>
  );
}

// ============ MAIN COMPONENT ============
export default function ClassManagementV2() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const toastRef = useRef({ success, showError });
  useEffect(() => {
    toastRef.current = { success, showError };
  }, [success, showError]);

  // Filters
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [classType, setClassType] = useState(""); // "", "online", "offline"
  const [statusFilter, setStatusFilter] = useState(""); // "", "DRAFT", "PUBLIC"
  const [showFilters, setShowFilters] = useState(false);

  // Server-side pagination
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Data
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Stats counts (load all once)
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    draft: 0,
    published: 0,
  });

  // Selection
  const [selectedId, setSelectedId] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Load stats once
  useEffect(() => {
    (async () => {
      try {
        const data = await classService.list({});
        const allClasses = Array.isArray(data) ? data : [];
        const online = allClasses.filter((c) => c.online === true).length;
        const offline = allClasses.filter((c) => c.online === false).length;
        const draft = allClasses.filter((c) => c.status === "DRAFT").length;
        const published = allClasses.filter(
          (c) => c.status === "PUBLIC"
        ).length;
        setStats({
          total: allClasses.length,
          online,
          offline,
          draft,
          published,
        });
      } catch (e) {
        console.error("Failed to load stats:", e);
      }
    })();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [debouncedQuery, classType, statusFilter]);

  // Map FE filters to BE params
  const mapStatusToBE = (status) => {
    if (status === "DRAFT") return "DRAFT";
    if (status === "PUBLIC") return "PUBLIC";
    return "ALL";
  };

  // Load classes with server-side pagination
  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      // Map classType to isOnline param
      let isOnline = null;
      if (classType === "online") isOnline = true;
      else if (classType === "offline") isOnline = false;

      console.log("📡 Fetching classes:", {
        search: debouncedQuery,
        status: mapStatusToBE(statusFilter),
        isOnline,
        page,
        size,
      });

      const response = await classApi.listPaginated({
        search: debouncedQuery,
        status: mapStatusToBE(statusFilter),
        isOnline,
        page,
        size,
        sortBy: "id",
        order: "desc",
      });

      console.log("📊 BE Response:", response);

      const content = response.content || [];
      setClasses(content);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (e) {
      console.error(e);
      setClasses([]);
      toastRef.current.showError("Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, classType, statusFilter, page, size]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // Reload stats after changes
  const reloadStats = async () => {
    try {
      const data = await classService.list({});
      const allClasses = Array.isArray(data) ? data : [];
      const online = allClasses.filter((c) => c.online === true).length;
      const offline = allClasses.filter((c) => c.online === false).length;
      const draft = allClasses.filter((c) => c.status === "DRAFT").length;
      const published = allClasses.filter((c) => c.status === "PUBLIC").length;
      setStats({ total: allClasses.length, online, offline, draft, published });
    } catch (e) {
      console.error("Failed to reload stats:", e);
    }
  };

  // Data for rendering
  const filtered = classes;

  // Selected class
  const selectedClass = useMemo(() => {
    if (!selectedId) return null;
    return classes.find((c) => c.id === selectedId) || null;
  }, [classes, selectedId]);

  // Actions
  const handlePublish = async () => {
    if (!selectedClass) return;
    setUpdating(true);
    try {
      await classService.publish(selectedClass.id);
      await loadClasses();
      await reloadStats();
      success("Đã xuất bản lớp học thành công");
    } catch (e) {
      console.error(e);
      showError("Không thể xuất bản lớp học");
    } finally {
      setUpdating(false);
    }
  };

  const handleRevert = async () => {
    if (!selectedClass) return;
    setUpdating(true);
    try {
      await classService.revertDraft(selectedClass.id);
      await loadClasses();
      await reloadStats();
      success("Đã chuyển lớp về bản nháp");
    } catch (e) {
      console.error(e);
      showError("Không thể chuyển về bản nháp");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-50">
      {/* ============ HEADER ============ */}
      <div className="flex-shrink-0 p-6 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-200">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý lớp học
              </h1>
              <p className="text-sm text-gray-500">
                Quản lý thông tin các lớp học trong hệ thống
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/home/admin/class/create-offline")}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Building className="w-4 h-4" />
              Tạo Offline
            </button>
            <button
              onClick={() => navigate("/home/admin/class/create-online")}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all"
            >
              <Globe className="w-4 h-4" />
              Tạo Online
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Layers}
            label="Tổng số lớp"
            value={stats.total}
            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            iconBg="bg-white/20"
          />
          <StatCard
            icon={Globe}
            label="Lớp Online"
            value={stats.online}
            gradient="bg-gradient-to-br from-purple-500 to-pink-600"
            iconBg="bg-white/20"
          />
          <StatCard
            icon={Building}
            label="Lớp Offline"
            value={stats.offline}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            iconBg="bg-white/20"
          />
          <StatCard
            icon={CheckCircle}
            label="Đã xuất bản"
            value={stats.published}
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            iconBg="bg-white/20"
          />
        </div>
      </div>

      {/* ============ MAIN CONTENT - SPLIT VIEW ============ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ============ LEFT: MASTER LIST ============ */}
        <div className="w-full lg:w-[420px] xl:w-[480px] flex flex-col border-r border-gray-200 bg-white">
          {/* Search & Filter */}
          <div className="flex-shrink-0 p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm lớp học..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl border transition-colors ${
                  showFilters
                    ? "bg-blue-50 border-blue-200 text-blue-600"
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-3 flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-200">
                <select
                  value={classType}
                  onChange={(e) => setClassType(e.target.value)}
                  className="px-3 py-2 text-sm bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả loại</option>
                  <option value="online">🌐 Online</option>
                  <option value="offline">🏫 Offline</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="DRAFT">📝 Bản nháp</option>
                  <option value="PUBLIC">✅ Đã xuất bản</option>
                </select>
              </div>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Không có lớp học nào</p>
              </div>
            ) : (
              filtered.map((cls) => (
                <ClassListItem
                  key={cls.id}
                  cls={cls}
                  isSelected={selectedId === cls.id}
                  onClick={() => setSelectedId(cls.id)}
                />
              ))
            )}
          </div>

          {/* Footer with Pagination */}
          <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Hiển thị {filtered.length} / {totalElements} lớp học
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-600 px-2">
                  {page + 1} / {Math.max(1, totalPages)}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page >= totalPages - 1}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ============ RIGHT: DETAIL PANEL ============ */}
        <div className="hidden lg:flex flex-1 flex-col overflow-hidden">
          {selectedClass ? (
            <DetailPanel
              cls={selectedClass}
              onClose={() => setSelectedId(null)}
              onPublish={handlePublish}
              onRevert={handleRevert}
              updating={updating}
            />
          ) : (
            <EmptyDetail />
          )}
        </div>
      </div>

      {/* ============ MOBILE DETAIL DRAWER ============ */}
      {selectedClass && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSelectedId(null)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <DetailPanel
              cls={selectedClass}
              onClose={() => setSelectedId(null)}
              onPublish={handlePublish}
              onRevert={handleRevert}
              updating={updating}
            />
          </div>
        </div>
      )}
    </div>
  );
}
