import React, { useEffect, useMemo, useState } from "react";
import { timeslotService } from "../../../services/timeslot/timeslot.service";

// Helpers
function addDays(base, n) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}
function fmt(date, pattern) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  if (pattern === "dd/MM") return `${dd}/${mm}`;
  if (pattern === "yyyy-MM-dd") return `${yyyy}-${mm}-${dd}`;
  return date.toISOString();
}
function buildSlot(date, slot) {
  const [sh, sm] = slot.startTime.split(":").map(Number);
  const [eh, em] = slot.endTime.split(":").map(Number);
  const s = new Date(date);
  s.setHours(sh, sm, 0, 0);
  const e = new Date(date);
  e.setHours(eh, em, 0, 0);
  return {
    isoStart: s.toISOString(),
    isoEnd: e.toISOString(),
    slotId: slot.id,
  };
}
function isOverlapping(aStart, aEnd, bStart, bEnd) {
  if (!aStart || !aEnd || !bStart || !bEnd) return false;
  const as = new Date(aStart).getTime();
  const ae = new Date(aEnd).getTime();
  const bs = new Date(bStart).getTime();
  const be = new Date(bEnd).getTime();
  if ([as, ae, bs, be].some((x) => isNaN(x))) return false;
  return as < be && bs < ae;
}

