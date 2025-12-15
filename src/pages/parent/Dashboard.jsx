// pages/parent/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Wallet,
  BookOpen,
  Bell,
  TrendingUp,
  Clock,
} from "lucide-react";
import PageTitle from "../../components/common/PageTitle";
import { Card } from "../../components/ui/Card";
import { parentApi } from "../../services/parent/parent.api";

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    children: [],
    totalClasses: 0,
    attendanceRate: 0,
    upcomingSchedules: [],
    recentPayments: [],
    notifications: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await parentApi.getDashboardData();

      // Transform backend data to match dashboard structure
      const children = await parentApi.getChildren();

      setDashboardData({
        children: children.map((child) => ({
          id: child.id,
          name: child.name,
          classCount: 0, // Will be calculated or fetched separately
        })),
        totalClasses: data.totalClasses || 0,
        attendanceRate: 0, // Calculate from attendanceThisMonth
        upcomingSchedules: [],
        recentPayments: [],
        notifications: [],
        childrenCount: data.childrenCount || 0,
        attendanceThisMonth: data.attendanceThisMonth || 0,
        unreadNotifications: data.unreadNotifications || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Fallback to empty data on error
      setDashboardData({
        children: [],
        totalClasses: 0,
        attendanceRate: 0,
        upcomingSchedules: [],
        recentPayments: [],
        notifications: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Tổng số con",
      value: dashboardData.childrenCount || dashboardData.children.length,
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgLight: "bg-blue-50",
    },
    {
      title: "Tổng số lớp",
      value: dashboardData.totalClasses || 0,
      icon: BookOpen,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgLight: "bg-green-50",
    },
    {
      title: "Điểm danh tháng này",
      value: dashboardData.attendanceThisMonth || 0,
      icon: CheckCircle,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgLight: "bg-purple-50",
    },
    {
      title: "Thông báo mới",
      value: dashboardData.unreadNotifications || 0,
      icon: Bell,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgLight: "bg-orange-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle title="Dashboard Phụ Huynh" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-lg ${stat.bgLight}`}>
                <stat.icon className={`w-8 h-8 ${stat.textColor}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Children List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Danh sách con
          </h2>
          <div className="space-y-4">
            {dashboardData.children.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate(`/home/parent/classes`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {child.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{child.name}</p>
                    <p className="text-sm text-gray-600">
                      {child.classCount} lớp học
                    </p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700">
                  Xem chi tiết →
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Truy cập nhanh</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/home/parent/attendance")}
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
            >
              <CheckCircle className="w-8 h-8 text-purple-600 mb-2" />
              <p className="font-semibold text-gray-900">Điểm danh</p>
              <p className="text-sm text-gray-600">Xem tình trạng</p>
            </button>
            <button
              onClick={() => navigate("/home/parent/schedule")}
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
            >
              <Calendar className="w-8 h-8 text-blue-600 mb-2" />
              <p className="font-semibold text-gray-900">Lịch học</p>
              <p className="text-sm text-gray-600">Xem thời khóa biểu</p>
            </button>
            <button
              onClick={() => navigate("/home/parent/payment")}
              className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
            >
              <Wallet className="w-8 h-8 text-green-600 mb-2" />
              <p className="font-semibold text-gray-900">Thanh toán</p>
              <p className="text-sm text-gray-600">Lịch sử giao dịch</p>
            </button>
            <button
              onClick={() => navigate("/home/parent/classes")}
              className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left"
            >
              <BookOpen className="w-8 h-8 text-orange-600 mb-2" />
              <p className="font-semibold text-gray-900">Lớp học</p>
              <p className="text-sm text-gray-600">Thông tin lớp</p>
            </button>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Schedules */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Lịch học sắp tới
          </h2>
          {dashboardData.upcomingSchedules.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.upcomingSchedules.map((schedule, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">
                    {schedule.className}
                  </p>
                  <p className="text-sm text-gray-600">{schedule.time}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Không có lịch học sắp tới
            </p>
          )}
        </Card>

        {/* Recent Notifications */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Bell className="w-6 h-6 text-orange-600" />
            Thông báo mới nhất
          </h2>
          {dashboardData.notifications.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.notifications.map((notification, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {notification.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Không có thông báo mới
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ParentDashboard;
