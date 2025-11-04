import { useEffect, useState } from "react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Label } from "../../../components/ui/Label";
import { useToast } from "../../../hooks/use-toast";
import { userService } from "../../../services/user.service";

export default function UserForm({ user, onClose, onSuccess }) {
  const { success, error } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        username: user.username || "",
        password: "",
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
      if (!user) {
        // Tạo mới người dùng
        await userService.create({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          username: form.username.trim(),
          password: form.password,
        });
        success("Đã tạo tài khoản người dùng");
      } else {
        // Cập nhật người dùng
        await userService.update(user.id, {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          username: form.username.trim(),
          ...(form.password ? { password: form.password } : {}),
        });
        success("Đã cập nhật thông tin người dùng");
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
      {/* Grid chia 2 cột để bố cục gọn gàng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
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
        <div>
          <Label className="font-medium text-gray-700">Tên đăng nhập</Label>
          <Input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="username"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <Label className="font-medium text-gray-700">Mật khẩu</Label>
          <Input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Nhập mật khẩu"
            required={!user} // khi chỉnh sửa có thể bỏ qua mật khẩu
          />
          {user && (
            <p className="text-xs text-gray-500 mt-1">
              (Để trống nếu không muốn thay đổi mật khẩu)
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
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
          {submitting ? "Đang lưu..." : user ? "Lưu thay đổi" : "Tạo tài khoản"}
        </Button>
      </div>
    </form>
  );
}
