import { useEffect, useState } from "react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Label } from "../../../components/ui/Label";
import { useToast } from "../../../hooks/use-toast";
import { userService } from "../../../services/user/user.service";
import { subjectService } from "../../../services/subject/subject.service";

export default function CreateTeacherForm({
  user,
  onClose,
  onSuccess,
  onPreviewChange,
}) {
  const { success, error } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    subjectIds: [], // required (multi)
  });

  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        subjectIds: Array.isArray(user.subjectIds)
          ? user.subjectIds.map(String)
          : user.subjectId
          ? [String(user.subjectId)]
          : [],
      });
    }
  }, [user]);

  // Update preview whenever form changes
  useEffect(() => {
    if (onPreviewChange) {
      onPreviewChange(form);
    }
  }, [form, onPreviewChange]);

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
    const { name, value, multiple, selectedOptions } = e.target;
    if (multiple) {
      const vals = Array.from(selectedOptions).map((o) => o.value);
      setForm((prev) => ({ ...prev, [name]: vals }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Toggle chọn/bỏ chọn môn theo dạng thẻ (chip)
  const toggleSubject = (id) => {
    const key = String(id);
    setForm((prev) => {
      const cur = new Set((prev.subjectIds || []).map(String));
      if (cur.has(key)) cur.delete(key);
      else cur.add(key);
      return { ...prev, subjectIds: Array.from(cur) };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subjectIds: form.subjectIds.map((id) => Number(id)),
      };

      if (!user && (!payload.subjectIds || payload.subjectIds.length === 0)) {
        error("Vui lòng chọn ít nhất một môn học");
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
    <form className="space-y-8" onSubmit={submit}>
      {/* Section: Personal Information */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-sm">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            Thông tin cá nhân
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Họ và tên *
            </Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <Input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                required
                className="h-12 pl-12 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Email *
            </Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@360edu.vn"
                required
                className="h-12 pl-12 border-2 border-slate-200 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Số điện thoại *
            </Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <Input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="0123456789"
                className="h-12 pl-12 border-2 border-slate-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section: Subject Selection */}
      {!user && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shadow-sm">
              <svg
                className="w-5 h-5 text-orange-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-800">
              Môn học giảng dạy
            </h2>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-6 border border-slate-200/50">
            <p className="text-sm text-slate-600 mb-4 flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">💡</span>
              Click để chọn môn học mà giáo viên có thể giảng dạy
            </p>

            {loadingSubjects ? (
              <div className="text-sm text-slate-500 py-8 text-center">
                <div className="inline-block w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2">Đang tải môn học…</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {subjects.map((s) => {
                  const selected = (form.subjectIds || [])
                    .map(String)
                    .includes(String(s.id));
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => toggleSubject(s.id)}
                      className={
                        `relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ` +
                        (selected
                          ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-xl shadow-blue-500/30 scale-105 border-2 border-transparent"
                          : "bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5")
                      }
                      aria-pressed={selected}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {selected && (
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        <span>{s.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {form.subjectIds && form.subjectIds.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-blue-600">
                    {form.subjectIds.length}
                  </span>{" "}
                  môn đã chọn
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="px-6 py-3 rounded-xl border-2 border-slate-300 hover:bg-slate-50 transition-all duration-300 hover:scale-105"
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Đang lưu...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {user ? "Lưu thay đổi" : "Tạo giáo viên"}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
