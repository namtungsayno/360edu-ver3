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
import { Textarea } from "../../../components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/Select";
import {
  ArrowLeft,
  Plus,
  X,
  Loader2,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { newsService } from "../../../services/news/news.service";
import { useToast } from "../../../hooks/use-toast";

export default function CreateNews() {
  const navigate = useNavigate();
  const location = useLocation();
  const draft = location.state?.draft;
  const { success, error: showError } = useToast();
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [imagePreview, setImagePreview] = useState(null);
  const [imageMode, setImageMode] = useState("upload"); // "upload" | "url"
  const [imageUrlInput, setImageUrlInput] = useState("");
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
          console.error("Failed to upload image:", error);
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
      };

      if (isEditing && draft?.id) {
        await newsService.updateNews(draft.id, newsData);
        success("Cập nhật tin tức thành công!", "Thành công");
      } else {
        await newsService.createNews(newsData);
        success("Tạo tin tức thành công!", "Thành công");
      }
      setTimeout(() => {
        navigate("/home/admin/news");
      }, 1000);
    } catch (error) {
      console.error("Failed to submit news:", error);
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/home/admin/news")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Chỉnh sửa tin tức" : "Tạo tin tức mới"}
          </h1>
          <p className="text-slate-600 mt-1">
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
                <Textarea
                  id="newsExcerpt"
                  placeholder="Nhập mô tả ngắn (hiển thị trong danh sách tin tức)..."
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newsContent">Nội dung chi tiết *</Label>
                <Textarea
                  id="newsContent"
                  placeholder="Nhập nội dung chi tiết tin tức..."
                  rows={15}
                  className="font-mono text-sm"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Ảnh đại diện</Label>
                <div className="flex gap-4 mb-2">
                  <Button
                    type="button"
                    variant={imageMode === "upload" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setImageMode("upload")}
                  >
                    Upload ảnh
                  </Button>
                  <Button
                    type="button"
                    variant={imageMode === "url" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setImageMode("url")}
                  >
                    Nhập URL ảnh
                  </Button>
                </div>
                {imageMode === "upload" ? (
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
                            console.error(
                              "Failed to load image:",
                              imagePreview
                            );
                          }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagePreview(null);
                            setImageUrlInput("");
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
                ) : (
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Nhập URL ảnh (http...)"
                      value={imageUrlInput}
                      onChange={(e) => {
                        setImageUrlInput(e.target.value);
                        setImagePreview(e.target.value);
                      }}
                      disabled={loading}
                    />
                    {imageUrlInput && (
                      <div className="mt-2">
                        <img
                          src={imageUrlInput}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = "/placeholder-image.png";
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
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
                <Label htmlFor="newsStatus">Trạng thái *</Label>
                <Select
                  defaultValue="draft"
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Lưu nháp</SelectItem>
                    <SelectItem value="published">Đăng ngay</SelectItem>
                    <SelectItem value="hidden">Ẩn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newsAuthor">Tác giả</Label>
                <Input
                  id="newsAuthor"
                  value={formData.author}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newsDate">Ngày đăng</Label>
                <Input
                  id="newsDate"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Thêm tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button type="button" onClick={addTag} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => handleSubmit("published")}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>{isEditing ? "Cập nhật tin tức" : "Đăng tin tức"}</>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              onClick={() => handleSubmit("draft")}
              disabled={loading}
            >
              Lưu nháp
            </Button>
            <Button
              variant="ghost"
              className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200"
              onClick={() => navigate("/home/admin/news")}
              disabled={loading}
            >
              Hủy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
