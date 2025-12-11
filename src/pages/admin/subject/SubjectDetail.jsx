import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Switch } from "../../../components/ui/Switch";
import { Label } from "../../../components/ui/Label";
import {
  Layers,
  FileText,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  ArrowLeft,
  Edit,
  Plus,
  Users,
  Calendar,
  Save,
  X,
} from "lucide-react";
import {
  getAllSubjects,
  updateSubject,
  enableSubject,
  disableSubject,
} from "../../../services/subject/subject.api";
import { courseApi } from "../../../services/course/course.api";
import { useToast } from "../../../hooks/use-toast";
import { RichTextContent } from "../../../components/ui/RichTextEditor";
import {
  DetailPageWrapper,
  DetailHeader,
  DetailSection,
  DetailField,
  DetailFieldGrid,
  DetailHighlightCard,
  DetailLoading,
  DetailError,
  DetailEmpty,
} from "../../../components/common/DetailPageLayout";

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

  useEffect(() => {
    let ignore = false;
    const stateSubject = location.state?.subject;

    const normalize = (dataObj) => {
      if (!dataObj) return null;
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
      if (!tempStatusActive && (subject?.numClasses ?? 0) > 0) {
        showError?.("Không thể vô hiệu hóa. Môn này đang có lớp học.");
        return;
      }

      const nextStatusEnum = tempStatusActive ? "AVAILABLE" : "UNAVAILABLE";
      const resp = await updateSubject(subject.id, {
        name: subject.name,
        status: nextStatusEnum,
        description: tempDescription,
      });
      if (tempStatusActive && subject.status !== "active") {
        await enableSubject(subject.id);
      } else if (!tempStatusActive && subject.status !== "inactive") {
        await disableSubject(subject.id);
      }

      const serverData = resp?.data || resp;
      const updated = {
        ...subject,
        status: tempStatusActive ? "active" : "inactive",
        description: serverData?.description ?? tempDescription,
        updatedAt: serverData?.updatedAt || new Date().toISOString(),
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

  const handleViewCourse = (courseId) => {
    navigate(`/home/admin/subject/${id}/courses/${courseId}`);
  };

  // Loading state
  if (loading) {
    return <DetailLoading message="Đang tải thông tin môn học..." />;
  }

  // Error state
  if (error) {
    return (
      <DetailError
        title="Không thể tải thông tin môn học"
        message={error}
        onBack={handleBack}
        backLabel="Quay lại danh sách"
      />
    );
  }

  // No data state
  if (!subject) {
    return (
      <DetailEmpty
        title="Không tìm thấy môn học"
        message="Môn học này không tồn tại hoặc đã bị xóa."
        onAction={handleBack}
        actionLabel="Quay lại danh sách"
      />
    );
  }

  // Stats data
  const statsData = [
    {
      icon: BookOpen,
      label: "Khóa học",
      value: courses.length,
      color: "purple",
    },
    {
      icon: Users,
      label: "Lớp học",
      value: subject.numClasses,
      color: "orange",
    },
  ];

  // Course status helper
  const getCourseStatusInfo = (status) => {
    const statusMap = {
      APPROVED: {
        label: "Đang hoạt động",
        variant: "success",
        icon: CheckCircle2,
      },
      ARCHIVED: {
        label: "Đã lưu trữ",
        variant: "secondary",
        icon: AlertCircle,
      },
    };
    return (
      statusMap[status] || {
        label: "Đang hoạt động",
        variant: "success",
        icon: CheckCircle2,
      }
    );
  };

  return (
    <DetailPageWrapper>
      {/* Header */}
      <DetailHeader
        title={subject?.name || "Chi tiết môn học"}
        subtitle={null}
        onBack={handleBack}
        icon={BookOpen}
        iconColor="indigo"
        status={
          !editMode
            ? {
                label:
                  subject.status === "active" ? "Hoạt động" : "Không hoạt động",
                variant:
                  subject.status === "active" ? "success" : "destructive",
              }
            : null
        }
        actions={
          !editMode ? (
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleEdit}
            >
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="border-gray-300"
                onClick={handleCancelEdit}
              >
                <X className="w-4 h-4 mr-2" />
                Hủy
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSaveEdit}
              >
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </Button>
            </div>
          )
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <DetailHighlightCard
            key={index}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            color={stat.color}
          />
        ))}
        <DetailHighlightCard
          icon={Calendar}
          label="Ngày tạo"
          value={new Date(subject.createdAt).toLocaleDateString("sv-SE")}
          color="blue"
        />
        <DetailHighlightCard
          icon={Clock}
          label="Cập nhật"
          value={new Date(subject.updatedAt).toLocaleDateString("sv-SE")}
          color="green"
        />
      </div>

      {/* Edit Mode - Status Toggle */}
      {editMode && (
        <DetailSection title="Cập nhật trạng thái">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Label className="text-sm font-medium text-gray-700">
                Trạng thái môn học
              </Label>
              <Badge variant={tempStatusActive ? "success" : "destructive"}>
                {tempStatusActive ? "Hoạt động" : "Không hoạt động"}
              </Badge>
            </div>
            <Switch
              checked={tempStatusActive}
              onCheckedChange={handleToggleStatus}
            />
          </div>
          {!tempStatusActive && (subject?.numClasses ?? 0) > 0 && (
            <p className="text-sm text-amber-600 mt-2">
              ⚠️ Không thể vô hiệu hóa môn học đang có lớp học.
            </p>
          )}
        </DetailSection>
      )}

      {/* Subject Information */}
      <DetailSection title="Thông tin môn học">
        <DetailFieldGrid columns={2}>
          <DetailField label="Tên môn học" value={subject.name} />
          <DetailField
            label="Trạng thái"
            value={
              <Badge
                variant={
                  subject.status === "active" ? "success" : "destructive"
                }
              >
                {subject.status === "active" ? "Hoạt động" : "Không hoạt động"}
              </Badge>
            }
          />
        </DetailFieldGrid>
      </DetailSection>

      {/* Courses Section */}
      <DetailSection
        title="Danh sách khóa học"
        headerActions={
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleOpenCreateCourse}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo khóa học
          </Button>
        }
      >
        {loadingCourses ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải khóa học...</span>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có khóa học
            </h3>
            <p className="text-gray-500 mb-4">
              Môn học này chưa có khóa học nào. Tạo khóa học mới để bắt đầu.
            </p>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleOpenCreateCourse}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo khóa học đầu tiên
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => {
              const statusInfo = getCourseStatusInfo(course.status);
              const StatusIcon = statusInfo.icon;
              const chapterCount = course.chapters?.length || 0;
              const lessonCount =
                course.chapters?.reduce(
                  (sum, ch) => sum + (ch.lessons?.length || 0),
                  0
                ) || 0;

              return (
                <div
                  key={course.courseId || course.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={statusInfo.variant} className="text-xs">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900 text-lg mb-2">
                        🎯 {course.title || course.courseName || course.name}
                      </h4>
                      <RichTextContent
                        content={course.description || "Không có mô tả"}
                        className="text-sm text-gray-500 mb-3 line-clamp-2"
                      />
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Layers className="w-4 h-4 text-purple-500" />
                          {chapterCount} chương
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4 text-blue-500" />
                          {lessonCount} bài học
                        </span>
                        {course.version && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-500" />v
                            {course.version}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() =>
                        handleViewCourse(course.courseId || course.id)
                      }
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Xem
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DetailSection>
    </DetailPageWrapper>
  );
}
