import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  BookOpen,
  SlidersHorizontal,
  ChevronDown,
  X,
  Video,
  ExternalLink,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { enrollmentService } from "../../services/enrollment/enrollment.service";
import { formatDateVN } from "../../helper/formatters";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card, CardContent } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";

export default function Classes() {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const navigate = useNavigate();
  const { error: showError } = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await enrollmentService.listMyClasses();
        const classList = Array.isArray(data) ? data : [];
        setClasses(classList);
        setFilteredClasses(classList);
      } catch {
        setError("Không tải được danh sách lớp đã đăng ký. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter và search
  useEffect(() => {
    let result = [...classes];

    // Apply search
    if (searchQuery) {
      result = result.filter(
        (c) =>
          c.className?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.subjectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.teacherName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by subject
    if (selectedSubject) {
      result = result.filter((c) => c.subjectName === selectedSubject);
    }

    // Filter by teacher
    if (selectedTeacher) {
      result = result.filter((c) => c.teacherName === selectedTeacher);
    }

    setFilteredClasses(result);
  }, [searchQuery, selectedSubject, selectedTeacher, classes]);

  const isFirstSessionToday = (c) => {
    const today = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(
      today.getDate()
    )}`;
    const firstDate = c.firstSessionDate || c.startDate;
    if (!firstDate) return false;
    return String(firstDate).slice(0, 10) === todayStr;
  };

  const goDetail = (id, c) => {
    // Chặn lớp đầy slot (nếu dữ liệu có)
    const current = Number(c.currentStudents || 0);
    const max = Number(c.maxStudents || 0);
    if (max > 0 && current >= max) {
      showError("Lớp học đã đầy slot, vui lòng chọn lớp khác", "Lớp đầy");
      return;
    }

    // Xác nhận nếu lớp bắt đầu hôm nay
    if (isFirstSessionToday(c)) {
      const ok = window.confirm(
        `Lớp này bắt đầu học hôm nay. Bạn có muốn tiếp tục vào chi tiết lớp (đang học)?`
      );
      if (!ok) return;
    }

    navigate(`/home/my-classes/${id}`);
  };

  // Lấy danh sách unique để tạo filters
  const subjects = [
    ...new Set(classes.map((c) => c.subjectName).filter(Boolean)),
  ];
  const teachers = [
    ...new Set(classes.map((c) => c.teacherName).filter(Boolean)),
  ];

  // Clear all filters
  const clearFilters = () => {
    setSelectedSubject("");
    setSelectedTeacher("");
    setSearchQuery("");
  };

  // Count active filters
  const activeFiltersCount = [
    selectedSubject,
    selectedTeacher,
    searchQuery,
  ].filter(Boolean).length;

  // Gradient backgrounds cho các cards
  const gradients = [
    "from-blue-500 via-blue-600 to-indigo-600",
    "from-purple-500 via-purple-600 to-pink-600",
    "from-green-500 via-emerald-600 to-teal-600",
    "from-orange-500 via-amber-600 to-yellow-600",
    "from-red-500 via-rose-600 to-pink-600",
    "from-cyan-500 via-blue-600 to-indigo-600",
  ];

  return (
    <>
      <style>{`
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `}</style>

      <div className="bg-gray-50 min-h-screen">
        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-[1920px] mx-auto px-6 py-8 relative z-10">
            <div className="flex flex-col items-center gap-6">
              {/* Title & Description */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <BookOpen className="w-8 h-8" />
                  <h1 className="text-3xl font-bold">Lớp học đã đăng ký</h1>
                </div>
                <p className="text-blue-100 text-base max-w-2xl mx-auto">
                  Danh sách các lớp học bạn đã đăng ký. Theo dõi tiến độ học tập
                  và thông tin lớp học của bạn.
                </p>
              </div>

              {/* Quick Stats Cards */}
              <div className="w-full max-w-2xl flex gap-4 justify-center">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex-1 border border-white/20">
                  <div className="text-2xl font-bold mb-1">
                    {filteredClasses.length}
                  </div>
                  <div className="text-xs text-blue-100">Lớp học</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex-1 border border-white/20">
                  <div className="text-2xl font-bold mb-1">
                    {subjects.length}
                  </div>
                  <div className="text-xs text-blue-100">Môn học</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex-1 border border-white/20">
                  <div className="text-2xl font-bold mb-1">
                    {teachers.length}
                  </div>
                  <div className="text-xs text-blue-100">Giáo viên</div>
                </div>
              </div>

              {/* Quick Search Bar */}
              <div className="w-full max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm lớp học, môn học, giáo viên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 text-base text-gray-900 bg-white/95 backdrop-blur-sm border-0 shadow-lg focus:ring-2 focus:ring-white/50 placeholder:text-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className="max-w-[1920px] mx-auto px-6 py-8">
          <div className="flex gap-6">
            {/* Left Sidebar - Filter Panel */}
            <aside className="w-80 flex-shrink-0">
              <div className="sticky top-4">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Sidebar Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5" />
                        <h3 className="font-bold text-lg">Bộ lọc</h3>
                      </div>
                      {activeFiltersCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                          {activeFiltersCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Filters Content */}
                  <div className="p-4 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
                    {/* Subject Filter */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Môn học
                      </label>
                      <div className="relative">
                        <select
                          value={selectedSubject}
                          onChange={(e) => setSelectedSubject(e.target.value)}
                          className="w-full h-10 pl-3 pr-10 bg-white border border-gray-300 rounded-lg appearance-none cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition text-sm"
                        >
                          <option value="">Tất cả môn học</option>
                          {subjects.map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Teacher Filter */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Giáo viên
                      </label>
                      <div className="relative">
                        <select
                          value={selectedTeacher}
                          onChange={(e) => setSelectedTeacher(e.target.value)}
                          className="w-full h-10 pl-3 pr-10 bg-white border border-gray-300 rounded-lg appearance-none cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition text-sm"
                        >
                          <option value="">Tất cả giáo viên</option>
                          {teachers.map((teacher) => (
                            <option key={teacher} value={teacher}>
                              {teacher}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Active Filters */}
                    {activeFiltersCount > 0 && (
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Đang áp dụng
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedSubject && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {selectedSubject}
                              <X
                                className="w-3.5 h-3.5 cursor-pointer hover:text-blue-900"
                                onClick={() => setSelectedSubject("")}
                              />
                            </span>
                          )}
                          {selectedTeacher && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                              {selectedTeacher}
                              <X
                                className="w-3.5 h-3.5 cursor-pointer hover:text-purple-900"
                                onClick={() => setSelectedTeacher("")}
                              />
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Clear All Button */}
                    {activeFiltersCount > 0 && (
                      <Button
                        onClick={clearFilters}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 h-10 text-sm font-medium"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Xóa tất cả bộ lọc
                      </Button>
                    )}
                  </div>

                  {/* Results Count - Fixed at Bottom */}
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-200">
                    <p className="text-sm text-gray-700 text-center">
                      Hiển thị{" "}
                      <span className="font-bold text-blue-600">
                        {filteredClasses.length}
                      </span>{" "}
                      lớp học
                      {activeFiltersCount > 0 && ` / ${classes.length} tổng`}
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Content - Class List */}
            <main className="flex-1">
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {!loading && !error && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredClasses.map((c, idx) => {
                    const teacherInitial = (c.teacherName || "G")
                      .charAt(0)
                      .toUpperCase();
                    // Tính tiến độ lớp học
                    const totalSessions = c.totalSessions || 0;
                    const completedSessions = c.completedSessions || 0;
                    const progressPercent =
                      totalSessions > 0
                        ? Math.round((completedSessions / totalSessions) * 100)
                        : 0;
                    const isOnline = c.online || c.isOnline;

                    // Xác định trạng thái học dựa trên ngày
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const startDate = c.startDate ? new Date(c.startDate) : null;
                    const endDate = c.endDate ? new Date(c.endDate) : null;
                    
                    let classStatus = "registered"; // Mặc định: Đã đăng ký
                    let statusLabel = " Đã đăng ký";
                    let statusColor = "bg-blue-500/90";
                    
                    if (startDate && endDate) {
                      if (today < startDate) {
                        classStatus = "registered";
                        statusLabel = " Chờ khai giảng";
                        statusColor = "bg-amber-500/90";
                      } else if (today >= startDate && today <= endDate) {
                        classStatus = "active";
                        statusLabel = " Đang học";
                        statusColor = "bg-green-500/90";
                      } else if (today > endDate) {
                        classStatus = "completed";
                        statusLabel = " Đã hoàn thành";
                        statusColor = "bg-emerald-500/90";
                      }
                    }

                    return (
                      <Card
                        key={c.classId}
                        className={`group overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-blue-200 flex flex-col ${
                          Number(c.maxStudents || 0) > 0 &&
                          Number(c.currentStudents || 0) >=
                            Number(c.maxStudents || 0)
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        onClick={() => goDetail(c.classId, c)}
                      >
                        {/* Card Header với Gradient */}
                        <div
                          className={`bg-gradient-to-br ${
                            gradients[idx % gradients.length]
                          } h-36 relative`}
                        >
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all"></div>
                          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                            <div className="flex flex-col gap-1.5">
                              <Badge className="bg-white/95 text-gray-900 backdrop-blur-sm shadow-lg w-fit font-medium text-xs">
                                {c.subjectName || "Môn học"}
                              </Badge>
                              <div className="flex gap-1.5">
                                <Badge
                                  className={`${statusColor} backdrop-blur-sm shadow-lg w-fit text-xs`}
                                >
                                  {statusLabel}
                                </Badge>
                                {isOnline && (
                                  <Badge className="bg-blue-500/90 backdrop-blur-sm shadow-lg w-fit text-xs">
                                    <Video className="w-3 h-3 mr-1" />
                                    Online
                                  </Badge>
                                )}
                                {Number(c.maxStudents || 0) > 0 &&
                                  Number(c.currentStudents || 0) >=
                                    Number(c.maxStudents || 0) && (
                                    <Badge className="bg-red-600/90 text-white backdrop-blur-sm shadow-lg w-fit text-xs">
                                      ⚠ Lớp đầy slot
                                    </Badge>
                                  )}
                              </div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md rounded-full p-2 shadow-lg">
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        </div>

                        <CardContent className="p-4 relative flex-1 flex flex-col">
                          {/* Teacher Avatar - Overlapping */}
                          <div className="absolute -top-8 right-3">
                            <div className="w-16 h-16 rounded-full bg-white ring-4 ring-white shadow-xl flex items-center justify-center overflow-hidden">
                              {c.teacherAvatarUrl ? (
                                <img
                                  src={c.teacherAvatarUrl}
                                  alt={c.teacherName}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                  <span className="text-xl font-bold text-blue-600">
                                    {teacherInitial}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Class Name - Full display */}
                          <h3
                            className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors pr-20 min-h-[48px]"
                            title={c.className}
                          >
                            {c.className || `Lớp ${c.subjectName || "học"}`}
                          </h3>

                          {/* Teacher Info */}
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-700 truncate">
                              {c.teacherName || "Đang cập nhật"}
                            </span>
                          </div>

                          {/* Schedule & Date Info */}
                          <div className="space-y-1 mb-3 text-xs text-gray-600">
                            {c.roomName && (
                              <div className="truncate">
                                📍 Phòng: {c.roomName}
                              </div>
                            )}
                            {c.semesterName && (
                              <div className="truncate">
                                📅 {c.semesterName}
                              </div>
                            )}
                            {c.startDate && c.endDate && (
                              <div>
                                🕐 {formatDateVN(c.startDate)} →{" "}
                                {formatDateVN(c.endDate)}
                              </div>
                            )}
                          </div>

                          {/* Progress Bar for Active/Completed Classes */}
                          {(classStatus === "active" || classStatus === "completed") && totalSessions > 0 && (
                            <div className="mb-3">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Tiến độ</span>
                                <span className="font-medium">
                                  {completedSessions}/{totalSessions} buổi
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Online Link */}
                          {isOnline && c.onlineLink && (
                            <a
                              href={c.onlineLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="mb-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <Video className="w-4 h-4" />
                              <span className="flex-1 truncate">
                                Link học online
                              </span>
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}

                          {/* Spacer */}
                          <div className="flex-1"></div>

                          {/* CTA Button */}
                          <Button
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg group-hover:shadow-xl transition-all mt-auto"
                            disabled={
                              Number(c.maxStudents || 0) > 0 &&
                              Number(c.currentStudents || 0) >=
                                Number(c.maxStudents || 0)
                            }
                          >
                            <span className="font-medium text-sm">
                              Xem chi tiết
                            </span>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {filteredClasses.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        {activeFiltersCount > 0
                          ? "Không tìm thấy lớp học phù hợp"
                          : "Bạn chưa đăng ký lớp học nào"}
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        {activeFiltersCount > 0
                          ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                          : "Hãy đăng ký lớp học để bắt đầu học tập"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
