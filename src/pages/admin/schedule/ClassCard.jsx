import React from "react";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Eye, Users, Video, MapPin } from "lucide-react";

/**
 * ClassCard - Component hiển thị thông tin một lớp học trong schedule (compact version)
 */
export default function ClassCard({ classData, onViewDetail }) {
  const {
    className,
    subjectName,
    teacherName,
    studentCount = 0,
    maxStudents = 0,
    isOnline,
    room,
    status,
  } = classData;

  // Status badge
  const getStatusBadge = () => {
    if (status === "COMPLETED" || status === "completed") {
      return (
        <Badge className="text-xs bg-green-100 text-green-800 px-1 py-0">
          Hoàn thành
        </Badge>
      );
    }
    if (status === "CANCELLED" || status === "cancelled") {
      return (
        <Badge className="text-xs bg-red-100 text-red-800 px-1 py-0">
          Đã hủy
        </Badge>
      );
    }
    if (status === "AVAILABLE" || status === "available") {
      return (
        <Badge className="text-xs bg-blue-100 text-blue-800 px-1 py-0">
          Đang mở
        </Badge>
      );
    }
    return (
      <Badge className="text-xs bg-gray-100 text-gray-800 px-1 py-0">
        Chưa bắt đầu
      </Badge>
    );
  };

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-2.5 shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200">
      {/* Class name - prominent */}
      <h4 className="font-bold text-blue-700 text-sm leading-tight mb-1.5 truncate">
        {className}
      </h4>

      {/* Subject */}
      <p className="text-xs text-gray-700 mb-1.5 truncate font-medium">
        {subjectName}
      </p>

      {/* Teacher info */}
      <div className="flex items-center gap-1.5 mb-1.5 bg-blue-50 rounded px-1.5 py-1">
        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">
            {teacherName?.charAt(0)?.toUpperCase() || "T"}
          </span>
        </div>
        <span className="text-xs text-gray-700 truncate flex-1 font-medium">
          {teacherName}
        </span>
      </div>

      {/* Student count with progress */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <Users className="h-3.5 w-3.5 text-gray-600 flex-shrink-0" />
        <span className="text-xs text-gray-700 font-medium">
          {studentCount}
          {maxStudents > 0 ? `/${maxStudents}` : ""}
        </span>
        {maxStudents > 0 && (
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{
                width: `${Math.min((studentCount / maxStudents) * 100, 100)}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Online/Offline status */}
      <div className="flex items-center gap-1.5 mb-2">
        {isOnline ? (
          <>
            <Video className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
            <Badge className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5">
              Online
            </Badge>
          </>
        ) : (
          <>
            <MapPin className="h-3.5 w-3.5 text-orange-600 flex-shrink-0" />
            <Badge className="bg-orange-100 text-orange-800 text-xs px-1.5 py-0.5">
              {room || "Chưa có phòng"}
            </Badge>
          </>
        )}
      </div>

      {/* Status and detail button */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        {getStatusBadge()}
        <Button
          size="sm"
          variant="outline"
          onClick={() => onViewDetail(classData)}
          className="h-6 px-2 text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400"
        >
          <Eye className="h-3 w-3 mr-1" />
          Chi tiết
        </Button>
      </div>
    </div>
  );
}
