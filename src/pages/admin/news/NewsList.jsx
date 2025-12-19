// src/pages/admin/news/NewsList.jsx
// ✨ REDESIGN - Consistent với RoomManagement, SubjectManagement
// 🔄 SERVER-SIDE PAGINATION
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Newspaper,
  Edit,
  Eye,
  EyeOff,
  Loader2,
  FileText,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Trash2,
  AlertTriangle,
  Layers,
  Calendar,
  User,
  Tag,
  ExternalLink,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "../../../components/ui/Dialog";
import { newsService } from "../../../services/news/news.service";
import { formatDateVN } from "../../../helper/formatters";
import { useToast } from "../../../hooks/use-toast";
import useDebounce from "../../../hooks/useDebounce";

const STATUS_FILTERS = ["all", "published", "draft"];

export default function NewsList() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const toastRef = useRef({ success, showError });

  useEffect(() => {
    toastRef.current = { success, showError };
  }, [success, showError]);

  // Filter & Search
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  // Server-side pagination
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // Server response data
  const [news, setNews] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // Stats counts (load all once for tabs)
  const [counts, setCounts] = useState({ all: 0, published: 0, draft: 0 });

  // Expanded row for preview
  const [expandedId, setExpandedId] = useState(null);

  // State for delete confirmation
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load counts once for stats
  useEffect(() => {
    (async () => {
      try {
        const statsData = await newsService.getStats();
        setCounts({
          all: statsData.total || 0,
          published: statsData.published || 0,
          draft: statsData.draft || 0,
        });
      } catch {
        // Silently ignore
      }
    })();
  }, []);

  // Server-side fetch with pagination
  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
      };
      if (debouncedQuery.trim()) {
        params.search = debouncedQuery.trim();
      }
      if (tab !== "all") {
        params.status = tab;
      }

      const response = await newsService.getNews(params);
      const pageData = response.data || response;
      const newsData = pageData.content || [];
      setNews(newsData);
      setTotalElements(pageData.totalElements || 0);
      setTotalPages(pageData.totalPages || 0);
    } catch {
      toastRef.current?.showError?.("Lỗi tải danh sách tin tức");
      setNews([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [tab, debouncedQuery, page, size]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Reset page when tab or search changes
  useEffect(() => {
    setPage(0);
  }, [tab, debouncedQuery]);

  // Reload counts after changes
  const reloadCounts = async () => {
    try {
      const statsData = await newsService.getStats();
      setCounts({
        all: statsData.total || 0,
        published: statsData.published || 0,
        draft: statsData.draft || 0,
      });
    } catch {
      // Silently ignore
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      setDeleting(true);
      await newsService.deleteNews(id);
      toastRef.current?.success?.("Đã xóa tin tức thành công!");
      setDeleteId(null);
      setExpandedId(null);
      fetchNews();
      reloadCounts();
    } catch (err) {
      toastRef.current?.showError?.(
        err.displayMessage || "Không thể xóa tin tức"
      );
    } finally {
      setDeleting(false);
    }
  };

  // Handle publish
  const handlePublish = async (id, e) => {
    e?.stopPropagation();
    try {
      await newsService.updateStatus(id, "published");
      toastRef.current?.success?.("Đã xuất bản tin tức thành công!");
      fetchNews();
      reloadCounts();
    } catch (err) {
      toastRef.current?.showError?.(
        err.displayMessage || "Không thể xuất bản tin tức"
      );
    }
  };

  // Handle move to draft
  const handleMoveToDraft = async (id, e) => {
    e?.stopPropagation();
    try {
      await newsService.updateStatus(id, "draft");
      toastRef.current?.success?.("Đã chuyển tin tức về nháp!");
      fetchNews();
      reloadCounts();
    } catch (err) {
      toastRef.current?.showError?.(
        err.displayMessage || "Không thể chuyển về nháp"
      );
    }
  };

  // Toggle expand row
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const normalizedStatus = status?.toLowerCase();
    if (normalizedStatus === "published") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
          <CheckCircle className="w-3 h-3" />
          Đã xuất bản
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        <FileText className="w-3 h-3" />
        Bản nháp
      </span>
    );
  };

  // Get tab label
  const getTabLabel = (filter) => {
    if (filter === "all") return "Tất cả";
    if (filter === "published") return "Đã xuất bản";
    return "Bản nháp";
  };

  return (
    <div className="p-6 min-h-screen">
      {/* ============ HEADER ============ */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-lg shadow-rose-200">
              <Newspaper className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý tin tức
              </h1>
              <p className="text-sm text-gray-500">
                Click vào dòng để xem chi tiết • Quản lý tin tức và thông báo
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/home/admin/news/create")}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-rose-200 transition-all duration-200 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Tạo tin tức mới
          </button>
        </div>
      </div>

      {/* ============ STATS CARDS ============ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Tổng tin tức */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl p-5 text-white shadow-lg shadow-slate-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-200 text-sm font-medium mb-1">
                Tổng tin tức
              </p>
              <p className="text-3xl font-bold">{counts.all}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Layers className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-white/10 rounded-full" />
        </div>

        {/* Đã xuất bản */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">
                Đã xuất bản
              </p>
              <p className="text-3xl font-bold">{counts.published}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-white/10 rounded-full" />
        </div>

        {/* Bản nháp */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium mb-1">
                Bản nháp
              </p>
              <p className="text-3xl font-bold">{counts.draft}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-white/10 rounded-full" />
        </div>
      </div>

      {/* ============ TOOLBAR ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Filter tabs */}
          <div className="flex items-center gap-2">
            {STATUS_FILTERS.map((f) => {
              const isActive = tab === f;
              const label = getTabLabel(f);
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

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tin tức..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-72 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ============ TABLE WITH INLINE EXPANSION ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/80 border-b border-gray-100">
          <div className="col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            STT
          </div>
          <div className="col-span-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Tiêu đề
          </div>
          <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Ngày tạo
          </div>
          <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Tác giả
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
                <Loader2 className="w-5 h-5 animate-spin text-rose-600" />
                Đang tải...
              </div>
            </div>
          ) : news.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Không có tin tức nào</p>
            </div>
          ) : (
            news.map((item, idx) => {
              const isExpanded = expandedId === item.id;
              const rowNum = page * size + idx + 1;
              const isDraft = item.status?.toLowerCase() === "draft";

              return (
                <div key={item.id} className="group">
                  {/* ============ COLLAPSED ROW ============ */}
                  <div
                    onClick={() => toggleExpand(item.id)}
                    className={`
                      grid grid-cols-12 gap-4 px-6 py-4 cursor-pointer transition-all duration-200
                      ${isExpanded ? "bg-rose-50/50" : "hover:bg-gray-50/80"}
                    `}
                  >
                    {/* STT */}
                    <div className="col-span-1 flex items-center">
                      <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-600">
                        {rowNum}
                      </span>
                    </div>

                    {/* Tiêu đề + thumbnail */}
                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                          <Newspaper className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {item.views || 0} lượt xem
                        </p>
                      </div>
                    </div>

                    {/* Ngày tạo */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-sm text-gray-600">
                        {formatDateVN(item.date)}
                      </span>
                    </div>

                    {/* Tác giả */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-sm text-gray-600 truncate">
                        {item.author || "—"}
                      </span>
                    </div>

                    {/* Trạng thái */}
                    <div className="col-span-2 flex items-center justify-center">
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  {/* ============ EXPANDED PANEL ============ */}
                  {isExpanded && (
                    <div className="px-6 pb-6 bg-gradient-to-b from-rose-50/50 to-white animate-in slide-in-from-top-2 duration-200">
                      <div className="pt-2 border-t border-rose-100">
                        <div className="flex gap-6 mt-4">
                          {/* Image Preview */}
                          <div className="flex-shrink-0">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-48 h-32 rounded-xl object-cover shadow-md"
                              />
                            ) : (
                              <div className="w-48 h-32 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md">
                                <Newspaper className="w-12 h-12 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 space-y-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {item.title}
                            </h3>

                            {/* Excerpt */}
                            {item.excerpt && (
                              <div
                                className="text-sm text-gray-600 line-clamp-2"
                                dangerouslySetInnerHTML={{
                                  __html: item.excerpt,
                                }}
                              />
                            )}

                            {/* Tags */}
                            {item.tags && (
                              <div className="flex items-center gap-2 flex-wrap">
                                <Tag className="w-3.5 h-3.5 text-gray-400" />
                                {(typeof item.tags === "string"
                                  ? item.tags.split(",").map((t) => t.trim())
                                  : item.tags
                                ).map((tag, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Meta info */}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDateVN(item.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {item.author || "Admin"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                {item.views || 0} lượt xem
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                          <button
                            onClick={() =>
                              navigate(`/home/admin/news/${item.id}`)
                            }
                            className="inline-flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 font-medium"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Xem chi tiết
                          </button>

                          <div className="flex items-center gap-2">
                            {/* DRAFT: Sửa, Xuất bản, Xóa */}
                            {isDraft && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/home/admin/news/create`, {
                                      state: { draft: item },
                                    });
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                  Sửa
                                </button>
                                <button
                                  onClick={(e) => handlePublish(item.id, e)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg hover:shadow-md transition-all"
                                >
                                  <Send className="w-4 h-4" />
                                  Xuất bản
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteId(item.id);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Xóa
                                </button>
                              </>
                            )}

                            {/* PUBLISHED: Ẩn, Xóa */}
                            {!isDraft && (
                              <>
                                <button
                                  onClick={(e) => handleMoveToDraft(item.id, e)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                                >
                                  <EyeOff className="w-4 h-4" />
                                  Ẩn tin
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteId(item.id);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Xóa
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ============ PAGINATION ============ */}
        {totalElements > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Trang {page + 1} / {totalPages} — Tổng {totalElements} bản ghi
              </p>

              <div className="flex items-center gap-4">
                {/* Size selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Số bản ghi / trang:
                  </span>
                  <select
                    value={size}
                    onChange={(e) => {
                      setSize(Number(e.target.value));
                      setPage(0);
                    }}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                {/* Page navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i;
                      } else if (page < 3) {
                        pageNum = i;
                      } else if (page > totalPages - 4) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                            page === pageNum
                              ? "bg-rose-600 text-white shadow-md"
                              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={page >= totalPages - 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============ DELETE CONFIRMATION DIALOG ============ */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl">Xác nhận xóa tin tức</DialogTitle>
          </DialogHeader>
          <DialogContent className="text-gray-500 mb-6">
            Bạn có chắc chắn muốn xóa tin tức này không?
            <br />
            <span className="text-red-500 font-medium">
              Hành động này không thể hoàn tác.
            </span>
          </DialogContent>
          <DialogFooter className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={deleting}
              className="min-w-[100px]"
            >
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(deleteId)}
              disabled={deleting}
              className="min-w-[100px] bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}
