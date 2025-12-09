import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { newsService } from "../../../services/news/news.service";
import { Calendar, Eye, Edit, Trash2, Newspaper } from "lucide-react";
import { BackButton } from "../../../components/common/BackButton";

export default function AdminNewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        const data = await newsService.getNewsById(id);
        setNews(data);
      } catch (err) {
        setNews(null);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const handleEdit = () => {
    navigate("/home/admin/news/create", { state: { draft: news } });
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc muốn xóa tin này?")) {
      await newsService.deleteNews(id);
      navigate("/home/admin/news");
    }
  };

  if (loading) return <div className="p-12 text-center">Đang tải...</div>;
  if (!news)
    return (
      <div className="p-12 text-center text-red-600">
        Không tìm thấy tin tức
      </div>
    );

  const tags = Array.isArray(news.tags)
    ? news.tags
    : typeof news.tags === "string"
    ? news.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <BackButton to="/home/admin/news" showLabel={false} />
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
          <Newspaper className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chi tiết tin tức</h1>
          <p className="text-sm text-gray-500">
            Xem và quản lý thông tin tin tức
          </p>
        </div>
      </div>

      {news.imageUrl && (
        <img
          src={news.imageUrl}
          alt={news.title}
          className="w-full h-72 object-cover rounded-xl shadow-sm"
        />
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{news.title}</h2>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{news.date || news.createdAt}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{news.views} lượt xem</span>
          </div>
          <span>Bởi: {news.author}</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag, idx) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="prose max-w-none">
          <div 
            className="text-base text-gray-700 leading-relaxed rich-text-content"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="default" onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" /> Sửa
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" /> Xóa
        </Button>
      </div>
    </div>
  );
}
