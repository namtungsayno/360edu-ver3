// src/pages/admin/user/UserTable.jsx
import { Badge } from "../../../components/ui/Badge";
import { Switch } from "../../../components/ui/Switch";
import { Button } from "../../../components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/Table";
import { Eye, Edit } from "lucide-react";

const ROLE_LABEL = { STUDENT: "Student", TEACHER: "Teacher", PARENT: "Parent" };

/**
 * Bảng hiển thị dữ liệu người dùng (dumb UI)
 * Props:
 * - items: array of users (đã được chuẩn bị/paginate ở parent)
 * - loading: boolean
 * - onView(user)
 * - onEdit(user)
 * - onToggleStatus(user)
 */
export default function UserTable({
  items = [],
  loading,
  onView,
  onEdit,
  onToggleStatus,
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
            <TableHead>Thao tác</TableHead>
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
              <TableRow key={u.id} className="hover:bg-gray-50">
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
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!u.active}
                      onCheckedChange={() => onToggleStatus(u)}
                    />
                    <span className="text-sm text-gray-600">
                      {u.active ? "Hoạt động" : "Vô hiệu hóa"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onView(u)}>
                    <Eye className="w-4 h-4 mr-1" /> Xem
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onEdit(u)}>
                    <Edit className="w-4 h-4 mr-1" /> Sửa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
