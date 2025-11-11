import React from "react";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Eye, Users, Video, MapPin } from "lucide-react";

/**
 * ClassCard - Component hiển thị thông tin một lớp học trong schedule (compact version)
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
      return <Badge className="text-xs bg-green-100 text-green-800 px-1 py-0">Hoàn thành</Badge>;
    }
    if (status === "not_yet") {
      return <Badge className="text-xs bg-red-100 text-red-800 px-1 py-0">Chưa học</Badge>;
    }
    return <Badge className="text-xs bg-blue-100 text-blue-800 px-1 py-0">Đã lên lịch</Badge>;
  };

  return (
    <div className="bg-white border border-gray-300 rounded-md p-2 shadow-sm hover:shadow-md transition-shadow">
      {/* Teacher info */}
      <div className="flex items-center gap-1 mb-1">
        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {teacherName?.charAt(0) || "T"}
          </span>
        </div>
        <span className="text-xs text-gray-600 truncate flex-1">{teacherName}</span>
      </div>

      {/* Class name */}
      <h4 className="font-bold text-blue-700 text-sm leading-tight mb-1 truncate">
        {className}
      </h4>

      {/* Subject */}
      <p className="text-xs text-gray-700 mb-2 truncate">{subjectName}</p>

      {/* Student count */}
      <div className="flex items-center gap-1 mb-2">
        <Users className="h-3 w-3 text-gray-500" />
        <span className="text-xs text-gray-600">{studentCount}</span>
      </div>

      {/* Online/Offline status */}
      <div className="flex items-center gap-1 mb-2">
        {isOnline ? (
          <>
            <Video className="h-3 w-3 text-purple-600" />
            <Badge className="bg-purple-100 text-purple-800 text-xs px-1 py-0">Online</Badge>
          </>
        ) : (
          <>
            <MapPin className="h-3 w-3 text-gray-600" />
            <Badge className="bg-gray-100 text-gray-800 text-xs px-1 py-0">
              {room || "TBA"}
            </Badge>
          </>
        )}
      </div>

      {/* Status and detail button */}
      <div className="flex items-center justify-between">
        {getStatusBadge()}
        <Button
          size="sm"
          variant="outline"
          onClick={() => onViewDetail(classData)}
          className="h-6 px-2 text-xs"
        >
          <Eye className="h-3 w-3 mr-1" />
          Chi tiết
        </Button>
      </div>
    </div>
  );
}
