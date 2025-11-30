import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/Dialog";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Button } from "../../../components/ui/Button";
import { useToast } from "../../../hooks/use-toast";
import { courseApi } from "../../../services/course/course.api";

export default function CreateCourseDialog({
  open,
  onOpenChange,
  subject,
  onCreated,
}) {
  const { success, error } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setSaving(false);
    }
  }, [open]);

  const canSubmit = subject?.id && title.trim().length >= 3;

  async function handleSubmit(e) {
    e?.preventDefault?.();
    if (!canSubmit || saving) return;
    try {
      setSaving(true);
      const payload = {
        subjectId: Number(subject.id),
        title: title.trim(),
        description: description.trim() || undefined,
      };
      const created = await courseApi.create(payload);
      success("Tạo khóa học thành công");
      onCreated?.(created);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.message || "Không thể tạo khóa học";
      error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo khóa học mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Môn học
            </label>
            <Input
              readOnly
              value={subject?.name || `ID: ${subject?.id || ""}`}
              className="bg-gray-50 text-gray-700"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tiêu đề khóa học <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Cấu trúc dữ liệu & Giải thuật"
            />
            {title && title.trim().length < 3 && (
              <p className="text-xs text-red-600 mt-1">Tối thiểu 3 ký tự</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Mô tả (tuỳ chọn)
            </label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về nội dung khóa học"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || saving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {saving ? "Đang tạo..." : "Tạo khóa học"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
