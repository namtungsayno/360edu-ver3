/**
 * COURSE LIST PAGE - Trang danh sách khóa học video
 * 
 * Route: /home/courses
 * Layout: GuestLayout (có Header)
 * 
 * Chức năng hiện tại:
 * - Hiển thị grid layout của các khóa học (3 cột desktop, 2 cột tablet, 1 cột mobile)
 * - Sample data với 6 khóa học mẫu
 * - Mỗi card có: thumbnail gradient, title, description, price, button chi tiết
 * - Click "Xem chi tiết" → navigate đến course detail (chưa implement)
 * 
 * TODO: Replace sample data bằng API calls
 */

import { useOutletContext } from "react-router-dom";

export default function CourseList() {
  // Nhận onNavigate từ GuestLayout
  const { onNavigate } = useOutletContext();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* HEADER SECTION */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Danh sách khóa học</h1>
          <p className="text-gray-600">Khám phá các khóa học chất lượng cao của chúng tôi</p>
        </div>
        
        {/* COURSE GRID - Responsive 3-2-1 columns */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* SAMPLE COURSE CARDS - TODO: Replace với data từ API */}
          {[1, 2, 3, 4, 5, 6].map((course) => (
            <div key={course} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Course thumbnail - Gradient placeholder */}
              <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500"></div>
              
              {/* Course info */}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Khóa học {course}</h3>
                <p className="text-gray-600 mb-4">Mô tả ngắn về khóa học này...</p>
                
                {/* Price và CTA button */}
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-bold">1,000,000 VNĐ</span>
                  <button 
                    onClick={() => onNavigate({ type: "course", courseId: course })}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}