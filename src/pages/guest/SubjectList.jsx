//src/pages/guest/SubjectList.jsx
import { useOutletContext } from "react-router-dom";

export default function SubjectList() {
  const { onNavigate } = useOutletContext();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Danh sách lớp học</h1>
          <p className="text-gray-600">Tham gia các lớp học trực tiếp với giáo viên chuyên nghiệp</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample subject cards */}
          {[1, 2, 3, 4, 5, 6].map((subject) => (
            <div key={subject} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Lớp học {subject}</h3>
                <p className="text-gray-600 mb-2">Giáo viên: Thầy/Cô ABC</p>
                <p className="text-gray-600 mb-4">Thời gian: 19:00 - 21:00</p>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-bold">500,000 VNĐ/tháng</span>
                  <button 
                    onClick={() => onNavigate({ type: "subject", subjectId: subject.toString() })}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
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
