// src/pages/admin/classrooms/ClassroomList.jsx
import { useEffect, useState, useCallback } from "react";
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
import { Switch } from "../../../components/ui/Switch"; // ✅ THÊM
import ClassroomForm from "./RoomForm";
import { useToast } from "../../../hooks/use-toast"; // ✅ dùng hook
import { Edit } from "lucide-react"; // ✅ THÊM

export default function ClassroomList() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toast = useToast(); // ✅ KHỞI TẠO

  const normalizeRoom = (r) => ({
    ...r,
    enabled:
      // ưu tiên nếu BE đã có boolean enabled
      typeof r.enabled === "boolean"
        ? r.enabled
        : // nếu BE có active / isActive
        typeof r.active === "boolean"
        ? r.active
        : typeof r.isActive === "boolean"
        ? r.isActive
        : // nếu BE có disabled / isDisabled (logic ngược)
        typeof r.disabled === "boolean"
        ? !r.disabled
        : typeof r.isDisabled === "boolean"
        ? !r.isDisabled
        : // nếu BE có status dạng chuỗi
        typeof r.status === "string"
        ? ["ACTIVE", "ENABLED", "AVAILABLE"].includes(r.status.toUpperCase())
        : false, // mặc định
  });

  const fetchClassrooms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await classroomService.list({ q: search });
      const items = Array.isArray(data)
        ? data
        : data?.items ?? data?.content ?? [];
      setClassrooms(items.map(normalizeRoom)); // ✅ luôn có c.enabled đúng
      // eslint-disable-next-line no-unused-vars
    } catch (_) {
      toast?.error?.("Lỗi tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  }, [search]);

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý lớp học</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setIsDialogOpen(true);
          }}
        >
          + Thêm lớp học
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Tìm kiếm lớp học..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={fetchClassrooms}>Tìm</Button>
      </div>

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
          ) : classrooms.length ? (
            classrooms.map((c) => (
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
