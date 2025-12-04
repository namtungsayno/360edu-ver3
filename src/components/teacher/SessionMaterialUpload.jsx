// src/components/teacher/SessionMaterialUpload.jsx
// Component cho phép giáo viên upload tài liệu cho buổi học
import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/Button.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Input } from "../ui/Input.jsx";
import {
  Upload,
  FileText,
  Image,
  File,
  Trash2,
  Download,
  X,
  Check,
  Loader2,
  Paperclip,
  FileImage,
  FileVideo,
  FileArchive,
  Link,
  ExternalLink,
  Plus,
} from "lucide-react";
import { materialService } from "../../services/material/material.service.js";
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

export default function SessionMaterialUpload({ sessionId, readOnly = false }) {
  const { success, error } = useToast();
  const fileInputRef = useRef(null);

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [description, setDescription] = useState("");
  
  // Link upload states
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [addingLink, setAddingLink] = useState(false);

  // Tab state: 'file' or 'link'
  const [uploadTab, setUploadTab] = useState("file");

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, materialId: null, materialName: '' });

  // Load materials khi component mount hoặc sessionId thay đổi
  useEffect(() => {
    console.log("📎 SessionMaterialUpload: sessionId changed to", sessionId);
    if (sessionId) {
      loadMaterials();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function loadMaterials() {
    try {
      setLoading(true);
      const data = await materialService.getMaterialsBySession(sessionId);
      setMaterials(data || []);
    } catch (e) {
      console.error("Load materials error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileSelect(files) {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      error("File quá lớn! Kích thước tối đa là 50MB");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(30);

      const result = await materialService.uploadMaterial(sessionId, file, description);
      
      setUploadProgress(100);
      setMaterials(prev => [result, ...prev]);
      setDescription("");
      success("Upload tài liệu thành công!");

    } catch (e) {
      console.error("Upload error:", e);
      error("Không thể upload tài liệu");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  // Handle add link
  async function handleAddLink() {
    if (!linkUrl.trim()) {
      error("Vui lòng nhập đường dẫn");
      return;
    }

    // Validate URL
    try {
      new URL(linkUrl);
    } catch {
      error("Đường dẫn không hợp lệ");
      return;
    }

    try {
      setAddingLink(true);
      console.log("📎 Adding link to sessionId:", sessionId, "URL:", linkUrl);
      const result = await materialService.addLink(sessionId, linkUrl);
      console.log("📎 Link added result:", result);
      setMaterials(prev => [result, ...prev]);
      setLinkUrl("");
      success("Thêm link thành công!");
    } catch (e) {
      console.error("Add link error:", e);
      error("Không thể thêm link");
    } finally {
      setAddingLink(false);
    }
  }

  // Show delete confirmation toast
  function showDeleteConfirm(materialId, materialName) {
    setDeleteConfirm({ show: true, materialId, materialName });
  }

  // Cancel delete
  function cancelDelete() {
    setDeleteConfirm({ show: false, materialId: null, materialName: '' });
  }

  // Confirm and execute delete
  async function confirmDelete() {
    const { materialId } = deleteConfirm;
    if (!materialId) return;

    try {
      await materialService.deleteMaterial(materialId);
      setMaterials(prev => prev.filter(m => m.id !== materialId));
      success("Đã xóa tài liệu");
    } catch (e) {
      console.error("Delete error:", e);
      error("Không thể xóa tài liệu");
    } finally {
      setDeleteConfirm({ show: false, materialId: null, materialName: '' });
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

  function handleDragLeave() {
    setDragOver(false);
  }

  function getFileIcon(fileType) {
    const iconType = materialService.getFileIcon(fileType);
    return FILE_ICONS[iconType] || File;
  }

  function formatFileSize(bytes) {
    return materialService.formatFileSize(bytes);
  }

  if (!sessionId) return null;

  return (
    <div className="bg-white rounded-2xl border-2 border-purple-100 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
          <Paperclip className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">Tài liệu buổi học</h3>
          <p className="text-xs text-gray-500">
            Upload file hoặc thêm link tài liệu để học sinh có thể truy cập
          </p>
        </div>
      </div>

      {/* Upload Area - Only show if not readOnly */}
      {!readOnly && (
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => { setUploadTab("file"); setShowLinkForm(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                uploadTab === "file"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload File
            </button>
            <button
              onClick={() => { setUploadTab("link"); setShowLinkForm(true); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                uploadTab === "link"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Link className="w-4 h-4" />
              Thêm Link
            </button>
          </div>

          {/* File Upload Area */}
          {uploadTab === "file" && (
            <div
              className={`border-2 border-dashed rounded-xl p-6 transition-all ${
                dragOver
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {uploading ? (
                <div className="text-center">
                  <Loader2 className="w-8 h-8 mx-auto text-purple-500 animate-spin mb-2" />
                  <p className="text-sm text-gray-600">Đang upload... {uploadProgress}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Kéo thả file vào đây hoặc{" "}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-purple-600 font-medium hover:underline"
                    >
                      chọn file
                    </button>
                  </p>
                  <p className="text-xs text-gray-400">
                    Hỗ trợ: PDF, Word, Excel, PowerPoint, hình ảnh, video (tối đa 50MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.zip,.rar"
                  />
                </div>
              )}
            </div>
          )}

          {/* Link Form */}
          {uploadTab === "link" && showLinkForm && (
            <div className="border-2 border-blue-100 rounded-xl p-4 bg-blue-50/50">
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="Nhập link tài liệu (https://...) rồi nhấn Enter"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                  disabled={addingLink}
                />
                {addingLink && (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Nhập link Google Drive, OneDrive, YouTube hoặc bất kỳ URL nào rồi nhấn Enter
              </p>
            </div>
          )}
        </div>
      )}

      {/* Materials List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-4">
            <Loader2 className="w-6 h-6 mx-auto text-gray-400 animate-spin" />
            <p className="text-sm text-gray-500 mt-2">Đang tải tài liệu...</p>
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            <File className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chưa có tài liệu nào</p>
          </div>
        ) : (
          materials.map((material) => {
            const IconComponent = getFileIcon(material.fileType);
            const isLink = material.fileType === 'LINK';
            return (
              <div
                key={material.id}
                className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition group ${
                  isLink ? 'bg-blue-50' : 'bg-gray-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                  isLink ? 'bg-blue-100 border-blue-200' : 'bg-white'
                }`}>
                  <IconComponent className={`w-5 h-5 ${isLink ? 'text-blue-600' : 'text-purple-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {material.fileName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {isLink ? (
                      <span className="text-blue-600">Link</span>
                    ) : (
                      <span>{formatFileSize(material.fileSize)}</span>
                    )}
                    {material.description && (
                      <>
                        <span>•</span>
                        <span className="truncate">{material.description}</span>
                      </>
                    )}
                    {material.uploadedByName && (
                      <>
                        <span>•</span>
                        <span>bởi {material.uploadedByName}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-white rounded-lg transition"
                    title={material.fileType === 'LINK' ? "Mở link" : "Tải xuống"}
                  >
                    {material.fileType === 'LINK' ? (
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Download className="w-4 h-4 text-blue-600" />
                    )}
                  </a>
                  {!readOnly && (
                    <button
                      onClick={() => showDeleteConfirm(material.id, material.fileName || material.url)}
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

      {/* Upload Count Badge */}
      {materials.length > 0 && (
        <div className="flex justify-end">
          <Badge variant="outline" className="text-xs">
            {materials.length} tài liệu
          </Badge>
        </div>
      )}

      {/* Delete Confirmation Toast/Dialog */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Xóa tài liệu?</h3>
                <p className="text-sm text-gray-500">Hành động này không thể hoàn tác</p>
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
