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
  Search,
  Plus,
  Newspaper,
  Eye,
  Edit,
  EyeOff,
  Calendar,
  Loader2,
  FileText,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Send,
  MoreVertical,
  Trash2,
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
import Modal from "../../../components/ui/Modal";
import { newsService } from "../../../services/news/news.service";
import { useToast } from "../../../hooks/use-toast";
import useDebounce from "../../../hooks/useDebounce";

export default function NewsList() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
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
    hidden: 0,
    scheduled: 0,
  });

  // Debounced search query for API calls
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Dữ liệu tin tức từ API
  const [news, setNews] = useState([]);

  // Fetch stats for tab badges (load once)
  const fetchStats = useCallback(async () => {
    try {
      const [allRes, publishedRes, draftRes, hiddenRes, scheduledRes] =
        await Promise.all([
          newsService.getNews({ page: 0, size: 1 }),
          newsService.getNews({ page: 0, size: 1, status: "published" }),
          newsService.getNews({ page: 0, size: 1, status: "draft" }),
          newsService.getNews({ page: 0, size: 1, status: "hidden" }),
          newsService.getNews({ page: 0, size: 1, status: "scheduled" }),
        ]);
      setStats({
        total: allRes.data?.totalElements || 0,
        published: publishedRes.data?.totalElements || 0,
        draft: draftRes.data?.totalElements || 0,
        hidden: hiddenRes.data?.totalElements || 0,
        scheduled: scheduledRes.data?.totalElements || 0,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

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
      console.error("Failed to fetch news:", err);
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

  const getStatusBadge = (status, scheduledAt) => {
    switch (status) {
      case "published":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 border-green-200"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Đã đăng
          </Badge>
        );
      case "draft":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            <Edit className="h-3 w-3 mr-1" />
            Nháp
          </Badge>
        );
      case "scheduled":
        return (
          <div className="flex flex-col gap-1">
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 border-blue-200"
            >
              <Clock className="h-3 w-3 mr-1" />
              Đã lên lịch
            </Badge>
            {scheduledAt && (
              <span className="text-xs text-blue-600">
                {new Date(scheduledAt).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        );
      case "hidden":
        return (
          <Badge
            variant="secondary"
            className="bg-slate-100 text-slate-800 border-slate-200"
          >
            <EyeOff className="h-3 w-3 mr-1" />
            Đã ẩn
          </Badge>
        );
      default:
        return (
          <Badge
            variant="secondary"
            className="bg-slate-100 text-slate-800 border-slate-200"
          >
            Chưa xác định
          </Badge>
        );
    }
  };

  const handleView = (item) => {
    setSelected(item);
    setIsPreviewOpen(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      const currentNews = news.find((n) => n.id === id);
      const currentStatus = currentNews?.status;
      // Logic chuyển trạng thái
      let newStatus;
      if (currentStatus === "published") {
        newStatus = "hidden";
      } else if (currentStatus === "hidden") {
        newStatus = "published";
      } else if (currentStatus === "draft" || currentStatus === "scheduled") {
        newStatus = "published";
      } else {
        newStatus = "published";
      }

      await newsService.updateStatus(id, newStatus);
      // Refresh data and stats after status change
      fetchNews();
      fetchStats();
      success(
        newStatus === "published"
          ? "Đã công bố tin tức"
          : newStatus === "hidden"
          ? "Đã ẩn tin tức"
          : "Đã cập nhật trạng thái"
      );
    } catch (err) {
      console.error("Failed to toggle status:", err);
      showError(err.displayMessage || "Không thể cập nhật trạng thái");
    }
  };

  // Công bố tin tức từ draft
  const handlePublish = async (id) => {
    try {
      await newsService.publishNews(id);
      fetchNews();
      fetchStats();
      success("Đã công bố tin tức thành công!");
    } catch (err) {
      console.error("Failed to publish:", err);
      showError(err.displayMessage || "Không thể công bố tin tức");
    }
  };

  // Chuyển về nháp
  const handleUnpublish = async (id) => {
    try {
      await newsService.unpublishNews(id);
      fetchNews();
      fetchStats();
      success("Đã chuyển tin tức về nháp");
    } catch (err) {
      console.error("Failed to unpublish:", err);
      showError(err.displayMessage || "Không thể chuyển về nháp");
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Tổng tin tức</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Đã đăng</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.published}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Bản nháp</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.draft}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Edit className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Đã lên lịch</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.scheduled}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
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
                <Select
                  value={String(size)}
                  onValueChange={(v) => {
                    setSize(Number(v));
                    setPage(0);
                  }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 / trang</SelectItem>
                    <SelectItem value="10">10 / trang</SelectItem>
                    <SelectItem value="20">20 / trang</SelectItem>
                    <SelectItem value="50">50 / trang</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm tin tức..."
                    className="pl-10 w-80 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
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
              <TabsList>
                <TabsTrigger value="all">Tất cả ({stats.total})</TabsTrigger>
                <TabsTrigger value="published">
                  Đã đăng ({stats.published})
                </TabsTrigger>
                <TabsTrigger value="draft">Nháp ({stats.draft})</TabsTrigger>
                <TabsTrigger value="scheduled">
                  Đã lên lịch ({stats.scheduled})
                </TabsTrigger>
                <TabsTrigger value="hidden">Đã ẩn ({stats.hidden})</TabsTrigger>
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
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold">
                                {item.title}
                              </h3>
                              {getStatusBadge(item.status, item.scheduledAt)}
                            </div>
                            <p className="text-sm text-slate-600">
                              {item.excerpt}
                            </p>
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

                            {/* Action Buttons - Cải tiến */}
                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                              {/* Nút Chỉnh sửa - Luôn hiển thị */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/home/admin/news/create`, {
                                    state: { draft: item },
                                  });
                                }}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Sửa
                              </Button>

                              {/* Nút Công bố - Hiện khi draft hoặc scheduled */}
                              {(item.status === "draft" ||
                                item.status === "scheduled") && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePublish(item.id);
                                  }}
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  Công bố ngay
                                </Button>
                              )}

                              {/* Nút Ẩn - Hiện khi published */}
                              {item.status === "published" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-amber-600 border-amber-200 hover:bg-amber-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleStatus(item.id);
                                  }}
                                >
                                  <EyeOff className="h-4 w-4 mr-1" />
                                  Ẩn tin
                                </Button>
                              )}

                              {/* Nút Hiển thị lại - Hiện khi hidden */}
                              {item.status === "hidden" && (
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePublish(item.id);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Hiển thị lại
                                </Button>
                              )}

                              {/* Nút Chuyển về nháp - Hiện khi published hoặc scheduled */}
                              {(item.status === "published" ||
                                item.status === "scheduled") && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-slate-600 border-slate-200 hover:bg-slate-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnpublish(item.id);
                                  }}
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  Về nháp
                                </Button>
                              )}

                              {/* Nút Xem trước */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-gray-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleView(item);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Xem
                              </Button>
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600 px-3">
                    Trang {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={selected?.title}
      >
        {selected && (
          <div className="space-y-4">
            {selected.imageUrl && (
              <img
                src={selected.imageUrl}
                alt={selected.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{selected.date}</span>
              </div>
              <span>Bởi: {selected.author}</span>
            </div>
            <p className="text-slate-700">{selected.excerpt}</p>
            <div className="prose max-w-none">
              <p className="whitespace-pre-line text-sm text-slate-800">
                {selected.content}
              </p>
            </div>
            {selected.tags?.length ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {selected.tags.map((t, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </Modal>
    </div>
  );
}
