import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../hooks/use-toast";
import { attendanceService } from "../../services/attendance/attendance.service";
import { Card, CardContent } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Input } from "../../components/ui/Input.jsx";
import {
  ArrowLeft,
  Save,
  Calendar,
  Users,
  Check,
  X,
  Clock,
  MapPin,
  BookOpen,
  User as UserIcon,
} from "lucide-react";
import { scheduleService } from "../../services/schedule/schedule.service";

export default function ClassDetail() {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [searchParams] = useSearchParams();
  const slotId = searchParams.get('slotId');
  const { success, error } = useToast();
  const [classDetail, setClassDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [originalDetails, setOriginalDetails] = useState([]);
  useEffect(() => {
    if (!classId) return;

    (async () => {
      try {
        setLoading(true);
        // Load attendance from backend by class + today + slotId
        const today = new Date().toISOString().split("T")[0];
        const slotIdNum = slotId ? parseInt(slotId, 10) : null;
        console.log('ClassDetail loading:', { classId, today, slotId, slotIdNum });
        
        const attendance = await attendanceService.getByClass(classId, today, slotIdNum);
        setAttendanceDetails(attendance);
        setOriginalDetails(attendance);
        // Auto-enter edit mode if nothing marked yet
        if (attendance.every((a) => !a.status || a.status === "-")) {
          setEditMode(true);
        }

        // Get class info from schedule (we need to fetch schedule to get class details)
        // For now, we'll get it from URL state or fetch all schedule
        const allSchedule = await scheduleService.getScheduleBySemester("all");
        const classInfo = allSchedule.find(
          (item) => String(item.classId) === String(classId)
        );

        if (classInfo) {
          setClassDetail({
            ...classInfo,
            studentCount: attendance.length,
          });
        }
      } catch (e) {
        console.error("Failed to load class details:", e);
        error("Không thể tải thông tin lớp học");
      } finally {
        setLoading(false);
      }
    })();
  }, [classId, error]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceDetails((prev) =>
      prev.map((record) =>
        record.id === studentId ? { ...record, status } : record
      )
    );
    setHasChanges(true);
  };

  const handleNoteChange = (studentId, note) => {
    setAttendanceDetails((prev) =>
      prev.map((record) =>
        record.id === studentId ? { ...record, note } : record
      )
    );
    setHasChanges(true);
  };

  const handleSaveAttendance = async () => {
    try {
      // Filter students that have attendance marked (status not "-")
      const attendanceData = attendanceDetails
        .filter((record) => record.status && record.status !== "-")
        .map((record) => ({
          studentId: record.id,
          status: record.status,
          note: record.note || "",
        }));

      if (attendanceData.length === 0) {
        error(
          "Vui l\u00f2ng \u0111i\u1ec3m danh \u00edt nh\u1ea5t m\u1ed9t h\u1ecdc vi\u00ean"
        );
        return;
      }

      const date = new Date().toISOString().split("T")[0];
      const slotIdNum = slotId ? parseInt(slotId, 10) : null;
      console.log('Saving attendance:', { classId, date, slotId, slotIdNum });
      
      await attendanceService.saveAttendance(classId, date, attendanceData, slotIdNum);

      setHasChanges(false);
      success("Lưu điểm danh thành công!");

      // Reload to reflect persisted statuses
      const refreshed = await attendanceService.getByClass(classId, date, slotIdNum);
      setAttendanceDetails(refreshed);
      setOriginalDetails(refreshed);
      setEditMode(false);
    } catch (err) {
      console.error("Error saving attendance:", err);
      const backendMsg =
        (typeof err.response?.data === "string" && err.response.data) ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message;
      error(
        backendMsg ||
          "C\u00f3 l\u1ed7i x\u1ea3y ra khi l\u01b0u \u0111i\u1ec3m danh"
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Không tìm thấy thông tin lớp học</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-[#45556c] hover:text-neutral-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
        </div>

        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-950">
            Chi tiết buổi học
          </h1>
          <p className="text-sm text-[#45556c] mt-1">
            {classDetail.subjectName}
          </p>
        </div>

        {/* Class Info Card */}
        <Card className="border border-gray-200 rounded-[14px] bg-white">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-neutral-950 mb-4">
              Thông tin buổi học
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tên lớp */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[12px] text-[#62748e] font-medium">
                    Tên lớp
                  </p>
                  <p className="text-[14px] text-neutral-950 font-semibold mt-1">
                    {classDetail.classFullName || classDetail.className}
                  </p>
                </div>
              </div>

              {/* Giáo viên */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[12px] text-[#62748e] font-medium">
                    Giáo viên
                  </p>
                  <p className="text-[14px] text-neutral-950 font-semibold mt-1">
                    {classDetail.teacherName}
                  </p>
                </div>
              </div>

              {/* Môn học */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[12px] text-[#62748e] font-medium">
                    Môn học
                  </p>
                  <p className="text-[14px] text-neutral-950 font-semibold mt-1">
                    {classDetail.subjectName}
                  </p>
                </div>
              </div>

              {/* Loại lớp */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    classDetail.isOnline ? "bg-purple-100" : "bg-green-100"
                  }`}
                >
                  <MapPin
                    className={`w-5 h-5 ${
                      classDetail.isOnline
                        ? "text-purple-600"
                        : "text-green-600"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-[12px] text-[#62748e] font-medium">
                    Loại lớp
                  </p>
                  <Badge
                    className={`mt-1 border-0 font-semibold ${
                      classDetail.isOnline
                        ? "bg-purple-100 text-purple-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {classDetail.isOnline ? "Online" : "Offline"}
                  </Badge>
                </div>
              </div>

              {/* Phòng học */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-[12px] text-[#62748e] font-medium">
                    Phòng học
                  </p>
                  <p className="text-[14px] text-neutral-950 font-semibold mt-1">
                    {classDetail.isOnline
                      ? "Phòng Online"
                      : classDetail.room ||
                        classDetail.roomName ||
                        "Chưa xếp phòng"}
                  </p>
                </div>
              </div>

              {/* Sĩ số */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-[12px] text-[#62748e] font-medium">
                    Sĩ số
                  </p>
                  <p className="text-[14px] text-neutral-950 font-semibold mt-1">
                    {classDetail.studentCount || 0}/
                    {classDetail.maxStudents || 0}
                  </p>
                </div>
              </div>

              {/* Thời gian */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[12px] text-[#62748e] font-medium">
                    Thời gian
                  </p>
                  <p className="text-[14px] text-neutral-950 font-semibold mt-1">
                    {classDetail.startTime} - {classDetail.endTime}
                  </p>
                </div>
              </div>

              {/* Lịch học */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-[12px] text-[#62748e] font-medium">
                    Lịch học
                  </p>
                  <p className="text-[14px] text-neutral-950 font-semibold mt-1">
                    {classDetail.dayName}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Tổng số */}
          <div className="bg-white border border-gray-200 rounded-[14px] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] text-[#62748e] font-medium">
                  Tổng số
                </p>
                <p className="text-2xl font-bold text-neutral-950 mt-1">
                  {attendanceDetails.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Có mặt */}
          <div className="bg-white border border-gray-200 rounded-[14px] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] text-[#62748e] font-medium">Có mặt</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {
                    attendanceDetails.filter((a) => a.status === "present")
                      .length
                  }
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          {/* Vắng mặt */}
          <div className="bg-white border border-gray-200 rounded-[14px] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] text-[#62748e] font-medium">
                  Vắng mặt
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {
                    attendanceDetails.filter((a) => a.status === "absent")
                      .length
                  }
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>

          {/* Muộn */}
          <div className="bg-white border border-gray-200 rounded-[14px] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] text-[#62748e] font-medium">Muộn</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {attendanceDetails.filter((a) => a.status === "late").length}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Student Attendance List */}
        <Card className="border border-gray-200 rounded-[14px] bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-neutral-950">
                  Danh sách điểm danh ({attendanceDetails.length} học viên)
                </h2>
                <p className="text-[12px] text-[#62748e] mt-1">
                  <span className="text-green-600 font-semibold">
                    {
                      attendanceDetails.filter((a) => a.status === "present")
                        .length
                    }{" "}
                    có mặt
                  </span>
                  ,{" "}
                  <span className="text-red-600 font-semibold">
                    {
                      attendanceDetails.filter((a) => a.status === "absent")
                        .length
                    }{" "}
                    vắng
                  </span>
                  ,{" "}
                  <span className="text-orange-600 font-semibold">
                    {
                      attendanceDetails.filter((a) => a.status === "late")
                        .length
                    }{" "}
                    muộn
                  </span>
                </p>
              </div>
              {editMode ? (
                <div className="flex gap-3">
                  {hasChanges && (
                    <Button
                      onClick={handleSaveAttendance}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Lưu điểm danh
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAttendanceDetails(originalDetails);
                      setHasChanges(false);
                      setEditMode(false);
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Sửa điểm danh
                </Button>
              )}
            </div>

            {/* Student List */}
            <div className="space-y-3">
              {attendanceDetails.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">Chưa có học viên nào trong lớp</p>
                </div>
              ) : (
                attendanceDetails.map((record, index) => (
                  <div
                    key={record.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* STT & Avatar */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500 w-6">
                          {index + 1}
                        </span>
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-6 h-6 text-gray-500" />
                        </div>
                      </div>

                      {/* Student Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-neutral-950">
                          {record.student}
                        </p>
                        <p className="text-[12px] text-[#62748e]">
                          {record.studentCode || `HS00${index + 1}`}
                        </p>
                      </div>

                      {/* Attendance Status Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            editMode &&
                            handleAttendanceChange(record.id, "present")
                          }
                          disabled={!editMode}
                          className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-colors ${
                            record.status === "present"
                              ? "bg-green-100 text-green-700 border-2 border-green-600"
                              : editMode
                              ? "bg-gray-100 hover:bg-green-50 text-gray-600 border border-gray-200"
                              : "bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed"
                          }`}
                        >
                          <Check className="w-4 h-4 inline mr-1" />
                          Có mặt
                        </button>

                        <button
                          onClick={() =>
                            editMode &&
                            handleAttendanceChange(record.id, "absent")
                          }
                          disabled={!editMode}
                          className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-colors ${
                            record.status === "absent"
                              ? "bg-red-100 text-red-700 border-2 border-red-600"
                              : editMode
                              ? "bg-gray-100 hover:bg-red-50 text-gray-600 border border-gray-200"
                              : "bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed"
                          }`}
                        >
                          <X className="w-4 h-4 inline mr-1" />
                          Vắng
                        </button>

                        <button
                          onClick={() =>
                            editMode &&
                            handleAttendanceChange(record.id, "late")
                          }
                          disabled={!editMode}
                          className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-colors ${
                            record.status === "late"
                              ? "bg-orange-100 text-orange-700 border-2 border-orange-600"
                              : editMode
                              ? "bg-gray-100 hover:bg-orange-50 text-gray-600 border border-gray-200"
                              : "bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed"
                          }`}
                        >
                          <Clock className="w-4 h-4 inline mr-1" />
                          Muộn
                        </button>
                      </div>

                      {/* Note Input */}
                      <div className="w-48">
                        {editMode ? (
                          <input
                            type="text"
                            value={record.note || ""}
                            onChange={(e) =>
                              handleNoteChange(record.id, e.target.value)
                            }
                            placeholder="Ghi chú..."
                            className="w-full px-3 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <span className="text-[12px] text-[#62748e]">
                            {record.note || ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-[12px] text-[#45556c] font-medium mb-2">
            Chú thích:
          </p>
          <div className="flex items-center gap-6 text-[12px]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-[#45556c]">Có mặt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-[#45556c]">Vắng mặt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-[#45556c]">Muộn</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
