import { Switch } from "../../../components/ui/Switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/Table";
// no action icons needed

/**
 * Table component for displaying subjects (similar to UserTable)
 * Props:
 * - items: array of subjects (already paginated from parent)
 * - loading: boolean
 * - onView(subject)
 * - onEdit(subject)
 * - onToggleStatus(subject)
 */
export default function SubjectTable({
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
            <TableHead>Ảnh</TableHead>
            <TableHead>Tên môn học</TableHead>
            <TableHead>Số khóa học</TableHead>
            <TableHead>Số lớp học</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-10 text-gray-500"
              >
                Đang tải…
              </TableCell>
            </TableRow>
          )}

          {!loading && items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-10 text-gray-500"
              >
                Không có dữ liệu
              </TableCell>
            </TableRow>
          )}

          {!loading &&
            items.map((subject) => (
              <TableRow
                key={subject.id}
                className={
                  onRowClick
                    ? "hover:bg-indigo-50 cursor-pointer"
                    : "hover:bg-gray-50"
                }
                onClick={() => onRowClick && onRowClick(subject)}
              >
                <TableCell className="text-center text-gray-700">
                  {subject.id}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                      <span className="text-blue-600 text-xs font-bold">
                        {(subject.code || "").substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-semibold text-blue-600">
                      {subject.code}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell className="text-gray-700">
                  {subject.numCourses || 0}
                </TableCell>
                <TableCell className="text-gray-700">
                  {subject.numClasses || 0}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!subject.active}
                      onCheckedChange={() => onToggleStatus(subject)}
                    />
                    <span
                      className={
                        subject.active
                          ? "text-sm font-medium text-green-700"
                          : "text-sm font-medium text-red-600"
                      }
                    >
                      {subject.active ? "Hoạt động" : "Vô hiệu hóa"}
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
