import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { newsService } from "../../../services/news/news.service";
import {
  Calendar,
  Eye,
  EyeOff,
  Edit,
  Newspaper,
  User,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "../../../hooks/use-toast";
import { BackButton } from "../../../components/common/BackButton";

export default function AdminNewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
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

  const handleHide = async () => {
    try {
      await newsService.updateStatus(id, "hidden");
      success("Đã ẩn tin tức thành công!");
      // Reload news data
      const data = await newsService.getNewsById(id);
      setNews(data);
    } catch (err) {
      showError("Không thể ẩn tin tức");
    }
  };

  const handleUnhide = async () => {
    try {
      await newsService.updateStatus(id, "draft");
      success("Đã chuyển tin về nháp!");
      const data = await newsService.getNewsById(id);
      setNews(data);
    } catch (err) {
      showError("Không thể chuyển trạng thái tin tức");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="text-gray-600">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Newspaper className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Không tìm thấy tin tức
          </h2>
          <p className="text-gray-500 mb-4">
            Tin tức này có thể đã bị xóa hoặc không tồn tại
          </p>
          <Button onClick={() => navigate("/home/admin/news")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton to="/home/admin/news" showLabel={false} />
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
            <Newspaper className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết tin tức
            </h1>
            <p className="text-sm text-gray-500">
              Xem và quản lý thông tin tin tức
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Chỉ cho sửa khi ở trạng thái draft */}
          {news.status === "draft" && (
            <Button
              variant="outline"
              onClick={handleEdit}
              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            >
              <Edit className="h-4 w-4 mr-2" /> Sửa
            </Button>
          )}
          
          {/* Nút ẩn tin khi đang published */}
          {news.status === "published" && (
            <Button
              variant="outline"
              onClick={handleHide}
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              <EyeOff className="h-4 w-4 mr-2" /> Ẩn tin
            </Button>
          )}

          {/* Nút bỏ ẩn khi đang hidden */}
          {news.status === "hidden" && (
            <Button
              variant="outline"
              onClick={handleUnhide}
              className="border-green-200 text-green-600 hover:bg-green-50"
            >
              <Eye className="h-4 w-4 mr-2" /> Bỏ ẩn (về nháp)
            </Button>
          )}
        </div>
      </div>

      {/* Featured Image - Hiển thị đầy đủ, không bị cắt */}
      {news.imageUrl && (
        <div className="bg-gray-100 rounded-xl overflow-hidden">
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-auto object-contain max-h-[700px] mx-auto"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{news.title}</h2>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(news.date || news.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{news.views || 0} lượt xem</span>
          </div>
          <span>Bởi: {news.author || "Admin"}</span>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Article Content */}
        <div className="prose max-w-none">
          <div
            className="text-base text-gray-700 leading-relaxed rich-text-content
              [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4
              [&_p]:mb-4 [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg
              [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6
              [&_a]:text-indigo-600 [&_a]:underline
              [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-300 [&_blockquote]:pl-4 [&_blockquote]:italic"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </div>
      </div>
    </div>
  );
}
