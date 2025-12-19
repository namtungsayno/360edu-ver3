import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Label } from "../../../components/ui/Label";
import {
  Plus,
  X,
  Loader2,
  Upload,
  Newspaper,
  Send,
  Save,
  Eye,
  AlertCircle,
} from "lucide-react";
import { newsService } from "../../../services/news/news.service";
import { useToast } from "../../../hooks/use-toast";
import { BackButton } from "../../../components/common/BackButton";
import RichTextEditor from "../../../components/ui/RichTextEditor";

export default function CreateNews() {
  const navigate = useNavigate();
  const location = useLocation();
  const draft = location.state?.draft;
  const { success, error: showError } = useToast();
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    imageUrl: "",
    status: "draft",
    author: "Admin",
    date: new Date().toISOString().split("T")[0],
  });

  const isEditing = Boolean(draft);

  useEffect(() => {
    if (draft) {
      setFormData({
        title: draft.title || "",
        excerpt: draft.excerpt || "",
        content: draft.content || "",
        imageUrl: draft.imageUrl || "",
        status: draft.status || "draft",
        author: draft.author || "Admin",
        date: draft.date || new Date().toISOString().split("T")[0],
      });
      setTags(draft.tags || []);
      if (draft.imageUrl) {
        setImagePreview(draft.imageUrl);
        setImageUrlInput(draft.imageUrl);
      }
    }
  }, [draft]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showError("Vui lòng chọn file ảnh", "Lỗi");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError("Kích thước ảnh tối đa 5MB", "Lỗi");
        return;
      }
      // Upload file to server
      setLoading(true);
      newsService
        .uploadImage(file)
        .then((response) => {
          const imageUrl = response.url;
          setImagePreview(imageUrl);
          setImageUrlInput(imageUrl);
          setFormData({ ...formData, imageUrl: imageUrl });
          success("Upload ảnh thành công!", "Thành công");
        })
        .catch((error) => {
          const errorMsg =
            error.response?.data?.error ||
            error.message ||
            "Upload ảnh thất bại";
          showError(errorMsg, "Lỗi");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleSubmit = async (status) => {
    // Validation cơ bản
    if (!formData.title.trim()) {
      showError("Vui lòng nhập tiêu đề", "Lỗi");
      return;
    }
    if (!formData.excerpt.trim()) {
      showError("Vui lòng nhập mô tả ngắn", "Lỗi");
      return;
    }
    if (!formData.content.trim()) {
      showError("Vui lòng nhập nội dung", "Lỗi");
      return;
    }

    try {
      setLoading(true);
      // Chỉ lấy imageUrl từ lựa chọn hiện tại
      let imageUrlFinal = "";
      if (imageMode === "upload") {
        imageUrlFinal = imageUrlInput || "";
      } else {
        imageUrlFinal = imageUrlInput.trim();
      }
      const newsData = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        imageUrl: imageUrlFinal || null,
        status,
        author: formData.author,
        tags: tags, // Backend expects array, not comma-separated string
        date: new Date().toISOString().split("T")[0], // Tự động lưu ngày hiện tại
      };

      if (isEditing && draft?.id) {
        await newsService.updateNews(draft.id, newsData);
        success("Cập nhật tin tức thành công!", "Thành công");
      } else {
        await newsService.createNews(newsData);
        success(
          status === "published"
            ? "Đăng tin tức thành công!"
            : "Lưu nháp thành công!",
          "Thành công"
        );
      }
      setTimeout(() => {
        navigate("/home/admin/news");
      }, 1000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra khi lưu tin tức";
      showError(errorMsg, "Lỗi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <BackButton to="/home/admin/news" showLabel={false} />
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
          <Newspaper className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Chỉnh sửa tin tức" : "Tạo tin tức mới"}
          </h1>
          <p className="text-sm text-gray-500">
            {isEditing
              ? "Cập nhật nội dung và cài đặt của tin tức"
              : "Tạo và đăng tin tức cho học viên và phụ huynh"}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Nội dung chính */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nội dung tin tức</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newsTitle">Tiêu đề *</Label>
                <Input
                  id="newsTitle"
                  placeholder="Nhập tiêu đề tin tức..."
                  className="text-lg"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newsExcerpt">Mô tả ngắn *</Label>
                <RichTextEditor
                  value={formData.excerpt}
                  onChange={(excerpt) =>
                    setFormData({ ...formData, excerpt: excerpt })
                  }
                  placeholder="Nhập mô tả ngắn (hiển thị trong danh sách tin tức)..."
                  simple={true}
                  minHeight="100px"
                  maxHeight="150px"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newsContent">Nội dung chi tiết *</Label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) =>
                    setFormData({ ...formData, content: content })
                  }
                  placeholder="Nhập nội dung chi tiết tin tức..."
                  minHeight="350px"
                  maxHeight="600px"
                />
              </div>

              <div className="space-y-2">
                <Label>Ảnh đại diện</Label>
                <div className="space-y-3">
                  {imagePreview ? (
                    <div className="relative border-2 border-dashed rounded-lg p-4 hover:border-blue-400 transition-colors">
                      <img
                        src={`${
                          import.meta.env.VITE_API_BASE_URL ||
                          "http://localhost:8080"
                        }${imagePreview}`}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = "/placeholder-image.png";
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImagePreview(null);
                        }}
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer hover:border-blue-400 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mb-3" />
                      <span className="text-sm text-gray-600 mb-1">
                        Click để tải ảnh lên
                      </span>
                      <span className="text-xs text-gray-400">
                        PNG, JPG, JPEG, GIF, WebP (tối đa 5MB)
                      </span>
                      <input
                        id="newsImage"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={loading}
                      />
                    </label>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cài đặt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newsAuthor">Tác giả</Label>
                <Input
                  id="newsAuthor"
                  value={formData.author}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            {/* Nút Đăng ngay */}
            <Button
              className="w-full bg-green-600 text-white hover:bg-green-700"
              onClick={() => handleSubmit("published")}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {isEditing ? "Cập nhật & Đăng" : "Đăng ngay"}
                </>
              )}
            </Button>

            {/* Nút Lưu nháp */}
            <Button
              variant="outline"
              className="w-full border-amber-300 text-amber-600 hover:bg-amber-50 hover:border-amber-400"
              onClick={() => handleSubmit("draft")}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              Lưu nháp
            </Button>

            {/* Nút Hủy */}
            <Button
              variant="ghost"
              className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200"
              onClick={() => navigate("/home/admin/news")}
              disabled={loading}
            >
              Hủy
            </Button>
          </div>

          {/* Thông tin trạng thái hiện tại */}
          {isEditing && (
            <Card className="border-slate-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Trạng thái hiện tại:</span>
                  <Badge
                    variant="secondary"
                    className={
                      draft?.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }
                  >
                    {draft?.status === "published"
                      ? "Đã đăng"
                      : "Bản nháp"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
