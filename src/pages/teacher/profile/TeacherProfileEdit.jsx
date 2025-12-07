import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import Card from "../../../components/common/Card";
import { teacherProfileService } from "../../../services/teacher/teacher.profile.service";
import { teacherProfileApi } from "../../../services/teacher/teacher.profile.detail.api";
import { UserCog } from "lucide-react";
import { useToast } from "../../../hooks/use-toast";
import RichTextEditor, { RichTextContent } from "../../../components/ui/RichTextEditor";

const DEGREE_OPTIONS = ["Cử nhân", "Thạc sĩ", "Tiến sĩ", "Khác"];

export default function TeacherProfileEdit() {
  const { success, error: showError } = useToast();
  const [form, setForm] = useState({
    fullName: "",
    degree: "",
    subject: "",
    homeroom: "",
    workplace: "",
    avatarUrl: "",
    avatarFile: null,
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // State cho certificates, experiences, educations
  const [certificates, setCertificates] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);

  // State cho edit/add forms
  const [certForm, setCertForm] = useState({
    id: null,
    title: "",
    organization: "",
    year: "",
    description: "",
  });
  const [expForm, setExpForm] = useState({
    id: null,
    position: "",
    company: "",
    startYear: "",
    endYear: "",
    description: "",
  });
  const [eduForm, setEduForm] = useState({
    id: null,
    degree: "",
    school: "",
    year: "",
    description: "",
  });

  const [showCertForm, setShowCertForm] = useState(false);
  const [showExpForm, setShowExpForm] = useState(false);
  const [showEduForm, setShowEduForm] = useState(false);

  // Load functions
  const loadCertificates = async () => {
    try {
      const data = await teacherProfileApi.getMyCertificates();
      setCertificates(data || []);
    } catch (err) {
      console.error("Error loading certificates:", err);
    }
  };

  const loadExperiences = async () => {
    try {
      const data = await teacherProfileApi.getMyExperiences();
      setExperiences(data || []);
    } catch (err) {
      console.error("Error loading experiences:", err);
    }
  };

  const loadEducations = async () => {
    try {
      const data = await teacherProfileApi.getMyEducations();
      setEducations(data || []);
    } catch (err) {
      console.error("Error loading educations:", err);
    }
  };

  // Load data on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await teacherProfileService.getProfile();
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
          setSaved(true);
        }
      } catch {
        // ignore
      }
    })();

    loadCertificates();
    loadExperiences();
    loadEducations();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatarFile") {
      setForm((f) => ({ ...f, avatarFile: files?.[0] || null }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

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
      let payload = {
        fullName: form.fullName.trim(),
        degree: form.degree.trim(),
        subject: form.subject.trim(),
        homeroom: form.homeroom.trim(),
        workplace: form.workplace.trim(),
        avatarUrl: form.avatarUrl.trim(),
      };

      if (form.avatarFile) {
        const fileToBase64 = (file) =>
          new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result);
            r.onerror = reject;
            r.readAsDataURL(file);
          });
        const base64 = await fileToBase64(form.avatarFile);
        payload.avatarUrl = base64;
      }

      await teacherProfileService.saveProfile(payload);
      setSaved(true);
    } catch (err) {
      setError(err?.displayMessage || "Không thể lưu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Certificate handlers
  const handleSaveCert = async () => {
    try {
      if (certForm.id) {
        await teacherProfileApi.updateCertificate(certForm.id, certForm);
        success("Cập nhật chứng chỉ thành công");
      } else {
        await teacherProfileApi.addCertificate(certForm);
        success("Thêm chứng chỉ thành công");
      }
      await loadCertificates();
      setCertForm({
        id: null,
        title: "",
        organization: "",
        year: "",
        description: "",
      });
      setShowCertForm(false);
    } catch (err) {
      showError(err?.displayMessage || "Không thể lưu chứng chỉ");
    }
  };

  const handleEditCert = (cert) => {
    setCertForm(cert);
    setShowCertForm(true);
  };

  const handleDeleteCert = async (id) => {
    if (!confirm("Xóa chứng chỉ này?")) return;
    try {
      await teacherProfileApi.deleteCertificate(id);
      await loadCertificates();
      success("Xóa chứng chỉ thành công");
    } catch (err) {
      showError(err?.displayMessage || "Không thể xóa chứng chỉ");
    }
  };

  // Experience handlers
  const handleSaveExp = async () => {
    try {
      if (expForm.id) {
        await teacherProfileApi.updateExperience(expForm.id, expForm);
        success("Cập nhật kinh nghiệm thành công");
      } else {
        await teacherProfileApi.addExperience(expForm);
        success("Thêm kinh nghiệm thành công");
      }
      await loadExperiences();
      setExpForm({
        id: null,
        position: "",
        company: "",
        startYear: "",
        endYear: "",
        description: "",
      });
      setShowExpForm(false);
    } catch (err) {
      showError(err?.displayMessage || "Không thể lưu kinh nghiệm");
    }
  };

  const handleEditExp = (exp) => {
    setExpForm(exp);
    setShowExpForm(true);
  };

  const handleDeleteExp = async (id) => {
    if (!confirm("Xóa kinh nghiệm này?")) return;
    try {
      await teacherProfileApi.deleteExperience(id);
      await loadExperiences();
      success("Xóa kinh nghiệm thành công");
    } catch (err) {
      showError(err?.displayMessage || "Không thể xóa kinh nghiệm");
    }
  };

  // Education handlers
  const handleSaveEdu = async () => {
    try {
      if (eduForm.id) {
        await teacherProfileApi.updateEducation(eduForm.id, eduForm);
        success("Cập nhật học vấn thành công");
      } else {
        await teacherProfileApi.addEducation(eduForm);
        success("Thêm học vấn thành công");
      }
      await loadEducations();
      setEduForm({
        id: null,
        degree: "",
        school: "",
        year: "",
        description: "",
      });
      setShowEduForm(false);
    } catch (err) {
      showError(err?.displayMessage || "Không thể lưu học vấn");
    }
  };

  const handleEditEdu = (edu) => {
    setEduForm(edu);
    setShowEduForm(true);
  };

  const handleDeleteEdu = async (id) => {
    if (!confirm("Xóa học vấn này?")) return;
    try {
      await teacherProfileApi.deleteEducation(id);
      await loadEducations();
      success("Xóa học vấn thành công");
    } catch (err) {
      showError(err?.displayMessage || "Không thể xóa học vấn");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-200">
            <UserCog className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chỉnh sửa hồ sơ
            </h1>
            <p className="text-sm text-gray-500">
              Giáo viên tự thêm/chỉnh sửa thông tin của mình
            </p>
          </div>
        </div>
      </div>

      {/* THÔNG TIN CƠ BẢN */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="bg-white border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Thông tin cơ bản
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Cập nhật thông tin cá nhân của bạn.
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
                    placeholder="Dán URL ảnh"
                  />
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
                  {loading ? "Đang lưu..." : "Lưu thông tin"}
                </Button>
                {saved && (
                  <span className="text-sm text-green-700">✓ Đã lưu!</span>
                )}
              </div>
            </form>
          </div>
        </Card>

        <Card className="bg-white border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
            <p className="text-sm text-gray-500 mt-1">
              Khách truy cập sẽ thấy thông tin như bên dưới.
            </p>

            {!saved ? (
              <div className="mt-6 rounded-md border border-dashed border-gray-300 p-6 text-center text-gray-500">
                Lưu hồ sơ để hiển thị Preview.
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
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* CERTIFICATES */}
      <Card className="bg-white border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Chứng chỉ</h2>
              <p className="text-sm text-gray-500 mt-1">
                Danh sách chứng chỉ đã đạt được
              </p>
            </div>
            <Button
              onClick={() => {
                setCertForm({
                  id: null,
                  title: "",
                  organization: "",
                  year: "",
                  description: "",
                });
                setShowCertForm(true);
              }}
            >
              + Thêm chứng chỉ
            </Button>
          </div>

          {showCertForm && (
            <div className="mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-4">
                {certForm.id ? "Sửa chứng chỉ" : "Thêm chứng chỉ mới"}
              </h3>
              <div className="space-y-3">
                <Input
                  placeholder="Tên chứng chỉ *"
                  value={certForm.title}
                  onChange={(e) =>
                    setCertForm({ ...certForm, title: e.target.value })
                  }
                />
                <Input
                  placeholder="Tổ chức cấp"
                  value={certForm.organization}
                  onChange={(e) =>
                    setCertForm({ ...certForm, organization: e.target.value })
                  }
                />
                <Input
                  placeholder="Năm (VD: 2023)"
                  type="number"
                  value={certForm.year}
                  onChange={(e) =>
                    setCertForm({ ...certForm, year: e.target.value })
                  }
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <RichTextEditor
                    value={certForm.description}
                    onChange={(content) =>
                      setCertForm({ ...certForm, description: content })
                    }
                    placeholder="Mô tả chứng chỉ..."
                    simple
                    minHeight="120px"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveCert}>Lưu</Button>
                  <Button
                    onClick={() => {
                      setCertForm({
                        id: null,
                        title: "",
                        organization: "",
                        year: "",
                        description: "",
                      });
                      setShowCertForm(false);
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {certificates.length === 0 ? (
              <p className="text-gray-500 text-sm">Chưa có chứng chỉ nào.</p>
            ) : (
              certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 border border-gray-200 rounded-lg flex justify-between items-start"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{cert.title}</h4>
                    {cert.organization && (
                      <p className="text-sm text-gray-600">
                        {cert.organization}
                      </p>
                    )}
                    {cert.year && (
                      <p className="text-sm text-gray-500">Năm: {cert.year}</p>
                    )}
                    {cert.description && (
                      <div className="text-sm text-gray-600 mt-2">
                        <RichTextContent content={cert.description} />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCert(cert)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteCert(cert.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* EXPERIENCES */}
      <Card className="bg-white border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Kinh nghiệm làm việc
              </h2>
              <p className="text-sm text-gray-500 mt-1">Lịch sử công tác</p>
            </div>
            <Button
              onClick={() => {
                setExpForm({
                  id: null,
                  position: "",
                  company: "",
                  startYear: "",
                  endYear: "",
                  description: "",
                });
                setShowExpForm(true);
              }}
            >
              + Thêm kinh nghiệm
            </Button>
          </div>

          {showExpForm && (
            <div className="mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-4">
                {expForm.id ? "Sửa kinh nghiệm" : "Thêm kinh nghiệm mới"}
              </h3>
              <div className="space-y-3">
                <Input
                  placeholder="Vị trí *"
                  value={expForm.position}
                  onChange={(e) =>
                    setExpForm({ ...expForm, position: e.target.value })
                  }
                />
                <Input
                  placeholder="Công ty/Tổ chức"
                  value={expForm.company}
                  onChange={(e) =>
                    setExpForm({ ...expForm, company: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Năm bắt đầu"
                    type="number"
                    value={expForm.startYear}
                    onChange={(e) =>
                      setExpForm({ ...expForm, startYear: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Năm kết thúc"
                    type="number"
                    value={expForm.endYear}
                    onChange={(e) =>
                      setExpForm({ ...expForm, endYear: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả công việc</label>
                  <RichTextEditor
                    value={expForm.description}
                    onChange={(content) =>
                      setExpForm({ ...expForm, description: content })
                    }
                    placeholder="Mô tả công việc..."
                    simple
                    minHeight="120px"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveExp}>Lưu</Button>
                  <Button
                    onClick={() => {
                      setExpForm({
                        id: null,
                        position: "",
                        company: "",
                        startYear: "",
                        endYear: "",
                        description: "",
                      });
                      setShowExpForm(false);
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {experiences.length === 0 ? (
              <p className="text-gray-500 text-sm">Chưa có kinh nghiệm nào.</p>
            ) : (
              experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 border border-gray-200 rounded-lg flex justify-between items-start"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {exp.position}
                    </h4>
                    {exp.company && (
                      <p className="text-sm text-gray-600">{exp.company}</p>
                    )}
                    {(exp.startYear || exp.endYear) && (
                      <p className="text-sm text-gray-500">
                        {exp.startYear || "?"} - {exp.endYear || "Hiện tại"}
                      </p>
                    )}
                    {exp.description && (
                      <div className="text-sm text-gray-600 mt-2">
                        <RichTextContent content={exp.description} />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditExp(exp)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteExp(exp.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* EDUCATIONS */}
      <Card className="bg-white border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Học vấn</h2>
              <p className="text-sm text-gray-500 mt-1">
                Bằng cấp và trình độ học vấn
              </p>
            </div>
            <Button
              onClick={() => {
                setEduForm({
                  id: null,
                  degree: "",
                  school: "",
                  year: "",
                  description: "",
                });
                setShowEduForm(true);
              }}
            >
              + Thêm học vấn
            </Button>
          </div>

          {showEduForm && (
            <div className="mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-4">
                {eduForm.id ? "Sửa học vấn" : "Thêm học vấn mới"}
              </h3>
              <div className="space-y-3">
                <Input
                  placeholder="Bằng cấp *"
                  value={eduForm.degree}
                  onChange={(e) =>
                    setEduForm({ ...eduForm, degree: e.target.value })
                  }
                />
                <Input
                  placeholder="Trường"
                  value={eduForm.school}
                  onChange={(e) =>
                    setEduForm({ ...eduForm, school: e.target.value })
                  }
                />
                <Input
                  placeholder="Năm tốt nghiệp"
                  type="number"
                  value={eduForm.year}
                  onChange={(e) =>
                    setEduForm({ ...eduForm, year: e.target.value })
                  }
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <RichTextEditor
                    value={eduForm.description}
                    onChange={(content) =>
                      setEduForm({ ...eduForm, description: content })
                    }
                    placeholder="Mô tả học vấn..."
                    simple
                    minHeight="120px"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveEdu}>Lưu</Button>
                  <Button
                    onClick={() => {
                      setEduForm({
                        id: null,
                        degree: "",
                        school: "",
                        year: "",
                        description: "",
                      });
                      setShowEduForm(false);
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {educations.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Chưa có thông tin học vấn.
              </p>
            ) : (
              educations.map((edu) => (
                <div
                  key={edu.id}
                  className="p-4 border border-gray-200 rounded-lg flex justify-between items-start"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                    {edu.school && (
                      <p className="text-sm text-gray-600">{edu.school}</p>
                    )}
                    {edu.year && (
                      <p className="text-sm text-gray-500">Năm: {edu.year}</p>
                    )}
                    {edu.description && (
                      <div className="text-sm text-gray-600 mt-2">
                        <RichTextContent content={edu.description} />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditEdu(edu)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteEdu(edu.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
