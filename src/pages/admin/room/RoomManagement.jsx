// src/pages/admin/room/RoomManagement.jsx
// ✨ INLINE EXPANSION - Click row để mở rộng thành form tại chỗ
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { classroomService } from "../../../services/classrooms/classroom.service";
import { useToast } from "../../../hooks/use-toast";
import {
  Building,
  X,
  Pencil,
  Trash2,
  Plus,
  Users,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  DoorOpen,
} from "lucide-react";
import useDebounce from "../../../hooks/useDebounce";
import { Switch } from "../../../components/ui/Switch";

const STATUS_FILTERS = ["ALL", "ACTIVE", "INACTIVE"];

export default function ClassroomList() {
  const toast = useToast();
  const toastRef = useRef(toast);

  // Filter & Search
  const [tab, setTab] = useState("ALL");
  const [query, setQuery] = useState("");
  const q = useDebounce(query, 300);

  // Pagination per tab
  const [pageByTab, setPageByTab] = useState({
    ALL: 0,
    ACTIVE: 0,
    INACTIVE: 0,
  });
  const sizeByTab = { ALL: 8, ACTIVE: 8, INACTIVE: 8 };
  const curPage = pageByTab[tab] ?? 0;
  const curSize = sizeByTab[tab] ?? 8;

  // Data
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Inline Expansion states
  const [expandedId, setExpandedId] = useState(null); // ID of expanded row
  const [editMode, setEditMode] = useState(false); // true = editing, false = viewing
  const [isCreating, setIsCreating] = useState(false); // true = creating new row
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  // Refs for animation
  const expandedRef = useRef(null);

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

  // Counts
  const counts = useMemo(() => {
    const active = allRooms.filter((r) => r.enabled).length;
    const inactive = allRooms.filter((r) => !r.enabled).length;
    return { ALL: allRooms.length, ACTIVE: active, INACTIVE: inactive };
  }, [allRooms]);

  // Filter + paginate
  const filtered = useMemo(() => {
    let list = allRooms;
    if (tab === "ACTIVE") list = allRooms.filter((r) => r.enabled);
    else if (tab === "INACTIVE") list = allRooms.filter((r) => !r.enabled);

    if (!q) return list;
    const kw = q.toLowerCase();
    return list.filter(
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
  const setPage = (p) =>
    setPageByTab((prev) => ({ ...prev, [tab]: Math.max(0, p) }));

  // Toggle status
  const handleToggleStatus = async (room, e) => {
    e?.stopPropagation();
    const nextEnabled = !room.enabled;
    try {
      if (
        !nextEnabled &&
        (room.numClasses || room.classCount || room.soLop) > 0
      ) {
        toast?.error?.("Phòng đang được sử dụng, không thể vô hiệu hóa.");
        return;
      }
      if (nextEnabled && classroomService.enable)
        await classroomService.enable(room.id);
      else if (!nextEnabled && classroomService.disable)
        await classroomService.disable(room.id);
      else if (classroomService.update)
        await classroomService.update(room.id, { enabled: nextEnabled });

      setAllRooms((prev) =>
        prev.map((r) => (r.id === room.id ? { ...r, enabled: nextEnabled } : r))
      );
      toast?.success?.(nextEnabled ? "Đã bật phòng học" : "Đã tắt phòng học");
    } catch {
      toast?.error?.("Cập nhật thất bại");
    }
  };

  // ============ INLINE EXPANSION HANDLERS ============

  // Expand row to view details
  const expandRow = (room) => {
    if (expandedId === room.id && !editMode) {
      // Collapse if clicking same row
      collapseRow();
      return;
    }
    setExpandedId(room.id);
    setEditMode(false);
    setIsCreating(false);
    setFormData({
      name: room.name || "",
      capacity: room.capacity || "",
      description: room.description || "",
    });
  };

  // Switch to edit mode
  const startEdit = () => {
    setEditMode(true);
  };

  // Start creating new
  const startCreate = () => {
    setExpandedId(null);
    setIsCreating(true);
    setEditMode(true);
    setFormData({ name: "", capacity: "", description: "" });
  };

  // Collapse/Cancel
  const collapseRow = () => {
    setExpandedId(null);
    setEditMode(false);
    setIsCreating(false);
    setFormData({ name: "", capacity: "", description: "" });
  };

  // Form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save
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
      if (isCreating) {
        await classroomService.create(formData);
        toast?.success?.("Thêm phòng học thành công!");
      } else if (expandedId) {
        await classroomService.update(expandedId, formData);
        toast?.success?.("Cập nhật thành công!");
      }
      collapseRow();
      fetchClassrooms();
    } catch {
      toast?.error?.("Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  // Get current room data
  const currentRoom = expandedId
    ? allRooms.find((r) => r.id === expandedId)
    : null;

  return (
    <div className="p-6 min-h-screen">
      {/* ============ HEADER ============ */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-200">
            <DoorOpen className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý phòng học
            </h1>
            <p className="text-sm text-gray-500">
              Click vào dòng để xem chi tiết • Double-click để chỉnh sửa
            </p>
          </div>
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

          {/* Search + Add */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm phòng..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                className="pl-10 pr-4 py-2.5 w-64 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <button
              onClick={startCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              Thêm phòng
            </button>
          </div>
        </div>
      </div>

      {/* ============ CREATE NEW ROW (Inline) ============ */}
      {isCreating && (
        <div className="mb-4 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-dashed border-indigo-300 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Tạo phòng học mới
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Tên phòng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="VD: Phòng A101"
                    autoFocus
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Sức chứa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="VD: 40"
                    min="1"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Mô tả
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Mô tả ngắn..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={collapseRow}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Tạo phòng
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ TABLE WITH INLINE EXPANSION ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/80 border-b border-gray-100">
          <div className="col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            STT
          </div>
          <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Tên phòng
          </div>
          <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Sức chứa
          </div>
          <div className="col-span-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Mô tả
          </div>
          <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
            Trạng thái
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="px-6 py-16 text-center">
              <div className="inline-flex items-center gap-3 text-gray-500">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
                Đang tải...
              </div>
            </div>
          ) : pageItems.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <DoorOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Không có phòng học nào</p>
            </div>
          ) : (
            pageItems.map((room, idx) => {
              const isExpanded = expandedId === room.id;
              const rowNum = pageSafe * curSize + idx + 1;

              return (
                <div key={room.id} className="group">
                  {/* ============ COLLAPSED ROW ============ */}
                  <div
                    onClick={() => expandRow(room)}
                    onDoubleClick={() => {
                      expandRow(room);
                      setTimeout(() => setEditMode(true), 100);
                    }}
                    className={`
                      grid grid-cols-12 gap-4 px-6 py-4 cursor-pointer transition-all duration-200
                      ${
                        isExpanded
                          ? "bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50"
                          : "hover:bg-gray-50/80"
                      }
                    `}
                  >
                    <div className="col-span-1 flex items-center">
                      <span
                        className={`
                        w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold
                        ${
                          isExpanded
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                        }
                        transition-colors
                      `}
                      >
                        {rowNum}
                      </span>
                    </div>
                    <div className="col-span-3 flex items-center gap-3">
                      <div
                        className={`
                        p-2 rounded-xl transition-colors
                        ${
                          isExpanded
                            ? "bg-indigo-100"
                            : "bg-gray-100 group-hover:bg-indigo-50"
                        }
                      `}
                      >
                        <Building
                          className={`w-4 h-4 ${
                            isExpanded ? "text-indigo-600" : "text-gray-500"
                          }`}
                        />
                      </div>
                      <span className="font-medium text-gray-900">
                        {room.name}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{room.capacity} người</span>
                      </div>
                    </div>
                    <div className="col-span-4 flex items-center">
                      <span className="text-gray-500 truncate">
                        {room.description || "—"}
                      </span>
                    </div>
                    <div
                      className="col-span-2 flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={room.enabled}
                          onCheckedChange={() => handleToggleStatus(room)}
                        />
                        <span
                          className={`text-xs font-medium ${
                            room.enabled ? "text-emerald-600" : "text-gray-400"
                          }`}
                        >
                          {room.enabled ? "Bật" : "Tắt"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ============ EXPANDED SECTION ============ */}
                  <div
                    ref={isExpanded ? expandedRef : null}
                    className={`
                      overflow-hidden transition-all duration-300 ease-out
                      ${
                        isExpanded
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                      }
                    `}
                  >
                    <div className="px-6 pb-6 bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-pink-50/50">
                      <div className="pt-2 border-t border-indigo-100">
                        {editMode ? (
                          /* ============ EDIT MODE ============ */
                          <div className="pt-4">
                            <div className="flex items-center gap-2 mb-4">
                              <Pencil className="w-4 h-4 text-indigo-600" />
                              <span className="text-sm font-semibold text-indigo-600">
                                Chế độ chỉnh sửa
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                  Tên phòng
                                </label>
                                <input
                                  type="text"
                                  name="name"
                                  value={formData.name}
                                  onChange={handleChange}
                                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                  Sức chứa
                                </label>
                                <input
                                  type="number"
                                  name="capacity"
                                  value={formData.capacity}
                                  onChange={handleChange}
                                  min="1"
                                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                  Mô tả
                                </label>
                                <input
                                  type="text"
                                  name="description"
                                  value={formData.description}
                                  onChange={handleChange}
                                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditMode(false);
                                  setFormData({
                                    name: currentRoom?.name || "",
                                    capacity: currentRoom?.capacity || "",
                                    description: currentRoom?.description || "",
                                  });
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
                              >
                                {saving ? (
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                                Lưu
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* ============ VIEW MODE ============ */
                          <div className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                              <div className="bg-white rounded-xl p-4 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">
                                  Mã phòng
                                </p>
                                <p className="text-lg font-bold text-gray-900">
                                  #{room.id}
                                </p>
                              </div>
                              <div className="bg-white rounded-xl p-4 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">
                                  Tên phòng
                                </p>
                                <p className="text-lg font-bold text-gray-900">
                                  {room.name}
                                </p>
                              </div>
                              <div className="bg-white rounded-xl p-4 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">
                                  Sức chứa
                                </p>
                                <p className="text-lg font-bold text-indigo-600">
                                  {room.capacity} người
                                </p>
                              </div>
                              <div className="bg-white rounded-xl p-4 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">
                                  Trạng thái
                                </p>
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm font-medium ${
                                    room.enabled
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      room.enabled
                                        ? "bg-emerald-500"
                                        : "bg-gray-400"
                                    }`}
                                  />
                                  {room.enabled ? "Hoạt động" : "Tạm dừng"}
                                </span>
                              </div>
                            </div>
                            {room.description && (
                              <div className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
                                <p className="text-xs text-gray-500 mb-1">
                                  Mô tả
                                </p>
                                <p className="text-sm text-gray-700">
                                  {room.description}
                                </p>
                              </div>
                            )}
                            <div className="flex justify-between items-center">
                              <button
                                onClick={collapseRow}
                                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                              >
                                <ChevronDown className="w-4 h-4 rotate-180" />
                                Thu gọn
                              </button>
                              <div className="flex gap-2">
                                <button
                                  onClick={startEdit}
                                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                  Chỉnh sửa
                                </button>
                                <button
                                  onClick={() =>
                                    toast?.error?.(
                                      "Xóa phòng học chưa được hỗ trợ"
                                    )
                                  }
                                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Xóa
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ============ PAGINATION ============ */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Hiển thị {pageItems.length} / {total} phòng học
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(pageSafe - 1)}
              disabled={pageSafe === 0}
              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (pageSafe < 3) {
                  pageNum = i;
                } else if (pageSafe > totalPages - 4) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = pageSafe - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      pageSafe === pageNum
                        ? "bg-gray-900 text-white shadow-lg"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(pageSafe + 1)}
              disabled={pageSafe >= totalPages - 1}
              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
