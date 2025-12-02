import { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { teacherSecurityService } from "../../services/teacher/teacher.security.service";
import { useToast } from "../../hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { consumeLastPassword } from "../../utils/last-login";

export default function TeacherResetPassword() {
  const { success, error } = useToast();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [show, setShow] = useState({ current: false, next: false, confirm: false });

  // Prefill current password from last login (session-scoped) and consume it
  useEffect(() => {
    const last = consumeLastPassword();
    if (last) setForm((f) => ({ ...f, currentPassword: last }));
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await teacherSecurityService.changePassword(form);
      success("Đổi mật khẩu thành công", "Thành công");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      error(err?.message || "Không thể đổi mật khẩu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardContent className="p-6 max-w-xl">
          <h1 className="text-2xl font-semibold mb-1">Đổi mật khẩu</h1>
          <p className="text-sm text-gray-500 mb-6">
            Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={show.current ? "text" : "password"}
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={onChange}
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => ({ ...s, current: !s.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu mới
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={show.next ? "text" : "password"}
                  name="newPassword"
                  value={form.newPassword}
                  onChange={onChange}
                  placeholder="Tối thiểu 6 ký tự"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => ({ ...s, next: !s.next }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {show.next ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={show.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={onChange}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={submitting} className="min-w-[160px]">
                {submitting ? "Đang lưu..." : "Đổi mật khẩu"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
