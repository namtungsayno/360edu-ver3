import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Calendar, Clock, ArrowRight, Eye, Tag } from "lucide-react";
import { newsService } from "../../../services/news/news.service";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { getImageUrl, PLACEHOLDER_IMAGE } from "../../../utils/image";

export default function NewsList() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredNews, setFeaturedNews] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await newsService.getNews({ 
          page: 0,
          size: 100
        });
        const newsData = response.content || response.data || response || [];
        // Filter only published news
        const publishedNews = newsData.filter(n => n.status?.toLowerCase() === 'published');
        setFeaturedNews(publishedNews[0]); // First news as featured
        setNews(publishedNews);
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Gradient colors for news cards
  const gradients = [
    "from-orange-400 to-red-500",
    "from-purple-400 to-pink-500", 
    "from-blue-400 to-cyan-500",
    "from-green-400 to-teal-500",
    "from-yellow-400 to-orange-500",
    "from-indigo-400 to-purple-500"
  ];

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-4">Tin tức & Sự kiện</h1>
            <p className="text-xl text-white/90">Theo dõi các tin tức, sự kiện và thành tích nổi bật của 360edu</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : news.length > 0 ? (
          <div className="space-y-8">
            {/* Featured News - Large Card */}
            {featuredNews && (
              <Card 
                className="group hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
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
                      {featuredNews.excerpt || featuredNews.content?.substring(0, 200) + '...'}
                    </p>

                    {(() => {
                      const tags = typeof featuredNews.tags === 'string' 
                        ? featuredNews.tags.split(',').map(t => t.trim()).filter(Boolean)
                        : (Array.isArray(featuredNews.tags) ? featuredNews.tags : []);
                      return tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {tags.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="secondary" className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      );
                    })()}


                  </CardContent>
                </div>
              </Card>
            )}

            {/* Other News - Grid Layout */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.slice(1).map((item, index) => {
              const gradient = gradients[index % gradients.length];
              
              // Parse tags if it's a string
              const tags = typeof item.tags === 'string' 
                ? item.tags.split(',').map(t => t.trim()).filter(Boolean)
                : (Array.isArray(item.tags) ? item.tags : []);

              return (
                <Card 
                  key={item.id}
                  className="group hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full"
                >
                  {/* Image/Gradient Header - Taller */}
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
                      <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
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
                      {item.excerpt || item.content?.substring(0, 150) + '...' || 'Mô tả ngắn về tin tức này...'}
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
        </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Chưa có tin tức nào
          </div>
        )}
      </div>
    </div>
  );
}