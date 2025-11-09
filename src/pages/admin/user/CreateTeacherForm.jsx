import { useEffect, useState } from "react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Label } from "../../../components/ui/Label";
import { useToast } from "../../../hooks/use-toast";
import { userService } from "../../../services/user/user.service";
import { subjectService } from "../../../services/subject/subject.service";

export default function CreateTeacherForm({ user, onClose, onSuccess }) {
  const { success, error } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    subjectId: "", // required
  });

  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        subjectId: user.subjectId || "",
      });
    }
  }, [user]);

  // Load subjects for dropdown when creating new teacher
  useEffect(() => {
    if (!user) {
      (async () => {
        try {
          setLoadingSubjects(true);
          const data = await subjectService.all();
          setSubjects(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to load subjects", err);
        } finally {
          setLoadingSubjects(false);
        }
      })();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subjectId: form.subjectId ? Number(form.subjectId) : null,
      };

      if (!user && !payload.subjectId) {
        error("Vui lòng chọn môn học");
        setSubmitting(false);
        return;
      }

      if (!user) {
        // Tạo giáo viên mới với 3 trường
        await userService.createTeacher(payload);
        success("Đã tạo tài khoản giáo viên");
      } else {
        // Cập nhật chỉ 3 trường
        await userService.update(user.id, payload);
        success("Đã cập nhật thông tin giáo viên");
      }

      onSuccess?.();
    } catch (err) {
      console.error(err);
      error("Lưu thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={submit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <Label className="font-medium text-gray-700">Họ và tên</Label>
          <Input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Nguyễn Văn A"
            required
          />
        </div>

        <div>
          <Label className="font-medium text-gray-700">Email</Label>
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="example@email.com"
            required
          />
        </div>

        <div>
          <Label className="font-medium text-gray-700">Số điện thoại</Label>
          <Input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="0123456789"
          />
        </div>

        {!user && (
          <div className="sm:col-span-2">
            <Label className="font-medium text-gray-700">Môn học *</Label>
            <select
              name="subjectId"
              value={form.subjectId}
              onChange={handleChange}
              required
              disabled={loadingSubjects}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              <option value="">-- Chọn môn học --</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Removed specialization, degree, note for admin creation as per new requirements */}
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="min-w-[100px]"
        >
          Hủy
        </Button>
        <Button type="submit" disabled={submitting} className="min-w-[140px]">
          {submitting ? "Đang lưu..." : user ? "Lưu thay đổi" : "Tạo giáo viên"}
        </Button>
      </div>
    </form>
  );
}
