// src/pages/student/StudentProfile.jsx
// Trang profile cho student: xem/sửa thông tin, upload avatar, đổi mật khẩu, xem parent

import { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Label } from "../../components/ui/Label.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import {
  User,
  Mail,
  Phone,
  Camera,
  Lock,
  Edit2,
  X,
  Calendar,
  GraduationCap,
  Building,
  Users,
  MapPin,
  Eye,
  EyeOff,
  Check,
  Loader2,
} from "lucide-react";
import { studentProfileService } from "../../services/student/student-profile.service.js";
import { authApi } from "../../services/auth/auth.api.js";
import { useToast } from "../../hooks/use-toast.js";
import { useAuth } from "../../hooks/useAuth.js";

export default function StudentProfile() {
  const { success, error: showError } = useToast();
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);

  // Profile state
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dob: "",
    grade: "",
    school: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Parent child count info
  const [parentChildInfo, setParentChildInfo] = useState(null);

  // Avatar upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await studentProfileService.getProfile();
        setProfile(data);
        setEditForm({
          fullName: data.fullName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          dob: data.dob || "",
          grade: data.grade || "",
          school: data.school || "",
        });

        // Fetch parent child count if parent has phone
        if (data.parent?.phoneNumber) {
          try {
            const parentCheck = await authApi.checkParentPhone(
              data.parent.phoneNumber
            );
            if (parentCheck.exists && parentCheck.parentInfo) {
              setParentChildInfo(parentCheck.parentInfo);
            }
          } catch (e) {}
        }
      } catch (e) {
        showError("Không thể tải thông tin profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [showError]);

  async function handleSaveProfile() {
    // Validate form
    const errors = {};

    // Validate fullName: required, min 2 chars, max 100 chars
    if (!editForm.fullName || !editForm.fullName.trim()) {
      errors.fullName = "Vui lòng nhập họ và tên";
    } else if (editForm.fullName.trim().length < 2) {
      errors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
    } else if (editForm.fullName.trim().length > 100) {
      errors.fullName = "Họ và tên không được quá 100 ký tự";
    }

    // Validate email: required, valid format
    if (!editForm.email || !editForm.email.trim()) {
      errors.email = "Vui lòng nhập email";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email.trim())) {
        errors.email = "Email không hợp lệ";
      }
    }

    // Validate phone number: optional, but if provided must be 10 digits starting with 0
    if (editForm.phoneNumber && editForm.phoneNumber.trim()) {
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(editForm.phoneNumber.trim())) {
        errors.phoneNumber = "Số điện thoại phải có 10 số và bắt đầu bằng 0";
      }
    }

    // Validate dob: optional, but if provided must not be in the future and not too old
    if (editForm.dob) {
      const dobDate = new Date(editForm.dob);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dobDate > today) {
        errors.dob = "Ngày sinh không được lớn hơn ngày hôm nay";
      } else {
        // Check if age is reasonable (not older than 100 years)
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 100);
        if (dobDate < minDate) {
          errors.dob = "Ngày sinh không hợp lệ";
        }
      }
    }

    // Validate grade: optional, max 20 chars
    if (editForm.grade && editForm.grade.trim().length > 20) {
      errors.grade = "Lớp/Khối không được quá 20 ký tự";
    }

    // Validate school: optional, max 100 chars
    if (editForm.school && editForm.school.trim().length > 100) {
      errors.school = "Tên trường không được quá 100 ký tự";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Show toast with first error message
      const firstError = Object.values(errors)[0];
      showError(firstError, "Thông tin không hợp lệ");
      return;
    }

    setFormErrors({});

    try {
      setSaving(true);
      const updated = await studentProfileService.updateProfile(editForm);
      setProfile(updated);
      setIsEditing(false);

      // Sync updated info to AuthContext and localStorage to prevent logout on navigation
      if (user) {
        const updatedUser = {
          ...user,
          fullName: updated.fullName || user.fullName,
          email: updated.email || user.email,
          phoneNumber: updated.phoneNumber || user.phoneNumber,
        };
        setUser(updatedUser);
        // Also update localStorage directly
        try {
          localStorage.setItem("auth_user", JSON.stringify(updatedUser));
        } catch {}
      }

      success("Cập nhật profile thành công");
    } catch (e) {
      showError(e.displayMessage || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const result = await studentProfileService.uploadAvatar(file);
      const newAvatarUrl = result.url + "?t=" + Date.now(); // Add timestamp to force reload
      setProfile((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));

      // Update user context to refresh Header avatar immediately
      if (user) {
        setUser((prevUser) => ({ ...prevUser, avatarUrl: newAvatarUrl }));
      }

      success("Cập nhật ảnh đại diện thành công");
    } catch (e) {
      showError(e.displayMessage || "Upload ảnh thất bại");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleChangePassword() {
    // Validate password form
    if (!passwordForm.currentPassword) {
      showError("Vui lòng nhập mật khẩu hiện tại", "Thiếu thông tin");
      return;
    }

    if (!passwordForm.newPassword) {
      showError("Vui lòng nhập mật khẩu mới", "Thiếu thông tin");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showError(
        "Mật khẩu mới phải có ít nhất 6 ký tự",
        "Mật khẩu không hợp lệ"
      );
      return;
    }

    if (passwordForm.newPassword.length > 40) {
      showError(
        "Mật khẩu mới không được quá 40 ký tự",
        "Mật khẩu không hợp lệ"
      );
      return;
    }

    if (!passwordForm.confirmPassword) {
      showError("Vui lòng xác nhận mật khẩu mới", "Thiếu thông tin");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError("Mật khẩu xác nhận không khớp", "Mật khẩu không khớp");
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      showError(
        "Mật khẩu mới phải khác mật khẩu hiện tại",
        "Mật khẩu không hợp lệ"
      );
      return;
    }

    try {
      setChangingPassword(true);
      await studentProfileService.changePassword(passwordForm);
      success("Đổi mật khẩu thành công");
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (e) {
      showError(e.displayMessage || "Đổi mật khẩu thất bại");
    } finally {
      setChangingPassword(false);
    }
  }

  function cancelEdit() {
    setEditForm({
      fullName: profile?.fullName || "",
      email: profile?.email || "",
      phoneNumber: profile?.phoneNumber || "",
      dob: profile?.dob || "",
      grade: profile?.grade || "",
      school: profile?.school || "",
    });
    setIsEditing(false);
  }

  // Get avatar URL with fallback
  const getAvatarUrl = () => {
    if (profile?.avatarUrl) {
      // Handle relative URLs
      if (profile.avatarUrl.startsWith("/")) {
        return `${
          import.meta.env.VITE_API_URL?.replace("/api", "") ||
          "http://localhost:8080"
        }${profile.avatarUrl}`;
      }
      return profile.avatarUrl;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="rounded-[14px] p-6 text-center text-[#62748e]">
          Đang tải thông tin...
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="rounded-[14px] p-6 text-center text-red-600">
          Không thể tải thông tin profile
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-950">
            Thông tin cá nhân
          </h1>
          <p className="text-sm text-[#62748e] mt-1">
            Quản lý thông tin profile và bảo mật tài khoản
          </p>
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <Button onClick={cancelEdit} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Hủy
            </Button>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Lưu
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Edit2 className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
        )}
      </div>

      {/* Avatar & Basic Info Card */}
      <Card className="rounded-[14px] border border-gray-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                  {getAvatarUrl() ? (
                    <img
                      src={getAvatarUrl()}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">
                        {(profile.fullName || "S").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                {/* Upload button overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
                  title="Upload ảnh từ máy"
                >
                  {uploadingAvatar ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="text-xs text-[#62748e] mt-2 text-center">
                <p>
                  <Camera className="w-3 h-3 inline mr-1" />
                  Click để upload ảnh
                </p>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold text-neutral-950">
                  {profile.fullName}
                </h2>
                <Badge
                  variant="outline"
                  className={
                    profile.isActive
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }
                >
                  {profile.isActive ? "Hoạt động" : "Không hoạt động"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-[#62748e]" />
                  <span className="text-[#62748e]">Username:</span>
                  <span className="text-neutral-950">{profile.username}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-[#62748e]" />
                  <span className="text-[#62748e]">Email:</span>
                  <span className="text-neutral-950">{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-[#62748e]" />
                  <span className="text-[#62748e]">SĐT:</span>
                  <span className="text-neutral-950">
                    {profile.phoneNumber || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-[#62748e]" />
                  <span className="text-[#62748e]">Ngày sinh:</span>
                  <span className="text-neutral-950">{profile.dob || "—"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form (shown when editing) */}
      {isEditing && (
        <Card className="rounded-[14px] border border-blue-200 bg-blue-50/30">
          <CardHeader className="border-b border-blue-100">
            <CardTitle className="text-base font-semibold text-neutral-950">
              Chỉnh sửa thông tin
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  value={editForm.fullName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, fullName: e.target.value })
                  }
                  placeholder="Nhập họ và tên"
                  className={formErrors.fullName ? "border-red-500" : ""}
                />
                {formErrors.fullName && (
                  <p className="text-sm text-red-500">{formErrors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  placeholder="Nhập email"
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input
                  id="phoneNumber"
                  value={editForm.phoneNumber}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phoneNumber: e.target.value })
                  }
                  placeholder="Nhập số điện thoại"
                  className={formErrors.phoneNumber ? "border-red-500" : ""}
                />
                {formErrors.phoneNumber && (
                  <p className="text-sm text-red-500">
                    {formErrors.phoneNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Ngày sinh</Label>
                <Input
                  id="dob"
                  type="date"
                  value={editForm.dob}
                  onChange={(e) =>
                    setEditForm({ ...editForm, dob: e.target.value })
                  }
                  max={new Date().toISOString().split("T")[0]}
                  className={formErrors.dob ? "border-red-500" : ""}
                />
                {formErrors.dob && (
                  <p className="text-sm text-red-500">{formErrors.dob}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Lớp / Khối</Label>
                <Input
                  id="grade"
                  value={editForm.grade}
                  onChange={(e) =>
                    setEditForm({ ...editForm, grade: e.target.value })
                  }
                  placeholder="VD: Lớp 10, Khối 11..."
                  className={formErrors.grade ? "border-red-500" : ""}
                />
                {formErrors.grade && (
                  <p className="text-sm text-red-500">{formErrors.grade}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">Trường</Label>
                <Input
                  id="school"
                  value={editForm.school}
                  onChange={(e) =>
                    setEditForm({ ...editForm, school: e.target.value })
                  }
                  placeholder="Tên trường đang học"
                  className={formErrors.school ? "border-red-500" : ""}
                />
                {formErrors.school && (
                  <p className="text-sm text-red-500">{formErrors.school}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Details Card */}
      <Card className="rounded-[14px] border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-neutral-950 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            Thông tin học sinh
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-[#62748e]">Lớp / Khối</p>
                <p className="font-semibold text-neutral-950">
                  {profile.grade || "Chưa cập nhật"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Building className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-[#62748e]">Trường</p>
                <p className="font-semibold text-neutral-950">
                  {profile.school || "Chưa cập nhật"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parent Info Card */}
      <Card className="rounded-[14px] border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-neutral-950 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Thông tin phụ huynh
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {profile.parent ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-[#62748e]">Họ và tên</p>
                    <p className="font-semibold text-neutral-950">
                      {profile.parent.fullName || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-[#62748e]">Email</p>
                    <p className="font-semibold text-neutral-950">
                      {profile.parent.email || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-[#62748e]">Số điện thoại</p>
                    <p className="font-semibold text-neutral-950">
                      {profile.parent.phoneNumber || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-[#62748e]">
                      Số con đang học tại trung tâm
                    </p>
                    <p className="font-semibold text-neutral-950">
                      {parentChildInfo?.childCount
                        ? `${parentChildInfo.childCount} học sinh`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {profile.parent.address && (
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-[#62748e]">Địa chỉ</p>
                    <p className="font-semibold text-neutral-950">
                      {profile.parent.address}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-[#62748e]">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Chưa có thông tin phụ huynh</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card className="rounded-[14px] border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-neutral-950 flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-600" />
            Bảo mật
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-950">Mật khẩu</p>
              <p className="text-sm text-[#62748e]">
                Đổi mật khẩu để bảo vệ tài khoản của bạn
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(true)}
            >
              <Lock className="w-4 h-4 mr-2" />
              Đổi mật khẩu
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md rounded-[14px]">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Đổi mật khẩu
                </CardTitle>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Nhập mật khẩu hiện tại"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Nhập lại mật khẩu mới"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                >
                  {changingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
