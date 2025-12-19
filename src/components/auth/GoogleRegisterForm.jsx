import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import Logo from "../common/Logo";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { authApi } from "../../services/auth/auth.api";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const PHONE_REGEX = /^0\d{9}$/; // 10 số, bắt đầu bằng 0

/**
 * Form đăng ký tài khoản qua Google OAuth
 * Yêu cầu thông tin học sinh và phụ huynh
 * Design giống Register.jsx
 */
export default function GoogleRegisterForm({
  googleUserInfo,
  onSubmit,
  onCancel,
  error,
  loading,
}) {
  const [formData, setFormData] = useState({
    username: "",
    studentFullName: googleUserInfo?.googleName || "",
    studentPhone: "",
    parentFullName: "",
    parentPhone: "",
    parentEmail: "",
  });

  const [errors, setErrors] = useState({});
  const [parentPhoneStatus, setParentPhoneStatus] = useState({
    checking: false,
    exists: false,
    parentInfo: null,
  });

  // Debounce check parent phone
  useEffect(() => {
    const phone = formData.parentPhone.trim();
    if (!phone || !PHONE_REGEX.test(phone)) {
      setParentPhoneStatus({
        checking: false,
        exists: false,
        parentInfo: null,
      });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setParentPhoneStatus({
          checking: true,
          exists: false,
          parentInfo: null,
        });
        const response = await authApi.checkParentPhone(phone);

        if (response.exists) {
          setParentPhoneStatus({
            checking: false,
            exists: true,
            parentInfo: response.parentInfo,
          });
        } else {
          setParentPhoneStatus({
            checking: false,
            exists: false,
            parentInfo: null,
          });
        }
      } catch (err) {
        setParentPhoneStatus({
          checking: false,
          exists: false,
          parentInfo: null,
        });
      }
    }, 800); // Debounce 800ms

    return () => clearTimeout(timer);
  }, [formData.parentPhone]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Vui lòng nhập tên đăng nhập.";
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự.";
    }

    if (!formData.studentFullName.trim()) {
      newErrors.studentFullName = "Vui lòng nhập họ và tên học sinh.";
    } else if (formData.studentFullName.trim().length < 2) {
      newErrors.studentFullName = "Họ và tên phải có ít nhất 2 ký tự.";
    }

    if (!formData.studentPhone.trim()) {
      newErrors.studentPhone = "Vui lòng nhập số điện thoại học sinh.";
    } else if (!PHONE_REGEX.test(formData.studentPhone)) {
      newErrors.studentPhone =
        "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0).";
    }

    if (!formData.parentFullName.trim()) {
      newErrors.parentFullName = "Vui lòng nhập tên phụ huynh.";
    }

    if (!formData.parentPhone.trim()) {
      newErrors.parentPhone = "Vui lòng nhập số điện thoại phụ huynh.";
    } else if (!PHONE_REGEX.test(formData.parentPhone)) {
      newErrors.parentPhone =
        "Số điện thoại phụ huynh không hợp lệ (10 số, bắt đầu bằng 0).";
    }

    if (!formData.parentEmail.trim()) {
      newErrors.parentEmail = "Vui lòng nhập email phụ huynh.";
    } else if (!EMAIL_REGEX.test(formData.parentEmail)) {
      newErrors.parentEmail = "Email phụ huynh không hợp lệ.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 overflow-hidden relative isolate">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-20">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 relative z-30">
          {/* Logo and Title */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg p-2">
                <Logo />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 bg-clip-text text-transparent">
                360edu
              </h1>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Hoàn tất đăng ký với Google
            </h2>
            <p className="text-gray-600 text-sm">
              Tham gia cộng đồng học tập 360edu
            </p>
          </div>

          {/* Google User Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-100">
            <div className="flex items-center gap-3">
              {googleUserInfo?.googlePicture ? (
                <img
                  src={googleUserInfo.googlePicture}
                  alt="Google Avatar"
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-sm">
                  {googleUserInfo?.googleName?.charAt(0) || "G"}
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {googleUserInfo?.googleName}
                </p>
                <p className="text-sm text-gray-600">
                  {googleUserInfo?.googleEmail}
                </p>
              </div>
            </div>
            <div className="mt-3 bg-white rounded-lg p-3 text-sm text-blue-700">
              <span className="font-medium">📝 Lưu ý:</span> Vui lòng hoàn tất
              thông tin bên dưới để đăng ký tài khoản học sinh.
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <Field
              id="username"
              label="Tên đăng nhập"
              value={formData.username}
              error={errors.username}
              onChange={handleChange}
              placeholder="VD: nguyenvana123"
            />

            {/* Student Full Name */}
            <Field
              id="studentFullName"
              label="Họ và tên học sinh"
              value={formData.studentFullName}
              error={errors.studentFullName}
              onChange={handleChange}
              placeholder="VD: Nguyễn Văn A"
            />

            {/* Student Phone */}
            <Field
              id="studentPhone"
              label="Số điện thoại học sinh"
              type="tel"
              value={formData.studentPhone}
              error={errors.studentPhone}
              onChange={handleChange}
              placeholder="VD: 0912345678"
            />

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500 font-medium">
                  👨‍👩‍👧 Thông tin phụ huynh
                </span>
              </div>
            </div>

            {/* Parent Full Name */}
            <Field
              id="parentFullName"
              label="Tên phụ huynh"
              value={formData.parentFullName}
              error={errors.parentFullName}
              onChange={handleChange}
              placeholder="VD: Nguyễn Văn B"
            />

            {/* Parent Email */}
            <Field
              id="parentEmail"
              label="Email phụ huynh"
              type="email"
              value={formData.parentEmail}
              error={errors.parentEmail}
              onChange={handleChange}
              placeholder="VD: parent@example.com"
            />

            {/* Parent Phone with Status */}
            <div className="space-y-2">
              <label
                htmlFor="parentPhone"
                className="block text-sm font-medium text-gray-700"
              >
                Số điện thoại phụ huynh <span className="text-red-500">*</span>
              </label>
              <Input
                id="parentPhone"
                name="parentPhone"
                type="tel"
                value={formData.parentPhone}
                onChange={handleChange}
                placeholder="VD: 0987654321"
                className={errors.parentPhone ? "border-red-500" : ""}
              />
              {errors.parentPhone && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.parentPhone}
                </p>
              )}

              {/* Parent Phone Status */}
              {parentPhoneStatus.checking && (
                <p className="text-sm text-blue-600 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Đang kiểm tra số điện thoại...
                </p>
              )}

              {parentPhoneStatus.exists && parentPhoneStatus.parentInfo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">
                        Phụ huynh đã có trong hệ thống
                      </p>
                      <p className="text-green-700 mt-1">
                        <span className="font-medium">
                          {parentPhoneStatus.parentInfo.fullName}
                        </span>{" "}
                        đã có {parentPhoneStatus.parentInfo.childCount} con đăng
                        ký tại 360edu.
                      </p>
                      <p className="text-green-600 text-xs mt-1">
                        Hệ thống sẽ liên kết tài khoản của bạn với phụ huynh
                        này.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!parentPhoneStatus.checking &&
                !parentPhoneStatus.exists &&
                formData.parentPhone &&
                PHONE_REGEX.test(formData.parentPhone) && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Phụ huynh chưa có trong hệ thống. Hệ thống sẽ tạo tài khoản
                    phụ huynh mới.
                  </p>
                )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang xử lý...
                  </span>
                ) : (
                  "Hoàn tất đăng ký"
                )}
              </Button>
            </div>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Đã có tài khoản?{" "}
            <button
              type="button"
              onClick={onCancel}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Đăng nhập ngay
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

GoogleRegisterForm.propTypes = {
  googleUserInfo: PropTypes.shape({
    googleId: PropTypes.string,
    googleEmail: PropTypes.string,
    googleName: PropTypes.string,
    googlePicture: PropTypes.string,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  error: PropTypes.string,
  loading: PropTypes.bool,
};

// Reusable Field Component
function Field({
  id,
  label,
  type = "text",
  value,
  error,
  onChange,
  placeholder,
  helper,
  showPassword,
  onTogglePassword,
}) {
  const isPasswordField = type === "password";

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={isPasswordField && showPassword ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={error ? "border-red-500" : ""}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      {helper && !error && <p className="text-sm text-gray-500">{helper}</p>}
    </div>
  );
}

Field.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  helper: PropTypes.string,
  showPassword: PropTypes.bool,
  onTogglePassword: PropTypes.func,
};
