import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "../../../components/ui/Dialog";
import { newsService } from "../../../services/news/news.service";
import {
  Calendar,
  Eye,
  EyeOff,
  Edit,
  Newspaper,
  ArrowLeft,
  Send,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle,
  FileText,
} from "lucide-react";
import { useToast } from "../../../hooks/use-toast";
import { BackButton } from "../../../components/common/BackButton";

export default function AdminNewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        const data = await newsService.getNewsById(id);
        setNews(data);
      } catch {
        setNews(null);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const handleEdit = () => {
    navigate("/home/admin/news/create", {
      state: {
        draft: news,
        returnTo: `/home/admin/news/${id}`, // Quay về trang chi tiết sau khi sửa
      },
    });
  };

  // Ẩn tin = chuyển về draft
  const handleMoveToDraft = async () => {
    try {
      await newsService.updateStatus(id, "draft");
      success("Đã ẩn tin và chuyển về bản nháp!");
      const data = await newsService.getNewsById(id);
      setNews(data);
    } catch {
      showError("Không thể ẩn tin tức");
    }
  };

  // Xuất bản tin
  const handlePublish = async () => {
    try {
      await newsService.updateStatus(id, "published");
      success("Đã xuất bản tin tức thành công!");
      const data = await newsService.getNewsById(id);
      setNews(data);
    } catch {
      showError("Không thể xuất bản tin tức");
    }
  };

  // Xóa tin
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await newsService.deleteNews(id);
      success("Đã xóa tin tức thành công!");
      navigate("/home/admin/news");
    } catch {
      showError("Không thể xóa tin tức");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
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

  // Chuẩn hóa status sang lowercase để so sánh (backend trả về UPPERCASE)
  const normalizedStatus = news.status?.toLowerCase();

  // Status badge component
  const StatusBadge = () => {
    if (normalizedStatus === "published") {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-medium px-3 py-1">
          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
          Đã xuất bản
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-medium px-3 py-1">
        <FileText className="h-3.5 w-3.5 mr-1.5" />
        Bản nháp
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header - đồng bộ với CreateNews */}
      <div className="flex items-center gap-4">
        <BackButton to="/home/admin/news" showLabel={false} />
        <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-lg shadow-rose-200">
          <Newspaper className="h-7 w-7 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết tin tức
            </h1>
            <StatusBadge />
          </div>
          <p className="text-sm text-gray-500">
            Xem và quản lý thông tin tin tức
          </p>
        </div>
      </div>

      {/* Main Content Grid - giống layout CreateNews */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Nội dung chính - 2 cột */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured Image Card */}
          {news.imageUrl && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ảnh đại diện
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center">
                <img
                  src={news.imageUrl}
                  alt={news.title}
                  className="max-w-full h-auto rounded-lg"
                  style={{ maxHeight: "400px", objectFit: "contain" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          {/* Article Content Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Nội dung tin tức
            </h3>

            {/* Title */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-500 mb-1 block">
                Tiêu đề
              </label>
              <p className="text-xl font-bold text-gray-900">{news.title}</p>
            </div>

            {/* Excerpt */}
            {news.excerpt && (
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-500 mb-1 block">
                  Mô tả ngắn
                </label>
                <div
                  className="text-gray-700 bg-gray-50 rounded-lg p-3 rich-text-content"
                  dangerouslySetInnerHTML={{ __html: news.excerpt }}
                />
              </div>
            )}

            {/* Content */}
            <div>
              <label className="text-sm font-medium text-gray-500 mb-2 block">
                Nội dung chi tiết
              </label>
              <div className="prose max-w-none bg-gray-50 rounded-lg p-4">
                <div
                  className="text-base text-gray-700 leading-relaxed rich-text-content
                    [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4
                    [&_p]:mb-4 [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg
                    [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6
                    [&_a]:text-rose-600 [&_a]:underline
                    [&_blockquote]:border-l-4 [&_blockquote]:border-rose-300 [&_blockquote]:pl-4 [&_blockquote]:italic"
                  dangerouslySetInnerHTML={{ __html: news.content }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - 1 cột */}
        <div className="space-y-6">
          {/* Meta Info Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Trạng thái</span>
                <StatusBadge />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Tác giả</span>
                <span className="text-sm font-medium text-gray-900">
                  {news.author || "Admin"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Ngày tạo</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(news.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Lượt xem</span>
                <span className="text-sm font-medium text-gray-900">
                  {news.views || 0}
                </span>
              </div>

              {news.publishedAt && normalizedStatus === "published" && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Ngày xuất bản</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(news.publishedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tags Card */}
          {tags.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thẻ tag
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <Badge
                    key={idx}
                    className="bg-rose-50 text-rose-600 border-rose-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hành động
            </h3>
            <div className="space-y-3">
              {normalizedStatus === "draft" && (
                <>
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    className="w-full justify-start border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa tin tức
                  </Button>
                  <Button
                    onClick={handlePublish}
                    className="w-full justify-start bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Xuất bản ngay
                  </Button>
                </>
              )}
              {normalizedStatus === "published" && (
                <Button
                  onClick={handleMoveToDraft}
                  variant="outline"
                  className="w-full justify-start border-amber-200 text-amber-600 hover:bg-amber-50"
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Ẩn tin (chuyển về nháp)
                </Button>
              )}
              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="outline"
                className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa tin tức
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl">Xác nhận xóa tin tức</DialogTitle>
          </DialogHeader>
          <DialogContent className="text-gray-500 mb-6">
            Bạn có chắc chắn muốn xóa tin tức này không?
            <br />
            <span className="text-red-500 font-medium">
              Hành động này không thể hoàn tác.
            </span>
          </DialogContent>
          <DialogFooter className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
              className="min-w-[100px]"
            >
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="min-w-[100px] bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}
