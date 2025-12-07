import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  X,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  UserCog,
  BookOpen,
} from "lucide-react";
import { useToast } from "../../../hooks/use-toast";
import { teacherService } from "../../../services/teacher/teacher.service";
import { teacherApi } from "../../../services/teacher/teacher.api";
import { getAllSubjects } from "../../../services/subject/subject.api";
import useDebounce from "../../../hooks/useDebounce";

const SubjectChip = ({ label, color = "bg-indigo-100 text-indigo-700" }) => (
  <span
    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${color}`}
  >
    {label}
  </span>
);

const getSubjectColor = (name) => {
  const map = {
    Toán: "bg-blue-100 text-blue-700",
    "Ngữ văn": "bg-pink-100 text-pink-700",
    "Tiếng Anh": "bg-green-100 text-green-700",
    "Vật lý": "bg-purple-100 text-purple-700",
    "Hóa học": "bg-amber-100 text-amber-700",
    "Sinh học": "bg-emerald-100 text-emerald-700",
    "Lịch sử": "bg-red-100 text-red-700",
    "Địa lý": "bg-cyan-100 text-cyan-700",
    "Tin học": "bg-slate-100 text-slate-700",
    GDCD: "bg-orange-100 text-orange-700",
  };
  return map[name] ?? "bg-gray-100 text-gray-700";
};

const TeacherManagement = () => {
  const { error, success } = useToast();
  const toastRef = useRef({ error, success });
  useEffect(() => {
    toastRef.current = { error, success };
  }, [error, success]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [subjectFilter, setSubjectFilter] = useState(""); // subject id or empty

  // Server-side pagination
  const [page, setPage] = useState(0);
  const pageSize = 5;
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [editing, setEditing] = useState(null); // teacher object or null
  const [selectedSubjects, setSelectedSubjects] = useState([]); // subject ids
  const [subjects, setSubjects] = useState([]); // [{id,name}]
  const [teachers, setTeachers] = useState([]);

  // Normalize API teacher payloads to a consistent shape for rendering
  const normalizeTeachers = (list) => {
    return (Array.isArray(list) ? list : []).map((t) => {
      const name =
        t.name ?? t.fullName ?? t.user?.fullName ?? t.user?.name ?? "";
      const email = t.email ?? t.user?.email ?? "";
      const phone = t.phone ?? t.user?.phone ?? t.user?.phoneNumber ?? "";
      const code = t.code ?? t.teacherCode ?? t.user?.code ?? "";
      const avatarUrl =
        t.avatarUrl ?? t.user?.avatarUrl ?? t.user?.avatar ?? null;

      // Subjects can be in different shapes; normalize to array of {id, name}
      let normalizedSubjects = [];
      const rawSubjects = Array.isArray(t.subjects)
        ? t.subjects
        : Array.isArray(t.teacherSubjects)
        ? t.teacherSubjects
        : Array.isArray(t.subjectList)
        ? t.subjectList
        : [];
      normalizedSubjects = rawSubjects
        .map((s) => {
          if (!s) return null;
          if (typeof s === "string") return { id: s, name: s };
          const id = s.id ?? s.subjectId ?? s.idSubject ?? null;
          const name = s.name ?? s.subjectName ?? s.nameSubject ?? null;
          return id || name ? { id, name } : null;
        })
        .filter(Boolean);

      // Classes count can be provided or derived from classes array
      const classesCount =
        t.classCount ??
        t.totalClasses ??
        (Array.isArray(t.classes) ? t.classes.length : 0);

      return {
        id: t.id ?? t.teacherId ?? t.userId ?? code ?? email,
        name,
        email,
        phone,
        code,
        avatarUrl,
        subjects: normalizedSubjects,
        classCount: classesCount,
        primarySubjectId: t.subjectId ?? null,
        primarySubjectName: t.subjectName ?? null,
        // keep raw for any other usage
        _raw: t,
      };
    });
  };

  React.useEffect(() => {
    (async () => {
      try {
        const data = await getAllSubjects();
        setSubjects(Array.isArray(data) ? data : []);
      } catch (e) {
        toastRef.current.error("Không tải được danh sách môn học", "Môn học");
        console.error(e);
      }
    })();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, subjectFilter]);

  // Fetch teachers with server-side pagination
  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const subjectId = subjectFilter ? Number(subjectFilter) : null;
      console.log("📡 Fetching teachers:", {
        search: debouncedSearch,
        subjectId,
        page,
        size: pageSize,
      });

      const response = await teacherApi.listPaginated({
        search: debouncedSearch,
        subjectId,
        page,
        size: pageSize,
        sortBy: "id",
        order: "asc",
      });

      console.log("📊 BE Response:", response);

      const content = response.content || [];
      const base = normalizeTeachers(content);

      // Enrich subjects: ưu tiên teacher_id, fallback by-user nếu route chưa có
      const enriched = await Promise.all(
        base.map(async (t) => {
          try {
            const resp = await teacherApi.getSubjects(t.id);
            const normalized = (Array.isArray(resp) ? resp : [])
              .map((s) => {
                if (!s) return null;
                if (typeof s === "string") return { id: s, name: s };
                const id = s.id ?? s.subjectId ?? s.idSubject ?? null;
                const name = s.name ?? s.subjectName ?? s.nameSubject ?? null;
                return id || name ? { id, name } : null;
              })
              .filter(Boolean);
            return { ...t, subjects: normalized };
          } catch (e) {
            console.error(e);
            // Fallback by-user
            try {
              const userId = t._raw?.userId ?? t.userId;
              if (userId) {
                const detail = await teacherApi.getByUserId(userId);
                const rawSubjects = Array.isArray(detail?.subjects)
                  ? detail.subjects
                  : Array.isArray(detail?.teacherSubjects)
                  ? detail.teacherSubjects
                  : Array.isArray(detail?.subjectList)
                  ? detail.subjectList
                  : [];
                const normalized = rawSubjects
                  .map((s) => {
                    if (!s) return null;
                    if (typeof s === "string") return { id: s, name: s };
                    const id = s.id ?? s.subjectId ?? s.idSubject ?? null;
                    const name =
                      s.name ?? s.subjectName ?? s.nameSubject ?? null;
                    return id || name ? { id, name } : null;
                  })
                  .filter(Boolean);
                return { ...t, subjects: normalized };
              }
            } catch (e2) {
              console.error(e2);
            }
            return t;
          }
        })
      );

      setTeachers(enriched);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (e) {
      toastRef.current.error("Không tải được danh sách giáo viên", "Giáo viên");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, subjectFilter, page, pageSize]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Data for rendering
  const paged = teachers;
  const currentPage = page + 1;

  const openEdit = async (teacher) => {
    try {
      // Lấy danh sách môn hiện tại theo teacher_id
      const data = await teacherApi.getSubjects(teacher.id);
      const normalized = (Array.isArray(data) ? data : [])
        .map((s) => {
          if (!s) return null;
          if (typeof s === "string") return { id: s, name: s };
          const id = s.id ?? s.subjectId ?? s.idSubject ?? null;
          const name = s.name ?? s.subjectName ?? s.nameSubject ?? null;
          return id || name ? { id, name } : null;
        })
        .filter(Boolean);
      // Cập nhật editing với subjects từ backend (teacher_id)
      const updated = { ...teacher, subjects: normalized };
      setEditing(updated);
      setSelectedSubjects(normalized.map((s) => s.id));
    } catch (e) {
      console.error(e);
      // Fallback: thử lấy theo userId nếu backend chưa có route teacher_id
      try {
        const userId = teacher._raw?.userId ?? teacher.userId;
        if (userId) {
          const detail = await teacherApi.getByUserId(userId);
          const rawSubjects = Array.isArray(detail?.subjects)
            ? detail.subjects
            : Array.isArray(detail?.teacherSubjects)
            ? detail.teacherSubjects
            : Array.isArray(detail?.subjectList)
            ? detail.subjectList
            : [];
          const normalized = rawSubjects
            .map((s) => {
              if (!s) return null;
              if (typeof s === "string") return { id: s, name: s };
              const id = s.id ?? s.subjectId ?? s.idSubject ?? null;
              const name = s.name ?? s.subjectName ?? s.nameSubject ?? null;
              return id || name ? { id, name } : null;
            })
            .filter(Boolean);
          const updated = { ...teacher, subjects: normalized };
          setEditing(updated);
          setSelectedSubjects(normalized.map((s) => s.id));
          return;
        }
      } catch (e2) {
        console.error(e2);
      }
      // Nếu vẫn lỗi, mở panel với dữ liệu sẵn có
      setEditing(teacher);
      const currentSubjects = Array.isArray(teacher.subjects)
        ? teacher.subjects
        : Array.isArray(teacher.teacherSubjects)
        ? teacher.teacherSubjects
        : [];
      setSelectedSubjects(
        currentSubjects.map((s) => (typeof s === "string" ? s : s.id))
      );
    }
  };
  const closeEdit = () => {
    setEditing(null);
    setSelectedSubjects([]);
  };
  const [primarySubjectId, setPrimarySubjectId] = useState(null);
  React.useEffect(() => {
    if (editing) {
      setPrimarySubjectId(editing.primarySubjectId ?? null);
    }
  }, [editing]);
  const toggleSubject = (id) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };
  const saveChanges = () => {
    if (selectedSubjects.length === 0) {
      error("Giáo viên cần dạy ít nhất một môn", "Chỉnh sửa môn dạy");
      return;
    }
    (async () => {
      try {
        // Nếu thay đổi môn chính, gọi API đổi môn chính trước
        if (
          editing &&
          primarySubjectId !== null &&
          primarySubjectId !== (editing.primarySubjectId ?? null)
        ) {
          try {
            const resp = await teacherApi.updatePrimarySubject(
              editing.id,
              Number(primarySubjectId)
            );
            if (resp && resp.id && resp.id === -1) {
              // BE trả lỗi dạng SubjectResponse placeholder
              throw { response: { data: [resp] } };
            }
            // Will reload from server after all changes
          } catch (e) {
            let msg = "Không thể đổi môn chính";
            try {
              const data = e?.response?.data;
              if (Array.isArray(data) && data.length > 0) {
                msg = data[0]?.name || msg;
              } else if (typeof data === "string") {
                msg = data;
              } else if (data?.message) {
                msg = data.message;
              }
            } catch (parseErr) {
              // Bỏ qua lỗi parse, giữ thông điệp mặc định
              console.debug(parseErr);
            }
            error(msg, "Chỉnh sửa môn dạy");
            return; // Dừng lại, không cập nhật môn phụ khi đổi môn chính bị chặn
          }
        }
        await teacherApi.updateSubjects(editing.id, selectedSubjects);
        success("Đã lưu danh sách môn dạy", "Chỉnh sửa môn dạy");
        // Reload data from server
        fetchTeachers();
        closeEdit();
      } catch (e) {
        // Hiển thị thông điệp nghiệp vụ từ backend nếu có (400 Bad Request)
        let msg = "Lưu thất bại, vui lòng thử lại";
        try {
          const data = e?.response?.data;
          if (Array.isArray(data) && data.length > 0) {
            // Backend trả SubjectResponse placeholder với name chứa thông điệp
            msg = data[0]?.name || msg;
          } else if (typeof data === "string") {
            msg = data;
          } else if (data?.message) {
            msg = data.message;
          }
        } catch (parseErr) {
          // Bỏ qua lỗi parse, dùng thông điệp mặc định
          console.debug(parseErr);
        }
        error(msg, "Chỉnh sửa môn dạy");
        console.error(e);
      }
    })();
  };

  return (
    <div className="p-6 min-h-screen">
      {/* ============ HEADER ============ */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-200">
            <UserCog className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý giáo viên
            </h1>
            <p className="text-sm text-gray-500">
              Xem và chỉnh sửa danh sách môn dạy của giáo viên
            </p>
          </div>
        </div>
      </div>

      {/* ============ STATS CARDS ============ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">
                Tổng giáo viên
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {teachers.length}
              </p>
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
              <p className="text-sm font-medium text-white/80">
                Đang hoạt động
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {teachers.filter((t) => t.classCount > 0).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <UserCog className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Số môn học</p>
              <p className="text-2xl font-bold text-white mt-1">
                {subjects.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
        </div>
      </div>

      {/* ============ TOOLBAR ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm giáo viên..."
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="w-full lg:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={subjectFilter}
                onChange={(e) => {
                  setSubjectFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm appearance-none"
              >
                <option value="">Lọc theo môn học</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ============ DATA TABLE ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                Giáo viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                Liên hệ
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                Môn đang dạy
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                Số lớp đang dạy
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                Số môn
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paged.map((t) => {
              const currentSubjects = Array.isArray(t.subjects)
                ? t.subjects
                : [];
              const subjectNames = currentSubjects.map((s) =>
                typeof s === "string" ? s : s?.name
              );
              const chipsToShow = subjectNames.slice(0, 3);
              const overflow = subjectNames.length - chipsToShow.length;
              return (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={t.avatarUrl || "/assets/images/logo.jpg"}
                        alt={t.name}
                        className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {t.name}
                        </div>
                        <div className="text-xs text-gray-600">{t.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{t.email}</div>
                    <div className="text-xs text-gray-600">{t.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {chipsToShow.map((s, idx) => (
                        <SubjectChip
                          key={`${t.id}-${idx}`}
                          label={s}
                          color={getSubjectColor(s)}
                        />
                      ))}
                      {overflow > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                          +{overflow}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 font-medium">
                      {t.classCount ?? 0} lớp
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 font-medium">
                      {subjectNames.length} môn
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEdit(t)}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                      Sửa
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            {loading
              ? "Đang tải..."
              : `Hiển thị ${paged.length} / ${totalElements} giáo viên`}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-700 px-3">
              {currentPage} / {Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={closeEdit} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl border-l border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Chỉnh sửa môn dạy
              </h2>
              <button
                onClick={closeEdit}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img
                  src={editing.avatarUrl || "/assets/images/logo.jpg"}
                  alt={editing.name}
                  className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {editing.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {editing.code} • {editing.email}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <div className="mb-3">
                <div className="text-sm font-semibold text-gray-800 mb-2">
                  Môn học có thể chọn
                </div>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => toggleSubject(s.id)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border ${
                        selectedSubjects.includes(s.id)
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {selectedSubjects.includes(s.id) ? (
                        <X className="h-3 w-3" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-800 mb-2">
                      Môn chính
                    </div>
                    <div className="relative w-full">
                      <select
                        value={primarySubjectId ?? ""}
                        onChange={(e) =>
                          setPrimarySubjectId(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm appearance-none"
                      >
                        <option value="">-- Chọn môn chính --</option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {editing?.primarySubjectName && (
                      <div className="mt-1 text-xs text-gray-600">
                        Môn chính hiện tại: {editing.primarySubjectName}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800 mb-2">
                      Hiện tại chọn: {selectedSubjects.length} môn
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubjects
                        .map((id) => subjects.find((s) => s.id === id))
                        .filter(Boolean)
                        .map((s) => (
                          <SubjectChip
                            key={s.id}
                            label={s.name}
                            color={getSubjectColor(s.name)}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                onClick={closeEdit}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={saveChanges}
                className="px-3 py-2 text-sm rounded-lg bg-black text-white hover:bg-gray-800"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default TeacherManagement;
