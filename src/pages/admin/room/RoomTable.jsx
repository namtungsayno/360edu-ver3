import { Switch } from "../../../components/ui/Switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/Table";
import { Building } from "lucide-react";

/**
 * Table component for displaying classrooms/rooms
 * Props:
 * - items: array of rooms (already paginated from parent)
 * - loading: boolean
 * - onToggleStatus(room)
 * - onRowClick(room)
 */
export default function RoomTable({
  items = [],
  loading,
  onToggleStatus,
  onRowClick,
}) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-16">STT</TableHead>
            <TableHead>Tên phòng</TableHead>
            <TableHead>Sức chứa</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-10 text-gray-500"
              >
                Đang tải…
              </TableCell>
            </TableRow>
          )}

          {!loading && items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-10 text-gray-500"
              >
                Không có dữ liệu
              </TableCell>
            </TableRow>
          )}

          {!loading &&
            items.map((room, index) => (
              <TableRow
                key={room.id}
                className={
                  onRowClick
                    ? "hover:bg-indigo-50 cursor-pointer"
                    : "hover:bg-gray-50"
                }
                onClick={() => onRowClick && onRowClick(room)}
              >
                <TableCell className="text-center text-gray-700">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-teal-100 rounded flex items-center justify-center mr-3">
                      <Building className="w-4 h-4 text-teal-600" />
                    </div>
                    <span className="font-medium text-gray-900">
                      {room.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-700">
                  {room.capacity || 0} người
                </TableCell>
                <TableCell className="text-gray-500 max-w-xs truncate">
                  {room.description || "—"}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!room.enabled}
                      onCheckedChange={() => onToggleStatus(room)}
                    />
                    <span
                      className={
                        room.enabled
                          ? "text-sm font-medium text-green-700"
                          : "text-sm font-medium text-red-600"
                      }
                    >
                      {room.enabled ? "Hoạt động" : "Tạm dừng"}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
