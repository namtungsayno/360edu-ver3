// src/components/teacher/LessonMaterialUpload.jsx
// Component cho phép giáo viên upload tài liệu cho bài học (lesson)
import { useState, useEffect, useRef } from "react";
import { Badge } from "../ui/Badge.jsx";
import {
  Upload,
  FileText,
  File,
  Trash2,
  Download,
  Loader2,
  Paperclip,
  FileImage,
  FileVideo,
  FileArchive,
  Link,
  ExternalLink,
} from "lucide-react";
import { lessonMaterialService } from "../../services/lesson-material/lesson-material.service.js";
import { useToast } from "../../hooks/use-toast.js";

// Icon mapping based on file type
const FILE_ICONS = {
  pdf: FileText,
  image: FileImage,
  word: FileText,
  excel: FileText,
  powerpoint: FileText,
  video: FileVideo,
  audio: File,
  archive: FileArchive,
  file: File,
  link: Link,
};

export default function LessonMaterialUpload({
  lessonId,
  lessonTitle,
  readOnly = false,
}) {
  const { success, error } = useToast();
  const fileInputRef = useRef(null);

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);



  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    materialId: null,
    materialName: "",
  });

  // Load materials khi component mount hoặc lessonId thay đổi
  useEffect(() => {
    if (lessonId) {
      loadMaterials();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  async function loadMaterials() {
    try {
      setLoading(true);
      const data = await lessonMaterialService.getMaterialsByLesson(lessonId);
      setMaterials(data || []);
    } catch (e) {
      } finally {
      setLoading(false);
    }
  }

  async function handleFileSelect(files) {
    if (!files || files.length === 0 || readOnly) return;

    const file = files[0];

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      error("File quá lớn. Kích thước tối đa là 50MB");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(30);

      const result = await lessonMaterialService.uploadMaterial(lessonId, file);
      setUploadProgress(100);

      setMaterials((prev) => [result, ...prev]);
      success("Upload tài liệu thành công!");
    } catch (e) {
      error("Không thể upload tài liệu");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  // Show delete confirmation
  function showDeleteConfirm(materialId, materialName) {
    setDeleteConfirm({ show: true, materialId, materialName });
  }

  // Cancel delete
  function cancelDelete() {
    setDeleteConfirm({ show: false, materialId: null, materialName: "" });
  }

  // Confirm and execute delete
  async function confirmDelete() {
    const { materialId } = deleteConfirm;
    if (!materialId) return;

    try {
      await lessonMaterialService.deleteMaterial(materialId);
      setMaterials((prev) => prev.filter((m) => m.id !== materialId));
      success("Đã xóa tài liệu");
    } catch (e) {
      error("Không thể xóa tài liệu");
    } finally {
      setDeleteConfirm({ show: false, materialId: null, materialName: "" });
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setDragOver(false);
  }

  function formatFileSize(bytes) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function getFileIcon(fileType) {
    const iconType = lessonMaterialService.getFileIcon(fileType);
    return FILE_ICONS[iconType] || File;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        <span className="ml-2 text-sm text-gray-500">Đang tải tài liệu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-gray-700">
            Tài liệu bài học {lessonTitle && `- ${lessonTitle}`}
          </span>
        </div>
        <Badge variant="outline" className="text-xs">
          {materials.length} tài liệu
        </Badge>
      </div>

      {/* Upload section - chỉ hiển thị khi không phải readOnly */}
      {!readOnly && (
        <div className="space-y-3">
          {/* File Upload */}
          <div
            className={`border-2 border-dashed rounded-xl p-4 transition-all ${
              dragOver
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif,.mp4,.mp3"
            />

            {uploading ? (
              <div className="text-center py-2">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Đang upload... {uploadProgress}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-purple-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div
                className="text-center py-2 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Kéo thả file hoặc{" "}
                  <span className="text-purple-600 font-medium">
                    chọn file
                  </span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, Word, Excel, PowerPoint, ảnh, video (tối đa 50MB)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Materials List */}
      <div className="space-y-2">
        {materials.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            <File className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chưa có tài liệu nào</p>
          </div>
        ) : (
          materials.map((material) => {
            const IconComponent = getFileIcon(material.fileType);
            const isLink = material.fileType === "LINK";

            return (
              <div
                key={material.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isLink ? "bg-blue-100" : "bg-purple-100"
                  }`}
                >
                  <IconComponent
                    className={`w-5 h-5 ${
                      isLink ? "text-blue-600" : "text-purple-600"
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {material.fileName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {!isLink && material.fileSize > 0 && (
                      <span>{formatFileSize(material.fileSize)}</span>
                    )}
                    {isLink && <span className="text-blue-500">Link</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-white rounded-lg transition"
                    title={isLink ? "Mở link" : "Tải xuống"}
                  >
                    {isLink ? (
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Download className="w-4 h-4 text-blue-600" />
                    )}
                  </a>
                  {!readOnly && (
                    <button
                      onClick={() =>
                        showDeleteConfirm(material.id, material.fileName)
                      }
                      className="p-2 hover:bg-white rounded-lg transition"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Xóa tài liệu?</h3>
                <p className="text-sm text-gray-500">
                  Hành động này không thể hoàn tác
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg break-all">
              {deleteConfirm.materialName}
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
