// src/pages/admin/user/UserTable.jsx
import { Badge } from "../../../components/ui/Badge";
import { Switch } from "../../../components/ui/Switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/Table";
// action icons removed

const ROLE_LABEL = { STUDENT: "Student", TEACHER: "Teacher", PARENT: "Parent" };

/**
 * Bảng hiển thị dữ liệu người dùng (dumb UI)
 * Props:
 * - items: array of users (đã được chuẩn bị/paginate ở parent)
 * - loading: boolean
 * - onRowClick(user)
 * - onToggleStatus(user)
 */
export default function UserTable({
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
            <TableHead>Họ và tên</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Số điện thoại</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Trạng thái</TableHead>
            {/* Removed action column */}
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-10 text-gray-500"
              >
                Đang tải…
              </TableCell>
            </TableRow>
          )}

          {!loading && items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-10 text-gray-500"
              >
                Không có dữ liệu
              </TableCell>
            </TableRow>
          )}

          {!loading &&
            items.map((u) => (
              <TableRow
                key={u.id}
                className={
                  onRowClick
                    ? "hover:bg-indigo-50 cursor-pointer"
                    : "hover:bg-gray-50"
                }
                onClick={() => onRowClick && onRowClick(u)}
              >
                <TableCell className="font-medium">{u.fullName}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.phone}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      u.role === "TEACHER"
                        ? "bg-green-100 text-green-700"
                        : u.role === "STUDENT"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }
                  >
                    {ROLE_LABEL[u.role] || u.role}
                  </Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!u.active}
                      onCheckedChange={() => onToggleStatus(u)}
                    />
                    <span
                      className={
                        u.active
                          ? "text-sm font-medium text-green-700"
                          : "text-sm font-medium text-red-600"
                      }
                    >
                      {u.active ? "Hoạt động" : "Vô hiệu hóa"}
                    </span>
                  </div>
                </TableCell>
                {/* Row click will handle view/edit in side panel */}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
