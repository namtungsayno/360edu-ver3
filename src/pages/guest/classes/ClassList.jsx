import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, BookOpen, TrendingUp, SlidersHorizontal, ChevronDown, ArrowUpDown, X } from "lucide-react";
import { classService } from "../../../services/class/class.service";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Input } from "../../../components/ui/Input.jsx";
import { dayLabelVi } from "../../../helper/formatters";

export default function ClassList() {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedDays, setSelectedDays] = useState([]); // T2-CN
  const [priceSort, setPriceSort] = useState(""); // "asc" hoặc "desc"
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await classService.list();
        const classList = Array.isArray(data) ? data : [];
        setClasses(classList);
        setFilteredClasses(classList);
      } catch (e) {
        console.error("Failed to load classes", e);
        setError("Không tải được danh sách lớp. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter và search nâng cao
  useEffect(() => {
    let result = [...classes];
    
    // Apply search
    if (searchQuery) {
      result = result.filter(c => 
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subjectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.teacherFullName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by subject
    if (selectedSubject) {
      result = result.filter(c => c.subjectName === selectedSubject);
    }

    // Filter by teacher
    if (selectedTeacher) {
      result = result.filter(c => c.teacherFullName === selectedTeacher);
    }

    // Filter by days of week
    if (selectedDays.length > 0) {
      result = result.filter(c => {
        const scheduleText = c.schedule || "";
        return selectedDays.some(day => scheduleText.includes(day));
      });
    }

    // Sort by price
    if (priceSort === "asc") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (priceSort === "desc") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    setFilteredClasses(result);
  }, [searchQuery, selectedSubject, selectedTeacher, selectedDays, priceSort, classes]);

  const goDetail = (id) => navigate(`/home/classes/${id}`);

  // Lấy danh sách unique để tạo filters
  const subjects = [...new Set(classes.map(c => c.subjectName).filter(Boolean))];
  const teachers = [...new Set(classes.map(c => c.teacherFullName).filter(Boolean))];
  
  // Danh sách các ngày trong tuần
  const daysOfWeek = [
    { label: "Thứ 2", value: "T2" },
    { label: "Thứ 3", value: "T3" },
    { label: "Thứ 4", value: "T4" },
    { label: "Thứ 5", value: "T5" },
    { label: "Thứ 6", value: "T6" },
    { label: "Thứ 7", value: "T7" },
    { label: "Chủ nhật", value: "CN" }
  ];

  // Toggle day selection
  const toggleDay = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedSubject("");
    setSelectedTeacher("");
    setSelectedDays([]);
    setPriceSort("");
    setSearchQuery("");
  };

  // Count active filters
  const activeFiltersCount = [selectedSubject, selectedTeacher, selectedDays.length > 0, priceSort, searchQuery].filter(Boolean).length;

  // Gradient backgrounds cho các cards
  const gradients = [
    "from-blue-500 via-blue-600 to-indigo-600",
    "from-purple-500 via-purple-600 to-pink-600", 
    "from-green-500 via-emerald-600 to-teal-600",
    "from-orange-500 via-amber-600 to-yellow-600",
    "from-red-500 via-rose-600 to-pink-600",
    "from-cyan-500 via-blue-600 to-indigo-600"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Improved Hero Banner - Compact & Informative */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-[1920px] mx-auto px-6 py-8 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-6">
            {/* Left: Title & Description */}
            <div className="flex-1 min-w-[300px]">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="w-8 h-8" />
                <h1 className="text-3xl font-bold">Khám phá Lớp học</h1>
              </div>
              <p className="text-blue-100 text-base max-w-2xl">
                Tìm lớp học phù hợp với mục tiêu của bạn. Giáo viên giàu kinh nghiệm, lịch học linh hoạt, học phí hợp lý.
              </p>
            </div>

            {/* Right: Quick Stats Cards */}
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 min-w-[120px] border border-white/20">
                <div className="text-2xl font-bold mb-1">{filteredClasses.length}</div>
                <div className="text-xs text-blue-100">Lớp học</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 min-w-[120px] border border-white/20">
                <div className="text-2xl font-bold mb-1">{subjects.length}</div>
                <div className="text-xs text-blue-100">Môn học</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 min-w-[120px] border border-white/20">
                <div className="text-2xl font-bold mb-1">{teachers.length}</div>
                <div className="text-xs text-blue-100">Giáo viên</div>
              </div>
            </div>
          </div>

          {/* Quick Search Bar in Banner */}
          <div className="mt-6 max-w-2xl">
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

      {/* Main Content with Sidebar */}
      <div className="max-w-[1920px] mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar - Fixed Filter Panel */}
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-4">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Sidebar Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4" />
                      <h3 className="font-bold text-base">Bộ lọc</h3>
                    </div>
                    {activeFiltersCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Filters Content */}
                <div className="p-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {/* Subject Filter */}
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      📚 Môn học
                    </label>
                    <div className="relative">
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full h-9 pl-2.5 pr-8 bg-white border border-gray-300 rounded-lg appearance-none cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition text-xs"
                      >
                        <option value="">Tất cả môn học</option>
                        {subjects.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Teacher Filter */}
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      👨‍🏫 Giáo viên
                    </label>
                    <div className="relative">
                      <select
                        value={selectedTeacher}
                        onChange={(e) => setSelectedTeacher(e.target.value)}
                        className="w-full h-9 pl-2.5 pr-8 bg-white border border-gray-300 rounded-lg appearance-none cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition text-xs"
                      >
                        <option value="">Tất cả giáo viên</option>
                        {teachers.map((teacher) => (
                          <option key={teacher} value={teacher}>
                            {teacher}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Days of Week Filter */}
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      📅 Ngày trong tuần
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {daysOfWeek.map((day) => (
                        <button
                          key={day.value}
                          onClick={() => toggleDay(day.value)}
                          className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                            selectedDays.includes(day.value)
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Sort */}
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      💰 Học phí
                    </label>
                    <div className="relative">
                      <select
                        value={priceSort}
                        onChange={(e) => setPriceSort(e.target.value)}
                        className="w-full h-9 pl-2.5 pr-8 bg-white border border-gray-300 rounded-lg appearance-none cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition text-xs"
                      >
                        <option value="">Mặc định</option>
                        <option value="asc">Thấp đến cao</option>
                        <option value="desc">Cao đến thấp</option>
                      </select>
                      <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Active Filters */}
                  {activeFiltersCount > 0 && (
                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        🏷️ Đang áp dụng
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSubject && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                            {selectedSubject}
                            <X className="w-3 h-3 cursor-pointer hover:text-blue-900" onClick={() => setSelectedSubject("")} />
                          </span>
                        )}
                        {selectedTeacher && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                            {selectedTeacher}
                            <X className="w-3 h-3 cursor-pointer hover:text-purple-900" onClick={() => setSelectedTeacher("")} />
                          </span>
                        )}
                        {selectedDays.map((day) => (
                          <span key={day} className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                            {day}
                            <X className="w-3 h-3 cursor-pointer hover:text-green-900" onClick={() => toggleDay(day)} />
                          </span>
                        ))}
                        {priceSort && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                            {priceSort === "asc" ? "Giá ↑" : "Giá ↓"}
                            <X className="w-3 h-3 cursor-pointer hover:text-orange-900" onClick={() => setPriceSort("")} />
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Clear All Button */}
                  {activeFiltersCount > 0 && (
                    <Button
                      onClick={clearFilters}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 h-8 text-xs"
                    >
                      Xóa tất cả bộ lọc
                    </Button>
                  )}
                </div>

                {/* Results Count */}
                <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-200">
                  <p className="text-xs text-gray-600 text-center">
                    <span className="font-bold text-blue-600">{filteredClasses.length}</span> lớp học
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
              const teacherInitial = (c.teacherFullName || "G").charAt(0).toUpperCase();
              const currentStudents = c.currentStudents || 0;
              const maxStudents = c.maxStudents || 30;
              const enrollmentPercentage = (currentStudents / maxStudents) * 100;
              
              return (
              <Card 
                key={c.id} 
                className="group overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-200"
                onClick={() => goDetail(c.id)}
              >
                {/* Card Header với Gradient & Overlay */}
                <div className={`bg-gradient-to-br ${gradients[idx % gradients.length]} h-44 relative`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all"></div>
                  <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                    <div className="flex flex-col gap-2">
                      <Badge className="bg-white/95 text-gray-900 backdrop-blur-sm shadow-lg w-fit font-medium">
                        {c.subjectName || "Môn học"}
                      </Badge>
                      <Badge className={c.online ? "bg-green-500/90 backdrop-blur-sm shadow-lg w-fit" : "bg-blue-500/90 backdrop-blur-sm shadow-lg w-fit"}>
                        {c.online ? "🌐 Online" : "📍 Offline"}
                      </Badge>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-full p-2.5 shadow-lg">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <CardContent className="p-5 relative">
                  {/* Teacher Avatar - Overlapping */}
                  <div className="absolute -top-10 right-4">
                    <div className="w-20 h-20 rounded-full bg-white ring-4 ring-white shadow-xl flex items-center justify-center">
                      <div className="w-18 h-18 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <span className="text-2xl font-bold text-blue-600">{teacherInitial}</span>
                      </div>
                    </div>
                  </div>

                  {/* Class Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors pr-24">
                    {c.name || `Lớp ${c.subjectName || 'học'}`}
                  </h3>
                  
                  {/* Teacher Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">{c.teacherFullName || "Đang cập nhật"}</span>
                  </div>

                  {/* Schedule & Date Info */}
                  <div className="space-y-2 mb-4">
                    {Array.isArray(c.schedule) && c.schedule.length > 0 ? (
                      <div className="text-sm text-gray-600">
                        {dayLabelVi(c.schedule[0].dayOfWeek)} • {c.schedule[0].startTime?.slice(0,5)} - {c.schedule[0].endTime?.slice(0,5)}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        Thứ Hai, Tư, Sáu • 19:00 - 21:00
                      </div>
                    )}
                    {c.startDate && (
                      <div className="text-sm text-gray-600">
                        Khai giảng: {c.startDate}
                      </div>
                    )}
                  </div>

                  {/* Enrollment Progress */}
                  <div className="mb-4 bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-600 font-medium">Đã đăng ký</span>
                      <span className="font-bold text-blue-600">{currentStudents}/{maxStudents}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${enrollmentPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg group-hover:shadow-xl transition-all"
                  >
                    <span className="font-medium">Xem chi tiết lớp học</span>
                  </Button>
                </CardContent>
              </Card>
              );
            })}

            {filteredClasses.length === 0 && (
              <div className="col-span-full text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Không tìm thấy lớp học phù hợp</p>
                <p className="text-gray-400 text-sm mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
