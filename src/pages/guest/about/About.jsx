//src/pages/guest/About.jsx
import { useOutletContext } from "react-router-dom";

export default function About() {
  const { onNavigate } = useOutletContext();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Giới thiệu về 360edu</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hệ thống quản lý giáo dục toàn diện, mang đến trải nghiệm học tập tối ưu cho mọi người
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Tầm nhìn của chúng tôi</h2>
            <p className="text-gray-600 mb-4">
              360edu được thành lập với mục tiêu tạo ra một nền tảng giáo dục toàn diện, 
              kết hợp giữa công nghệ hiện đại và phương pháp giảng dạy truyền thống.
            </p>
            <p className="text-gray-600 mb-6">
              Chúng tôi hỗ trợ 3 hình thức học tập linh hoạt: Học Online, Học Offline 
              tại trung tâm, và Khóa học Video theo nhu cầu.
            </p>
            <button 
              onClick={() => onNavigate({ type: "courses" })}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Khám phá khóa học
            </button>
          </div>
          <div className="h-96 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg"></div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Tại sao chọn 360edu?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎓</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Giáo viên chuyên nghiệp</h3>
              <p className="text-gray-600">Đội ngũ giáo viên có trình độ cao và kinh nghiệm phong phú</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💻</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Công nghệ hiện đại</h3>
              <p className="text-gray-600">Ứng dụng công nghệ mới nhất trong giảng dạy và quản lý</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Chất lượng cao</h3>
              <p className="text-gray-600">Cam kết mang đến chất lượng giáo dục tốt nhất</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}