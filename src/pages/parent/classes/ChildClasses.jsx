// pages/parent/classes/ChildClasses.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  User,
  Calendar,
  Clock,
  MapPin,
  GraduationCap,
  ChevronRight,
  TrendingUp,
  CheckCircle,
  X,
  Play,
  Award,
  Target,
  Phone,
  Mail,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { parentApi } from "../../../services/parent/parent.api";

const ChildClasses = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    const initializeData = async () => {
      await fetchChildren();
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchClasses();
    } else {
      setLoading(false);
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const response = await parentApi.getChildren();
      setChildren(response || []);
      if (response && response.length > 0) {
        setSelectedChild(response[0].id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
      setChildren([]);
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await parentApi.getChildClasses(selectedChild);
      setClasses(response);
      // Auto select first class
      if (response && response.length > 0 && !selectedClass) {
        setSelectedClass(response[0]);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const statusConfig = {
      ONGOING: {
        label: "Đang học",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
      },
      UPCOMING: {
        label: "Sắp bắt đầu",
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
        dot: "bg-blue-500",
      },
      COMPLETED: {
        label: "Hoàn thành",
        color: "text-gray-500",
        bg: "bg-gray-50",
        border: "border-gray-200",
        dot: "bg-gray-400",
      },
      CANCELLED: {
        label: "Đã hủy",
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        dot: "bg-red-500",
      },
    };
    return statusConfig[status] || statusConfig.ONGOING;
  };

  const getDayLabel = (dayOfWeek) => {
    const dayLabels = {
      MONDAY: "Th 2",
      TUESDAY: "Th 3",
      WEDNESDAY: "Th 4",
      THURSDAY: "Th 5",
      FRIDAY: "Th 6",
      SATURDAY: "Th 7",
      SUNDAY: "CN",
    };
    return dayLabels[dayOfWeek] || dayOfWeek;
  };

  const getProgress = (completed, total) => {
    if (!total || total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getSelectedChildData = () => {
    return children.find((c) => c.id === selectedChild);
  };

  const childData = getSelectedChildData();

  // Stats
  const stats = {
    total: classes.length,
    ongoing: classes.filter((c) => c.status === "ONGOING").length,
    completed: classes.filter((c) => c.status === "COMPLETED").length,
  };

  if (loading && !selectedChild) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header - Inspired by ClassDojo */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white">
        <div className="px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Child Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border-2 border-white/30">
                <span className="text-2xl font-bold">
                  {childData?.name?.charAt(0) || "H"}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedChild || ""}
                    onChange={(e) => {
                      setSelectedChild(Number(e.target.value));
                      setSelectedClass(null);
                    }}
                    className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer appearance-none pr-8"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                      backgroundPosition: "right 0 center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                    }}
                  >
                    {children.map((child) => (
                      <option
                        key={child.id}
                        value={child.id}
                        className="text-gray-900 text-base"
                      >
                        {child.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-indigo-200 mt-1">Theo dõi tiến độ học tập</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-indigo-200">Lớp học</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/30 rounded-lg flex items-center justify-center">
                    <Play className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.ongoing}</p>
                    <p className="text-xs text-indigo-200">Đang học</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/30 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.completed}</p>
                    <p className="text-xs text-indigo-200">Hoàn thành</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Classes List */}
          <div className="xl:col-span-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Các lớp đang theo học
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Chọn lớp để xem chi tiết
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-indigo-200 border-t-indigo-600"></div>
                </div>
              ) : classes.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {classes.map((classItem) => {
                    const status = getStatusConfig(classItem.status);
                    const progress = getProgress(
                      classItem.completedSessions,
                      classItem.totalSessions
                    );
                    const isSelected = selectedClass?.id === classItem.id;

                    return (
                      <div
                        key={classItem.id}
                        onClick={() => setSelectedClass(classItem)}
                        className={`p-5 cursor-pointer transition-all duration-200 hover:bg-indigo-50/50 ${
                          isSelected
                            ? "bg-indigo-50 border-l-4 border-indigo-600"
                            : "border-l-4 border-transparent"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Status Badge */}
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`w-2 h-2 rounded-full ${status.dot}`}
                              ></span>
                              <span
                                className={`text-xs font-medium ${status.color}`}
                              >
                                {status.label}
                              </span>
                            </div>

                            {/* Class Name */}
                            <h3 className="font-semibold text-gray-900 mb-1 truncate">
                              {classItem.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-3">
                              {classItem.subject}
                            </p>

                            {/* Schedule Pills */}
                            {classItem.schedule &&
                              classItem.schedule.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {classItem.schedule.map((s, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600"
                                    >
                                      <Clock className="w-3 h-3" />
                                      {getDayLabel(s.dayOfWeek)} {s.startTime}
                                    </span>
                                  ))}
                                </div>
                              )}

                            {/* Progress */}
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-600 w-12 text-right">
                                {progress}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {classItem.completedSessions}/
                              {classItem.totalSessions} buổi học
                            </p>
                          </div>

                          <ChevronRight
                            className={`w-5 h-5 text-gray-300 flex-shrink-0 transition-transform ${
                              isSelected ? "rotate-90 text-indigo-600" : ""
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 font-medium mb-1">
                    Chưa có lớp học
                  </h3>
                  <p className="text-sm text-gray-500">
                    Con chưa được đăng ký lớp học nào
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Class Detail Panel */}
          <div className="xl:col-span-7">
            {selectedClass ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Detail Header */}
                <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                  <button
                    onClick={() => setSelectedClass(null)}
                    className="xl:hidden absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                      getStatusConfig(selectedClass.status).bg
                    } ${getStatusConfig(selectedClass.status).color}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        getStatusConfig(selectedClass.status).dot
                      }`}
                    ></span>
                    {getStatusConfig(selectedClass.status).label}
                  </div>

                  <h2 className="text-xl font-bold mb-1">
                    {selectedClass.name}
                  </h2>
                  <p className="text-indigo-200">{selectedClass.subject}</p>

                  {/* Progress Ring */}
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block">
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="white"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 36}`}
                          strokeDashoffset={`${
                            2 *
                            Math.PI *
                            36 *
                            (1 -
                              getProgress(
                                selectedClass.completedSessions,
                                selectedClass.totalSessions
                              ) /
                                100)
                          }`}
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold">
                          {getProgress(
                            selectedClass.completedSessions,
                            selectedClass.totalSessions
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detail Content */}
                <div className="p-6 space-y-6">
                  {/* Teacher Card */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Giáo viên phụ trách
                    </h3>
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-200">
                        {selectedClass.teacher?.name?.charAt(0) || "G"}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {selectedClass.teacher?.name}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-2">
                          {selectedClass.teacher?.email && (
                            <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                              <Mail className="w-3.5 h-3.5" />
                              {selectedClass.teacher.email}
                            </span>
                          )}
                          {selectedClass.teacher?.phone && (
                            <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                              <Phone className="w-3.5 h-3.5" />
                              {selectedClass.teacher.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Schedule */}
                  {selectedClass.schedule &&
                    selectedClass.schedule.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Lịch học hàng tuần
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedClass.schedule.map((schedule, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors"
                            >
                              <div className="w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center shadow-sm border border-gray-100">
                                <span className="text-xs text-gray-400 leading-none">
                                  {
                                    getDayLabel(schedule.dayOfWeek).split(
                                      " "
                                    )[0]
                                  }
                                </span>
                                <span className="text-lg font-bold text-indigo-600 leading-none">
                                  {getDayLabel(schedule.dayOfWeek).split(
                                    " "
                                  )[1] || getDayLabel(schedule.dayOfWeek)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {schedule.startTime} - {schedule.endTime}
                                </p>
                                {schedule.room && schedule.room !== "N/A" && (
                                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3" />
                                    {schedule.room}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Duration & Progress Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-xs text-blue-600 font-medium mb-1">
                        Ngày bắt đầu
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(selectedClass.startDate).toLocaleDateString(
                          "vi-VN",
                          { day: "2-digit", month: "2-digit" }
                        )}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                      <p className="text-xs text-purple-600 font-medium mb-1">
                        Ngày kết thúc
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(selectedClass.endDate).toLocaleDateString(
                          "vi-VN",
                          { day: "2-digit", month: "2-digit" }
                        )}
                      </p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <p className="text-xs text-emerald-600 font-medium mb-1">
                        Đã hoàn thành
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedClass.completedSessions}/
                        {selectedClass.totalSessions}
                        <span className="text-sm font-normal text-gray-500 ml-1">
                          buổi
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedClass.description && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Mô tả khóa học
                      </h3>
                      <div
                        className="prose prose-sm max-w-none text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100"
                        dangerouslySetInnerHTML={{
                          __html: selectedClass.description,
                        }}
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() =>
                        navigate(`/home/parent/classes/${selectedClass.id}`)
                      }
                      className="flex-1 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg shadow-indigo-200"
                    >
                      Xem chi tiết đầy đủ
                    </button>
                    <button
                      onClick={() =>
                        navigate(
                          `/home/parent/schedule?class=${selectedClass.id}`
                        )
                      }
                      className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Lịch học
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full min-h-[500px] flex items-center justify-center">
                <div className="text-center px-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <BookOpen className="w-10 h-10 text-indigo-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chọn lớp học
                  </h3>
                  <p className="text-gray-500 max-w-sm">
                    Chọn một lớp học từ danh sách bên trái để xem thông tin chi
                    tiết về lịch học, giáo viên và tiến độ học tập của con
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildClasses;
