import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import Card from "../../components/common/Card";
import { teacherService } from "../../services/teacher.service";

const DEGREE_OPTIONS = ["Cử nhân", "Thạc sĩ", "Tiến sĩ", "Khác"];

export default function TeacherProfile() {
  const [form, setForm] = useState({
    fullName: "",
    degree: "",
    subject: "",
    homeroom: "",
    workplace: "",
    avatarUrl: "",
    avatarFile: null, // nếu upload file
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false); // đã lưu thành công => hiện Preview
  const [error, setError] = useState("");

  // tải dữ liệu đã có (nếu BE có hoặc local fallback)
  useEffect(() => {
    (async () => {
      try {
        const data = await teacherService.getProfile();
        if (data) {
          setForm((prev) => ({
            ...prev,
            fullName: data.fullName || "",
            degree: data.degree || "",
            subject: data.subject || "",
            homeroom: data.homeroom || "",
            workplace: data.workplace || "",
            avatarUrl: data.avatarUrl || "",
          }));
          // Nếu có dữ liệu thì coi như đã có profile → hiển thị preview ngay
          setSaved(true);
        }
        // eslint-disable-next-line no-unused-vars
      } catch (_) {
        // ignore
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatarFile") {
      setForm((f) => ({ ...f, avatarFile: files?.[0] || null }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Hiển thị avatar ưu tiên theo thứ tự: file đã chọn (preview) → avatarUrl → placeholder
  const [avatarPreview, setAvatarPreview] = useState("");
  useEffect(() => {
    if (form.avatarFile) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target.result);
      reader.readAsDataURL(form.avatarFile);
      return;
    }
    setAvatarPreview(form.avatarUrl || "");
  }, [form.avatarFile, form.avatarUrl]);

  const valid = useMemo(() => {
    return form.fullName.trim() && form.subject.trim() && form.workplace.trim();
  }, [form]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!valid) {
      setError("Vui lòng nhập tối thiểu: Tên Giáo viên, Bộ môn, Nơi công tác.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Chuẩn hóa payload
      let payload = {
        fullName: form.fullName.trim(),
        degree: form.degree.trim(),
        subject: form.subject.trim(),
        homeroom: form.homeroom.trim(),
        workplace: form.workplace.trim(),
        avatarUrl: form.avatarUrl.trim(),
      };

      // Nếu có file ảnh, (tạm thời) encode base64 để lưu/mock
      if (form.avatarFile) {
        const fileToBase64 = (file) =>
          new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result);
            r.onerror = reject;
            r.readAsDataURL(file);
          });
        const base64 = await fileToBase64(form.avatarFile);
        payload.avatarUrl = base64; // với BE thực tế thì sẽ upload file -> nhận URL
      }

      await teacherService.saveProfile(payload); // thử gọi BE, nếu lỗi dùng localStorage
      setSaved(true);
    } catch (err) {
      setError(err?.message || "Không thể lưu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* FORM NHẬP THÔNG TIN */}
      <Card className="bg-white border border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Hồ sơ giáo viên
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Giáo viên tự thêm/chỉnh sửa thông tin của mình.
          </p>

          <form className="mt-6 space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tên Giáo viên *
              </label>
              <Input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="VD: Nguyễn Văn A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Trình độ
              </label>
              <select
                name="degree"
                value={form.degree}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              >
                <option value="">-- Chọn trình độ --</option>
                {DEGREE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bộ môn *
                </label>
                <Input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="VD: Toán, Văn, Lý..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phụ trách lớp
                </label>
                <Input
                  name="homeroom"
                  value={form.homeroom}
                  onChange={handleChange}
                  placeholder="VD: 10A1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nơi công tác *
              </label>
              <Input
                name="workplace"
                value={form.workplace}
                onChange={handleChange}
                placeholder="VD: THPT ABC, Quận 1, TP.HCM"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ảnh đại diện (URL)
                </label>
                <Input
                  name="avatarUrl"
                  value={form.avatarUrl}
                  onChange={handleChange}
                  placeholder="Dán URL ảnh hoặc dùng 'Chọn file' bên cạnh"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ưu tiên dùng URL ảnh. Nếu không có, chọn file để xem thử.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Chọn file ảnh
                </label>
                <input
                  type="file"
                  name="avatarFile"
                  accept="image/*"
                  onChange={handleChange}
                  className="mt-1 block w-full text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu hồ sơ"}
              </Button>
              {saved && (
                <span className="text-sm text-green-700">
                  Đã lưu! Xem phần Preview bên cạnh.
                </span>
              )}
            </div>
          </form>
        </div>
      </Card>

      {/* PREVIEW (GÓC NHÌN GUEST) – CHỈ HIỆN SAU KHI LƯU */}
      <Card className="bg-white border border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Preview (Góc nhìn khách)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Khách truy cập sẽ thấy thông tin như bên dưới.
          </p>

          {!saved ? (
            <div className="mt-6 rounded-md border border-dashed border-gray-300 p-6 text-center text-gray-500">
              Lưu hồ sơ để hiển thị phần Preview.
            </div>
          ) : (
            <div className="mt-6">
              <div className="flex items-start gap-6">
                <div className="w-28 h-28 rounded-2xl overflow-hidden border border-gray-200 flex-shrink-0">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {form.fullName || "Tên giáo viên"}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {form.degree ? `${form.degree} • ` : ""}
                    {form.subject || "Bộ môn"}
                  </p>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Phụ trách lớp
                      </p>
                      <p className="mt-1 text-gray-900">
                        {form.homeroom || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Nơi công tác
                      </p>
                      <p className="mt-1 text-gray-900">
                        {form.workplace || "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* có thể mở rộng: danh sách lớp, lịch dạy sắp tới, liên hệ… */}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
