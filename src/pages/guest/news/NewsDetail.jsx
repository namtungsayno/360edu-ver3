import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, User, Eye, ArrowLeft, Tag } from "lucide-react";
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
          .filter(n => n.id !== parseInt(id) && n.status?.toLowerCase() === 'published')
          .slice(0, 3);
        setRelatedNews(related);
      } catch (error) {
        console.error("Failed to fetch news detail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNewsDetail();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy tin tức</h2>
          <Button onClick={() => navigate('/news')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const tags = typeof news.tags === 'string' 
    ? news.tags.split(',').map(t => t.trim()).filter(Boolean)
    : (Array.isArray(news.tags) ? news.tags : []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Featured Image Background */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        {/* Background Overlay */}
        {news.imageUrl && (
          <div className="absolute inset-0 opacity-20">
            <img 
              src={news.imageUrl} 
              alt={news.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
          </div>
        )}
        
        <div className="relative container mx-auto px-4 py-12">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/20 mb-6"
            onClick={() => navigate('/home/news')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
          
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, index) => (
                <Badge key={index} className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{news.title}</h1>
          
          {/* Excerpt */}
          {news.excerpt && (
            <p className="text-xl text-white/90 mb-6 max-w-4xl leading-relaxed">
              {news.excerpt}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-6 text-white/90">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <User className="w-4 h-4" />
              <span className="font-medium">{news.author || 'Admin'}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(news.publishedAt || news.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Featured Image */}
              {news.imageUrl && (
                <div className="relative h-[500px] overflow-hidden">
                  <img 
                    src={news.imageUrl} 
                    alt={news.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-8 md:p-12">
                {/* Article Info Bar */}
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-200">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Tác giả: <span className="font-semibold text-gray-900">{news.author || 'Admin'}</span></span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {formatDate(news.publishedAt || news.createdAt)}
                  </div>
                </div>

                {/* Main Content with better typography */}
                <article className="prose prose-lg max-w-none">
                  <div className="text-gray-800 leading-relaxed space-y-4">
                    {news.content?.split('\n').map((paragraph, index) => (
                      paragraph.trim() && (
                        <p key={index} className="text-justify">
                          {paragraph}
                        </p>
                      )
                    ))}
                  </div>
                </article>

                {/* Share Section */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Chia sẻ bài viết</h4>
                      <div className="flex gap-2">
                        {tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation to other articles */}
            <div className="mt-8 flex justify-between">
              <Button 
                variant="outline"
                onClick={() => navigate('/home/news')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Xem tất cả tin tức
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Author/Info Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Thông tin bài viết
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 pb-3 border-b">
                  <User className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-xs">Tác giả</p>
                    <p className="font-semibold text-gray-900">{news.author || 'Admin'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pb-3 border-b">
                  <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-xs">Ngày đăng</p>
                    <p className="font-semibold text-gray-900">{formatDate(news.publishedAt || news.createdAt)}</p>
                  </div>
                </div>
                {news.updatedAt && news.updatedAt !== news.createdAt && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-500 text-xs">Cập nhật</p>
                      <p className="font-semibold text-gray-900">{formatDate(news.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Related News */}
            {relatedNews.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Tin tức liên quan</h3>
                <div className="space-y-4">
                  {relatedNews.map((item) => (
                    <div
                      key={item.id}
                      className="group cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                      onClick={() => navigate(`/home/news/${item.id}`)}
                    >
                      <div className="flex gap-3">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-24 h-24 object-cover rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-lg flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
