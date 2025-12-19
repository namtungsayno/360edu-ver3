import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  User,
  Eye,
  ArrowLeft,
  Tag,
  Clock,
  Share2,
} from "lucide-react";
import { newsService } from "../../../services/news/news.service";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { getImageUrl, PLACEHOLDER_IMAGE } from "../../../utils/image";

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState([]);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        const response = await newsService.getNewsById(id);
        setNews(response);

        // Increment view count
        await newsService.incrementView(id);

        // Fetch related news
        const allNewsResponse = await newsService.getNews({ page: 0, size: 4 });
        const allNews = allNewsResponse.content || [];
        const related = allNews
          .filter(
            (n) =>
              n.id !== parseInt(id) && n.status?.toLowerCase() === "published"
          )
          .slice(0, 3);
        setRelatedNews(related);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNewsDetail();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 font-medium">Đang tải tin tức...</span>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy tin tức
          </h2>
          <p className="text-gray-500 mb-6">
            Tin tức này có thể đã bị xóa hoặc không tồn tại
          </p>
          <Button
            onClick={() => navigate("/home/news")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const tags =
    typeof news.tags === "string"
      ? news.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : Array.isArray(news.tags)
      ? news.tags
      : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button - Fixed */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <Button
            variant="ghost"
            className="text-gray-700 hover:bg-gray-100"
            onClick={() => navigate("/home/news")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Article Card */}
          <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Featured Image - Full width, auto height, no cropping */}
            {news.imageUrl && (
              <div className="w-full bg-gray-100">
                <img
                  src={news.imageUrl}
                  alt={news.title}
                  className="w-full h-auto max-h-[700px] object-contain mx-auto"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6 md:p-10">
              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      className="bg-blue-50 text-blue-600 border-blue-200"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {news.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900">
                    {news.author || "Admin"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(news.publishedAt || news.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Eye className="w-4 h-4" />
                  <span>{news.views || 0} lượt xem</span>
                </div>
              </div>

              {/* Excerpt */}
              {news.excerpt && (
                <div
                  className="text-lg text-gray-600 mb-8 leading-relaxed font-medium border-l-4 border-blue-500 pl-4 bg-blue-50/50 py-3 rounded-r-lg rich-text-content"
                  dangerouslySetInnerHTML={{ __html: news.excerpt }}
                />
              )}

              {/* Main Article Content */}
              <div className="prose prose-lg max-w-none">
                <div
                  className="text-gray-800 leading-relaxed rich-text-content
                    [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:my-6 [&_img]:mx-auto [&_img]:block [&_img]:shadow-md
                    [&_p]:mb-5 [&_p]:text-gray-700
                    [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4
                    [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3
                    [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
                    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4
                    [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4
                    [&_li]:mb-2
                    [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800
                    [&_blockquote]:border-l-4 [&_blockquote]:border-blue-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-6
                    [&_strong]:font-bold [&_strong]:text-gray-900
                    [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
                    [&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_th]:bg-gray-100
                    [&_td]:border [&_td]:border-gray-300 [&_td]:p-2"
                  dangerouslySetInnerHTML={{ __html: news.content }}
                />
              </div>

              {/* Share Section */}
              <div className="mt-10 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      Chia sẻ bài viết này
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/home/news")}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Xem tất cả tin tức
                  </Button>
                </div>
              </div>
            </div>
          </article>

          {/* Related News */}
          {relatedNews.length > 0 && (
            <div className="mt-10">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                Tin tức liên quan
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedNews.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    onClick={() => navigate(`/home/news/${item.id}`)}
                  >
                    {item.imageUrl ? (
                      <div className="h-40 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500" />
                    )}
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
