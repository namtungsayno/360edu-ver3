import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";

export default function CreateSubjectManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    credits: "",
    department: "",
    prerequisite: "",
    status: "active"
  });

  const [errors, setErrors] = useState({});

  const departments = [
    { value: "it", label: "Công nghệ thông tin" },
    { value: "business", label: "Kinh doanh" },
    { value: "engineering", label: "Kỹ thuật" },
    { value: "math", label: "Toán học" },
    { value: "science", label: "Khoa học" },
    { value: "language", label: "Ngôn ngữ" }
  ];

  const statusOptions = [
    { value: "active", label: "Hoạt động" },
    { value: "inactive", label: "Không hoạt động" }
  ];

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = "Mã môn học là bắt buộc";
    } else if (!/^[A-Z0-9]{3,10}$/.test(formData.code.trim())) {
      newErrors.code = "Mã môn học phải có 3-10 ký tự chữ hoa và số";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Tên môn học là bắt buộc";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Tên môn học phải có ít nhất 3 ký tự";
    }

    if (!formData.credits) {
      newErrors.credits = "Số tín chỉ là bắt buộc";
    } else if (Number.isNaN(Number(formData.credits)) || formData.credits < 1 || formData.credits > 10) {
      newErrors.credits = "Số tín chỉ phải là số từ 1 đến 10";
    }

    if (!formData.department) {
      newErrors.department = "Khoa/Bộ môn là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Call API to create subject when available
      console.log("Creating subject:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success - navigate back to subject list
      navigate("/home/admin/subject", { 
        state: { 
          message: "Môn học đã được tạo thành công!" 
        }
      });
    } catch (error) {
      console.error("Error creating subject:", error);
      setErrors({ submit: "Có lỗi xảy ra khi tạo môn học. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/home/admin/subject");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại
            </Button>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tạo môn học mới</h1>
            <p className="text-gray-600">Thêm môn học mới vào hệ thống</p>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h3 className="text-sm font-medium text-red-800">Có lỗi xảy ra</h3>
                        <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cơ bản</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="subject-code" className="block text-sm font-medium text-gray-700 mb-2">
                        Mã môn học <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="subject-code"
                        type="text"
                        value={formData.code}
                        onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                        placeholder="VD: IT101, MATH201"
                        error={errors.code}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">3-10 ký tự chữ hoa và số</p>
                    </div>

                    <div>
                      <label htmlFor="subject-credits" className="block text-sm font-medium text-gray-700 mb-2">
                        Số tín chỉ <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="subject-credits"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.credits}
                        onChange={(e) => handleInputChange("credits", e.target.value)}
                        placeholder="Nhập số tín chỉ"
                        error={errors.credits}
                        className="w-full"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="subject-name" className="block text-sm font-medium text-gray-700 mb-2">
                        Tên môn học <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="subject-name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Nhập tên môn học"
                        error={errors.name}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject-department" className="block text-sm font-medium text-gray-700 mb-2">
                        Khoa/Bộ môn <span className="text-red-500">*</span>
                      </label>
                      <Select
                        id="subject-department"
                        value={formData.department}
                        onChange={(value) => handleInputChange("department", value)}
                        options={departments}
                        placeholder="Chọn khoa/bộ môn"
                        error={errors.department}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject-status" className="block text-sm font-medium text-gray-700 mb-2">
                        Trạng thái
                      </label>
                      <Select
                        id="subject-status"
                        value={formData.status}
                        onChange={(value) => handleInputChange("status", value)}
                        options={statusOptions}
                        className="w-full"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="subject-prerequisite" className="block text-sm font-medium text-gray-700 mb-2">
                        Môn học tiên quyết
                      </label>
                      <Input
                        id="subject-prerequisite"
                        type="text"
                        value={formData.prerequisite}
                        onChange={(e) => handleInputChange("prerequisite", e.target.value)}
                        placeholder="VD: IT101, MATH101 (tùy chọn)"
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Nhập mã các môn học tiên quyết, cách nhau bằng dấu phẩy</p>
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="subject-description" className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả môn học
                      </label>
                      <textarea
                        id="subject-description"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Nhập mô tả chi tiết về môn học..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-6"
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    disabled={loading}
                    className="px-6 bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang tạo...
                      </>
                    ) : (
                      "Tạo môn học"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}