// src/pages/admin/classrooms/ClassroomList.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { classroomService } from "../../../services/classrooms/classroom.service";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../../components/ui/Table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/Dialog";
import { Switch } from "../../../components/ui/Switch";
import ClassroomForm from "./RoomForm";
import { useToast } from "../../../hooks/use-toast";
import { Edit, Plus } from "lucide-react";
import useDebounce from "../../../hooks/useDebounce";

const SORTS = {
  NAME_ASC: "NAME_ASC",
  NAME_DESC: "NAME_DESC",
  CAP_ASC: "CAP_ASC",
  CAP_DESC: "CAP_DESC",
};

const FILTERS = {
  ALL: "ALL",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

export default function ClassroomList() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [editing, setEditing] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // sort & filter
  const [sortBy, setSortBy] = useState(SORTS.NAME_ASC);
  const [filterBy, setFilterBy] = useState(FILTERS.ALL);

  const toast = useToast();

  const normalizeRoom = (r) => ({
    ...r,
    enabled:
      typeof r.enabled === "boolean"
        ? r.enabled
        : typeof r.active === "boolean"
        ? r.active
        : typeof r.isActive === "boolean"
        ? r.isActive
        : typeof r.disabled === "boolean"
        ? !r.disabled
        : typeof r.isDisabled === "boolean"
        ? !r.isDisabled
        : typeof r.status === "string"
        ? ["ACTIVE", "ENABLED", "AVAILABLE"].includes(r.status.toUpperCase())
        : false,
  });

  const fetchClassrooms = useCallback(async () => {
    setLoading(true);
    try {
      // Gửi nhiều khóa tìm kiếm phổ biến lên BE nếu có hỗ trợ
      const params = {
        q: debouncedSearch || undefined,
        name: debouncedSearch || undefined,
        keyword: debouncedSearch || undefined,
      };
      const data = await classroomService.list(params);
      const items = Array.isArray(data)
        ? data
        : data?.items ?? data?.content ?? [];
      setClassrooms(items.map(normalizeRoom));
      // eslint-disable-next-line no-unused-vars
    } catch (_) {
      toast?.error?.("Lỗi tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  const handleToggleStatus = async (id, nextEnabled) => {
    try {
      if (nextEnabled && classroomService.enable) {
        await classroomService.enable(id);
      } else if (!nextEnabled && classroomService.disable) {
        await classroomService.disable(id);
      } else if (classroomService.update) {
        await classroomService.update(id, { enabled: nextEnabled });
      }

      setClassrooms((prev) =>
        prev.map((c) => (c.id === id ? { ...c, enabled: nextEnabled } : c))
      );

      toast?.success?.(nextEnabled ? "Đã bật phòng học" : "Đã tắt phòng học");
      // eslint-disable-next-line no-unused-vars
    } catch (_) {
      toast?.error?.("Cập nhật trạng thái thất bại");
    }
  };

  // Đếm số lượng theo filter để hiển thị (12) như screenshot
  const getCount = (type) => {
    if (type === FILTERS.ACTIVE)
      return classrooms.filter((c) => !!c.enabled).length;
    if (type === FILTERS.INACTIVE)
      return classrooms.filter((c) => !c.enabled).length;
    return classrooms.length;
  };

  // --- FILTER + SORT (client-side) ---
  const displayedRooms = useMemo(() => {
    let list = [...classrooms];

    // Fallback filter client-side theo search (nếu BE không lọc)
    const kw = (debouncedSearch || "").trim().toLowerCase();
    if (kw) {
      list = list.filter((r) => {
        const name = (r.name || "").toLowerCase();
        const idStr = String(r.id || "").toLowerCase();
        const capStr = String(r.capacity || "").toLowerCase();
        return name.includes(kw) || idStr.includes(kw) || capStr.includes(kw);
      });
    }

    // 1) Lọc theo trạng thái
    if (filterBy === FILTERS.ACTIVE) {
      list = list.filter((r) => !!r.enabled);
    } else if (filterBy === FILTERS.INACTIVE) {
      list = list.filter((r) => !r.enabled);
    }

    // 2) Sắp xếp: luôn ưu tiên enabled=true lên trước
    list.sort((a, b) => {
      if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;

      // sort phụ
      const nameA = (a.name ?? "").toString();
      const nameB = (b.name ?? "").toString();
      const capA = Number(a.capacity ?? 0);
      const capB = Number(b.capacity ?? 0);

      switch (sortBy) {
        case SORTS.NAME_ASC:
          return nameA.localeCompare(nameB, "vi", { sensitivity: "base" });
        case SORTS.NAME_DESC:
          return nameB.localeCompare(nameA, "vi", { sensitivity: "base" });
        case SORTS.CAP_ASC:
          return capA - capB;
        case SORTS.CAP_DESC:
          return capB - capA;
        default:
          return 0;
      }
    });

    return list;
  }, [classrooms, sortBy, filterBy, debouncedSearch]);

  return (
    <div className="p-6 space-y-6">
      {/* Thanh điều khiển giống screenshot, có SORT + SEARCH ngắn */}
      <div className="flex items-center justify-between rounded-xl border bg-white p-3 md:p-4">
        {/* Pills filter bên trái */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: FILTERS.ALL, label: `Tất cả` },
            { key: FILTERS.ACTIVE, label: `Hoạt động` },
            { key: FILTERS.INACTIVE, label: `Tạm dừng` },
          ].map((opt) => {
            const active = filterBy === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFilterBy(opt.key)}
                className={[
                  "h-8 rounded-full px-3 text-sm transition",
                  active
                    ? "bg-gray-900 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                ].join(" ")}
              >
                {opt.label}
                <span className="ml-1 opacity-80">({getCount(opt.key)})</span>
              </button>
            );
          })}
        </div>

        {/* Search ngắn + Sort + Thêm */}
        <div className="flex items-center gap-2">
          {/* Sort ngắn gọn */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 w-44 rounded-md border px-2 text-sm"
            aria-label="Sắp xếp"
            title="Sắp xếp"
          >
            <option value={SORTS.NAME_ASC}>Tên: A → Z</option>
            <option value={SORTS.NAME_DESC}>Tên: Z → A</option>
            <option value={SORTS.CAP_ASC}>Sức chứa: nhỏ → lớn</option>
            <option value={SORTS.CAP_DESC}>Sức chứa: lớn → nhỏ</option>
          </select>

          {/* Search ngắn */}
          <Input
            placeholder="Tìm theo tên, mã, sức chứa"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchClassrooms()}
            className="h-9 w-56 md:w-72"
          />

          {/* Nút thêm (giống style của User Management: primary + icon) */}
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Thêm lớp học
          </Button>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã</TableHead>
            <TableHead>Tên lớp</TableHead>
            <TableHead align="center">Sức chứa</TableHead>
            <TableHead align="center">Trạng thái</TableHead>
            <TableHead align="right">Hành động</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                Đang tải...
              </TableCell>
            </TableRow>
          ) : displayedRooms.length ? (
            displayedRooms.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.id}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell align="center">{c.capacity}</TableCell>

                <TableCell align="center">
                  <div className="flex items-center justify-center gap-2">
                    <Switch
                      checked={!!c.enabled}
                      onCheckedChange={(v) => handleToggleStatus(c.id, v)}
                      aria-label={`Chuyển trạng thái phòng ${c.name}`}
                    />
                    <span className="text-sm text-gray-600">
                      {c.enabled ? "Hoạt động" : "Tạm dừng"}
                    </span>
                  </div>
                </TableCell>

                <TableCell align="right">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Sửa"
                    title="Sửa"
                    onClick={() => {
                      setEditing(c);
                      setIsDialogOpen(true);
                    }}
                    className="hover:bg-gray-100"
                  >
                    <Edit className="h-5 w-5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                Không có dữ liệu
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Dialog thêm/sửa — light theme */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white text-gray-900 border border-gray-200">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Chỉnh sửa lớp học" : "Thêm lớp học mới"}
            </DialogTitle>
          </DialogHeader>
          <ClassroomForm
            initialData={editing}
            onClose={() => {
              setIsDialogOpen(false);
              fetchClassrooms();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
