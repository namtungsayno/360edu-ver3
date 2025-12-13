import { useEffect, useState } from "react";
import Card from "../../../components/common/Card";
import StatsCard from "../../../components/common/StatsCard";
import DataTable from "../../../components/common/DataTable";
import { mockApi } from "../../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [statsData, usersData, coursesData] = await Promise.all([
          mockApi.getDashboardStats(),
          mockApi.getUsers(),
          mockApi.getCourses()
        ]);
        setStats(statsData);
        setRecentUsers(usersData.slice(0, 5));
        setRecentCourses(coursesData.slice(0, 4));
      } catch (error) {
        } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const userColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status", render: (value) => (
      <span className={`px-2 py-1 rounded text-xs ${
        value === "active" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
      }`}>
        {value}
      </span>
    )},
  ];

  const courseColumns = [
    { key: "title", label: "Course" },
    { key: "instructor", label: "Instructor" },
    { key: "students", label: "Students" },
    { key: "price", label: "Price", render: (value) => `$${value}` },
    { key: "status", label: "Status", render: (value) => (
      <span className={`px-2 py-1 rounded text-xs ${
        value === "active" ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"
      }`}>
        {value}
      </span>
    )},
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-300">Overview of your learning platform</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon="👥"
            trend={stats.userGrowth}
          />
          <StatsCard
            title="Active Users"
            value={stats.activeUsers.toLocaleString()}
            icon="✅"
          />
          <StatsCard
            title="Total Courses"
            value={stats.totalCourses}
            icon="📚"
          />
          <StatsCard
            title="Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon="💰"
            trend={stats.revenueGrowth}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <Card title="Recent Users">
          <DataTable
            data={recentUsers}
            columns={userColumns}
            loading={loading}
          />
        </Card>

        {/* Recent Courses */}
        <Card title="Recent Courses">
          <DataTable
            data={recentCourses}
            columns={courseColumns}
            loading={loading}
          />
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-6 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors">
            <div className="text-blue-400 text-3xl mb-3">👤</div>
            <div className="text-white font-semibold text-lg">Manage Users</div>
            <div className="text-gray-400">View and edit user accounts</div>
          </button>
          <button className="p-6 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors">
            <div className="text-green-400 text-3xl mb-3">📚</div>
            <div className="text-white font-semibold text-lg">Manage Courses</div>
            <div className="text-gray-400">Create and edit courses</div>
          </button>
          <button className="p-6 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors">
            <div className="text-purple-400 text-3xl mb-3">📊</div>
            <div className="text-white font-semibold text-lg">View Analytics</div>
            <div className="text-gray-400">Detailed platform analytics</div>
          </button>
        </div>
      </Card>
    </div>
  );
}