export default function ScheduleGrid({
  weekStart,
  teacherBusy = [], // format mới: [{start,end}] ; format cũ (fallback) {day,slotId}
  roomBusy = [],
  selected = [],
  timeSlots: propTimeSlots = [],
  onToggle,
  disabled = false,
}) {
  const [internalSlots, setInternalSlots] = useState([]);

  // Fetch timeslots nếu parent không truyền
  useEffect(() => {
    if (propTimeSlots && propTimeSlots.length) return;
    (async () => {
      try {
        const data = await timeslotService.list();
        if (Array.isArray(data) && data.length) setInternalSlots(data);
        else
          setInternalSlots([
            { id: 1, startTime: "07:30", endTime: "09:00", name: "Slot 1" },
            { id: 2, startTime: "09:15", endTime: "10:45", name: "Slot 2" },
            { id: 3, startTime: "14:00", endTime: "15:30", name: "Slot 3" },
          ]);
      } catch {
        setInternalSlots([
          { id: 1, startTime: "07:30", endTime: "09:00", name: "Slot 1" },
          { id: 2, startTime: "09:15", endTime: "10:45", name: "Slot 2" },
          { id: 3, startTime: "14:00", endTime: "15:30", name: "Slot 3" },
        ]);
      }
    })();
  }, [propTimeSlots]);

  const timeSlots = useMemo(
    () =>
      propTimeSlots && propTimeSlots.length ? propTimeSlots : internalSlots,
    [propTimeSlots, internalSlots]
  );

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  function isSelected(slotObj) {
    return selected.some(
      (s) => s.isoStart === slotObj.isoStart && s.isoEnd === slotObj.isoEnd
    );
  }

  // Chuẩn hoá busy => Set pattern `${isoDay}-${slotId}`
  const busyKeysTeacher = useMemo(() => {
    const set = new Set();
    if (!teacherBusy.length || !timeSlots.length) return set;
    teacherBusy.forEach((b) => {
      if (b.start) {
        const d = new Date(b.start);
        const isoDay = d.getDay() === 0 ? 7 : d.getDay();
        const hhmm = String(b.start).substring(11, 16);
        const ts = timeSlots.find((t) => t.startTime === hhmm);
        if (ts) set.add(`${isoDay}-${ts.id}`);
      } else if (b.day && (b.slotId || b.timeSlotId)) {
        set.add(`${b.day}-${b.slotId || b.timeSlotId}`);
      }
    });
    return set;
  }, [teacherBusy, timeSlots]);

  const busyKeysRoom = useMemo(() => {
    const set = new Set();
    if (!roomBusy.length || !timeSlots.length) return set;
    roomBusy.forEach((b) => {
      if (b.start) {
        const d = new Date(b.start);
        const isoDay = d.getDay() === 0 ? 7 : d.getDay();
        const hhmm = String(b.start).substring(11, 16);
        const ts = timeSlots.find((t) => t.startTime === hhmm);
        if (ts) set.add(`${isoDay}-${ts.id}`);
      } else if (b.day && (b.slotId || b.timeSlotId)) {
        set.add(`${b.day}-${b.slotId || b.timeSlotId}`);
      }
    });
    return set;
  }, [roomBusy, timeSlots]);

  function isBusy(slotObj) {
    const d = new Date(slotObj.isoStart);
    const isoDay = d.getDay() === 0 ? 7 : d.getDay();
    const pattern = `${isoDay}-${slotObj.slotId}`;
    if (busyKeysTeacher.has(pattern) || busyKeysRoom.has(pattern)) return true;
    // Fallback overlap (đề phòng lệch HH:mm)
    return (
      teacherBusy.some(
        (b) =>
          b.start &&
          isOverlapping(slotObj.isoStart, slotObj.isoEnd, b.start, b.end)
      ) ||
      roomBusy.some(
        (b) =>
          b.start &&
          isOverlapping(slotObj.isoStart, slotObj.isoEnd, b.start, b.end)
      )
    );
  }

  function getCellClass(sel, busy) {
    if (sel) return "bg-blue-600 text-white border-blue-700";
    if (busy) return "bg-red-50 text-red-700 border-red-200";
    return "bg-white hover:bg-gray-50";
  }
  function getCellText(sel, busy) {
    if (sel) return "Đã chọn";
    if (busy) return "Bận";
    return "Trống";
  }

  // Weekday labels in Vietnamese
  const weekdayNames = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];

  return (
    <div className="overflow-x-auto">
      {/* local keyframes for fade-in */}
      <style>{`
        @keyframes fadeIn { from {opacity:0; transform:translateY(4px);} to {opacity:1; transform:translateY(0);} }
        .animate-fadeIn { animation: fadeIn .4s ease-out; }
      `}</style>
      <div className="min-w-[1000px] space-y-3">
        {/* Header */}
        <div className="grid grid-cols-8 gap-2 sticky top-0 z-10 bg-white/80 backdrop-blur border-b pb-2">
          <div className="p-2 text-center text-xs font-semibold text-gray-600 flex flex-col items-center justify-center">
            <span className="uppercase tracking-wide">Slot</span>
            <span className="text-[10px] font-normal mt-1 text-gray-400">
              Khung giờ
            </span>
          </div>
          {weekDates.map((d, idx) => (
            <div
              key={fmt(d, "yyyy-MM-dd")}
              className="p-2 rounded-lg flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-sm animate-fadeIn"
            >
              <span className="text-xs font-semibold tracking-wide">
                {weekdayNames[idx]}
              </span>
              <span className="mt-1 text-[11px] font-medium opacity-90">
                {fmt(d, "dd/MM")}
              </span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="space-y-3">
          {timeSlots.map((slot) => (
            <div key={slot.id} className="grid grid-cols-8 gap-2">
              {/* Slot label */}
              <div className="p-3 bg-white border rounded-lg text-sm flex flex-col justify-center shadow-sm">
                <div className="font-semibold text-gray-700">
                  {slot.name || `Slot ${slot.id}`}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {slot.startTime} - {slot.endTime}
                </div>
              </div>
              {weekDates.map((d) => {
                const sObj = buildSlot(d, slot);
                const sel = isSelected(sObj);
                const busy = isBusy(sObj);
                const base =
                  "h-[70px] rounded-lg border flex items-center justify-center text-xs font-medium transition-all duration-200 ease-out will-change-transform focus:outline-none focus:ring-2 focus:ring-indigo-400/60";
                const cls = getCellClass(sel, busy);
                const text = getCellText(sel, busy);
                const extra = sel
                  ? "shadow-md scale-[1.02]"
                  : busy
                  ? "bg-red-50 text-red-700"
                  : "hover:shadow hover:scale-[1.02]";
                return (
                  <button
                    key={fmt(d, "yyyy-MM-dd") + "-" + slot.id}
                    className={`${base} ${cls} ${extra} animate-fadeIn`}
                    type="button"
                    disabled={disabled || busy}
                    onClick={() => onToggle?.(sObj)}
                    title={
                      busy ? "Giờ này đã bận" : sel ? "Bỏ chọn" : "Chọn giờ"
                    }
                  >
                    {text}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 pt-4 border-t flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded border bg-white" /> Trống
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded border bg-red-50" /> Bận
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded border bg-blue-600" /> Đã chọn
          </div>
        </div>
      </div>
    </div>
  );
}
