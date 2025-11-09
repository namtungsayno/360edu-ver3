import React, { useCallback, useEffect, useMemo, useState } from "react";
import { dayLabelVi } from "../../../helper/formatters";
import { Button } from "../../../components/ui/Button";
import CreateOnlineClassModal from "./CreateOnlineClassModal";
import CreateOfflineClassModal from "./CreateOfflineClassModal";
import { classService } from "../../../services/class/class.service";
import { teacherService } from "../../../services/teacher/teacher.service";
// timeslot service
import { timeslotService } from "../../../services/timeslot/timeslot.service";
import { Input } from "../../../components/ui/Input";

/**
 * Trang quản lý lớp học
 * ✅ TÁCH FORM: Online & Offline riêng biệt theo yêu cầu
 * - Online: nhập thủ công sĩ số + meeting link
 * - Offline: chọn phòng → tự động hiển thị sức chứa, không nhập sĩ số
 */
export default function CreateClassPage() {
  const [openOnline, setOpenOnline] = useState(false);
  const [openOffline, setOpenOffline] = useState(false);

  // filters
  const [teacherUserId, setTeacherUserId] = useState("");
  const [timeSlotId, setTimeSlotId] = useState("");
  const [query, setQuery] = useState("");

  // data sources
  const [teachers, setTeachers] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [ts, tch] = await Promise.all([
          timeslotService.list(),
          teacherService.list(),
        ]);
        setTimeSlots(Array.isArray(ts) ? ts : []);
        setTeachers(Array.isArray(tch) ? tch : []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await classService.list({
        teacherUserId: teacherUserId || undefined,
        timeSlotId: timeSlotId || undefined,
      });
      setClasses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [teacherUserId, timeSlotId]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter((c) =>
      [c.name, c.subjectName, c.teacherFullName, c.roomName]
        .filter(Boolean)
        .some((s) => s.toLowerCase().includes(q))
    );
  }, [classes, query]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Quản lý lớp học</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setOpenOffline(true)}
            className="bg-white hover:bg-gray-50"
          >
            Tạo lớp Offline
          </Button>
          <Button
            onClick={() => setOpenOnline(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Tạo lớp Online
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Tìm kiếm lớp học..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-72"
        />
        <select
          value={teacherUserId}
          onChange={(e) => setTeacherUserId(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="">Lọc theo giáo viên</option>
          {teachers.map((t) => (
            <option key={t.userId} value={t.userId}>
              {t.fullName}
            </option>
          ))}
        </select>
        <select
          value={timeSlotId}
          onChange={(e) => setTimeSlotId(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="">Lọc theo Slot</option>
          {timeSlots.map((s) => (
            <option key={s.id} value={s.id}>
              Ca {s.id} • {s.startTime?.slice(0, 5)}-{s.endTime?.slice(0, 5)}
            </option>
          ))}
        </select>
        <Button variant="outline" onClick={loadClasses}>
          Làm mới
        </Button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          <div className="text-sm text-gray-500">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-gray-500">Không có lớp nào.</div>
        ) : (
          filtered.map((c) => (
            <div key={c.id} className="rounded-2xl border bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {c.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{c.subjectName}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    c.online
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {c.online ? "Online" : "Offline"}
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <div>👨‍🏫 {c.teacherFullName}</div>
                <div>📍 {c.online ? "Online" : c.roomName}</div>
                <div>
                  ⏰{" "}
                  {Array.isArray(c.schedule) && c.schedule.length > 0
                    ? c.schedule
                        .map(
                          (s) =>
                            `${dayLabelVi(s.dayOfWeek)} - ${s.startTime?.slice(
                              0,
                              5
                            )}-${s.endTime?.slice(0, 5)}`
                        )
                        .join(", ")
                    : "Chưa có lịch"}
                </div>
              </div>
              {typeof c.maxStudents === "number" && (
                <div className="mt-3 text-sm text-gray-600">
                  Sĩ số tối đa: {c.maxStudents}
                </div>
              )}
              <div className="mt-4 flex items-center gap-3 text-gray-500">
                <button className="text-xs hover:text-gray-700">👁 Xem</button>
                <button className="text-xs hover:text-gray-700">✏️ Sửa</button>
                <button className="text-xs hover:text-red-600">🗑 Xóa</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Online */}
      <CreateOnlineClassModal
        open={openOnline}
        onClose={() => setOpenOnline(false)}
        onCreated={() => {
          // TODO: trigger reload list
          loadClasses();
        }}
      />
      {/* Modal Offline */}
      <CreateOfflineClassModal
        open={openOffline}
        onClose={() => setOpenOffline(false)}
        onCreated={() => {
          // TODO: trigger reload list
          loadClasses();
        }}
      />
    </div>
  );
}
