import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";

export default function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSubject = async () => {
      try {
        // Simulate API call - replace with actual API call when available
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockSubject = {
          id,
          code: "IT101",
          name: "Nhập môn Công nghệ thông tin",
          description: "Môn học giới thiệu tổng quan về lĩnh vực công nghệ thông tin, bao gồm các khái niệm cơ bản về phần cứng, phần mềm, mạng máy tính và ứng dụng.",
          credits: 3,
          department: "Công nghệ thông tin",
          prerequisite: "",
          status: "active",
          numCourses: 5,
          numClasses: 12,
          createdAt: "2024-01-15",
          updatedAt: "2024-10-20"
        };

        setSubject(mockSubject);
      } catch {
        setError("Không thể tải thông tin môn học");
      } finally {
        setLoading(false);
      }
    };

    loadSubject();
  }, [id]);

  const handleEdit = () => {
    navigate(`/home/admin/subject/${id}/edit`);
  };

  const handleBack = () => {
    navigate("/home/admin/subject");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg text-gray-600">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex">
                <svg className="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-medium text-red-800">Có lỗi xảy ra</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                  <div className="mt-4">
                    <Button variant="outline" onClick={handleBack}>
                      Quay lại danh sách
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Chi tiết môn học</h1>
              <p className="text-gray-600">Thông tin chi tiết về môn học trong hệ thống</p>
            </div>
            <Button 
              variant="default" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleEdit}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Chỉnh sửa
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Thông tin cơ bản</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="block text-sm font-medium text-gray-500 mb-1">Mã môn học</div>
                    <p className="text-lg font-semibold text-blue-600">{subject.code}</p>
                  </div>
                  
                  <div>
                    <div className="block text-sm font-medium text-gray-500 mb-1">Số tín chỉ</div>
                    <p className="text-lg font-semibold text-gray-800">{subject.credits}</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="block text-sm font-medium text-gray-500 mb-1">Tên môn học</div>
                    <p className="text-lg font-semibold text-gray-800">{subject.name}</p>
                  </div>
                  
                  <div>
                    <div className="block text-sm font-medium text-gray-500 mb-1">Khoa/Bộ môn</div>
                    <p className="text-lg text-gray-800">{subject.department}</p>
                  </div>
                  
                  <div>
                    <div className="block text-sm font-medium text-gray-500 mb-1">Trạng thái</div>
                    <Badge variant={subject.status === "active" ? "success" : "destructive"}>
                      {subject.status === "active" ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                  </div>
                  
                  {subject.prerequisite && (
                    <div className="md:col-span-2">
                      <div className="block text-sm font-medium text-gray-500 mb-1">Môn học tiên quyết</div>
                      <p className="text-lg text-gray-800">{subject.prerequisite}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Mô tả môn học</h2>
                <p className="text-gray-700 leading-relaxed">
                  {subject.description || "Chưa có mô tả cho môn học này."}
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Statistics */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Thống kê</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-lg mr-3">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Khóa học</p>
                        <p className="font-semibold text-gray-800">{subject.numCourses}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-orange-100 p-2 rounded-lg mr-3">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Lớp học</p>
                        <p className="font-semibold text-gray-800">{subject.numClasses}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta Information */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin khác</h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="block text-xs font-medium text-gray-500 mb-1">Ngày tạo</div>
                    <p className="text-sm text-gray-800">
                      {new Date(subject.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  
                  <div>
                    <div className="block text-xs font-medium text-gray-500 mb-1">Cập nhật lần cuối</div>
                    <p className="text-sm text-gray-800">
                      {new Date(subject.updatedAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Hành động</h3>
                
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={handleEdit}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Chỉnh sửa môn học
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Tạo khóa học mới
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-purple-600 border-purple-200 hover:bg-purple-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Xem báo cáo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
