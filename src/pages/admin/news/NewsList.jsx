import { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/Tabs";
import Modal from "../../../components/ui/Modal";
import { newsService } from "../../../services/news/news.service";
import { useToast } from "../../../hooks/use-toast";

export default function NewsList() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dữ liệu tin tức từ API
  const [news, setNews] = useState([]);

  // Fetch danh sách tin tức khi component mount
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Real API call
      const response = await newsService.getNews({
        page: 0,
        size: 100,
      });
      const newsData = response.content || response.data || response || [];
      setNews(newsData);
    } catch (err) {
      console.error("Failed to fetch news:", err);
      setError(err.displayMessage || "Không thể tải danh sách tin tức");
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 border-green-200"
          >
            Đã đăng
          </Badge>
        );
      case "draft":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            Nháp
          </Badge>
        );
      case "hidden":
        return (
          <Badge
            variant="secondary"
            className="bg-slate-100 text-slate-800 border-slate-200"
          >
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
      const currentStatus = news.find((n) => n.id === id)?.status;
      const newStatus = currentStatus === "published" ? "hidden" : "published";
      await newsService.updateStatus(id, newStatus);
      setNews((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: newStatus } : n))
      );
      success(
        newStatus === "published" ? "Đã hiển thị tin tức" : "Đã ẩn tin tức"
      );
    } catch (err) {
      console.error("Failed to toggle status:", err);
      showError(err.displayMessage || "Không thể cập nhật trạng thái");
    }
  };

  const filteredNews = news.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Tổng tin tức</p>
              <p className="text-2xl font-bold text-white mt-1">
                {news.length}
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
                {news.filter((n) => n.status === "published").length}
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
                {news.filter((n) => n.status === "draft").length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Edit className="w-6 h-6 text-white" />
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

          {/* Content */}
          <div className="p-4">
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">Tất cả ({news.length})</TabsTrigger>
                <TabsTrigger value="published">
                  Đã đăng ({news.filter((n) => n.status === "published").length}
                  )
                </TabsTrigger>
                <TabsTrigger value="draft">
                  Nháp ({news.filter((n) => n.status === "draft").length})
                </TabsTrigger>
                <TabsTrigger value="hidden">
                  Đã ẩn ({news.filter((n) => n.status === "hidden").length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {filteredNews.map((item) => (
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
                          <h3 className="text-lg font-semibold mb-2">
                            {item.title}
                          </h3>
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
                          <div className="flex gap-2 mt-2">
                            {item.status === "published" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStatus(item.id);
                                }}
                              >
                                Ẩn
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStatus(item.id);
                                }}
                              >
                                Hiện
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="published" className="space-y-4">
                {filteredNews
                  .filter((n) => n.status === "published")
                  .map((item) => (
                    <Card
                      key={item.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-600 mb-3">
                          {item.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span>{item.date}</span>
                          <span>{item.views} lượt xem</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>

              <TabsContent value="draft" className="space-y-4">
                {filteredNews
                  .filter((n) => n.status === "draft")
                  .map((item) => (
                    <Card
                      key={item.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-600">{item.excerpt}</p>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>

              <TabsContent value="hidden" className="space-y-4">
                {filteredNews
                  .filter((n) => n.status === "hidden")
                  .map((item) => (
                    <Card
                      key={item.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-600">{item.excerpt}</p>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>
            </Tabs>
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
