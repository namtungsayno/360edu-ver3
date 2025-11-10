import React from "react";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Eye, Users, Video, MapPin } from "lucide-react";

/**
 * ClassCard - Component hiển thị thông tin một lớp học trong schedule
 * Props:
 *  - classData: { id, className, subjectName, teacherName, studentCount, isOnline, room, meetLink, status }
 *  - onViewDetail: callback khi click xem chi tiết
 */
export default function ClassCard({ classData, onViewDetail }) {
  const { 
    className, 
    subjectName, 
    teacherName, 
    studentCount, 
    isOnline, 
    room, 
    meetLink,
    status 
  } = classData;

  // Status badge
  const getStatusBadge = () => {
    if (status === "completed") {
      return <Badge className="text-xs bg-green-100 text-green-800">Hoàn thành</Badge>;
    }
    if (status === "not_yet") {
      return <Badge className="text-xs bg-red-100 text-red-800">Chưa học</Badge>;
    }
    return <Badge className="text-xs bg-blue-100 text-blue-800">Đã lên lịch</Badge>;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow space-y-2">
      {/* Header: Tên lớp + Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-blue-700 truncate">
            {className}
          </h4>
          <p className="text-xs text-gray-600 truncate">{subjectName}</p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Giáo viên */}
      <div className="flex items-center gap-2 text-xs text-gray-700">
        <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
          <span className="text-xs font-medium text-indigo-700">
            {teacherName?.charAt(0)?.toUpperCase()}
          </span>
        </div>
        <span className="truncate">{teacherName}</span>
      </div>

      {/* Số lượng học sinh */}
      <div className="flex items-center gap-1 text-xs text-gray-600">
        <Users className="h-3.5 w-3.5" />
        <span>{studentCount} học viên</span>
      </div>

      {/* Online/Offline + Room/Link */}
      <div className="flex items-center gap-2">
        {isOnline ? (
          <>
            <Badge className="text-xs bg-purple-100 text-purple-800 flex items-center gap-1">
              <Video className="h-3 w-3" />
              Online
            </Badge>
            {meetLink && (
              <a
                href={meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline truncate"
                title={meetLink}
              >
                Meet
              </a>
            )}
          </>
        ) : (
          <Badge className="text-xs bg-gray-100 text-gray-800 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {room || "Chưa có phòng"}
          </Badge>
        )}
      </div>

      {/* Action button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full h-7 text-xs"
        onClick={() => onViewDetail?.(classData)}
      >
        <Eye className="h-3 w-3 mr-1" />
        Chi tiết
      </Button>
    </div>
  );
}
