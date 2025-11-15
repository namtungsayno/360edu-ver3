import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  GraduationCap,
  User,
  Mail,
  Phone,
  BookOpen,
} from "lucide-react";
import CreateTeacherForm from "./CreateTeacherForm.jsx";
import { subjectService } from "../../../services/subject/subject.service";

// Trang tạo giáo viên - Thiết kế theo Figma với glassmorphism & gradient
export default function CreateTeacherPage() {
  const navigate = useNavigate();
  const [previewData, setPreviewData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subjectIds: [],
  });
  const [subjects, setSubjects] = useState([]);

  // Load subjects for preview labels
  useEffect(() => {
    (async () => {
      try {
        const data = await subjectService.all();
        setSubjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load subjects", err);
      }
    })();
  }, []);

  // Get selected subject names
  const selectedSubjects = subjects.filter((s) =>
    previewData.subjectIds.map(String).includes(String(s.id))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Quay lại</span>
        </button>

        {/* Header Card with Gradient */}
        <div className="mb-8 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-3xl p-8 shadow-xl shadow-indigo-500/30">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/40 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Thêm giáo viên mới
              </h1>
              <p className="text-blue-50 text-sm">
                Điền thông tin và chọn môn học giảng dạy
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Form Section - 2 cols */}
          <div className="col-span-2">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 p-8">
              <CreateTeacherForm
                user={null}
                onClose={() => navigate(-1)}
                onSuccess={() => navigate(-1)}
                onPreviewChange={setPreviewData}
              />
            </div>
          </div>

          {/* Preview Section - 1 col */}
          <div className="col-span-1 space-y-6">
            {/* Preview Card */}
            <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              {/* Decorative blur */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 text-amber-400 mb-4">
                  <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                    <span className="text-xs">✨</span>
                  </div>
                  <span className="text-xs font-semibold tracking-wider uppercase">
                    Xem trước
                  </span>
                </div>

                {/* Avatar Placeholder */}
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/50 transition-all duration-300">
                  {previewData.fullName ? (
                    <span className="text-2xl font-bold text-white">
                      {previewData.fullName.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User className="w-10 h-10 text-white" strokeWidth={2} />
                  )}
                </div>

                <h3 className="text-center text-white font-bold text-lg mb-1 transition-all duration-300">
                  {previewData.fullName || "Chưa nhập tên"}
                </h3>
                <p className="text-center text-slate-400 text-sm mb-6">
                  Giáo viên
                </p>

                {/* Info Preview */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-300 transition-all duration-300">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        previewData.email
                          ? "bg-green-500/20"
                          : "bg-slate-700/50"
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-sm truncate">
                      {previewData.email || "Chưa nhập email"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300 transition-all duration-300">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        previewData.phone
                          ? "bg-purple-500/20"
                          : "bg-slate-700/50"
                      }`}
                    >
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-sm">
                      {previewData.phone || "Chưa nhập SĐT"}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Môn giảng dạy
                      </span>
                    </div>
                    {selectedSubjects.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedSubjects.map((s) => (
                          <span
                            key={s.id}
                            className="px-2 py-1 text-xs rounded-lg bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-600/20 text-blue-200 border border-blue-500/30"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">
                        Chưa chọn môn học
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Info Tip */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200/50">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-600 text-sm">💡</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-900 mb-1">
                    Lưu ý
                  </h4>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Chọn ít nhất 1 môn học mà giáo viên có thể giảng dạy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
