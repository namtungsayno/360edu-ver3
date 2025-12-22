// pages/parent/attendance/ChildAttendance.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Filter,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { parentApi } from "../../../services/parent/parent.api";

const ChildAttendance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    rate: 0,
  });

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchAttendanceData();
    }
  }, [selectedChild, filterMonth, filterYear]);

  const fetchChildren = async () => {
    try {
      const response = await parentApi.getChildren();
      setChildren(response);
      if (response.length > 0) {
        setSelectedChild(response[0].id);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
      setChildren([]);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await parentApi.getChildAttendance(
        selectedChild,
        filterMonth,
        filterYear
      );
      const attendances = response.attendances || [];

      // Transform backend data to match frontend expectations
      const transformedData = attendances.map((att) => ({
        id: att.id,
        date: att.date,
        className: att.className,
        subject: att.subjectName,
        teacher: att.teacherName || "N/A",
        time:
          att.startTime && att.endTime
            ? `${att.startTime} - ${att.endTime}`
            : "N/A",
        status: att.status,
        note: att.note,
      }));

      setAttendanceData(transformedData);
      setStats(
        response.stats || {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          rate: 0,
        }
      );
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setAttendanceData([]);
      setStats({ total: 0, present: 0, absent: 0, late: 0, rate: 0 });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PRESENT: {
        label: "Có mặt",
        icon: CheckCircle,
        className: "bg-green-100 text-green-800 border-green-300",
        iconClass: "text-green-600",
      },
      ABSENT: {
        label: "Vắng mặt",
        icon: XCircle,
        className: "bg-red-100 text-red-800 border-red-300",
        iconClass: "text-red-600",
      },
      LATE: {
        label: "Đi muộn",
        icon: Clock,
        className: "bg-yellow-100 text-yellow-800 border-yellow-300",
        iconClass: "text-yellow-600",
      },
    };

    const config = statusConfig[status] || statusConfig.PRESENT;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}
      >
        <Icon className={`w-4 h-4 ${config.iconClass}`} />
        {config.label}
      </span>
    );
  };

  const months = [
    { value: 1, label: "Tháng 1" },
    { value: 2, label: "Tháng 2" },
    { value: 3, label: "Tháng 3" },
    { value: 4, label: "Tháng 4" },
    { value: 5, label: "Tháng 5" },
    { value: 6, label: "Tháng 6" },
    { value: 7, label: "Tháng 7" },
    { value: 8, label: "Tháng 8" },
    { value: 9, label: "Tháng 9" },
    { value: 10, label: "Tháng 10" },
    { value: 11, label: "Tháng 11" },
    { value: 12, label: "Tháng 12" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: new Date().getFullYear() - i,
    label: `Năm ${new Date().getFullYear() - i}`,
  }));

  if (loading && !selectedChild) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 text-white">
        <div className="px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Child Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border-2 border-white/30">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedChild || ""}
                    onChange={(e) => setSelectedChild(Number(e.target.value))}
                    className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer appearance-none pr-8"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                      backgroundPosition: "right 0 center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                    }}
                  >
                    {children.map((child) => (
                      <option
                        key={child.id}
                        value={child.id}
                        className="text-gray-900 text-base"
                      >
                        {child.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-emerald-200 mt-1">Theo dõi điểm danh</p>
              </div>
            </div>

            {/* Month/Year Filter in Header */}
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 border border-white/20">
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(Number(e.target.value))}
                  className="bg-transparent text-white border-none focus:outline-none cursor-pointer"
                >
                  {months.map((month) => (
                    <option
                      key={month.value}
                      value={month.value}
                      className="text-gray-900"
                    >
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 border border-white/20">
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(Number(e.target.value))}
                  className="bg-transparent text-white border-none focus:outline-none cursor-pointer"
                >
                  {years.map((year) => (
                    <option
                      key={year.value}
                      value={year.value}
                      className="text-gray-900"
                    >
                      {year.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-emerald-200">Tổng buổi</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.present}</p>
                  <p className="text-xs text-emerald-200">Có mặt</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/30 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.absent}</p>
                  <p className="text-xs text-emerald-200">Vắng mặt</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.late}</p>
                  <p className="text-xs text-emerald-200">Đi muộn</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.rate}%</p>
                  <p className="text-xs text-emerald-200">Tỷ lệ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
              Chi tiết điểm danh
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-600"></div>
            </div>
          ) : attendanceData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Ngày
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Lớp học
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Môn học
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Giáo viên
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Ghi chú
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attendanceData.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(record.date).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {record.className}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.subject}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.teacher}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {record.time}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {record.note || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                Không có dữ liệu điểm danh trong tháng này
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildAttendance;
