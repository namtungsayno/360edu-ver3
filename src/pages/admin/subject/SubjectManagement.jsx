import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search, CheckCircle, XCircle, Layers } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { useToast } from "../../../hooks/use-toast";
import useDebounce from "../../../hooks/useDebounce";
import {
  getAllSubjects,
  enableSubject,
  disableSubject,
} from "../../../services/subject/subject.api";
import { courseApi } from "../../../services/course/course.api";
import SubjectTable from "./SubjectTable";
// Modal view removed; use full page detail instead
// import SubjectViewDialog from "./SubjectViewDialog";
// SidePanel removed theo yêu cầu -> chuyển sang Dialog popup
// import SidePanel from "../../../components/ui/SidePanel";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/Dialog";
import SubjectPagination from "./SubjectPagination";
// Modal creation removed: navigate to create page instead

const STATUS_FILTERS = ["ALL", "ACTIVE", "INACTIVE"];

export default function SubjectManagement() {
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Filter state
  const [tab, setTab] = useState("ALL");
  const [query, setQuery] = useState("");
  const q = useDebounce(query, 300);

  // Per-tab pagination
  const [pageByTab, setPageByTab] = useState({
    ALL: 0,
    ACTIVE: 0,
    INACTIVE: 0,
  });
  const [sizeByTab, setSizeByTab] = useState({
    ALL: 10,
    ACTIVE: 10,
    INACTIVE: 10,
  });
  const curPage = pageByTab[tab] ?? 0;
  const curSize = sizeByTab[tab] ?? 10;

  // Data loaded once (client-side mode)
  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialogs
  // const [selected, setSelected] = useState(null);
  // const [detailOpen, setDetailOpen] = useState(false);
  // const [courseOpen, setCourseOpen] = useState(false); // no longer used
  // panelMode removed (chỉ dùng view hiện tại). Nếu cần edit inline sau này có thể thêm lại.

  // Load data once
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const response = await getAllSubjects();
        if (!mounted) return;

        const data = response?.data || response || [];
        console.log("📊 Backend response:", data); // Debug: xem dữ liệu thô từ backend

        const subjects = data.map((s) => {
          // Xử lý status: hỗ trợ nhiều định dạng từ backend
          let isActive = false;

          // Kiểm tra theo thứ tự ưu tiên
          if (s.active !== undefined && s.active !== null) {
            // Nếu active là string
            if (typeof s.active === "string") {
              const activeStr = s.active.toLowerCase();
              isActive =
                activeStr === "available" ||
                activeStr === "active" ||
                activeStr === "show" ||
                activeStr === "true";
            } else {
              // Nếu active là boolean hoặc number
              isActive = Boolean(s.active);
            }
          } else if (s.status !== undefined && s.status !== null) {
            // Fallback sang status field
            if (typeof s.status === "string") {
              const statusStr = s.status.toLowerCase();
              isActive =
                statusStr === "available" ||
                statusStr === "active" ||
                statusStr === "show";
            } else {
              isActive = Boolean(s.status);
            }
          }

          console.log(
            `Subject "${s.name}": active=${s.active}, status=${s.status} => isActive=${isActive}`
          ); // Debug mỗi subject

          const base = {
            id: s.id ?? s.subjectId,
            code: s.code ?? s.subjectCode ?? s.maMon ?? "",
            name: s.name ?? s.subjectName ?? s.tenMon ?? "",
            numCourses: s.numCourses ?? s.courseCount ?? s.soKhoa ?? 0,
            numClasses: s.numClasses ?? s.classCount ?? s.soLop ?? 0,
            active: isActive,
          };
          return base;
        });
        const listSubjects = Array.isArray(subjects) ? subjects : [];

        // Fetch accurate approved course counts per subject
        const withCounts = await Promise.all(
          listSubjects.map(async (subj) => {
            try {
              const courses = await courseApi.list({
                subjectId: Number(subj.id),
                status: "APPROVED",
              });
              const filtered = (Array.isArray(courses) ? courses : []).filter(
                (c) => {
                  const hasSourceTag = String(c.description || "").includes(
                    "[[SOURCE:"
                  );
                  const isPersonal = c && c.ownerTeacherId != null;
                  return !hasSourceTag && !isPersonal;
                }
              );
              return { ...subj, numCourses: filtered.length };
            } catch (_) {
              return { ...subj };
            }
          })
        );

        setAllSubjects(withCounts);
      } catch (e) {
        if (!mounted) return;
        console.error(e);
        error("Không thể tải danh sách môn học");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Counts for tabs
  const counts = useMemo(() => {
    const active = allSubjects.filter((s) => s.active).length;
    const inactive = allSubjects.filter((s) => !s.active).length;
    return { ALL: allSubjects.length, ACTIVE: active, INACTIVE: inactive };
  }, [allSubjects]);

  // Filter + paginate
  const filtered = useMemo(() => {
    let statusFiltered;
    if (tab === "ALL") {
      statusFiltered = allSubjects;
    } else if (tab === "ACTIVE") {
      statusFiltered = allSubjects.filter((s) => s.active);
    } else {
      statusFiltered = allSubjects.filter((s) => !s.active);
    }

    if (!q) return statusFiltered;
    const kw = q.toLowerCase();
    return statusFiltered.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(kw) ||
        (s.code || "").toLowerCase().includes(kw)
    );
  }, [allSubjects, tab, q]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / curSize));
  const pageSafe = Math.min(curPage, totalPages - 1);
  const pageItems = filtered.slice(
    pageSafe * curSize,
    pageSafe * curSize + curSize
  );

  // Helpers
  const setPageForCurrentTab = (p) =>
    setPageByTab((prev) => ({ ...prev, [tab]: Math.max(0, p) }));
  const setSizeForCurrentTab = (s) => {
    setSizeByTab((prev) => ({ ...prev, [tab]: s }));
    setPageForCurrentTab(0);
  };

  const handleToggleStatus = async (subject) => {
    try {
      // Guard: nếu đang được lớp sử dụng thì không cho vô hiệu hóa
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
      setAllSubjects((list) =>
        list.map((x) =>
          x.id === subject.id ? { ...x, active: !subject.active } : x
        )
      );
      success(
        subject.active ? "Đã vô hiệu hóa môn học" : "Đã kích hoạt môn học"
      );
    } catch (e) {
      console.error(e);
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
              Quản lý thông tin các môn học trong hệ thống
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
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPageForCurrentTab(0);
                }}
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
            items={pageItems}
            loading={loading}
            onToggleStatus={handleToggleStatus}
            onRowClick={(s) =>
              navigate(`/home/admin/subject/${s.id}`, { state: { subject: s } })
            }
          />

          {/* Pagination */}
          <SubjectPagination
            page={pageSafe}
            size={curSize}
            total={total}
            onPageChange={setPageForCurrentTab}
            onSizeChange={setSizeForCurrentTab}
          />
        </div>
      </div>

      {/* Row click now navigates to full Subject Detail page */}

      {/* Create Course moved to full page at /home/admin/courses/create */}
    </div>
  );
}
