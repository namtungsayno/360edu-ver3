import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import Card from "../../../components/common/Card";
import { teacherProfileService } from "../../../services/teacher/teacher.profile.service";
import { teacherUploadApi } from "../../../services/teacher/teacher.upload.api";

const DEGREE_OPTIONS = ["Cử nhân", "Thạc sĩ", "Tiến sĩ", "Khác"];

export default function TeacherManagement() {
  const [form, setForm] = useState({
    fullName: "",
    degree: "",
    subject: "",
    homeroom: "",
    workplace: "",
    bio: "", // Thêm
    specialization: "", // Thêm
    achievements: "", // Thêm
    rating: 0, // Thêm
    yearsOfExperience: 0, // Thêm - tự tính hoặc nhập
    facebookUrl: "", // Thêm
    linkedinUrl: "", // Thêm
    note: "", // Thêm
    avatarUrl: "",
    avatarFile: null, // nếu upload file
  });

  // State for dynamic lists
  const [certificates, setCertificates] = useState([]);
  const [educations, setEducations] = useState([]);
  const [experiences, setExperiences] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false); // đã lưu thành công
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false); // uploading avatar state

  // Load functions for certificates, experiences, educations
  const loadCertificates = async () => {
    try {
      const data = await teacherProfileService.getProfile();
      setCertificates(data?.certificates || []);
    } catch (error) {
      console.error("Error loading certificates:", error);
    }
  };

  const loadExperiences = async () => {
    try {
      const data = await teacherProfileService.getProfile();
      setExperiences(data?.experiences || []);
    } catch (error) {
      console.error("Error loading experiences:", error);
    }
  };

  const loadEducations = async () => {
    try {
      const data = await teacherProfileService.getProfile();
      setEducations(data?.educations || []);
    } catch (error) {
      console.error("Error loading educations:", error);
    }
  };

  // tải dữ liệu đã có từ DB theo teacher đang login
  useEffect(() => {
    const loadTeacherData = async () => {
      try {
        setLoading(true);

        // Load basic profile data
        const profileData = await teacherProfileService.getProfile();
        if (profileData) {
          setForm((prev) => ({
            ...prev,
            fullName: profileData.fullName || "",
            degree: profileData.degree || "",
            subject: profileData.subject || "",
            homeroom: profileData.homeroom || "",
            workplace: profileData.workplace || "",
            bio: profileData.bio || "",
            specialization: profileData.specialization || "",
            achievements: profileData.achievements || "",
            rating: profileData.rating || 0,
            yearsOfExperience: profileData.yearsOfExperience || 0,
            facebookUrl: profileData.facebookUrl || "",
            linkedinUrl: profileData.linkedinUrl || "",
            note: profileData.note || "",
            avatarUrl: profileData.avatarUrl || "",
          }));

          // Load dynamic lists
          setCertificates(profileData.certificates || []);
          setEducations(profileData.educations || []);
          setExperiences(profileData.experiences || []);

          // Preview luôn hiển thị theo dữ liệu đã tải
        }
      } catch (error) {
        console.error("Error loading teacher data:", error);
        setError("Không thể tải thông tin giáo viên. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    loadTeacherData();

    // Load functions không cần thiết cho basic management
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
    return (
      form.fullName.trim() &&
      form.degree.trim() &&
      form.subject.trim() &&
      form.workplace.trim()
    );
  }, [form]);

  // Preview hiển thị realtime theo dữ liệu form

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!valid) {
      setError(
        "Vui lòng nhập đầy đủ: Tên Giáo viên, Trình độ, Bộ môn, Nơi công tác."
      );
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
        bio: form.bio.trim(),
        specialization: form.specialization.trim(),
        achievements: form.achievements.trim(),
        rating: form.rating,
        yearsOfExperience: form.yearsOfExperience,
        facebookUrl: form.facebookUrl.trim(),
        linkedinUrl: form.linkedinUrl.trim(),
        note: form.note.trim(),
        avatarUrl: form.avatarUrl.trim(),
        certificates: certificates,
        educations: educations,
        experiences: experiences,
      };

      // Nếu có file ảnh, upload lên server trước
      if (form.avatarFile) {
        try {
          setUploadingImage(true);
          const uploadedUrl = await teacherUploadApi.uploadAvatar(
            form.avatarFile
          );
          // Server có thể trả về object { url: "..." } hoặc trực tiếp string URL
          payload.avatarUrl =
            typeof uploadedUrl === "string" ? uploadedUrl : uploadedUrl.url;
        } catch (uploadError) {
          console.error("Error uploading avatar:", uploadError);
          setError("Không thể upload ảnh. Vui lòng thử lại hoặc dùng URL ảnh.");
          setLoading(false);
          setUploadingImage(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      await teacherProfileService.saveProfile(payload);
      setSaved(true);
    } catch (err) {
      setError(err?.message || "Không thể lưu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for managing dynamic lists
  const addCertificate = () => {
    setCertificates((prev) => [
      ...prev,
      {
        title: "",
        organization: "",
        year: new Date().getFullYear(),
        description: "",
      },
    ]);
  };

  const removeCertificate = (index) => {
    setCertificates((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCertificate = (index, field, value) => {
    setCertificates((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addEducation = () => {
    setEducations((prev) => [
      ...prev,
      {
        degree: "",
        school: "",
        year: new Date().getFullYear(),
        description: "",
      },
    ]);
  };

  const removeEducation = (index) => {
    setEducations((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEducation = (index, field, value) => {
    setEducations((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addExperience = () => {
    setExperiences((prev) => [
      ...prev,
      {
        position: "",
        company: "",
        startYear: new Date().getFullYear(),
        endYear: null,
        description: "",
      },
    ]);
  };

  const removeExperience = (index) => {
    setExperiences((prev) => prev.filter((_, i) => i !== index));
  };

  const updateExperience = (index, field, value) => {
    setExperiences((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Loading state */}
      {loading && !form.fullName ? (
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin giáo viên...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* FORM NHẬP THÔNG TIN */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                ⚙️ Quản lý hồ sơ giáo viên
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Cập nhật và quản lý thông tin cá nhân của bạn.
              </p>

              <form
                id="teacher-profile-form"
                className="mt-6 space-y-6"
                onSubmit={onSubmit}
              >
                {/* THÔNG TIN CƠ BẢN */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">
                    📋 Thông tin cơ bản
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                        Trình độ *
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
                        Nơi công tác *
                      </label>
                      <Input
                        name="workplace"
                        value={form.workplace}
                        onChange={handleChange}
                        placeholder="VD: THPT ABC, Quận 1, TP.HCM"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Số năm kinh nghiệm
                      </label>
                      <Input
                        type="number"
                        name="yearsOfExperience"
                        value={form.yearsOfExperience}
                        onChange={handleChange}
                        placeholder="VD: 5"
                        min="0"
                        max="50"
                      />
                    </div>
                  </div>
                </div>

                {/* THÔNG TIN MÔ TẢ */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">
                    📝 Thông tin mô tả
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Giới thiệu bản thân
                      </label>
                      <textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        rows={3}
                        style={{ minHeight: "72px", resize: "none" }}
                        onInput={(e) => {
                          e.target.style.height = "auto";
                          e.target.style.height =
                            Math.max(72, e.target.scrollHeight) + "px";
                        }}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                        placeholder="Giới thiệu ngắn gọn về bản thân, phương pháp dạy học..."
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Chuyên môn
                        </label>
                        <Input
                          name="specialization"
                          value={form.specialization}
                          onChange={handleChange}
                          placeholder="VD: Toán cao cấp, Phương pháp giảng dạy..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Thành tích nổi bật
                        </label>
                        <Input
                          name="achievements"
                          value={form.achievements}
                          onChange={handleChange}
                          placeholder="VD: Giáo viên xuất sắc 2023, Giải nhất..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Ghi chú
                      </label>
                      <textarea
                        name="note"
                        value={form.note}
                        onChange={handleChange}
                        rows={2}
                        style={{ minHeight: "56px", resize: "none" }}
                        onInput={(e) => {
                          e.target.style.height = "auto";
                          e.target.style.height =
                            Math.max(56, e.target.scrollHeight) + "px";
                        }}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                        placeholder="Ghi chú thêm nếu có..."
                      />
                    </div>
                  </div>
                </div>

                {/* LIÊN HỆ VÀ AVATAR */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">
                    🔗 Liên hệ và Hình ảnh
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Facebook URL
                      </label>
                      <Input
                        name="facebookUrl"
                        value={form.facebookUrl}
                        onChange={handleChange}
                        placeholder="https://facebook.com/username"
                        type="url"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        LinkedIn URL
                      </label>
                      <Input
                        name="linkedinUrl"
                        value={form.linkedinUrl}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/username"
                        type="url"
                      />
                    </div>

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
                        Ưu tiên dùng URL ảnh. Nếu không có, chọn file để xem
                        thử.
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
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </form>

              {/* CERTIFICATES SECTION */}
              <div className="mt-8 border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    🏆 Chứng chỉ
                  </h3>
                  <Button
                    type="button"
                    onClick={addCertificate}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    ➕ Thêm
                  </Button>
                </div>

                <div className="space-y-3">
                  {certificates.map((cert, index) => (
                    <div
                      key={index}
                      className="border border-gray-300 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCertificate(index)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          🗑️
                        </button>
                      </div>
                      <div className="space-y-2">
                        <Input
                          value={cert.title || ""}
                          onChange={(e) =>
                            updateCertificate(index, "title", e.target.value)
                          }
                          placeholder="Tên chứng chỉ"
                          className="text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={cert.organization || ""}
                            onChange={(e) =>
                              updateCertificate(
                                index,
                                "organization",
                                e.target.value
                              )
                            }
                            placeholder="Tổ chức"
                            className="text-sm"
                          />
                          <Input
                            type="number"
                            value={cert.year || ""}
                            onChange={(e) =>
                              updateCertificate(
                                index,
                                "year",
                                parseInt(e.target.value) || null
                              )
                            }
                            placeholder="Năm"
                            className="text-sm"
                          />
                        </div>
                        <textarea
                          value={cert.description || ""}
                          onChange={(e) =>
                            updateCertificate(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          rows="2"
                          style={{ minHeight: "56px", resize: "none" }}
                          onInput={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height =
                              Math.max(56, e.target.scrollHeight) + "px";
                          }}
                          placeholder="Mô tả"
                        />
                      </div>
                    </div>
                  ))}
                  {certificates.length === 0 && (
                    <p className="text-gray-500 text-center text-sm py-3">
                      Chưa có chứng chỉ
                    </p>
                  )}
                </div>
              </div>

              {/* EDUCATION SECTION */}
              <div className="mt-6 border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    🎓 Học vấn
                  </h3>
                  <Button
                    type="button"
                    onClick={addEducation}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    ➕ Thêm
                  </Button>
                </div>

                <div className="space-y-3">
                  {educations.map((edu, index) => (
                    <div
                      key={index}
                      className="border border-gray-300 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeEducation(index)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          🗑️
                        </button>
                      </div>
                      <div className="space-y-2">
                        <Input
                          value={edu.degree || ""}
                          onChange={(e) =>
                            updateEducation(index, "degree", e.target.value)
                          }
                          placeholder="Bằng cấp"
                          className="text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={edu.school || ""}
                            onChange={(e) =>
                              updateEducation(index, "school", e.target.value)
                            }
                            placeholder="Trường học"
                            className="text-sm"
                          />
                          <Input
                            type="number"
                            value={edu.year || ""}
                            onChange={(e) =>
                              updateEducation(
                                index,
                                "year",
                                parseInt(e.target.value) || null
                              )
                            }
                            placeholder="Năm"
                            className="text-sm"
                          />
                        </div>
                        <textarea
                          value={edu.description || ""}
                          onChange={(e) =>
                            updateEducation(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          rows="2"
                          style={{ minHeight: "56px", resize: "none" }}
                          onInput={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height =
                              Math.max(56, e.target.scrollHeight) + "px";
                          }}
                          placeholder="Mô tả"
                        />
                      </div>
                    </div>
                  ))}
                  {educations.length === 0 && (
                    <p className="text-gray-500 text-center text-sm py-3">
                      Chưa có học vấn
                    </p>
                  )}
                </div>
              </div>

              {/* EXPERIENCE SECTION */}
              <div className="mt-6 border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    💼 Kinh nghiệm
                  </h3>
                  <Button
                    type="button"
                    onClick={addExperience}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    ➕ Thêm
                  </Button>
                </div>

                <div className="space-y-3">
                  {experiences.map((exp, index) => (
                    <div
                      key={index}
                      className="border border-gray-300 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExperience(index)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          🗑️
                        </button>
                      </div>
                      <div className="space-y-2">
                        <Input
                          value={exp.position || ""}
                          onChange={(e) =>
                            updateExperience(index, "position", e.target.value)
                          }
                          placeholder="Vị trí"
                          className="text-sm"
                        />
                        <Input
                          value={exp.company || ""}
                          onChange={(e) =>
                            updateExperience(index, "company", e.target.value)
                          }
                          placeholder="Công ty"
                          className="text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            value={exp.startYear || ""}
                            onChange={(e) =>
                              updateExperience(
                                index,
                                "startYear",
                                parseInt(e.target.value) || null
                              )
                            }
                            placeholder="Từ năm"
                            className="text-sm"
                          />
                          <Input
                            type="number"
                            value={exp.endYear || ""}
                            onChange={(e) =>
                              updateExperience(
                                index,
                                "endYear",
                                parseInt(e.target.value) || null
                              )
                            }
                            placeholder="Đến năm"
                            className="text-sm"
                          />
                        </div>
                        <textarea
                          value={exp.description || ""}
                          onChange={(e) =>
                            updateExperience(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          rows="2"
                          style={{ minHeight: "56px", resize: "none" }}
                          onInput={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height =
                              Math.max(56, e.target.scrollHeight) + "px";
                          }}
                          placeholder="Mô tả"
                        />
                      </div>
                    </div>
                  ))}
                  {experiences.length === 0 && (
                    <p className="text-gray-500 text-center text-sm py-3">
                      Chưa có kinh nghiệm
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PREVIEW SECTION */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Preview (Góc nhìn khách)
              </h2>

              <div className="mt-6">
                {/* HEADER PROFILE */}
                <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                        👤
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-gray-900">
                      {form.fullName.trim() || "Tên giáo viên"}
                    </h3>
                    <p className="text-lg text-gray-600 mt-1">
                      {form.degree ? `${form.degree} • ` : ""}
                      {form.subject.trim() || "Bộ môn"}
                    </p>

                    {form.yearsOfExperience > 0 && (
                      <p className="text-sm text-blue-600 mt-2 font-medium">
                        🏆 {form.yearsOfExperience} năm kinh nghiệm
                      </p>
                    )}

                    {(form.facebookUrl || form.linkedinUrl) && (
                      <div className="flex gap-3 mt-3">
                        {form.facebookUrl && (
                          <a
                            href={form.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebook
                          </a>
                        )}
                        {form.linkedinUrl && (
                          <a
                            href={form.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 hover:text-blue-900 text-sm flex items-center gap-1"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                            LinkedIn
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* THÔNG TIN CHI TIẾT */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                      📍 Nơi công tác
                    </p>
                    <p className="mt-1 text-gray-900">
                      {form.workplace.trim() || "Chưa cập nhật"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                      👨‍🎓 Phụ trách lớp
                    </p>
                    <p className="mt-1 text-gray-900">
                      {form.homeroom.trim() || "Chưa cập nhật"}
                    </p>
                  </div>

                  {form.specialization && (
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                        🎯 Chuyên môn
                      </p>
                      <p className="mt-1 text-gray-900">
                        {form.specialization}
                      </p>
                    </div>
                  )}

                  {form.achievements && (
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                        🏅 Thành tích
                      </p>
                      <p className="mt-1 text-gray-900">{form.achievements}</p>
                    </div>
                  )}
                </div>

                {/* MÔ TẢ BẢN THÂN */}
                {form.bio && (
                  <div className="mt-6 rounded-lg border border-gray-200 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
                      📝 Giới thiệu
                    </p>
                    <p className="text-gray-700 leading-relaxed">{form.bio}</p>
                  </div>
                )}

                {/* GHI CHÚ */}
                {form.note && (
                  <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                    <p className="text-xs uppercase tracking-wider text-yellow-700 font-medium mb-2">
                      📌 Ghi chú
                    </p>
                    <p className="text-yellow-800 text-sm">{form.note}</p>
                  </div>
                )}

                {/* CERTIFICATES PREVIEW */}
                {certificates.length > 0 && (
                  <div className="mt-6">
                    <p className="text-lg font-semibold text-gray-900 mb-4">
                      🏆 Chứng chỉ
                    </p>
                    <div className="space-y-3">
                      {certificates.map((cert, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-gray-200 p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {cert.title || "Chứng chỉ"}
                              </h4>
                              {cert.organization && (
                                <p className="text-sm text-gray-600">
                                  {cert.organization}
                                </p>
                              )}
                              {cert.year && (
                                <p className="text-sm text-blue-600">
                                  Năm {cert.year}
                                </p>
                              )}
                              {cert.description && (
                                <p className="text-sm text-gray-700 mt-1">
                                  {cert.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* EDUCATION PREVIEW */}
                {educations.length > 0 && (
                  <div className="mt-6">
                    <p className="text-lg font-semibold text-gray-900 mb-4">
                      🎓 Học vấn
                    </p>
                    <div className="space-y-3">
                      {educations.map((edu, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-gray-200 p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {edu.degree || "Bằng cấp"}
                              </h4>
                              {edu.school && (
                                <p className="text-sm text-gray-600">
                                  {edu.school}
                                </p>
                              )}
                              {edu.year && (
                                <p className="text-sm text-blue-600">
                                  Tốt nghiệp {edu.year}
                                </p>
                              )}
                              {edu.description && (
                                <p className="text-sm text-gray-700 mt-1">
                                  {edu.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* EXPERIENCE PREVIEW */}
                {experiences.length > 0 && (
                  <div className="mt-6">
                    <p className="text-lg font-semibold text-gray-900 mb-4">
                      💼 Kinh nghiệm làm việc
                    </p>
                    <div className="space-y-3">
                      {experiences.map((exp, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-gray-200 p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {exp.position || "Vị trí"}
                              </h4>
                              {exp.company && (
                                <p className="text-sm text-gray-600">
                                  {exp.company}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-sm text-blue-600 mt-1">
                                {exp.startYear && <span>{exp.startYear}</span>}
                                {exp.startYear &&
                                  (exp.endYear || !exp.endYear) && (
                                    <span>-</span>
                                  )}
                                {exp.endYear ? (
                                  <span>{exp.endYear}</span>
                                ) : exp.startYear ? (
                                  <span>Hiện tại</span>
                                ) : null}
                              </div>
                              {exp.description && (
                                <p className="text-sm text-gray-700 mt-1">
                                  {exp.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bỏ nút chỉnh sửa trong preview */}

                {saved && (
                  <div className="mt-4 rounded-md bg-green-50 border border-green-200 p-4">
                    <p className="text-sm text-green-700 font-medium">
                      ✅ Thông tin đã được lưu thành công!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SAVE BUTTON - MOVED TO BOTTOM */}
          <div className="mt-6 bg-white border border-gray-200 rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-center gap-3">
                <Button
                  type="submit"
                  disabled={loading || uploadingImage || !valid}
                  form="teacher-profile-form"
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  {uploadingImage
                    ? "📤 Đang upload ảnh..."
                    : loading
                    ? "⏳ Đang lưu..."
                    : "💾 Lưu hồ sơ"}
                </Button>
                {saved && (
                  <span className="text-lg text-green-700 font-medium">
                    ✅ Đã lưu thành công!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
