//src/pages/guest/TeacherList.jsx
import { useOutletContext } from "react-router-dom";

export default function TeacherList() {
  const { onNavigate } = useOutletContext();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Đội ngũ giáo viên</h1>
          <p className="text-gray-600">Gặp gỡ đội ngũ giáo viên chuyên nghiệp và giàu kinh nghiệm</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sample teacher cards */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((teacher) => (
            <div key={teacher} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500"></div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1">Thầy/Cô Teacher {teacher}</h3>
                <p className="text-gray-600 text-sm mb-2">Chuyên môn: Toán học</p>
                <p className="text-gray-600 text-sm mb-3">Kinh nghiệm: 5+ năm</p>
                <button 
                  onClick={() => onNavigate({ type: "teacher", teacherId: teacher })}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Xem hồ sơ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}