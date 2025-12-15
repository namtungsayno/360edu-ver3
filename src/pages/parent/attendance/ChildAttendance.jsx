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
} from "lucide-react";
import PageTitle from "../../../components/common/PageTitle";
import { Card } from "../../../components/ui/Card";
import { Select } from "../../../components/ui/Select";
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle
        title="Điểm danh"
        subtitle="Theo dõi tình trạng điểm danh của con"
      />

      {/* Child Selector */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-4">
            <User className="w-6 h-6 text-blue-600" />
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Chọn con
              </label>
              <select
                value={selectedChild || ""}
                onChange={(e) => setSelectedChild(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Tổng buổi học</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Có mặt</p>
          <p className="text-2xl font-bold text-green-600">{stats.present}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Vắng mặt</p>
          <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Đi muộn</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Tỷ lệ</p>
          <p className="text-2xl font-bold text-blue-600">{stats.rate}%</p>
        </Card>
      </div>

      {/* Attendance List */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Chi tiết điểm danh</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : attendanceData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Ngày
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Lớp học
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Môn học
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Giáo viên
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Thời gian
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Ghi chú
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceData.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {record.className}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {record.subject}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {record.teacher}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {record.time}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {record.note || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Không có dữ liệu điểm danh trong tháng này
          </p>
        )}
      </Card>
    </div>
  );
};

export default ChildAttendance;
