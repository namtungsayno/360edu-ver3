import { useEffect, useState } from "react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Label } from "../../../components/ui/Label";
import { useToast } from "../../../hooks/use-toast";
import { userService } from "../../../services/user/user.service";

export default function CreateTeacherForm({ user, onClose, onSuccess }) {
  const { success, error } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
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
        // Nếu backend yêu cầu role khi tạo mới:
        // ...(user ? {} : { role: "TEACHER" }),
      };

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
