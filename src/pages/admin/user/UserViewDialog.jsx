import { Badge } from "../../../components/ui/Badge";

export default function UserViewDialog({ user }) {
  if (!user) return <div className="text-gray-500">Không có dữ liệu</div>;

  const roleColor =
    user.role === "TEACHER"
      ? "bg-green-100 text-green-700"
      : user.role === "STUDENT"
      ? "bg-blue-100 text-blue-700"
      : "bg-purple-100 text-purple-700";

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-semibold">{user.fullName}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
        <Badge className={roleColor}>{user.role}</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Info label="Số điện thoại" value={user.phone || "—"} />
        <Info
          label="Trạng thái"
          value={user.active ? "Hoạt động" : "Vô hiệu hóa"}
        />
        {/* Bổ sung trường khác nếu BE trả về: gender, address, createdAt, ... */}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-base font-semibold text-gray-900">{label}</div>
      <div className="text-sm text-gray-700">{value}</div>
    </div>
  );
}
