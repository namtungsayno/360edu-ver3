import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/use-toast";
import { attendanceService } from "../../services/attendance/attendance.service";
import { Card, CardContent } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Input } from "../../components/ui/Input.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table.jsx";
import { ExternalLink, ArrowLeft, Save } from "lucide-react";
import { scheduleService } from "../../services/schedule/schedule.service";

export default function ClassDetail() {
  const navigate = useNavigate();
  const { classId } = useParams();
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
        // Load attendance from backend by class + today
        const today = new Date().toISOString().split("T")[0];
        const attendance = await attendanceService.getByClass(classId, today);
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
      await attendanceService.saveAttendance(classId, date, attendanceData);

      setHasChanges(false);
      success("L\u01b0u \u0111i\u1ec3m danh th\u00e0nh c\u00f4ng!");

      // Reload to reflect persisted statuses
      const refreshed = await attendanceService.getByClass(classId, date);
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Chi tiết lớp {classDetail.className}
            </h1>
            <p className="text-slate-600 mt-1">
              {classDetail.subjectName} - {classDetail.teacherName}
            </p>
          </div>
        </div>
        {classDetail.meetLink && (
          <Button onClick={() => window.open(classDetail.meetLink, "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Vào lớp học
          </Button>
        )}
      </div>

      {/* Class Info */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin lớp học</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Môn học:</span>
                <p className="font-medium">{classDetail.subjectName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Giáo viên:</span>
                <p className="font-medium">{classDetail.teacherName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Địa điểm:</span>
                <p className="font-medium">
                  {classDetail.isOnline ? (
                    <Badge className="bg-purple-100 text-purple-800">
                      Online
                    </Badge>
                  ) : (
                    classDetail.room || "Chưa có phòng"
                  )}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Số học viên:</span>
                <p className="font-medium">{classDetail.studentCount}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Thời gian:</span>
                <p className="font-medium">
                  {classDetail.startTime} - {classDetail.endTime}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Ngày học:</span>
                <p className="font-medium">{classDetail.dayName}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Danh sách học viên</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">
                  Tổng:{" "}
                  <span className="font-bold">{attendanceDetails.length}</span>
                </span>
                <span className="text-green-600">
                  {
                    attendanceDetails.filter((a) => a.status === "present")
                      .length
                  }{" "}
                  có mặt
                </span>
                <span className="text-red-600">
                  {
                    attendanceDetails.filter((a) => a.status === "absent")
                      .length
                  }{" "}
                  vắng
                </span>
                <span className="text-yellow-600">
                  {attendanceDetails.filter((a) => a.status === "late").length}{" "}
                  muộn
                </span>
              </div>
              {editMode ? (
                <div className="flex gap-2">
                  {hasChanges && (
                    <Button onClick={handleSaveAttendance} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Lưu điểm danh
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
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
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                >
                  Sửa điểm danh
                </Button>
              )}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">STT</TableHead>
                <TableHead>Học viên</TableHead>
                <TableHead className="w-96">Trạng thái</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceDetails.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">
                    Chưa có học viên nào trong lớp
                  </TableCell>
                </TableRow>
              ) : (
                attendanceDetails.map((record, index) => (
                  <TableRow key={record.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {record.student}
                    </TableCell>
                    <TableCell>
                      {editMode ? (
                        <div className="flex gap-2">
                          <Button
                            variant={
                              record.status === "present"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              handleAttendanceChange(record.id, "present")
                            }
                            className={
                              record.status === "present"
                                ? "bg-green-600 hover:bg-green-700"
                                : ""
                            }
                          >
                            Có mặt
                          </Button>
                          <Button
                            variant={
                              record.status === "absent" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              handleAttendanceChange(record.id, "absent")
                            }
                            className={
                              record.status === "absent"
                                ? "bg-red-600 hover:bg-red-700"
                                : ""
                            }
                          >
                            Vắng
                          </Button>
                          <Button
                            variant={
                              record.status === "late" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              handleAttendanceChange(record.id, "late")
                            }
                            className={
                              record.status === "late"
                                ? "bg-orange-600 hover:bg-orange-700"
                                : ""
                            }
                          >
                            Muộn
                          </Button>
                        </div>
                      ) : (
                        <div>
                          {record.status === "present" && (
                            <Badge className="bg-green-100 text-green-800">
                              Có mặt
                            </Badge>
                          )}
                          {record.status === "absent" && (
                            <Badge className="bg-red-100 text-red-800">
                              Vắng
                            </Badge>
                          )}
                          {record.status === "late" && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Muộn
                            </Badge>
                          )}
                          {!record.status || record.status === "-" ? (
                            <Badge className="bg-slate-100 text-slate-800">
                              Chưa điểm danh
                            </Badge>
                          ) : null}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editMode ? (
                        <Input
                          value={record.note || ""}
                          onChange={(e) =>
                            handleNoteChange(record.id, e.target.value)
                          }
                          placeholder="Nhập ghi chú..."
                          className="text-sm"
                        />
                      ) : (
                        <span className="text-sm text-slate-600">
                          {record.note || ""}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
