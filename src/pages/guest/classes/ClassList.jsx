import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, BookOpen, TrendingUp } from "lucide-react";
import { classService } from "../../../services/class/class.service";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Input } from "../../../components/ui/Input.jsx";

export default function ClassList() {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
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

  // Filter và search
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

    // Apply filter
    if (selectedFilter !== "all") {
      result = result.filter(c => c.subjectName === selectedFilter);
    }

    setFilteredClasses(result);
  }, [searchQuery, selectedFilter, classes]);

  const goDetail = (id) => navigate(`/home/classes/${id}`);

  // Lấy danh sách subject unique để tạo filters
  const subjects = [...new Set(classes.map(c => c.subjectName).filter(Boolean))];

  // Gradient backgrounds cho các cards
  const gradients = [
    "bg-gradient-to-br from-blue-400 to-blue-600",
    "bg-gradient-to-br from-purple-400 to-purple-600", 
    "bg-gradient-to-br from-green-400 to-green-600",
    "bg-gradient-to-br from-orange-400 to-orange-600",
    "bg-gradient-to-br from-red-400 to-red-600",
    "bg-gradient-to-br from-pink-400 to-pink-600"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-4">Lớp học với Giáo viên</h1>
          <p className="text-xl text-blue-100 mb-8">
            Học trực tiếp với giáo viên qua Google Meet hoặc tại trung tâm. Tương tác, thời gian thực, 
            thực, giải đáp thắc mắc ngay lập tức.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl">
            <div className="text-center">
              <div className="text-3xl font-bold">{classes.length}+</div>
              <div className="text-blue-100 text-sm">Học viên</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{subjects.length}</div>
              <div className="text-blue-100 text-sm">Môn học</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{classes.length}</div>
              <div className="text-blue-100 text-sm">Lớp đang mở</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm môn học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12"
            />
          </div>

          {/* Filter Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-600">Cấp học:</span>
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-4 py-1.5 rounded-full text-sm transition ${
                selectedFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            {subjects.slice(0, 5).map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedFilter(subject)}
                className={`px-4 py-1.5 rounded-full text-sm transition ${
                  selectedFilter === subject
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Class Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((c, idx) => (
              <Card key={c.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                {/* Card Header với Gradient */}
                <div className={`${gradients[idx % gradients.length]} h-40 relative`}>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Subject Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                    {c.subjectName || "Môn học"}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {c.description || `Học ${c.subjectName || 'môn học'} với giáo viên chuyên nghiệp, lớp học online qua Google Meet và offline tại trung tâm`}
                  </p>

                  {/* Teacher Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <Users className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Giáo viên</div>
                      <div className="text-sm font-medium text-gray-900">
                        {c.teacherFullName || c.teacher?.user?.fullName || "Đang cập nhật"}
                      </div>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{c.maxStudents || 30} học viên</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{Array.isArray(c.schedule) ? c.schedule.length : 3} lớp</span>
                    </div>
                  </div>

                  {/* Schedule Info */}
                  {Array.isArray(c.schedule) && c.schedule.length > 0 ? (
                    <div className="mb-4 text-sm">
                      <div className="text-gray-700">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">
                            {c.online ? "Online qua Google Meet" : "Offline"}
                          </Badge>
                        </div>
                        <div className="mt-2 text-gray-600">
                          Thứ {c.schedule[0].dayOfWeek} • {c.schedule[0].startTime?.slice(0,5)} - {c.schedule[0].endTime?.slice(0,5)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 text-sm">
                      <div className="text-gray-700">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">
                            Online & Offline
                          </Badge>
                        </div>
                        <div className="mt-2 text-gray-600">
                          Thứ 2, 4, 6 • 19:00 - 21:00
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <div className="text-xs text-gray-500">Học phí</div>
                      <div className="text-lg font-bold text-blue-600">
                        {c.fee ? `${c.fee.toLocaleString()}đ` : "2.500.000đ"}
                      </div>
                    </div>
                    <Button 
                      onClick={() => goDetail(c.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Xem chi tiết & Đăng ký
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredClasses.length === 0 && (
              <div className="col-span-full text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Không tìm thấy lớp học phù hợp</p>
                <p className="text-gray-400 text-sm mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
