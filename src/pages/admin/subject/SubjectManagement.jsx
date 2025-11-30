import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { useToast } from "../../../hooks/use-toast";
import useDebounce from "../../../hooks/useDebounce";
import {
  getAllSubjects,
  enableSubject,
  disableSubject,
} from "../../../services/subject/subject.api";
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

          return {
            id: s.id ?? s.subjectId,
            code: s.code ?? s.subjectCode ?? s.maMon ?? "",
            name: s.name ?? s.subjectName ?? s.tenMon ?? "",
            numCourses: s.numCourses ?? s.courseCount ?? s.soKhoa ?? 0,
            numClasses: s.numClasses ?? s.classCount ?? s.soLop ?? 0,
            active: isActive,
          };
        });
        setAllSubjects(Array.isArray(subjects) ? subjects : []);
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Quản lý môn học
        </h1>
        <p className="text-gray-500">
          Quản lý thông tin các môn học trong hệ thống
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex gap-2 overflow-x-auto">
            {STATUS_FILTERS.map((r) => {
              const active = tab === r;
              let label;
              if (r === "ALL") {
                label = `Tất cả (${counts.ALL})`;
              } else if (r === "ACTIVE") {
                label = `Hoạt động (${counts.ACTIVE})`;
              } else {
                label = `Vô hiệu hóa (${counts.INACTIVE})`;
              }
              return (
                <button
                  key={r}
                  onClick={() => setTab(r)}
                  className={`px-3 py-1.5 rounded-md border whitespace-nowrap ${
                    active
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Input
              className="w-72"
              placeholder="Tìm theo tên môn học, mã môn học…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPageForCurrentTab(0);
              }}
            />
            <Button onClick={() => navigate("/home/admin/subject/create")}>
              <BookOpen className="w-4 h-4 mr-2" /> Thêm môn học
            </Button>
          </div>
        </div>

        {/* Data table */}
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

      {/* Row click now navigates to full Subject Detail page */}

      {/* Create Course moved to full page at /home/admin/courses/create */}
    </div>
  );
}
