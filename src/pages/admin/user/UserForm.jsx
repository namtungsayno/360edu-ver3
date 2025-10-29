import { useEffect, useState } from "react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Label } from "../../../components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/Select";
import { useToast } from "../../../hooks/use-toast";
import { userService } from "../../../services/user.service";

const ROLE_OPTIONS = [
  { value: "TEACHER", label: "Teacher" },
  { value: "STUDENT", label: "Student" },
  { value: "PARENT", label: "Parent" },
];

export default function UserForm({ user, onClose, onSuccess }) {
  const { success, error } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "TEACHER",
    // các field khác nếu BE yêu cầu: username, password (khi tạo), gender, address, ...
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "TEACHER",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      // phân nhánh create teacher vs. update basic (tùy BE, ở đây minh họa create teacher)
      if (!user) {
        // yêu cầu ảnh 2: Create Teacher Account (Admin)
        if (form.role !== "TEACHER") {
          // vẫn cho tạo role khác nếu muốn, nhưng theo đề, nút này phục vụ giáo viên
        }
        await userService.createTeacher({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          // thêm username/password nếu cần
        });
        success("Đã tạo tài khoản giáo viên");
      } else {
        // Nếu BE có API update profile của Admin cho user khác, bạn nối vào đây.
        // Ví dụ: await userService.update(user.id, {...form});
        success("Đã cập nhật thông tin người dùng");
      }
      onSuccess?.();
    } catch (e) {
      console.error(e);
      error("Lưu thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Họ và tên</Label>
          <Input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>Số điện thoại</Label>
          <Input name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div>
          <Label>Vai trò</Label>
          <Select
            value={form.role}
            onValueChange={(v) => setForm((s) => ({ ...s, role: v }))}
            disabled={!!user} // nếu đang chỉnh sửa, có thể khóa role (tuỳ policy)
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn vai trò" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Đang lưu..." : user ? "Lưu thay đổi" : "Tạo giáo viên"}
        </Button>
      </div>
    </form>
  );
}
