import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  BookOpen,
  SlidersHorizontal,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { classApi } from "../../../services/class/class.api";
import { subjectService } from "../../../services/subject/subject.service";
import { teacherService } from "../../../services/teacher/teacher.service";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Input } from "../../../components/ui/Input.jsx";
import { dayLabelVi, formatDateVN } from "../../../helper/formatters";
import useDebounce from "../../../hooks/useDebounce";

export default function ClassList() {
  const navigate = useNavigate();

  // === SERVER-SIDE PAGINATION STATE ===
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState("");

  // Pagination
  const [page, setPage] = useState(0);
  const [size] = useState(12); // 12 cards per page (3x4 grid)
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filter states - sent to BE
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 400);

  const [selectedSubjectId, setSelectedSubjectId] = useState(""); // For BE filter
  const [selectedTeacherId, setSelectedTeacherId] = useState(""); // For BE filter
  const [isOnline, setIsOnline] = useState(null); // null = all, true = online, false = offline
  const [selectedSlots, setSelectedSlots] = useState([]); // FE filter (BE doesn't support time slots)
  const [priceRange, setPriceRange] = useState([2000000, 10000000]); // FE filter

  // Dropdown data
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // === LOAD DROPDOWN DATA ===
  useEffect(() => {
    (async () => {
      try {
        const [subjectData, teacherData] = await Promise.all([
          subjectService.all(),
          teacherService.list(),
        ]);
        setSubjects(subjectData || []);
        setTeachers(teacherData || []);
      } catch (e) {
        // Failed to load filter data
      }
    })();
  }, []);

  // === RESET PAGE WHEN FILTERS CHANGE ===
  useEffect(() => {
    setPage(0);
  }, [debouncedQuery, selectedSubjectId, selectedTeacherId, isOnline]);

  // === FETCH CLASSES WITH SERVER-SIDE PAGINATION ===
  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await classApi.listPaginated({
        search: debouncedQuery,
        status: "ALL", // Guest always sees PUBLIC classes (BE filters DRAFT)
        isOnline: isOnline,
        teacherUserId: selectedTeacherId || null,
        page,
        size,
        sortBy: "id",
        order: "desc",
      });

      let content = response.content || [];

      // === CLIENT-SIDE FILTERS (not supported by BE) ===
      // 1. Filter by subject (if BE doesn't support subjectId filter)
      if (selectedSubjectId) {
        const subjectName = subjects.find(
          (s) => String(s.id) === String(selectedSubjectId)
        )?.name;
        if (subjectName) {
          content = content.filter((c) => c.subjectName === subjectName);
        }
      }

      // 2. Filter by time slots
      if (selectedSlots.length > 0) {
        content = content.filter((c) => {
          if (!Array.isArray(c.schedule) || c.schedule.length === 0)
            return false;
          return c.schedule.some((sch) => {
            const startTime = sch.startTime?.slice(0, 5);
            if (!startTime) return false;
            const hour = Number.parseInt(startTime.split(":")[0], 10);
            return selectedSlots.some((slot) => {
              if (slot === "slot1") return hour >= 16 && hour < 18;
              if (slot === "slot2") return hour >= 18 && hour < 20;
              if (slot === "slot3") return hour >= 20 && hour < 22;
              return false;
            });
          });
        });
      }

      // 3. Filter by price range
      content = content.filter((c) => {
        const price = c.price || 0;
        if (price === 0) return true;
        return price >= priceRange[0] && price <= priceRange[1];
      });

      // 4. Always hide DRAFT classes for guests
      content = content.filter((c) => c.status !== "DRAFT");

      setClasses(content);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (e) {
      setError("Không tải được danh sách lớp. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [
    debouncedQuery,
    selectedSubjectId,
    selectedTeacherId,
    isOnline,
    selectedSlots,
    priceRange,
    page,
    size,
    subjects,
  ]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // === NAVIGATION ===
  const goDetail = (id) => navigate(`/home/classes/${id}`);

  // === TIME SLOTS ===
  const timeSlots = [
    { label: "Slot 1 (16h-18h)", value: "slot1", time: "16:00 - 18:00" },
    { label: "Slot 2 (18h-20h)", value: "slot2", time: "18:00 - 20:00" },
    { label: "Slot 3 (20h-22h)", value: "slot3", time: "20:00 - 22:00" },
  ];

  const toggleSlot = (slot) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSubjectId("");
    setSelectedTeacherId("");
    setIsOnline(null);
    setSelectedSlots([]);
    setPriceRange([2000000, 10000000]);
  };

  // Count active filters
  const activeFiltersCount = [
    searchQuery,
    selectedSubjectId,
    selectedTeacherId,
    isOnline !== null,
    selectedSlots.length > 0,
    priceRange[0] !== 2000000 || priceRange[1] !== 10000000,
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

  // Derived runtime badge for guests
  function getDerivedBadge(c) {
    const today = new Date();
    const sd = c?.startDate ? new Date(c.startDate) : null;
    const ed = c?.endDate ? new Date(c.endDate) : null;
    if (c?.status === "DRAFT") {
      if (sd && sd > today)
        return { label: "Sắp mở", className: "bg-sky-100 text-sky-700" };
      return { label: "Sắp diễn ra", className: "bg-amber-100 text-amber-700" };
    }
    if (sd && sd > today)
      return { label: "Sắp mở", className: "bg-sky-100 text-sky-700" };
    if (sd && ed && sd <= today && today <= ed)
      return {
        label: "Đang diễn ra",
        className: "bg-violet-100 text-violet-700",
      };
    return null;
  }

  // === PAGINATION HELPERS ===
  const canGoPrev = page > 0;
  const canGoNext = page < totalPages - 1;

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

        /* Custom Range Slider */
        input[type="range"].slider-thumb {
          -webkit-appearance: none;
          appearance: none;
        }
        input[type="range"].slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: all 0.2s;
        }
        input[type="range"].slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        input[type="range"].slider-thumb::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          border: none;
          transition: all 0.2s;
        }
        input[type="range"].slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        {/* Improved Hero Banner - Compact & Informative */}
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
                  <h1 className="text-3xl font-bold">Khám phá Lớp học</h1>
                </div>
                <p className="text-blue-100 text-base max-w-2xl mx-auto">
                  Tìm lớp học phù hợp với mục tiêu của bạn. Giáo viên giàu kinh
                  nghiệm, lịch học linh hoạt, học phí hợp lý.
                </p>
              </div>

              {/* Quick Stats Cards - Same width as search */}
              <div className="w-full max-w-2xl flex gap-4 justify-center">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex-1 border border-white/20">
                  <div className="text-2xl font-bold mb-1">{totalElements}</div>
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

              {/* Quick Search Bar in Banner */}
              <div className="w-full max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm nhanh lớp học, môn học, giáo viên..."
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
            {/* Left Sidebar - Scrollable Filter Panel */}
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

                  {/* Filters Content - Scrollable */}
                  <div className="p-4 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
                    {/* Subject Filter */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Môn học
                      </label>
                      <div className="relative">
                        <select
                          value={selectedSubjectId}
                          onChange={(e) => setSelectedSubjectId(e.target.value)}
                          className="w-full h-10 pl-3 pr-10 bg-white border border-gray-300 rounded-lg appearance-none cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition text-sm"
                        >
                          <option value="">Tất cả môn học</option>
                          {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                              {subject.name}
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
                          value={selectedTeacherId}
                          onChange={(e) => setSelectedTeacherId(e.target.value)}
                          className="w-full h-10 pl-3 pr-10 bg-white border border-gray-300 rounded-lg appearance-none cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition text-sm"
                        >
                          <option value="">Tất cả giáo viên</option>
                          {teachers.map((teacher) => (
                            <option key={teacher.userId} value={teacher.userId}>
                              {teacher.fullName}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Online/Offline Filter */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Hình thức học
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsOnline(null)}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isOnline === null
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Tất cả
                        </button>
                        <button
                          onClick={() => setIsOnline(true)}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isOnline === true
                              ? "bg-green-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Online
                        </button>
                        <button
                          onClick={() => setIsOnline(false)}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isOnline === false
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Offline
                        </button>
                      </div>
                    </div>

                    {/* Time Slots Filter */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Khung giờ học
                      </label>
                      <div className="space-y-2">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.value}
                            onClick={() => toggleSlot(slot.value)}
                            className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all text-left ${
                              selectedSlots.includes(slot.value)
                                ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-300"
                                : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">
                                {slot.label}
                              </span>
                              {selectedSlots.includes(slot.value) && (
                                <span className="text-xs">✓</span>
                              )}
                            </div>
                            <div className="text-xs mt-1 opacity-90">
                              {slot.time}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range Filter - Slider */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Khoảng giá (học phí/khóa)
                      </label>
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
                        {/* Display Selected Range */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-bold text-blue-700">
                            {formatPrice(priceRange[0])}
                          </span>
                          <span className="text-xs text-gray-500">→</span>
                          <span className="text-sm font-bold text-purple-700">
                            {formatPrice(priceRange[1])}
                          </span>
                        </div>

                        {/* Min Price Slider */}
                        <div className="mb-4">
                          <label className="text-xs text-gray-600 mb-1 block">
                            Giá tối thiểu
                          </label>
                          <input
                            type="range"
                            min="2000000"
                            max="10000000"
                            step="500000"
                            value={priceRange[0]}
                            onChange={(e) => {
                              const newMin = Number.parseInt(
                                e.target.value,
                                10
                              );
                              if (newMin <= priceRange[1]) {
                                setPriceRange([newMin, priceRange[1]]);
                              }
                            }}
                            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                          />
                        </div>

                        {/* Max Price Slider */}
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">
                            Giá tối đa
                          </label>
                          <input
                            type="range"
                            min="2000000"
                            max="10000000"
                            step="500000"
                            value={priceRange[1]}
                            onChange={(e) => {
                              const newMax = Number.parseInt(
                                e.target.value,
                                10
                              );
                              if (newMax >= priceRange[0]) {
                                setPriceRange([priceRange[0], newMax]);
                              }
                            }}
                            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Active Filters */}
                    {activeFiltersCount > 0 && (
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Đang áp dụng
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {searchQuery && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              "{searchQuery}"
                              <X
                                className="w-3.5 h-3.5 cursor-pointer hover:text-gray-900"
                                onClick={() => setSearchQuery("")}
                              />
                            </span>
                          )}
                          {selectedSubjectId && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {
                                subjects.find(
                                  (s) =>
                                    String(s.id) === String(selectedSubjectId)
                                )?.name
                              }
                              <X
                                className="w-3.5 h-3.5 cursor-pointer hover:text-blue-900"
                                onClick={() => setSelectedSubjectId("")}
                              />
                            </span>
                          )}
                          {selectedTeacherId && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                              {
                                teachers.find(
                                  (t) =>
                                    String(t.userId) ===
                                    String(selectedTeacherId)
                                )?.fullName
                              }
                              <X
                                className="w-3.5 h-3.5 cursor-pointer hover:text-purple-900"
                                onClick={() => setSelectedTeacherId("")}
                              />
                            </span>
                          )}
                          {isOnline !== null && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              {isOnline ? "Online" : "Offline"}
                              <X
                                className="w-3.5 h-3.5 cursor-pointer hover:text-green-900"
                                onClick={() => setIsOnline(null)}
                              />
                            </span>
                          )}
                          {selectedSlots.map((slot) => {
                            const slotInfo = timeSlots.find(
                              (s) => s.value === slot
                            );
                            return (
                              <span
                                key={slot}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium"
                              >
                                {slotInfo?.label}
                                <X
                                  className="w-3.5 h-3.5 cursor-pointer hover:text-amber-900"
                                  onClick={() => toggleSlot(slot)}
                                />
                              </span>
                            );
                          })}
                          {(priceRange[0] !== 2000000 ||
                            priceRange[1] !== 10000000) && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                              {formatPrice(priceRange[0])} -{" "}
                              {formatPrice(priceRange[1])}
                              <X
                                className="w-3.5 h-3.5 cursor-pointer hover:text-orange-900"
                                onClick={() =>
                                  setPriceRange([2000000, 10000000])
                                }
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
                        {classes.length}
                      </span>{" "}
                      / {totalElements} lớp học
                      {totalPages > 1 && ` • Trang ${page + 1}/${totalPages}`}
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

              {error && !loading && (
                <div className="text-center py-12">
                  <p className="text-red-600">{error}</p>
                  <Button onClick={fetchClasses} className="mt-4">
                    Thử lại
                  </Button>
                </div>
              )}

              {!loading && !error && (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {classes.map((c, idx) => {
                      const teacherInitial = (c.teacherFullName || "G")
                        .charAt(0)
                        .toUpperCase();
                      const currentStudents = c.currentStudents || 0;
                      const maxStudents = c.maxStudents || 30;
                      const enrollmentPercentage =
                        (currentStudents / maxStudents) * 100;

                      return (
                        <Card
                          key={c.id}
                          className={`group overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border-2 flex flex-col h-full ${
                            c.status === "DRAFT"
                              ? "border-amber-300"
                              : "border-transparent hover:border-blue-200"
                          }`}
                          onClick={() => goDetail(c.id)}
                        >
                          {/* Card Header với Gradient & Overlay */}
                          <div
                            className={`bg-gradient-to-br ${
                              gradients[idx % gradients.length]
                            } h-44 relative`}
                          >
                            <div
                              className={`absolute inset-0 ${
                                c.status === "DRAFT"
                                  ? "bg-white/30"
                                  : "bg-black/10 group-hover:bg-black/20"
                              } transition-all`}
                            ></div>
                            <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                              <div className="flex flex-col gap-2">
                                <Badge className="bg-white/95 text-gray-900 backdrop-blur-sm shadow-lg w-fit font-medium">
                                  {c.subjectName || "Môn học"}
                                </Badge>
                                <Badge
                                  className={
                                    c.online
                                      ? "bg-green-500/90 backdrop-blur-sm shadow-lg w-fit"
                                      : "bg-blue-500/90 backdrop-blur-sm shadow-lg w-fit"
                                  }
                                >
                                  {c.online ? " Online" : " Offline"}
                                </Badge>
                                {(() => {
                                  const b = getDerivedBadge(c);
                                  return b ? (
                                    <span
                                      className={`px-2 py-1 text-xs rounded-full ${b.className}`}
                                    >
                                      {b.label}
                                    </span>
                                  ) : null;
                                })()}
                                {c.startDate && (
                                  <span className="px-2 py-1 text-xs rounded-full bg-white/90 text-gray-800 shadow-sm border border-gray-200">
                                    Mở: {formatDateVN(c.startDate)}
                                  </span>
                                )}
                              </div>
                              <div className="bg-white/20 backdrop-blur-md rounded-full p-2.5 shadow-lg">
                                <BookOpen className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          </div>

                          <CardContent className="p-5 relative flex-1 flex flex-col">
                            {/* Teacher Avatar - Overlapping */}
                            <div className="absolute -top-10 right-4">
                              <div className="w-20 h-20 rounded-full bg-white ring-4 ring-white shadow-xl flex items-center justify-center overflow-hidden">
                                {c.teacherAvatarUrl ? (
                                  <img
                                    src={c.teacherAvatarUrl}
                                    alt={c.teacherFullName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-blue-600">
                                      {teacherInitial}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Class Name */}
                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors pr-24">
                              {c.name || `Lớp ${c.subjectName || "học"}`}
                            </h3>

                            {/* Teacher Info */}
                            <div className="flex items-center gap-2 mb-3">
                              <Users className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-700">
                                {c.teacherFullName || "Đang cập nhật"}
                              </span>
                            </div>

                            {/* Schedule & Date Info */}
                            <div className="space-y-2 mb-4">
                              {Array.isArray(c.schedule) &&
                              c.schedule.length > 0 ? (
                                <div className="text-sm text-gray-600">
                                  {dayLabelVi(c.schedule[0].dayOfWeek)} •{" "}
                                  {c.schedule[0].startTime?.slice(0, 5)} -{" "}
                                  {c.schedule[0].endTime?.slice(0, 5)}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-600">
                                  Thứ Hai, Tư, Sáu • 19:00 - 21:00
                                </div>
                              )}
                              {c.startDate && (
                                <div className="text-sm text-gray-600">
                                  Khai giảng: {formatDateVN(c.startDate)}
                                </div>
                              )}
                            </div>

                            {/* Spacer to push content below to bottom */}
                            <div className="flex-1"></div>

                            {/* Enrollment Progress */}
                            <div className="mb-4 bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between text-xs mb-2">
                                <span className="text-gray-600 font-medium">
                                  Đã đăng ký
                                </span>
                                <span className="font-bold text-blue-600">
                                  {currentStudents}/{maxStudents}
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                                  style={{ width: `${enrollmentPercentage}%` }}
                                />
                              </div>
                            </div>

                            {/* CTA Button */}
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg group-hover:shadow-xl transition-all">
                              <span className="font-medium">
                                Xem chi tiết lớp học
                              </span>
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Empty State */}
                  {classes.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        Không tìm thấy lớp học phù hợp
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                      </p>
                    </div>
                  )}

                  {/* === PAGINATION === */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={!canGoPrev}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Trang trước
                      </Button>

                      <div className="flex items-center gap-2">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i;
                            } else if (page < 3) {
                              pageNum = i;
                            } else if (page > totalPages - 4) {
                              pageNum = totalPages - 5 + i;
                            } else {
                              pageNum = page - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => setPage(pageNum)}
                                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                                  page === pageNum
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                                }`}
                              >
                                {pageNum + 1}
                              </button>
                            );
                          }
                        )}
                      </div>

                      <Button
                        variant="outline"
                        onClick={() =>
                          setPage((p) => Math.min(totalPages - 1, p + 1))
                        }
                        disabled={!canGoNext}
                        className="flex items-center gap-2"
                      >
                        Trang sau
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {/* Page Info */}
                  {totalPages > 1 && (
                    <div className="mt-4 text-center text-sm text-gray-500">
                      Hiển thị {page * size + 1} -{" "}
                      {Math.min((page + 1) * size, totalElements)} trong tổng số{" "}
                      {totalElements} lớp học
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
