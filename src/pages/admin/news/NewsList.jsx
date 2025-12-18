import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "../../../components/ui/Dialog";
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
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/Tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/Select";
import { newsService } from "../../../services/news/news.service";
import { useToast } from "../../../hooks/use-toast";
import useDebounce from "../../../hooks/useDebounce";

export default function NewsList() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Server-side pagination state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");

  // Stats for tab badges (loaded once)
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
  });

  // State for delete confirmation
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Debounced search query for API calls
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Dữ liệu tin tức từ API
  const [news, setNews] = useState([]);

  // Fetch stats for tab badges (load once)
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await newsService.getStats();
      setStats({
        total: statsData.total || 0,
        published: statsData.published || 0,
        draft: statsData.draft || 0,
      });
    } catch (err) {}
  }, []);

  // Handle delete news
  const handleDelete = async (id) => {
    try {
      setDeleting(true);
      await newsService.deleteNews(id);
      success("Đã xóa tin tức thành công!");
      setDeleteId(null);
      fetchNews();
      fetchStats();
    } catch (err) {
      showError(err.displayMessage || "Không thể xóa tin tức");
    } finally {
      setDeleting(false);
    }
  };

  // Handle unpublish (move to draft)
  const handleMoveToDraft = async (id) => {
    try {
      await newsService.updateStatus(id, "draft");
      success("Đã chuyển tin tức về nháp!");
      fetchNews();
      fetchStats();
    } catch (err) {
      showError(err.displayMessage || "Không thể chuyển về nháp");
    }
  };

  // Fetch danh sách tin tức với server-side pagination
  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build params for API call
      const params = {
        page,
        size,
      };

      // Add search if provided
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      // Add status filter if not "all"
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      // Real API call
      const response = await newsService.getNews(params);
      const pageData = response.data || response;
      const newsData = pageData.content || [];
      setNews(newsData);
      setTotalElements(pageData.totalElements || 0);
      setTotalPages(pageData.totalPages || 0);
    } catch (err) {
      setError(err.displayMessage || "Không thể tải danh sách tin tức");
      setNews([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, size, debouncedSearch, statusFilter]);

  // Reset page when search or filter changes
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, statusFilter]);

  // Fetch news when pagination/filter changes
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Fetch stats once on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle tab change
  const handleTabChange = (value) => {
    setStatusFilter(value);
    setPage(0);
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "published":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-medium">
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            Đã xuất bản
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-medium">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Bản nháp
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 text-slate-600 border-slate-200">
            Không xác định
          </Badge>
        );
    }
  };

  // Xuất bản tin tức từ draft
  const handlePublish = async (id) => {
    try {
      await newsService.updateStatus(id, "published");
      fetchNews();
      fetchStats();
      success("Đã xuất bản tin tức thành công!");
    } catch (err) {
      showError(err.displayMessage || "Không thể xuất bản tin tức");
    }
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
                Quản lý và đăng tin tức, thông báo cho học viên và phụ huynh
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/home/admin/news/create")}
            className="bg-rose-600 hover:bg-rose-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tạo tin tức mới
          </Button>
        </div>
      </div>

      {/* ============ STATS CARDS ============ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 p-5 group hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/70">Tổng tin tức</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/5" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 group hover:shadow-lg hover:shadow-emerald-200 transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/70">Đã xuất bản</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats.published}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/5" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-5 group hover:shadow-lg hover:shadow-amber-200 transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/70">Bản nháp</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats.draft}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Edit className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/5" />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600 mb-2" />
          <p className="text-gray-500">Đang tải danh sách tin tức...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
          <div className="text-red-600 mb-2">⚠️</div>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchNews} variant="outline">
            Thử lại
          </Button>
        </div>
      )}

      {/* ============ TOOLBAR & LIST ============ */}
      {!loading && !error && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Danh sách tin tức
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm tin tức..."
                    className="pl-10 w-[400px] h-11 text-base rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  value={String(size)}
                  onValueChange={(v) => {
                    setSize(Number(v));
                    setPage(0);
                  }}
                >
                  <SelectTrigger className="w-[80px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <Tabs
              value={statusFilter}
              onValueChange={handleTabChange}
              className="space-y-4"
            >
              <TabsList className="bg-gray-100/80 p-1 rounded-xl">
                <TabsTrigger
                  value="all"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Tất cả ({stats.total})
                </TabsTrigger>
                <TabsTrigger
                  value="published"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                  Đã xuất bản ({stats.published})
                </TabsTrigger>
                <TabsTrigger
                  value="draft"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  Bản nháp ({stats.draft})
                </TabsTrigger>
              </TabsList>

              {/* Single content for all tabs - data is filtered by server */}
              <div className="space-y-4">
                {news.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Newspaper className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Không có tin tức nào</p>
                  </div>
                ) : (
                  news.map((item) => (
                    <Card
                      key={item.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/home/admin/news/${item.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="h-64 w-64 rounded-lg object-cover flex-shrink-0 self-center"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-64 w-64 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white flex-shrink-0 self-center">
                              <Newspaper className="h-24 w-24" />
                            </div>
                          )}

                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                {item.title}
                              </h3>
                              {getStatusBadge(item.status)}
                            </div>
                            <div
                              className="text-sm text-slate-600 rich-text-content"
                              dangerouslySetInnerHTML={{ __html: item.excerpt }}
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                              {(typeof item.tags === "string"
                                ? item.tags
                                    .split(",")
                                    .map((tag) => tag.trim())
                                    .filter(Boolean)
                                : item.tags || []
                              ).map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs border border-slate-200 bg-slate-50 text-slate-700"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600 mt-2">
                              <span>{item.date}</span>
                              <span>{item.views} lượt xem</span>
                              <span>Bởi: {item.author}</span>
                            </div>

                            {/* Action Buttons - Theo nghĩép vụ mới */}
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                              {/* DRAFT: Sửa, Xuất bản, Xóa */}
                              {item.status?.toLowerCase() === "draft" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/home/admin/news/create`, {
                                        state: { draft: item },
                                      });
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-1.5" />
                                    Sửa
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePublish(item.id);
                                    }}
                                  >
                                    <Send className="h-4 w-4 mr-1.5" />
                                    Xuất bản
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteId(item.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1.5" />
                                    Xóa
                                  </Button>
                                </>
                              )}

                              {/* PUBLISHED: Ẩn (đưa về draft), Xóa */}
                              {item.status?.toLowerCase() === "published" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:border-amber-300 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveToDraft(item.id);
                                    }}
                                  >
                                    <EyeOff className="h-4 w-4 mr-1.5" />
                                    Ẩn tin (về nháp)
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteId(item.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1.5" />
                                    Xóa
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </Tabs>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Hiển thị {news.length} / {totalElements} tin tức
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-xs text-gray-600 px-2">
                    {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
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
