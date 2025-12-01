import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Textarea } from "../../../components/ui/Textarea";
import { Switch } from "../../../components/ui/Switch";
import { Label } from "../../../components/ui/Label";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import {
  Layers,
  FileText,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import {
  getAllSubjects,
  updateSubject,
  enableSubject,
  disableSubject,
} from "../../../services/subject/subject.api";
import { courseApi } from "../../../services/course/course.api";
import { useToast } from "../../../hooks/use-toast";

export default function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { error: showError } = useToast();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [tempStatusActive, setTempStatusActive] = useState(false);
  const [tempDescription, setTempDescription] = useState("");
  // modal removed; use route navigation to create page

  useEffect(() => {
    let ignore = false;
    const stateSubject = location.state?.subject;

    const normalize = (dataObj) => {
      if (!dataObj) return null;
      // Determine active/inactive robustly
      let isActive = false;
      if (dataObj.active !== undefined && dataObj.active !== null) {
        if (typeof dataObj.active === "string") {
          const activeStr = dataObj.active.toLowerCase();
          isActive =
            activeStr === "available" ||
            activeStr === "active" ||
            activeStr === "show" ||
            activeStr === "true";
        } else {
          isActive = Boolean(dataObj.active);
        }
      } else if (dataObj.status !== undefined && dataObj.status !== null) {
        if (typeof dataObj.status === "string") {
          const statusStr = dataObj.status.toLowerCase();
          isActive =
            statusStr === "available" ||
            statusStr === "active" ||
            statusStr === "show";
        } else {
          isActive = Boolean(dataObj.status);
        }
      }

      return {
        id: dataObj?.id ?? dataObj?.subjectId ?? id,
        code: dataObj?.code ?? dataObj?.subjectCode ?? dataObj?.maMon ?? "—",
        name: dataObj?.name ?? dataObj?.subjectName ?? dataObj?.tenMon ?? "—",
        description: dataObj?.description ?? dataObj?.moTa ?? "",
        credits: dataObj?.credits ?? dataObj?.soTinChi ?? "—",
        department: dataObj?.department ?? dataObj?.khoa ?? "—",
        prerequisite: dataObj?.prerequisite ?? "",
        status: isActive ? "active" : "inactive",
        numCourses:
          dataObj?.numCourses ?? dataObj?.courseCount ?? dataObj?.soKhoa ?? 0,
        numClasses:
          dataObj?.numClasses ?? dataObj?.classCount ?? dataObj?.soLop ?? 0,
        createdAt: dataObj?.createdAt || new Date().toISOString(),
        updatedAt: dataObj?.updatedAt || new Date().toISOString(),
      };
    };

    (async () => {
      try {
        setLoading(true);
        if (stateSubject) {
          if (ignore) return;
          setSubject(normalize(stateSubject));
        } else {
          const listResp = await getAllSubjects();
          if (ignore) return;
          const list = listResp?.data || listResp || [];
          const found = list.find(
            (s) => String(s.id ?? s.subjectId) === String(id)
          );
          if (!found) {
            setError("Không tìm thấy môn học");
          } else {
            setSubject(normalize(found));
          }
        }
      } catch (e) {
        console.error(e);
        if (!ignore) setError("Không thể tải thông tin môn học");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    (async () => {
      try {
        setLoadingCourses(true);
        // Chỉ hiển thị khóa học do Admin tạo và đã duyệt
        const list = await courseApi.list({
          subjectId: Number(id),
          status: "APPROVED",
        });
        const filtered = (Array.isArray(list) ? list : []).filter((c) => {
          const hasSourceTag = String(c.description || "").includes(
            "[[SOURCE:"
          );
          const isPersonal = c && c.ownerTeacherId != null;
          return !hasSourceTag && !isPersonal;
        });
        if (!ignore) setCourses(filtered);
      } catch (e) {
        console.error("Failed to load courses for subject", e);
        if (!ignore) showError?.("Không thể tải khóa học của môn này");
      } finally {
        if (!ignore) setLoadingCourses(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [id, showError, location.state]);

  const handleEdit = () => {
    // Toggle inline edit mode and initialize temp fields
    if (subject) {
      setTempStatusActive(subject.status === "active");
      setTempDescription(subject.description || "");
    }
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  const handleSaveEdit = async () => {
    try {
      // Validate: cannot deactivate when there are classes
      if (!tempStatusActive && (subject?.numClasses ?? 0) > 0) {
        showError?.("Không thể vô hiệu hóa. Môn này đang có lớp học.");
        return;
      }

      // Persist mandatory fields per backend contract (name, enum status)
      const nextStatusEnum = tempStatusActive ? "AVAILABLE" : "UNAVAILABLE";
      await updateSubject(subject.id, {
        name: subject.name,
        status: nextStatusEnum,
      });
      // Optional: also call enable/disable endpoints to keep parity
      if (tempStatusActive && subject.status !== "active") {
        await enableSubject(subject.id);
      } else if (!tempStatusActive && subject.status !== "inactive") {
        await disableSubject(subject.id);
      }

      const updated = {
        ...subject,
        status: tempStatusActive ? "active" : "inactive",
        // Description remains client-side until backend supports it
        description: tempDescription,
        updatedAt: new Date().toISOString(),
      };
      setSubject(updated);
      setEditMode(false);
    } catch (e) {
      console.error("Failed to save subject edits", e);
      showError?.("Không thể lưu thay đổi. Vui lòng thử lại.");
    }
  };

  const handleToggleStatus = (next) => {
    if (!next && (subject?.numClasses ?? 0) > 0) {
      showError?.("Không thể vô hiệu hóa. Môn này đang có lớp học.");
      return;
    }
    setTempStatusActive(next);
  };

  const handleBack = () => {
    navigate("/home/admin/subject");
  };
  const handleOpenCreateCourse = () =>
    navigate(`/home/admin/subject/${id}/courses/create`);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-lg text-gray-600">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex">
                <svg
                  className="w-6 h-6 text-red-400 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-lg font-medium text-red-800">
                    Có lỗi xảy ra
                  </h3>
                  <p className="text-red-700 mt-1">{error}</p>
                  <div className="mt-4">
                    <Button variant="outline" onClick={handleBack}>
                      Quay lại danh sách
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Quay lại
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Chi tiết môn học
                </h1>
                <p className="text-gray-600">
                  Thông tin chi tiết về môn học trong hệ thống
                </p>
              </div>
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleEdit}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                {editMode ? "Đang chỉnh sửa" : "Chỉnh sửa"}
              </Button>
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Subject Information (merged) */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Thông tin môn học
                    </h2>
                    {!editMode ? (
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-1 text-gray-600"
                      >
                        Cập nhật:{" "}
                        {new Date(subject.updatedAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Badge>
                    ) : null}
                  </div>

                  {!editMode ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="block text-sm font-medium text-gray-500 mb-1">
                          Ngày tạo
                        </div>
                        <p className="text-lg text-gray-900">
                          {new Date(subject.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>

                      <div>
                        <div className="block text-sm font-medium text-gray-500 mb-1">
                          Cập nhật lần cuối
                        </div>
                        <p className="text-lg text-gray-900">
                          {new Date(subject.updatedAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>

                      <div>
                        <div className="block text-sm font-medium text-gray-500 mb-1">
                          Trạng thái
                        </div>
                        <Badge
                          variant={
                            subject.status === "active"
                              ? "success"
                              : "destructive"
                          }
                        >
                          {subject.status === "active"
                            ? "Hoạt động"
                            : "Không hoạt động"}
                        </Badge>
                      </div>

                      <div className="md:col-span-2">
                        <div className="block text-sm font-medium text-gray-500 mb-1">
                          Mô tả môn học
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {subject.description ||
                            "Chưa có mô tả cho môn học này."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="block text-sm font-medium text-gray-500 mb-1">
                            Ngày tạo
                          </div>
                          <p className="text-lg text-gray-900">
                            {new Date(subject.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                        <div>
                          <div className="block text-sm font-medium text-gray-500 mb-1">
                            Cập nhật lần cuối
                          </div>
                          <p className="text-lg text-gray-900">
                            {new Date(subject.updatedAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-gray-200 p-4 bg-gradient-to-br from-gray-50 to-white">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm text-gray-700">
                            Trạng thái
                          </Label>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={
                                tempStatusActive ? "success" : "destructive"
                              }
                            >
                              {tempStatusActive
                                ? "Hoạt động"
                                : "Không hoạt động"}
                            </Badge>
                            <Switch
                              checked={tempStatusActive}
                              onCheckedChange={handleToggleStatus}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-gray-200 p-4 bg-gradient-to-br from-gray-50 to-white">
                        <Label className="text-sm text-gray-700 mb-2 block">
                          Mô tả môn học
                        </Label>
                        <Textarea
                          value={tempDescription}
                          onChange={(e) => setTempDescription(e.target.value)}
                          placeholder="Nhập mô tả chi tiết, rõ ràng và hấp dẫn..."
                          className="min-h-[120px] resize-y focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="mt-2 text-xs text-gray-500">
                          Mẹo: Mô tả rõ ràng sẽ giúp sinh viên hiểu môn học tốt
                          hơn.
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        <Button
                          variant="outline"
                          className="border-gray-300"
                          onClick={handleCancelEdit}
                        >
                          Hủy
                        </Button>
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={handleSaveEdit}
                        >
                          Lưu thay đổi
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Statistics */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Thống kê
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded-lg mr-3">
                          <svg
                            className="w-5 h-5 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Khóa học</p>
                          <p className="font-semibold text-gray-800">
                            {subject.numCourses}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-orange-100 p-2 rounded-lg mr-3">
                          <svg
                            className="w-5 h-5 text-orange-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Lớp học</p>
                          <p className="font-semibold text-gray-800">
                            {subject.numClasses}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meta Information */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Thông tin khác
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <div className="block text-xs font-medium text-gray-500 mb-1">
                        Ngày tạo
                      </div>
                      <p className="text-sm text-gray-800">
                        {new Date(subject.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>

                    <div>
                      <div className="block text-xs font-medium text-gray-500 mb-1">
                        Cập nhật lần cuối
                      </div>
                      <p className="text-sm text-gray-800">
                        {new Date(subject.updatedAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions section removed as requested */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* COURSES OF SUBJECT */}
      <div className="max-w-6xl mx-auto px-8 pb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Khóa học của môn ({courses.length})
          </h2>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleOpenCreateCourse}
          >
            Thêm khóa học
          </Button>
        </div>

        {loadingCourses && (
          <Card className="rounded-xl border border-gray-200">
            <CardContent className="p-6 text-[#62748e]">
              Đang tải danh sách khóa học...
            </CardContent>
          </Card>
        )}

        {!loadingCourses && courses.length === 0 && (
          <Card className="rounded-xl border border-dashed border-gray-300 bg-gray-50">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 rounded-full border border-gray-300 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-7 h-7 text-[#62748e]" />
              </div>
              <p className="text-lg font-semibold text-neutral-950 mb-1">
                Chưa có khóa học nào cho môn này
              </p>
              <p className="text-sm text-[#45556c]">
                Hãy tạo khóa học đầu tiên để bắt đầu.
              </p>
            </CardContent>
          </Card>
        )}

        {!loadingCourses && courses.length > 0 && (
          <div className="space-y-4">
            {courses.map((course) => {
              const status = String(course.status || "").toUpperCase();
              const statusCfg =
                status === "APPROVED"
                  ? {
                      label: "Đã phê duyệt",
                      className:
                        "bg-green-50 text-green-700 border border-green-200",
                      Icon: CheckCircle2,
                    }
                  : status === "PENDING"
                  ? {
                      label: "Chờ phê duyệt",
                      className:
                        "bg-yellow-50 text-yellow-700 border border-yellow-300",
                      Icon: Clock,
                    }
                  : status === "REJECTED"
                  ? {
                      label: "Đã từ chối",
                      className: "bg-red-50 text-red-700 border border-red-200",
                      Icon: XCircle,
                    }
                  : {
                      label: "Không xác định",
                      className:
                        "bg-gray-50 text-gray-600 border border-gray-200",
                      Icon: AlertCircle,
                    };

              const chapterCount =
                course.chapterCount ??
                (course.chapters ? course.chapters.length : 0);
              const lessonCount =
                course.lessonCount ??
                (course.chapters
                  ? course.chapters.reduce(
                      (sum, ch) => sum + (ch.lessons?.length || 0),
                      0
                    )
                  : 0);

              return (
                <Card
                  key={course.id}
                  className="rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-neutral-950">
                          {course.title}
                        </h3>
                        {course.description && (
                          <p className="text-sm text-[#45556c] line-clamp-2">
                            {course.description}
                          </p>
                        )}
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusCfg.className}`}
                        >
                          <statusCfg.Icon className="w-3 h-3" />
                          <span>{statusCfg.label}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Layers className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-[#62748e]">Số chương</p>
                          <p className="text-sm font-semibold text-neutral-950">
                            {chapterCount}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-[#62748e]">Số bài học</p>
                          <p className="text-sm font-semibold text-neutral-950">
                            {lessonCount}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() =>
                          navigate(
                            `/home/admin/subject/${id}/courses/${course.id}`
                          )
                        }
                      >
                        <Eye className="w-4 h-4 mr-2" /> Xem chi tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      {/* End courses section */}
    </>
  );
}
