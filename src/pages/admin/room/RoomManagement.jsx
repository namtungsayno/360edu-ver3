// src/pages/admin/room/RoomManagement.jsx
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { classroomService } from "../../../services/classrooms/classroom.service";
import { Input } from "../../../components/ui/Input";
import RoomTable from "./RoomTable";
import RoomPagination from "./RoomPagination";
import { useToast } from "../../../hooks/use-toast";
import { Building, X, Pencil, Trash2, Plus, Users } from "lucide-react";
import useDebounce from "../../../hooks/useDebounce";

const STATUS_FILTERS = ["ALL", "ACTIVE", "INACTIVE"];

export default function ClassroomList() {
  const toast = useToast();
  const toastRef = useRef(toast);

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

  // Data
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Side Panel states
  const [panelMode, setPanelMode] = useState(null); // 'view' | 'edit' | 'create' | null
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

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
      const data = await classroomService.list();
      const items = Array.isArray(data)
        ? data
        : data?.items ?? data?.content ?? [];
      setAllRooms(items.map(normalizeRoom));
    } catch {
      toastRef.current?.error?.("Lỗi tải danh sách phòng học");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  // Counts for tabs
  const counts = useMemo(() => {
    const active = allRooms.filter((r) => r.enabled).length;
    const inactive = allRooms.filter((r) => !r.enabled).length;
    return { ALL: allRooms.length, ACTIVE: active, INACTIVE: inactive };
  }, [allRooms]);

  // Filter + paginate
  const filtered = useMemo(() => {
    let statusFiltered;
    if (tab === "ALL") {
      statusFiltered = allRooms;
    } else if (tab === "ACTIVE") {
      statusFiltered = allRooms.filter((r) => r.enabled);
    } else {
      statusFiltered = allRooms.filter((r) => !r.enabled);
    }

    if (!q) return statusFiltered;
    const kw = q.toLowerCase();
    return statusFiltered.filter(
      (r) =>
        (r.name || "").toLowerCase().includes(kw) ||
        String(r.id || "")
          .toLowerCase()
          .includes(kw) ||
        String(r.capacity || "").includes(kw)
    );
  }, [allRooms, tab, q]);

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

  const handleToggleStatus = async (room) => {
    const nextEnabled = !room.enabled;
    try {
      if (
        !nextEnabled &&
        (room.numClasses || room.classCount || room.soLop) > 0
      ) {
        const count = room.numClasses || room.classCount || room.soLop;
        toast?.error?.(
          `Phòng đang được sử dụng bởi ${count} lớp chưa hoàn thành, không thể vô hiệu hóa.`
        );
        return;
      }
      if (nextEnabled && classroomService.enable) {
        await classroomService.enable(room.id);
      } else if (!nextEnabled && classroomService.disable) {
        await classroomService.disable(room.id);
      } else if (classroomService.update) {
        await classroomService.update(room.id, { enabled: nextEnabled });
      }

      setAllRooms((prev) =>
        prev.map((r) => (r.id === room.id ? { ...r, enabled: nextEnabled } : r))
      );

      toast?.success?.(nextEnabled ? "Đã bật phòng học" : "Đã tắt phòng học");
    } catch {
      toast?.error?.("Cập nhật trạng thái thất bại");
    }
  };

  // Side Panel handlers
  const openViewPanel = (room) => {
    setSelected(room);
    setPanelMode("view");
  };

  const openEditPanel = (room) => {
    setSelected(room);
    setFormData({
      name: room?.name || "",
      capacity: room?.capacity || "",
      description: room?.description || "",
    });
    setPanelMode("edit");
  };

  const openCreatePanel = () => {
    setSelected(null);
    setFormData({ name: "", capacity: "", description: "" });
    setPanelMode("create");
  };

  const closePanel = () => {
    setPanelMode(null);
    setSelected(null);
    setFormData({ name: "", capacity: "", description: "" });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast?.error?.("Vui lòng nhập tên phòng học");
      return;
    }
    if (!formData.capacity || Number(formData.capacity) <= 0) {
      toast?.error?.("Vui lòng nhập sức chứa hợp lệ");
      return;
    }

    setSaving(true);
    try {
      if (panelMode === "create") {
        await classroomService.create(formData);
        toast?.success?.("Thêm phòng học thành công!");
      } else if (panelMode === "edit" && selected) {
        await classroomService.update(selected.id, formData);
        toast?.success?.("Cập nhật phòng học thành công!");
      }
      closePanel();
      fetchClassrooms();
    } catch {
      toast?.error?.("Lưu thất bại, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  const handleRowClick = (room) => {
    openViewPanel(room);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý phòng học</h1>
        <p className="text-sm text-gray-600">
          Quản lý thông tin các phòng học trong hệ thống
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
                label = `Tạm dừng (${counts.INACTIVE})`;
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
              placeholder="Tìm theo tên phòng, mã, sức chứa…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPageForCurrentTab(0);
              }}
            />
            <button
              onClick={openCreatePanel}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800"
            >
              <Plus className="w-4 h-4" />
              Thêm phòng học
            </button>
          </div>
        </div>

        {/* Data table */}
        <RoomTable
          items={pageItems}
          loading={loading}
          onToggleStatus={handleToggleStatus}
          onRowClick={handleRowClick}
        />

        {/* Pagination */}
        <RoomPagination
          page={pageSafe}
          size={curSize}
          total={total}
          onPageChange={setPageForCurrentTab}
          onSizeChange={setSizeForCurrentTab}
        />
      </div>

      {/* Side Panel */}
      {panelMode && (
        <div className="fixed inset-0 z-40">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30" onClick={closePanel} />

          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl border-l border-gray-200 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {panelMode === "create"
                  ? "Thêm phòng học mới"
                  : panelMode === "edit"
                  ? "Chỉnh sửa phòng học"
                  : "Thông tin phòng học"}
              </h2>
              <button
                onClick={closePanel}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {panelMode === "view" && selected ? (
                // View mode
                <div className="space-y-6">
                  {/* Room info header */}
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="h-14 w-14 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <Building className="h-7 w-7 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selected.name}
                      </h3>
                      <p className="text-sm text-gray-500">Mã: {selected.id}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Sức chứa</p>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <p className="text-base font-medium text-gray-900">
                          {selected.capacity} người
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          selected.enabled
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {selected.enabled ? "Hoạt động" : "Tạm dừng"}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Mô tả
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3">
                      {selected.description || "Không có mô tả"}
                    </p>
                  </div>
                </div>
              ) : (
                // Create/Edit mode - Form
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên phòng học <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="VD: Phòng A101"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sức chứa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleFormChange}
                      placeholder="VD: 40"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="Nhập mô tả phòng học..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-2">
              {panelMode === "view" ? (
                <>
                  <button
                    onClick={() => openEditPanel(selected)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800"
                  >
                    <Pencil className="h-4 w-4" />
                    Sửa
                  </button>
                  <button
                    onClick={() =>
                      toast?.error?.("Xóa phòng học chưa được hỗ trợ")
                    }
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={closePanel}
                    className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-3 py-2 text-sm rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    {saving ? "Đang lưu..." : "Lưu"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
