// src/pages/admin/classrooms/ClassroomList.jsx
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
import { Plus } from "lucide-react";
// SidePanel removed: chuyển detail sang Dialog popup theo yêu cầu
// import SidePanel from "../../../components/ui/SidePanel";
import {
  Dialog as DetailDialog,
  DialogContent as DetailContent,
  DialogHeader as DetailHeader,
  DialogTitle as DetailTitle,
} from "../../../components/ui/Dialog";
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
  const [editing, setEditing] = useState(null); // for form create/edit
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // sort & filter
  const [sortBy, setSortBy] = useState(SORTS.NAME_ASC);
  const [filterBy, setFilterBy] = useState(FILTERS.ALL);

  const toast = useToast();
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

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
      // Tránh đưa toast vào dependency của useCallback/useEffect để không bị loop
      toastRef.current?.error?.("Lỗi tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  // Quan trọng: chỉ phụ thuộc vào debouncedSearch để tránh re-render vô hạn
  useEffect(() => {
    fetchClassrooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleToggleStatus = async (id, nextEnabled) => {
    try {
      // Find room for guard
      const room = classrooms.find((c) => c.id === id);
      if (
        !nextEnabled &&
        room &&
        (room.numClasses || room.classCount || room.soLop) > 0
      ) {
        const count = room.numClasses || room.classCount || room.soLop;
        toast?.error?.(
          `Phòng đang được sử dụng bởi ${count} lớp chưa hoàn thành, không thể vô hiệu hóa.`
        );
        return;
      }
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

    // 2) Sắp xếp: chỉ sort theo sortBy, không ưu tiên enabled nữa
    list.sort((a, b) => {
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
      {/* Header giống SubjectManagement */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Quản lý phòng học
        </h1>
        <p className="text-gray-500">
          Quản lý thông tin các phòng học trong hệ thống
        </p>
      </div>
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
            {/* removed action column */}
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
              <TableRow
                key={c.id}
                className="hover:bg-indigo-50 cursor-pointer"
                onClick={(e) => {
                  // Nếu click nằm trong vùng có class 'no-row-open' (toggle status) thì không mở detail
                  if (e.target.closest(".no-row-open")) return;
                  setSelected(c);
                  setDetailOpen(true);
                }}
              >
                <TableCell>{c.id}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell align="center">{c.capacity}</TableCell>

                <TableCell align="center">
                  <div
                    className="flex items-center justify-center gap-2 no-row-open"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Switch
                      checked={!!c.enabled}
                      onCheckedChange={(v) => handleToggleStatus(c.id, v)}
                      aria-label={`Chuyển trạng thái phòng ${c.name}`}
                    />
                    <span
                      className={
                        c.enabled
                          ? "text-sm font-medium text-green-700"
                          : "text-sm font-medium text-red-600"
                      }
                    >
                      {c.enabled ? "Hoạt động" : "Tạm dừng"}
                    </span>
                  </div>
                </TableCell>

                {/* removed action cell */}
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
      <DetailDialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DetailContent className="sm:max-w-xl">
          <DetailHeader>
            <DetailTitle>
              {selected
                ? selected.name || "Thông tin phòng học"
                : "Thông tin phòng học"}
            </DetailTitle>
          </DetailHeader>
          {selected ? (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    Mã phòng
                  </p>
                  <p className="text-sm text-gray-700">{selected.id}</p>
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    Tên phòng
                  </p>
                  <p className="text-sm text-gray-700">{selected.name}</p>
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    Sức chứa
                  </p>
                  <p className="text-sm text-gray-700">{selected.capacity}</p>
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    Trạng thái
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      selected.enabled ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {selected.enabled ? "Hoạt động" : "Tạm dừng"}
                  </p>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-base font-semibold text-gray-900 mb-1">
                  Mô tả
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selected.description || "Không có mô tả"}
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setEditing(selected);
                    setIsDialogOpen(true);
                    setDetailOpen(false);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Sửa
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => toast.error("Xóa phòng học chưa được hỗ trợ")}
                >
                  Xóa
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Không có dữ liệu</div>
          )}
        </DetailContent>
      </DetailDialog>
    </div>
  );
}
