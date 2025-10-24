import Card from "../../components/common/Card";
import StatsCard from "../../components/common/StatsCard";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-6xl font-bold text-white mb-6">
          Chào mừng đến với <span className="text-yellow-400">360Edu</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Nền tảng học tập toàn diện cho giáo dục hiện đại. Khám phá các khóa học chất lượng cao và nâng cao kỹ năng của bạn.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-8 rounded-lg transition-colors text-lg">
            Bắt đầu ngay
          </button>
          <button className="border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold py-4 px-8 rounded-lg transition-colors text-lg">
            Tìm hiểu thêm
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Tổng số học viên"
          value="1,250"
          icon="👥"
        />
        <StatsCard
          title="Khóa học"
          value="45"
          icon="📚"
        />
        <StatsCard
          title="Giảng viên"
          value="25"
          icon="👨‍🏫"
        />
        <StatsCard
          title="Đánh giá"
          value="4.8/5"
          icon="⭐"
        />
      </div>

      {/* Features Section */}
      <Card title="Tính năng nổi bật">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold text-white mb-2">Học tập linh hoạt</h3>
            <p className="text-gray-400">Học mọi lúc, mọi nơi với các khóa học trực tuyến chất lượng cao</p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">👨‍🏫</div>
            <h3 className="text-xl font-semibold text-white mb-2">Giảng viên chuyên nghiệp</h3>
            <p className="text-gray-400">Đội ngũ giảng viên giàu kinh nghiệm và tận tâm</p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">Theo dõi tiến độ</h3>
            <p className="text-gray-400">Hệ thống theo dõi và đánh giá tiến độ học tập hiệu quả</p>
          </div>
        </div>
      </Card>

      {/* Popular Courses */}
      <Card title="Khóa học phổ biến">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-700 p-6 rounded-lg hover:bg-gray-600 transition-colors">
            <h3 className="text-lg font-semibold text-white mb-2">Lập trình Web Frontend</h3>
            <p className="text-gray-400 text-sm mb-4">Học HTML, CSS, JavaScript và React từ cơ bản đến nâng cao</p>
            <div className="flex justify-between items-center">
              <span className="text-yellow-400 font-bold">Miễn phí</span>
              <span className="text-gray-400 text-sm">1,200 học viên</span>
            </div>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg hover:bg-gray-600 transition-colors">
            <h3 className="text-lg font-semibold text-white mb-2">Thiết kế UI/UX</h3>
            <p className="text-gray-400 text-sm mb-4">Nguyên tắc thiết kế giao diện và trải nghiệm người dùng</p>
            <div className="flex justify-between items-center">
              <span className="text-yellow-400 font-bold">299,000đ</span>
              <span className="text-gray-400 text-sm">850 học viên</span>
            </div>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg hover:bg-gray-600 transition-colors">
            <h3 className="text-lg font-semibold text-white mb-2">Python cho người mới bắt đầu</h3>
            <p className="text-gray-400 text-sm mb-4">Lập trình Python từ cơ bản đến ứng dụng thực tế</p>
            <div className="flex justify-between items-center">
              <span className="text-yellow-400 font-bold">199,000đ</span>
              <span className="text-gray-400 text-sm">1,100 học viên</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Call to Action */}
      <div className="text-center py-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
        <h2 className="text-3xl font-bold text-black mb-4">Sẵn sàng bắt đầu hành trình học tập?</h2>
        <p className="text-black text-lg mb-6">Tham gia cùng hàng nghìn học viên đã tin tưởng 360Edu</p>
        <button className="bg-black text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-800 transition-colors">
          Đăng ký ngay
        </button>
      </div>
    </div>
  );
}
