//src/pages/guest/TeacherList.jsx
import { useOutletContext } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { teacherApi } from "../../../services/teacher/teacher.api";
import { subjectService } from "../../../services/subject/subject.service";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import {
  Award,
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Loader2,
  GraduationCap,
} from "lucide-react";
import useDebounce from "../../../hooks/useDebounce";

export default function TeacherList() {
  const { onNavigate } = useOutletContext();

  // === SERVER-SIDE PAGINATION STATE ===
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 400);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  // Dropdown data
  const [subjects, setSubjects] = useState([]);

  // === LOAD SUBJECTS FOR FILTER ===
  useEffect(() => {
    (async () => {
      try {
        const data = await subjectService.all();
        setSubjects(data || []);
      } catch (e) {
        console.error("Failed to load subjects:", e);
      }
    })();
  }, []);

  // === RESET PAGE WHEN FILTERS CHANGE ===
  useEffect(() => {
    setPage(0);
  }, [debouncedQuery, selectedSubjectId]);

  // === FETCH TEACHERS WITH SERVER-SIDE PAGINATION ===
  const fetchTeachers = useCallback(async () => {
    console.log("📡 Fetching teachers with BE pagination...");
    setLoading(true);
    setError("");

    try {
      const response = await teacherApi.listPaginated({
        search: debouncedQuery,
        subjectId: selectedSubjectId || null,
        page,
        size,
        sortBy: "id",
        order: "asc",
      });

      console.log("📊 BE Response:", response);

      const enrichedTeachers = (response.content || []).map((teacher) => ({
        id: teacher.id,
        userId: teacher.userId,
        name: teacher.fullName || teacher.username,
        subject:
          teacher.subjectNames?.join(", ") ||
          teacher.subjectName ||
          "Chưa xác định",
        experience: teacher.yearsOfExperience
          ? `${teacher.yearsOfExperience} năm kinh nghiệm`
          : teacher.degree || "Giáo viên",
        courses: teacher.classCount || 0,
        rating: teacher.rating || 0,
        // Chỉ hiển thị degree trong card, specialization có HTML nên bỏ qua
        achievements: [teacher.degree].filter(Boolean),
        avatar: teacher.avatarUrl,
        bio: teacher.bio,
        workplace: teacher.workplace,
      }));

      setTeachers(enrichedTeachers);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (e) {
      console.error("❌ Failed to fetch teachers:", e);
      setError("Không tải được danh sách giáo viên. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, selectedSubjectId, page, size]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // === HELPERS ===
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSubjectId("");
  };

  const activeFiltersCount = [searchQuery, selectedSubjectId].filter(
    Boolean
  ).length;

  const canGoPrev = page > 0;
  const canGoNext = page < totalPages - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-rose-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <GraduationCap className="w-8 h-8" />
                <h1 className="text-3xl font-bold">Đội ngũ Giáo viên</h1>
              </div>
              <p className="text-purple-100 text-base max-w-2xl mx-auto">
                Gặp gỡ đội ngũ giáo viên chuyên nghiệp và giàu kinh nghiệm, sẵn
                sàng hướng dẫn bạn.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="w-full max-w-xl flex gap-4 justify-center">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex-1 border border-white/20">
                <div className="text-2xl font-bold mb-1">{totalElements}</div>
                <div className="text-xs text-purple-100">Giáo viên</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex-1 border border-white/20">
                <div className="text-2xl font-bold mb-1">{subjects.length}</div>
                <div className="text-xs text-purple-100">Môn học</div>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="w-full max-w-2xl flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm giáo viên theo tên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base text-gray-900 bg-white/95 backdrop-blur-sm border-0 shadow-lg focus:ring-2 focus:ring-white/50 placeholder:text-gray-500"
                />
                {loading && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500 animate-spin" />
                )}
              </div>
              <div className="relative w-64">
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full h-12 pl-4 pr-10 bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-lg text-gray-900 appearance-none cursor-pointer focus:ring-2 focus:ring-white/50"
                >
                  <option value="">Tất cả môn học</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-3">
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-full text-sm">
                    "{searchQuery}"
                    <X
                      className="w-4 h-4 cursor-pointer hover:text-white/80"
                      onClick={() => setSearchQuery("")}
                    />
                  </span>
                )}
                {selectedSubjectId && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-full text-sm">
                    {
                      subjects.find(
                        (s) => String(s.id) === String(selectedSubjectId)
                      )?.name
                    }
                    <X
                      className="w-4 h-4 cursor-pointer hover:text-white/80"
                      onClick={() => setSelectedSubjectId("")}
                    />
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm underline hover:text-white/80"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Hiển thị{" "}
            <span className="font-bold text-purple-600">{teachers.length}</span>{" "}
            / {totalElements} giáo viên
            {totalPages > 1 && ` • Trang ${page + 1}/${totalPages}`}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <Card key={idx} className="animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchTeachers} className="mt-4">
              Thử lại
            </Button>
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Không tìm thấy giáo viên</p>
            <p className="text-gray-400 text-sm mt-2">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((teacher) => {
                const nameParts = (teacher.name || "").trim().split(" ");
                const lastInitial = nameParts.length
                  ? nameParts[nameParts.length - 1].charAt(0)
                  : "?";

                return (
                  <Card
                    key={teacher.id}
                    className="group hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    {/* Avatar Background */}
                    <div className="h-56 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center relative">
                      {teacher.avatar ? (
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                          <img
                            src={teacher.avatar}
                            alt={teacher.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-white/20 border-4 border-white shadow-lg flex items-center justify-center">
                          <span className="text-6xl font-bold text-white">
                            {lastInitial}
                          </span>
                        </div>
                      )}
                      {/* Rating badge */}
                      <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-xs font-bold">
                        ⭐ {teacher.rating}
                      </div>
                    </div>

                    <CardContent className="p-4 flex flex-col">
                      <h3 className="text-lg font-semibold mb-1">
                        {teacher.name}
                      </h3>
                      <Badge className="mb-2">{teacher.subject}</Badge>
                      <p className="text-gray-600 text-sm mb-3">
                        {teacher.experience}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-center gap-6 mb-3 pb-3 border-b">
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">
                            {teacher.courses}
                          </p>
                          <p className="text-xs text-gray-500">Lớp học</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-yellow-600">
                            {teacher.rating > 0
                              ? teacher.rating.toFixed(1)
                              : "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">Đánh giá</p>
                        </div>
                      </div>

                      {/* Achievements */}
                      <div className="h-12 mb-3 overflow-hidden">
                        {teacher.achievements.length > 0 && (
                          <div className="space-y-1">
                            {teacher.achievements
                              .slice(0, 2)
                              .map((achievement, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-xs text-gray-600"
                                >
                                  <Award className="w-3 h-3 text-yellow-500 shrink-0" />
                                  <span className="line-clamp-1">
                                    {achievement}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      {/* Button */}
                      <Button
                        onClick={() =>
                          onNavigate({
                            type: "teacher",
                            teacherId: teacher.userId,
                          })
                        }
                        className="w-full bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm mt-auto"
                        size="sm"
                      >
                        Xem hồ sơ
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

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
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                            ? "bg-purple-600 text-white shadow-lg"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
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
                {totalElements} giáo viên
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
