import Card from "../../components/common/Card";
import StatsCard from "../../components/common/StatsCard";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Bảng điều khiển</h1>
        <p className="text-gray-400">Tổng quan về hệ thống 360Edu</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Tổng người dùng" value="1,250" icon="👥" />
        <StatsCard title="Khóa học" value="45" icon="📚" />
        <StatsCard title="Doanh thu tháng" value="12.5M" icon="💰" />
        <StatsCard title="Hoạt động" value="98%" icon="📊" />
      </div>

      {/* Recent Activity */}
      <Card title="Hoạt động gần đây">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-white">Người dùng mới đăng ký</span>
            </div>
            <span className="text-gray-400 text-sm">2 phút trước</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-white">Khóa học mới được tạo</span>
            </div>
            <span className="text-gray-400 text-sm">15 phút trước</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-white">Thanh toán thành công</span>
            </div>
            <span className="text-gray-400 text-sm">1 giờ trước</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
