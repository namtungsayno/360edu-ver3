// src/pages/admin/User.jsx
import { useEffect, useMemo, useState } from "react";
import { UserPlus, Users, GraduationCap, UserCog, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/Dialog";
import { useToast } from "../../hooks/use-toast";
import { userService } from "../../services/user/user.service";
import { teacherService } from "../../services/teacher/teacher.service";
import UserViewDialog from "./user/UserViewDialog";
// SidePanel removed (yêu cầu chuyển sang Modal)
// import SidePanel from "../../components/ui/SidePanel";
import useDebounce from "../../hooks/useDebounce";

import UserTable from "./user/UserTable";
import Pagination from "./user/Pagination";
import CreateTeacherForm from "./user/CreateTeacherForm";

const ROLE_LABEL = {
  STUDENT: "Học viên",
  TEACHER: "Giáo viên",
  PARENT: "Phụ huynh",
};
const ROLES = ["ALL", "STUDENT", "TEACHER", "PARENT"];

export default function UserManagement() {
  const { success, error } = useToast();
  const navigate = useNavigate();

  // filter
  const [tab, setTab] = useState("ALL");
  const [query, setQuery] = useState("");
  const q = useDebounce(query, 300);

  // per-tab pagination
  const [pageByTab, setPageByTab] = useState({
    ALL: 0,
    STUDENT: 0,
    TEACHER: 0,
    PARENT: 0,
  });
  const [sizeByTab, setSizeByTab] = useState({
    ALL: 10,
    STUDENT: 10,
    TEACHER: 10,
    PARENT: 10,
  });
  const curPage = pageByTab[tab] ?? 0;
  const curSize = sizeByTab[tab] ?? 10;

  // data loaded once (client-side mode). Nếu bạn dùng server-side, thay bằng listPage(...)
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // dialogs
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailMode, setDetailMode] = useState("view"); // view | edit

  // load data once
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const arr = await userService.list();
        setAllUsers(Array.isArray(arr) ? arr : []);
      } catch (e) {
        console.error(e);
        error("Không thể tải danh sách người dùng");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // counts for tabs
  const counts = useMemo(() => {
    const stu = allUsers.filter((u) => u.role === "STUDENT").length;
    const tea = allUsers.filter((u) => u.role === "TEACHER").length;
    const par = allUsers.filter((u) => u.role === "PARENT").length;
    return { ALL: allUsers.length, STUDENT: stu, TEACHER: tea, PARENT: par };
  }, [allUsers]);

  // filter + paginate
  const filtered = useMemo(() => {
    const roleFiltered =
      tab === "ALL" ? allUsers : allUsers.filter((u) => u.role === tab);
    if (!q) return roleFiltered;
    const kw = q.toLowerCase();
    return roleFiltered.filter(
      (u) =>
        (u.fullName || "").toLowerCase().includes(kw) ||
        (u.email || "").toLowerCase().includes(kw) ||
        (u.phone || "").toLowerCase().includes(kw)
    );
  }, [allUsers, tab, q]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / curSize));
  const pageSafe = Math.min(curPage, totalPages - 1);
  const pageItems = filtered.slice(
    pageSafe * curSize,
    pageSafe * curSize + curSize
  );

  // helpers
  const setPageForCurrentTab = (p) =>
    setPageByTab((prev) => ({ ...prev, [tab]: Math.max(0, p) }));
  const setSizeForCurrentTab = (s) => {
    setSizeByTab((prev) => ({ ...prev, [tab]: s }));
    setPageForCurrentTab(0);
  };

  const handleToggleStatus = async (u) => {
    try {
      // Nếu là giáo viên, luôn fetch realtime classCount để chắc chắn
      if (u.role === "TEACHER") {
        const live = await teacherService.getByUserId(u.id);
        const liveCount = live?.classCount ?? 0;
        // Chặn vô hiệu hóa nếu còn lớp chưa hoàn thành
        if (u.active && liveCount > 0) {
          error(
            `Giáo viên đang được sử dụng bởi ${liveCount} lớp chưa hoàn thành, không thể vô hiệu hóa.`
          );
          return;
        }
      }

      await userService.updateStatus(u.id, !u.active);
      setAllUsers((list) =>
        list.map((x) => (x.id === u.id ? { ...x, active: !u.active } : x))
      );
      success(
        u.active ? "Đã vô hiệu hóa người dùng" : "Đã kích hoạt người dùng"
      );
    } catch (e) {
      console.error(e);
      error(e.response?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

  return (
    <div className="p-6 min-h-screen">
      {/* ============ HEADER ============ */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-200">
            <Users className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý người dùng
            </h1>
            <p className="text-sm text-gray-500">
              Quản lý thông tin học viên, giáo viên và phụ huynh trong hệ thống
            </p>
          </div>
        </div>
      </div>

      {/* ============ STATS CARDS ============ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">
                Tổng người dùng
              </p>
              <p className="text-2xl font-bold text-white mt-1">{counts.ALL}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Học viên</p>
              <p className="text-2xl font-bold text-white mt-1">
                {counts.STUDENT}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Giáo viên</p>
              <p className="text-2xl font-bold text-white mt-1">
                {counts.TEACHER}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <UserCog className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Phụ huynh</p>
              <p className="text-2xl font-bold text-white mt-1">
                {counts.PARENT}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
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
            {ROLES.map((r) => {
              const isActive = tab === r;
              const label = r === "ALL" ? "Tất cả" : ROLE_LABEL[r];
              const count = counts[r] ?? 0;
              return (
                <button
                  key={r}
                  onClick={() => setTab(r)}
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
                placeholder="Tìm kiếm người dùng..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPageForCurrentTab(0);
                }}
              />
            </div>
            <Button
              onClick={() => navigate("/home/admin/users/create-teacher")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" /> Thêm giáo viên
            </Button>
          </div>
        </div>
      </div>

      {/* ============ DATA TABLE ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4">
          <UserTable
            items={pageItems}
            loading={loading}
            onToggleStatus={handleToggleStatus}
            onRowClick={(u) => {
              setSelected(u);
              setDetailMode("view");
              setDetailOpen(true);
            }}
          />

          {/* Pagination */}
          <Pagination
            page={pageSafe}
            size={curSize}
            total={total}
            onPageChange={setPageForCurrentTab}
            onSizeChange={setSizeForCurrentTab}
          />
        </div>
      </div>

      {/* Modal chi tiết / chỉnh sửa người dùng */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {detailMode === "edit"
                ? "Cập nhật người dùng"
                : selected
                ? selected.fullName || "Thông tin người dùng"
                : "Thông tin người dùng"}
            </DialogTitle>
          </DialogHeader>
          {detailMode === "view" && (
            <div className="space-y-4">
              <UserViewDialog user={selected} />
              {selected && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => setDetailMode("edit")}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => error("Chức năng xóa chưa được hỗ trợ")}
                  >
                    Xóa
                  </Button>
                </div>
              )}
            </div>
          )}
          {detailMode === "edit" && (
            <CreateTeacherForm
              user={selected}
              onClose={() => setDetailOpen(false)}
              onSuccess={async () => {
                success("Đã cập nhật người dùng");
                const arr = await userService.list();
                setAllUsers(Array.isArray(arr) ? arr : []);
                setDetailMode("view");
              }}
            />
          )}
          {detailMode === "edit" && (
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailMode("view")}
              >
                Hủy
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal tạo giáo viên đã được thay bằng trang riêng /home/admin/users/create-teacher */}
    </div>
  );
}
