// pages/parent/classes/ChildClasses.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  User,
  Calendar,
  Clock,
  MapPin,
  GraduationCap,
  FileText,
} from "lucide-react";
import PageTitle from "../../../components/common/PageTitle";
import { Card } from "../../../components/ui/Card";
import { parentApi } from "../../../services/parent/parent.api";

const ChildClasses = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const initializeData = async () => {
      await fetchChildren();
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchClasses();
    } else {
      setLoading(false);
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const response = await parentApi.getChildren();
      setChildren(response || []);
      if (response && response.length > 0) {
        setSelectedChild(response[0].id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
      setChildren([]);
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await parentApi.getChildClasses(selectedChild);
      setClasses(response);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ONGOING: {
        label: "Đang học",
        className: "bg-green-100 text-green-800 border-green-300",
      },
      UPCOMING: {
        label: "Sắp bắt đầu",
        className: "bg-blue-100 text-blue-800 border-blue-300",
      },
      COMPLETED: {
        label: "Đã kết thúc",
        className: "bg-gray-100 text-gray-800 border-gray-300",
      },
      CANCELLED: {
        label: "Đã hủy",
        className: "bg-red-100 text-red-800 border-red-300",
      },
    };

    const config = statusConfig[status] || statusConfig.ONGOING;

    return (
      <span
        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const getDayLabel = (dayOfWeek) => {
    const dayLabels = {
      MONDAY: "Thứ 2",
      TUESDAY: "Thứ 3",
      WEDNESDAY: "Thứ 4",
      THURSDAY: "Thứ 5",
      FRIDAY: "Thứ 6",
      SATURDAY: "Thứ 7",
      SUNDAY: "Chủ nhật",
    };
    return dayLabels[dayOfWeek] || dayOfWeek;
  };

  const getProgress = (completed, total) => {
    if (!total || total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

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
        title="Lớp học của con"
        subtitle="Xem thông tin chi tiết các lớp học"
      />

      {/* Child Selector */}
      <Card className="p-6 mb-6">
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
      </Card>

      {/* Classes List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : classes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {classes.map((classItem) => (
            <Card
              key={classItem.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-1">
                      {classItem.name}
                    </h3>
                    <p className="text-sm text-gray-600">{classItem.subject}</p>
                  </div>
                </div>
                {getStatusBadge(classItem.status)}
              </div>

              {/* Description */}
              {classItem.description && (
                <div
                  className="text-sm text-gray-600 mb-4 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: classItem.description?.replace(/\[\[(SOURCE|OWNER):\d+\]\]/g, "") }}
                />
              )}

              {/* Teacher Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-gray-900">Giáo viên</span>
                </div>
                <p className="text-sm text-gray-700 ml-7">
                  {classItem.teacher.name}
                </p>
                <p className="text-xs text-gray-600 ml-7">
                  {classItem.teacher.email}
                </p>
                <p className="text-xs text-gray-600 ml-7">
                  {classItem.teacher.phone}
                </p>
              </div>

              {/* Schedule */}
              {classItem.schedule && classItem.schedule.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-900">
                      Lịch học
                    </span>
                  </div>
                  <div className="space-y-2 ml-7">
                    {classItem.schedule.map((schedule, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 text-sm text-gray-700"
                      >
                        <span className="font-medium w-20">
                          {getDayLabel(schedule.dayOfWeek)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                        </div>
                        {schedule.room && schedule.room !== "N/A" && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>Phòng {schedule.room}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Duration */}
              <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Bắt đầu:</span>{" "}
                  {new Date(classItem.startDate).toLocaleDateString("vi-VN")}
                </div>
                <div>
                  <span className="font-medium">Kết thúc:</span>{" "}
                  {new Date(classItem.endDate).toLocaleDateString("vi-VN")}
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-700">
                    Tiến độ: {classItem.completedSessions}/
                    {classItem.totalSessions} buổi
                  </span>
                  <span className="font-semibold text-blue-600">
                    {getProgress(
                      classItem.completedSessions,
                      classItem.totalSessions
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${getProgress(
                        classItem.completedSessions,
                        classItem.totalSessions
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    navigate(`/home/parent/classes/${classItem.id}`)
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Xem chi tiết
                </button>
                <button
                  onClick={() =>
                    navigate(`/home/parent/schedule?class=${classItem.id}`)
                  }
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Xem lịch
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có lớp học nào</p>
        </div>
      )}
    </div>
  );
};

export default ChildClasses;
