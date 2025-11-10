import { Badge } from "../../../components/ui/Badge";

export default function SubjectViewDialog({ subject }) {
  if (!subject) return <div className="text-gray-500">Không có dữ liệu</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-semibold">{subject.name}</div>
          <div className="text-sm text-gray-500">Mã: {subject.code}</div>
        </div>
        <Badge
          className={
            subject.active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }
        >
          {subject.active ? "Hoạt động" : "Vô hiệu hóa"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Info label="Mã môn học" value={subject.code || "—"} />
        <Info label="Tên môn học" value={subject.name || "—"} />
        <Info
          label="Số khóa học"
          value={subject.numCourses?.toString() || "0"}
        />
        <Info
          label="Số lớp học"
          value={subject.numClasses?.toString() || "0"}
        />
        <Info
          label="Trạng thái"
          value={subject.active ? "Hoạt động" : "Vô hiệu hóa"}
        />
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
