import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";
import { newsService } from "../../../services/news/news.service";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";

export default function NewsList() {
  const { onNavigate } = useOutletContext();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await newsService.getNews({ 
          status: "published",
          sortBy: "date",
          order: "desc"
        });
        setNews(response.items || []);
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Tin tức & Sự kiện</h1>
          <p className="text-gray-600">Cập nhật những tin tức mới nhất về các khóa học, chương trình và thành tích của 360edu</p>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : news.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item, index) => {
              const gradient = gradients[index % gradients.length];
              
              // Parse tags if it's a string
              const tags = typeof item.tags === 'string' 
                ? item.tags.split(',').map(t => t.trim()).filter(Boolean)
                : (Array.isArray(item.tags) ? item.tags : []);

              return (
                <Card 
                  key={item.id}
                  className="group hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => onNavigate({ type: "news", id: item.id })}
                >
                  {/* Image/Gradient Header */}
                  <div className={`h-48 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}
                    {tags.length > 0 && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-white text-gray-900">
                          {tags[0]}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    {/* Date and Reading Time */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(item.createdDate)}</span>
                      </div>
                      {item.readTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.readTime} phút</span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {item.excerpt || item.content?.substring(0, 150) + '...' || 'Mô tả ngắn về tin tức này...'}
                    </p>

                    {/* Read More Link */}
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
                      Đọc thêm
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </CardContent>
                </Card>
              );
            })}
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