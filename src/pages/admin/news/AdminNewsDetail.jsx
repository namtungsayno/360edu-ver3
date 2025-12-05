import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { newsService } from "../../../services/news/news.service";
import { Calendar, Eye, Edit, Trash2, ArrowLeft } from "lucide-react";

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
      <Button
        variant="ghost"
        onClick={() => navigate("/home/admin/news")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại danh sách
      </Button>
      {news.imageUrl && (
        <img
          src={news.imageUrl}
          alt={news.title}
          className="w-full h-72 object-cover rounded-lg mb-6"
        />
      )}
      <h1 className="text-3xl font-bold mb-2">{news.title}</h1>
      <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
        <Calendar className="h-4 w-4" />
        <span>{news.date || news.createdAt}</span>
        <Eye className="h-4 w-4 ml-4" />
        <span>{news.views} lượt xem</span>
        <span className="ml-4">Bởi: {news.author}</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, idx) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
      <div className="prose max-w-none mb-6">
        <p className="whitespace-pre-line text-base text-slate-800">
          {news.content}
        </p>
      </div>
      <div className="flex gap-2 mt-4">
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
