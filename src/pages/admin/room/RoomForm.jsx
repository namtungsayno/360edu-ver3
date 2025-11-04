// src/pages/admin/classrooms/ClassroomForm.jsx
import { useState } from "react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { classroomService } from "../../../services/classroom.service";
import { toast } from "../../../hooks/use-toast";

export default function ClassroomForm({ initialData, onClose }) {
  const [formData, setFormData] = useState(
    initialData || { name: "", capacity: "" }
  );
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (initialData) {
        await classroomService.update(initialData.id, formData);
        toast?.success?.("Cập nhật thành công!");
      } else {
        await classroomService.create(formData);
        toast?.success?.("Thêm lớp học thành công!");
      }
      onClose();
    } catch {
      toast?.error?.("Lưu thất bại!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="name"
        label="Tên lớp học"
        placeholder="VD: Lớp 10A1"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <Input
        name="capacity"
        type="number"
        label="Sức chứa"
        placeholder="VD: 40"
        value={formData.capacity}
        onChange={handleChange}
        required
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>
    </form>
  );
}
