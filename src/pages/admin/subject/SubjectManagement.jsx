import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search, CheckCircle, XCircle, Layers } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { useToast } from "../../../hooks/use-toast";
import useDebounce from "../../../hooks/useDebounce";
import {
  getSubjectsPaginated,
  getAllSubjects,
  enableSubject,
  disableSubject,
} from "../../../services/subject/subject.api";
import SubjectTable from "./SubjectTable";
import SubjectPagination from "./SubjectPagination";

const STATUS_FILTERS = ["ALL", "ACTIVE", "INACTIVE"];

// Map FE status to BE status
const mapStatusToBE = (feStatus) => {
  if (feStatus === "ACTIVE") return "AVAILABLE";
  if (feStatus === "INACTIVE") return "UNAVAILABLE";
  return "ALL";
};

export default function SubjectManagement() {
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Filter state
  const [tab, setTab] = useState("ALL");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  // Pagination state (server-side)
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy] = useState("id");
  const [order] = useState("asc");

  // Server response
  const [subjects, setSubjects] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // Stats counts (load once)
  const [counts, setCounts] = useState({ ALL: 0, ACTIVE: 0, INACTIVE: 0 });

  // Load counts once for stats cards
  useEffect(() => {
    (async () => {
      try {
        const all = await getAllSubjects();
        const data = all?.data || all || [];
        const active = data.filter((s) => {
          const status = s.status || s.active;
          return (
            status === "AVAILABLE" || status === "active" || status === true
          );
        }).length;
        setCounts({
          ALL: data.length,
          ACTIVE: active,
          INACTIVE: data.length - active,
        });
      } catch (e) {}
    })();
  }, []);

  // Fetch data with server-side pagination
  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const beStatus = mapStatusToBE(tab);

      const response = await getSubjectsPaginated({
        search: debouncedQuery,
        status: beStatus,
        page,
        size,
        sortBy,
        order,
      });

      // Map BE response to FE format
      const content = response.content || [];
      const mapped = content.map((s) => ({
        id: s.id,
        code: s.code || "",
        name: s.name || "",
        numCourses: s.courseCount || 0,
        numClasses: s.classCount || 0,
        active: s.status === "AVAILABLE",
      }));

      setSubjects(mapped);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (e) {
      error("Không thể tải danh sách môn học");
    } finally {
      setLoading(false);
    }
  }, [tab, debouncedQuery, page, size, sortBy, order, error]);

  // Fetch when filters/pagination change
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Reset page when tab or search changes
  useEffect(() => {
    setPage(0);
  }, [tab, debouncedQuery]);

  // Handlers
  const handleToggleStatus = async (subject) => {
    try {
      if (subject.active && subject.numClasses > 0) {
        error(
          `Môn học đang được sử dụng bởi ${subject.numClasses} lớp chưa hoàn thành, không thể vô hiệu hóa.`
        );
        return;
      }
      if (subject.active) {
        await disableSubject(subject.id);
      } else {
        await enableSubject(subject.id);
      }
      success(
        subject.active ? "Đã vô hiệu hóa môn học" : "Đã kích hoạt môn học"
      );
      // Reload data
      fetchSubjects();
      // Update counts
      setCounts((prev) => ({
        ...prev,
        ACTIVE: subject.active ? prev.ACTIVE - 1 : prev.ACTIVE + 1,
        INACTIVE: subject.active ? prev.INACTIVE + 1 : prev.INACTIVE - 1,
      }));
    } catch (e) {
      error("Cập nhật trạng thái thất bại");
    }
  };

  return (
    <div className="p-6 min-h-screen">
      {/* ============ HEADER ============ */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-200">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý môn học
            </h1>
            <p className="text-sm text-gray-500">
              Quản lý thông tin các môn học trong hệ thống (Server-side
              Pagination)
            </p>
          </div>
        </div>
      </div>

      {/* ============ STATS CARDS ============ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Tổng số môn</p>
              <p className="text-2xl font-bold text-white mt-1">{counts.ALL}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">
                Đang hoạt động
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {counts.ACTIVE}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Tạm dừng</p>
              <p className="text-2xl font-bold text-white mt-1">
                {counts.INACTIVE}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
        </div>
      </div>

      {/* ============ TOOLBAR ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Filter tabs */}
          <div className="flex items-center gap-2">
            {STATUS_FILTERS.map((f) => {
              const isActive = tab === f;
              const label =
                f === "ALL"
                  ? "Tất cả"
                  : f === "ACTIVE"
                  ? "Hoạt động"
                  : "Tạm dừng";
              const count = counts[f];
              return (
                <button
                  key={f}
                  onClick={() => setTab(f)}
                  className={`
                    relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-gray-900 text-white shadow-lg shadow-gray-300"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }
                  `}
                >
                  {label}
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-md text-xs ${
                      isActive ? "bg-white/20" : "bg-gray-200"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="w-72 pl-9"
                placeholder="Tìm kiếm môn học..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button
              onClick={() => navigate("/home/admin/subject/create")}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <BookOpen className="w-4 h-4 mr-2" /> Thêm môn học
            </Button>
          </div>
        </div>
      </div>

      {/* ============ DATA TABLE ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4">
          <SubjectTable
            items={subjects}
            loading={loading}
            onToggleStatus={handleToggleStatus}
            onRowClick={(s) =>
              navigate(`/home/admin/subject/${s.id}`, { state: { subject: s } })
            }
          />

          {/* Pagination - now uses server totalElements */}
          <SubjectPagination
            page={page}
            size={size}
            total={totalElements}
            onPageChange={setPage}
            onSizeChange={(newSize) => {
              setSize(newSize);
              setPage(0);
            }}
          />
        </div>
      </div>
    </div>
  );
}
