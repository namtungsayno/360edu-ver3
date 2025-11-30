import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dayLabelVi } from "../../../helper/formatters";
import { Button } from "../../../components/ui/Button";
import { classService } from "../../../services/class/class.service";
import { teacherService } from "../../../services/teacher/teacher.service";
// timeslot service
import { timeslotService } from "../../../services/timeslot/timeslot.service";
import { Input } from "../../../components/ui/Input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/Dialog";
// import { useToast } from "../../../hooks/use-toast";

/**
 * Trang quản lý lớp học
 * List tất cả lớp học
 * Add class offline/online
 * Filter theo giáo viên, theo slot
 * Xem chi tiết lớp học
 */
export default function CreateClassPage() {
  const navigate = useNavigate();

  // filters
  const [teacherUserId, setTeacherUserId] = useState("");
  const [timeSlotId, setTimeSlotId] = useState("");
  const [classType, setClassType] = useState(""); // "", "online", "offline"
  const [query, setQuery] = useState("");

  // data sources
  const [teachers, setTeachers] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  // modal detail removed; no selected/actionMsg needed
  // const { error } = useToast();

  useEffect(() => {
    (async () => {
      try {
        // sử dụng Promise.all để call API song song
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
    let result = classes;

    // Filter by class type (online/offline)
    if (classType === "online") {
      result = result.filter((c) => c.online === true);
    } else if (classType === "offline") {
      result = result.filter((c) => c.online === false);
    }

    // Filter by search query
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((c) =>
        [c.name, c.subjectName, c.teacherFullName, c.roomName]
          .filter(Boolean)
          .some((s) => s.toLowerCase().includes(q))
      );
    }

    return result;
  }, [classes, query, classType]);

  // Derived status by date: Sắp mở / Đang diễn ra
  function getDerivedStatus(cls) {
    const today = new Date();
    const sd = cls?.startDate ? new Date(cls.startDate) : null;
    const ed = cls?.endDate ? new Date(cls.endDate) : null;
    if (sd && sd > today)
      return { label: "Sắp mở", style: "bg-sky-100 text-sky-700" };
    if (sd && ed && sd <= today && today <= ed)
      return { label: "Đang diễn ra", style: "bg-violet-100 text-violet-700" };
    return null;
  }

  // Statistics
  const stats = useMemo(() => {
    const online = classes.filter((c) => c.online === true).length;
    const offline = classes.filter((c) => c.online === false).length;
    return { online, offline, total: classes.length };
  }, [classes]);

  // Publish/Revert actions moved to detail page

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Quản lý lớp học
        </h1>
        <p className="text-gray-500">
          Quản lý thông tin các lớp học trong hệ thống
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Tổng số lớp</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
              📚
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-600 font-medium">Lớp Online</p>
              <p className="text-2xl font-bold text-indigo-900 mt-1">
                {stats.online}
              </p>
            </div>
            <div className="h-12 w-12 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-xl">
              🌐
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Lớp Offline</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {stats.offline}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
              🏫
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div></div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/home/admin/class/create-offline")}
            className="bg-white hover:bg-gray-50"
          >
            Tạo lớp Offline
          </Button>
          <Button
            onClick={() => navigate("/home/admin/class/create-online")}
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
          value={classType}
          onChange={(e) => setClassType(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm bg-white"
        >
          <option value="">Tất cả loại lớp</option>
          <option value="online">🌐 Lớp Online</option>
          <option value="offline">🏫 Lớp Offline</option>
        </select>
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
        {loading && <div className="text-sm text-gray-500">Đang tải...</div>}
        {!loading && filtered.length === 0 && (
          <div className="text-sm text-gray-500">Không có lớp nào.</div>
        )}
        {!loading &&
          filtered.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border bg-white p-5 hover:shadow-md transition cursor-pointer"
              onClick={() => navigate(`/home/admin/class/${c.id}`)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {c.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{c.subjectName}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Status badge */}
                  {c.status && (
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        c.status === "DRAFT"
                          ? "bg-amber-200 text-amber-900"
                          : c.status === "PUBLIC"
                          ? "bg-emerald-200 text-emerald-900"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {c.status === "DRAFT"
                        ? "Draft"
                        : c.status === "PUBLIC"
                        ? "Public"
                        : "Archived"}
                    </span>
                  )}
                  {/* Derived runtime badge */}
                  {(() => {
                    const d = getDerivedStatus(c);
                    return d ? (
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${d.style}`}
                      >
                        {d.label}
                      </span>
                    ) : null;
                  })()}
                  {/* Type badge */}
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
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <div>👨‍🏫 {c.teacherFullName}</div>
                <div className="flex items-center gap-1">
                  {c.online ? (
                    <>
                      📡 Online
                      {c.meetingLink && (
                        <a
                          href={c.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="ml-2 inline-flex items-center text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 hover:underline"
                        >
                          Vào học
                        </a>
                      )}
                    </>
                  ) : (
                    <>📍 {c.roomName}</>
                  )}
                </div>
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
                {(c.startDate || c.endDate) && (
                  <div>
                    📅{" "}
                    {c.startDate && c.endDate
                      ? `${c.startDate} → ${c.endDate}`
                      : c.startDate || c.endDate}
                  </div>
                )}
              </div>
              {typeof c.maxStudents === "number" && (
                <div className="mt-3 text-sm text-gray-600">
                  Sĩ số tối đa: {c.maxStudents}
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Chi tiết lớp chuyển sang trang riêng: /home/admin/class/:id */}
    </div>
  );
}
