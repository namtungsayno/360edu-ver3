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
  TrendingUp,
  Clock,
  ChevronRight,
  Sparkles,
  Bell,
} from "lucide-react";
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white">
        <div className="px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Welcome Message */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border-2 border-white/30">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Xin chào, Phụ huynh!</h1>
                <p className="text-indigo-200 mt-1">
                  Theo dõi việc học của con bạn
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {dashboardData.childrenCount ||
                      dashboardData.children.length}
                  </p>
                  <p className="text-xs text-indigo-200">Số con</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/30 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {dashboardData.totalClasses || 0}
                  </p>
                  <p className="text-xs text-indigo-200">Tổng lớp</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {dashboardData.attendanceThisMonth || 0}
                  </p>
                  <p className="text-xs text-indigo-200">Điểm danh</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Children List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-600" />
                Danh sách con
              </h2>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {dashboardData.children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/home/parent/classes`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-200">
                        {child.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{child.name}</p>
                        <p className="text-sm text-gray-500">
                          {child.classCount} lớp học
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                Truy cập nhanh
              </h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate("/home/parent/attendance")}
                  className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 rounded-xl transition-all text-left group border border-emerald-100"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-emerald-200">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-gray-900">Điểm danh</p>
                  <p className="text-sm text-gray-500">Xem tình trạng</p>
                </button>
                <button
                  onClick={() => navigate("/home/parent/schedule")}
                  className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all text-left group border border-blue-100"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-blue-200">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-gray-900">Lịch học</p>
                  <p className="text-sm text-gray-500">Xem thời khóa biểu</p>
                </button>
                <button
                  onClick={() => navigate("/home/parent/payment")}
                  className="p-5 bg-gradient-to-br from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 rounded-xl transition-all text-left group border border-violet-100"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-violet-200">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-gray-900">Thanh toán</p>
                  <p className="text-sm text-gray-500">Lịch sử giao dịch</p>
                </button>
                <button
                  onClick={() => navigate("/home/parent/classes")}
                  className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 rounded-xl transition-all text-left group border border-amber-100"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-amber-200">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-gray-900">Lớp học</p>
                  <p className="text-sm text-gray-500">Thông tin lớp</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Schedules */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-600" />
              Lịch học sắp tới
            </h2>
          </div>
          <div className="p-4">
            {dashboardData.upcomingSchedules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.upcomingSchedules.map((schedule, index) => (
                  <div
                    key={index}
                    className="p-4 bg-blue-50 rounded-xl border border-blue-100"
                  >
                    <p className="font-bold text-gray-900">
                      {schedule.className}
                    </p>
                    <p className="text-sm text-blue-600">{schedule.time}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Không có lịch học sắp tới</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
