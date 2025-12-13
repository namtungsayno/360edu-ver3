import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  ArrowRight,
  Tag,
  Search,
  Newspaper,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import { newsService } from "../../../services/news/news.service";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { getImageUrl, PLACEHOLDER_IMAGE } from "../../../utils/image";
import { stripHtmlTags } from "../../../utils/html-helpers";
import useDebounce from "../../../hooks/useDebounce";

export default function NewsList() {
  const navigate = useNavigate();

  // === SERVER-SIDE PAGINATION STATE ===
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [featuredNews, setFeaturedNews] = useState(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 400);

  // === RESET PAGE WHEN FILTERS CHANGE ===
  useEffect(() => {
    setPage(0);
  }, [debouncedQuery]);

  // === FETCH NEWS WITH SERVER-SIDE PAGINATION ===
  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await newsService.getNews({
        page,
        size,
        search: debouncedQuery,
        status: "published", // Only published news for guest
        sortBy: "createdAt",
        order: "desc",
      });

      const newsData = response.content || response.data || response || [];
      // Filter only published news (backup filter)
      const publishedNews = Array.isArray(newsData)
        ? newsData.filter((n) => n.status?.toLowerCase() === "published")
        : [];

      // Set featured news (only on first page without search)
      if (page === 0 && !debouncedQuery && publishedNews.length > 0) {
        setFeaturedNews(publishedNews[0]);
        setNews(publishedNews.slice(1));
      } else {
        setFeaturedNews(null);
        setNews(publishedNews);
      }

      setTotalPages(
        response.totalPages || Math.ceil(publishedNews.length / size) || 1
      );
      setTotalElements(response.totalElements || publishedNews.length || 0);
    } catch (e) {
      setError("Không tải được tin tức. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [page, size, debouncedQuery]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // === HELPERS ===
  const clearSearch = () => {
    setSearchQuery("");
  };

  const canGoPrev = page > 0;
  const canGoNext = page < totalPages - 1;

  // Gradient colors for news cards
  const gradients = [
    "from-orange-400 to-red-500",
    "from-purple-400 to-pink-500",
    "from-blue-400 to-cyan-500",
    "from-green-400 to-teal-500",
    "from-yellow-400 to-orange-500",
    "from-indigo-400 to-purple-500",
  ];

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("sv-SE");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-[1920px] mx-auto px-6 py-8 relative z-10">
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Newspaper className="w-8 h-8" />
                <h1 className="text-3xl font-bold">Tin tức & Sự kiện</h1>
              </div>
              <p className="text-blue-100 text-base max-w-2xl mx-auto">
                Theo dõi các tin tức, sự kiện và thành tích nổi bật của 360edu
              </p>
            </div>

            {/* Stats Card */}
            <div className="w-full max-w-xs">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
                <div className="text-2xl font-bold mb-1">{totalElements}</div>
                <div className="text-xs text-blue-100">Bài viết</div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm tin tức..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base text-gray-900 bg-white/95 backdrop-blur-sm border-0 shadow-lg focus:ring-2 focus:ring-white/50 placeholder:text-gray-500"
                />
                {loading && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
                )}
              </div>
            </div>

            {/* Active Search */}
            {searchQuery && (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-full text-sm">
                  "{searchQuery}"
                  <X
                    className="w-4 h-4 cursor-pointer hover:text-white/80"
                    onClick={clearSearch}
                  />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Hiển thị{" "}
            <span className="font-bold text-blue-600">
              {news.length + (featuredNews ? 1 : 0)}
            </span>{" "}
            / {totalElements} bài viết
            {totalPages > 1 && ` • Trang ${page + 1}/${totalPages}`}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchNews} className="mt-4">
              Thử lại
            </Button>
          </div>
        ) : news.length === 0 && !featuredNews ? (
          <div className="text-center py-12">
            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Không tìm thấy tin tức</p>
            <p className="text-gray-400 text-sm mt-2">
              Thử thay đổi từ khóa tìm kiếm
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured News - Large Card */}
            {featuredNews && (
              <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image Section */}
                  <div className="relative h-96 md:h-auto overflow-hidden">
                    {featuredNews.imageUrl ? (
                      <img
                        src={getImageUrl(featuredNews.imageUrl)}
                        alt={featuredNews.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = PLACEHOLDER_IMAGE;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500" />
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-red-600 text-white text-sm px-4 py-1">
                        Nổi bật
                      </Badge>
                    </div>
                  </div>

                  {/* Content Section */}
                  <CardContent className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(featuredNews.createdAt)}</span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {featuredNews.title}
                    </h2>

                    <p className="text-gray-600 text-lg mb-6 line-clamp-3">
                      {stripHtmlTags(
                        featuredNews.excerpt || featuredNews.content
                      )?.substring(0, 200) + "..."}
                    </p>

                    {(() => {
                      const tags =
                        typeof featuredNews.tags === "string"
                          ? featuredNews.tags
                              .split(",")
                              .map((t) => t.trim())
                              .filter(Boolean)
                          : Array.isArray(featuredNews.tags)
                          ? featuredNews.tags
                          : [];
                      return (
                        tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {tags.slice(0, 3).map((tag, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                <Tag className="w-3 h-3" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )
                      );
                    })()}

                    <button
                      onClick={() => navigate(`/home/news/${featuredNews.id}`)}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                    >
                      Đọc thêm
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </CardContent>
                </div>
              </Card>
            )}

            {/* Other News - Grid Layout */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item, index) => {
                const gradient = gradients[index % gradients.length];

                // Parse tags if it's a string
                const tags =
                  typeof item.tags === "string"
                    ? item.tags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                    : Array.isArray(item.tags)
                    ? item.tags
                    : [];

                return (
                  <Card
                    key={item.id}
                    className="group hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer"
                    onClick={() => navigate(`/home/news/${item.id}`)}
                  >
                    {/* Image/Gradient Header */}
                    <div className="h-64 relative overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={getImageUrl(item.imageUrl)}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = PLACEHOLDER_IMAGE;
                          }}
                        />
                      ) : (
                        <div
                          className={`w-full h-full bg-gradient-to-br ${gradient}`}
                        />
                      )}
                      {tags.length > 0 && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-white text-gray-900">
                            {tags[0]}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6 flex-1 flex flex-col">
                      {/* Date */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                        {stripHtmlTags(item.excerpt || item.content)?.substring(
                          0,
                          150
                        ) + "..." || "Mô tả ngắn về tin tức này..."}
                      </p>

                      {/* Read More Link */}
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 mt-auto">
                        Đọc thêm
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* === PAGINATION === */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={!canGoPrev}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Trang trước
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          page === pageNum
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={!canGoNext}
                  className="flex items-center gap-2"
                >
                  Trang sau
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Page Info */}
            {totalPages > 1 && (
              <div className="mt-4 text-center text-sm text-gray-500">
                Hiển thị {page * size + 1} -{" "}
                {Math.min((page + 1) * size, totalElements)} trong tổng số{" "}
                {totalElements} bài viết
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
