/**
 * ============================================================================
 * ScheduleGrid Component - Lưới chọn lịch học theo tuần
 * ============================================================================
 *
 * ✅ ĐÃ REDESIGN HOÀN TOÀN:
 * 1. Tạo lại toàn bộ component từ đầu (file cũ chỉ có snippet)
 * 2. Gradient styling với color-coded states
 * 3. Interactive hover effects
 * 4. Dynamic time slots loaded from backend (time_slots table)
 * 5. Hiển thị lịch bận của giáo viên và phòng học
 * 6. Responsive design
 *
 * @param {Date} weekStart - Ngày bắt đầu tuần (Monday)
 * @param {Array} teacherBusy - Danh sách slot giáo viên bận [{start, end}] (ISO format)
 * @param {Array} roomBusy - Danh sách slot phòng bận [{start, end}] (ISO format)
 * @param {Array} selected - Danh sách slot đã chọn
 * @param {Array} timeSlots - Time slots from backend [{id, startTime, endTime}]
 * @param {Function} onToggle - Callback khi toggle slot (day, slotKey)
 * @param {Boolean} disabled - Vô hiệu hóa grid (chưa chọn giáo viên/phòng)
 */
import React, { useMemo } from "react";

export default function ScheduleGrid({
  weekStart,
  teacherBusy = [],
  roomBusy = [],
  selected = [],
  timeSlots = [],
  onToggle,
  disabled = false,
}) {
  // Convert BE timeSlots to display format with Vietnamese labels
  const displaySlots = useMemo(() => {
    if (!timeSlots || timeSlots.length === 0) return [];

    return timeSlots.map((ts, idx) => {
      const labelMap = ["Sáng 1", "Sáng 2", "Chiều 1", "Chiều 2", "Tối"];
      const label = labelMap[idx] || `Slot ${idx + 1}`;

      return {
        key: `slot${ts.id}`,
        label: `${label}\n${ts.startTime}-${ts.endTime}`,
        start: ts.startTime,
        end: ts.endTime,
        id: ts.id,
      };
    });
  }, [timeSlots]);

  // Build weekly busy pattern keys from busy ranges: `${bizDay}-${timeSlotId}`
  // bizDay follows business convention: Mon=2 ... Sun=8
  const busyKeysTeacher = useMemo(() => {
    const keys = new Set();
    if (
      !teacherBusy ||
      teacherBusy.length === 0 ||
      !timeSlots ||
      timeSlots.length === 0
    )
      return keys;
    teacherBusy.forEach((b) => {
      if (!b?.start) return;
      const d = new Date(b.start);
      const jsDay = d.getDay(); // 0..6 (Sun..Sat)
      const bizDay = jsDay === 0 ? 8 : jsDay + 1; // 2..8
      const hhmm = String(b.start).substring(11, 16);
      const ts = timeSlots.find((t) => t.startTime === hhmm);
      if (ts) keys.add(`${bizDay}-${ts.id}`);
    });
    if (import.meta?.env?.MODE !== "production") {
      console.log("[GRID] busyKeysTeacher:", Array.from(keys));
    }
    return keys;
  }, [teacherBusy, timeSlots]);

  const busyKeysRoom = useMemo(() => {
    const keys = new Set();
    if (
      !roomBusy ||
      roomBusy.length === 0 ||
      !timeSlots ||
      timeSlots.length === 0
    )
      return keys;
    roomBusy.forEach((b) => {
      if (!b?.start) return;
      const d = new Date(b.start);
      const jsDay = d.getDay();
      const bizDay = jsDay === 0 ? 8 : jsDay + 1;
      const hhmm = String(b.start).substring(11, 16);
      const ts = timeSlots.find((t) => t.startTime === hhmm);
      if (ts) keys.add(`${bizDay}-${ts.id}`);
    });
    if (import.meta?.env?.MODE !== "production") {
      console.log("[GRID] busyKeysRoom:", Array.from(keys));
    }
    return keys;
  }, [roomBusy, timeSlots]);

  // Header các ngày trong tuần
  const header = useMemo(() => {
    const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    return days.map((day, idx) => ({
      label: day,
      date: addDays(weekStart, idx),
    }));
  }, [weekStart]);

  // Helper: Thêm số ngày vào date
  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // Helper: Kết hợp date + time theo LOCAL TIME (tránh lệch múi giờ khi so sánh)
  // Trả về chuỗi dạng YYYY-MM-DDTHH:mm:00 (KHÔNG có chữ Z)
  function combine(date, timeHHMM) {
    const [hh, mm] = timeHHMM.split(":");
    const d = new Date(date);
    d.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);

    const y = d.getFullYear();
    const M = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const H = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${M}-${day}T${H}:${m}:00`;
  }

  // Helper: Kiểm tra 2 khoảng thời gian có chồng chéo không
  function isOverlapping(start1, end1, start2, end2) {
    const s1 = new Date(start1).getTime();
    const e1 = new Date(end1).getTime();
    const s2 = new Date(start2).getTime();
    const e2 = new Date(end2).getTime();
    return s1 < e2 && s2 < e1;
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {import.meta?.env?.MODE !== "production" && (
          <div className="hidden">
            {/* Debug snapshot for F12 */}
            {console.log("[GRID] timeSlots:", displaySlots)}
            {console.log(
              "[GRID] teacherBusy count:",
              teacherBusy?.length,
              teacherBusy?.slice?.(0, 3)
            )}
            {console.log(
              "[GRID] roomBusy count:",
              roomBusy?.length,
              roomBusy?.slice?.(0, 3)
            )}
          </div>
        )}
        {/* FIXED: Header ngày trong tuần với style đẹp hơn */}
        <div
          className="grid gap-0 bg-white rounded-lg shadow-sm overflow-hidden border"
          style={{
            gridTemplateColumns: "150px repeat(7, minmax(100px, 1fr))",
          }}
        >
          {/* FIXED: Cell góc trên trái */}
          <div className="p-3 font-semibold border-b-2 border-r bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 text-xs">
            Thời gian
          </div>

          {/* FIXED: Header các ngày với highlight */}
          {header.map((h, idx) => (
            <div
              key={idx}
              className="p-3 text-center font-semibold border-b-2 border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50"
            >
              <div className="text-sm text-gray-900">{h.label}</div>
              <div className="text-xs text-gray-600 mt-0.5">
                {h.date.getDate()}/{h.date.getMonth() + 1}
              </div>
            </div>
          ))}

          {/* FIXED: Các slot thời gian với màu sắc đẹp hơn */}
          {displaySlots.map((slot) => (
            <React.Fragment key={slot.key}>
              {/* FIXED: Label thời gian với gradient */}
              <div className="whitespace-pre-wrap p-3 text-xs font-medium text-gray-700 border-t border-r bg-gradient-to-r from-gray-50 to-gray-100 flex items-center">
                <div>
                  <div className="font-semibold text-gray-900">
                    {slot.label.split("\n")[0]}
                  </div>
                  <div className="text-gray-500 mt-0.5">
                    {slot.label.split("\n")[1]}
                  </div>
                </div>
              </div>

              {/* FIXED: Cells với hover effect và màu sắc đẹp */}
              {header.map((_, idx) => {
                const day = addDays(weekStart, idx);
                const start = combine(day, slot.start);
                const end = combine(day, slot.end);
                const bizDayForColumn = idx + 2; // T2 starts at 2, ... CN=8

                // Kiểm tra slot có bị bận không
                // Prefer weekly pattern to reflect repeating schedules across semester
                const patternKey = `${bizDayForColumn}-${slot.id}`;
                const busyTeacher =
                  busyKeysTeacher.has(patternKey) ||
                  (teacherBusy || []).some((b) =>
                    isOverlapping(start, end, b.start, b.end)
                  );
                const busyRoom =
                  busyKeysRoom.has(patternKey) ||
                  (roomBusy || []).some((b) =>
                    isOverlapping(start, end, b.start, b.end)
                  );
                const busy = busyTeacher || busyRoom;

                if (busy && import.meta?.env?.MODE !== "production") {
                  console.log("[GRID] Busy cell:", {
                    day: idx + 2,
                    start,
                    end,
                    slotId: slot.id,
                    busyTeacher,
                    busyRoom,
                  });
                }

                // Kiểm tra slot đã được chọn chưa
                const picked = (selected || []).some(
                  (s) => s.isoStart === start && s.isoEnd === end
                );

                // FIXED: CSS classes với màu sắc đẹp hơn
                let cellClasses =
                  "m-1 h-16 rounded-lg border-2 text-center text-xs font-medium flex flex-col items-center justify-center transition-all select-none";
                let statusText = "";

                if (disabled) {
                  cellClasses +=
                    " bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50";
                  statusText = "---";
                } else if (picked) {
                  cellClasses +=
                    " bg-gradient-to-br from-green-400 to-green-500 text-white border-green-600 shadow-md cursor-pointer hover:shadow-lg transform hover:scale-105";
                  statusText = "✓ Đã chọn";
                } else if (busy) {
                  cellClasses +=
                    " bg-gradient-to-br from-red-100 to-red-200 text-red-700 border-red-300 cursor-not-allowed";
                  statusText = "✕ Bận";
                } else {
                  cellClasses +=
                    " bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border-blue-200 cursor-pointer hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-100 hover:to-blue-200 hover:shadow-md";
                  statusText = "○ Trống";
                }

                return (
                  <div
                    key={`${slot.key}-${idx}`}
                    onClick={() =>
                      !disabled &&
                      !busy &&
                      onToggle?.({
                        isoStart: start,
                        isoEnd: end,
                        dow: idx + 1,
                        startHHMM: slot.start,
                        endHHMM: slot.end,
                      })
                    }
                    className={cellClasses}
                  >
                    <span className="font-semibold">{statusText}</span>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* FIXED: Legend hướng dẫn */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-600 bg-gray-50 rounded-lg p-3 border">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200"></div>
            <span>Trống - Click để chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-green-400 to-green-500 border-2 border-green-600"></div>
            <span>Đã chọn - Click để bỏ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-300"></div>
            <span>Bận - Không thể chọn</span>
          </div>
        </div>
      </div>
    </div>
  );
}
