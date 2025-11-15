// src/pages/admin/User.jsx
import { useEffect, useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
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

const ROLE_LABEL = { STUDENT: "Student", TEACHER: "Teacher", PARENT: "Parent" };
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Quản lý người dùng
        </h1>
        <p className="text-gray-500">
          Quản lý thông tin học viên, giáo viên và phụ huynh
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex gap-2 overflow-x-auto">
            {ROLES.map((r) => {
              const active = tab === r;
              const label =
                r === "ALL"
                  ? `Tất cả (${counts.ALL})`
                  : `${ROLE_LABEL[r]} (${counts[r] ?? 0})`;
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
              placeholder="Tìm theo tên, email, số điện thoại…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPageForCurrentTab(0);
              }}
            />
            <Button
              onClick={() => navigate("/home/admin/users/create-teacher")}
            >
              <UserPlus className="w-4 h-4 mr-2" /> Thêm giáo viên
            </Button>
          </div>
        </div>

        {/* Data table */}
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
