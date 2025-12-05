import React, { useEffect, useMemo, useState } from "react";
import { timeslotService } from "../../../services/timeslot/timeslot.service";

// Helpers
function addDays(base, n) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
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
  teacherBusy = [],
  roomBusy = [],
  selected = [],
  originalSelected = [],
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

  function isOriginalSelected(slotObj) {
    return originalSelected.some(
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

  function isTeacherBusySlot(slotObj) {
    if (isOriginalSelected(slotObj)) return false;
    const d = new Date(slotObj.isoStart);
    const isoDay = d.getDay() === 0 ? 7 : d.getDay();
    const pattern = `${isoDay}-${slotObj.slotId}`;
    if (busyKeysTeacher.has(pattern)) return true;
    return teacherBusy.some(
      (b) =>
        b.start &&
        isOverlapping(slotObj.isoStart, slotObj.isoEnd, b.start, b.end)
    );
  }

  function isRoomBusySlot(slotObj) {
    if (isOriginalSelected(slotObj)) return false;
    const d = new Date(slotObj.isoStart);
    const isoDay = d.getDay() === 0 ? 7 : d.getDay();
    const pattern = `${isoDay}-${slotObj.slotId}`;
    if (busyKeysRoom.has(pattern)) return true;
    return roomBusy.some(
      (b) =>
        b.start &&
        isOverlapping(slotObj.isoStart, slotObj.isoEnd, b.start, b.end)
    );
  }

  const weekdayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="overflow-x-auto">
      <style>{`
        @keyframes fadeIn { from {opacity:0; transform:translateY(8px) scale(0.98);} to {opacity:1; transform:translateY(0) scale(1);} }
        @keyframes pop { 0% {transform:scale(0.95);} 60% {transform:scale(1.08);} 100% {transform:scale(1);} }
        .animate-fadeIn { animation: fadeIn .5s cubic-bezier(.4,0,.2,1); }
        .animate-pop { animation: pop .3s cubic-bezier(.4,0,.2,1); }
      `}</style>
      <div className="min-w-[900px] space-y-3">
        {/* Header: chỉ hiện thứ */}
        <div className="grid grid-cols-8 gap-2 sticky top-0 z-10 bg-white/80 backdrop-blur border-b pb-2">
          <div className="p-2 text-center text-xs font-semibold text-gray-600 flex flex-col items-center justify-center">
            <span className="uppercase tracking-wide">Slot</span>
            <span className="text-[10px] font-normal mt-1 text-gray-400">
              Khung giờ
            </span>
          </div>
          {weekdayNames.map((thu) => (
            <div
              key={thu}
              className="p-2 rounded-lg flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-sm animate-fadeIn"
            >
              <span className="text-xs font-semibold tracking-wide">{thu}</span>
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
              {Array(7)
                .fill(0)
                .map((_, dayIdx) => {
                  const d = weekDates[dayIdx];
                  const sObj = buildSlot(d, slot);
                  const sel = isSelected(sObj);
                  const wasOriginal = isOriginalSelected(sObj);
                  const teacherB = isTeacherBusySlot(sObj);
                  const roomB = isRoomBusySlot(sObj);
                  const busy = teacherB || roomB;
                  const base =
                    "h-[70px] rounded-lg border flex items-center justify-center text-xs font-medium transition-all duration-200 ease-out will-change-transform focus:outline-none focus:ring-2 focus:ring-indigo-400/60 cursor-pointer select-none";
                  let cls = "";
                  if (sel)
                    cls = "bg-blue-600 text-white border-blue-700 animate-pop";
                  else if (teacherB)
                    cls =
                      "bg-red-50 text-red-700 border-red-200 cursor-not-allowed";
                  else if (roomB)
                    cls =
                      "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed";
                  else
                    cls =
                      "bg-white hover:bg-blue-50 text-green-600 border-green-200 hover:shadow hover:scale-[1.03]";
                  const text = teacherB
                    ? "GV bận"
                    : roomB
                    ? "P bận"
                    : sel
                    ? wasOriginal
                      ? "Slot cũ"
                      : "Đã chọn"
                    : "Rảnh";
                  return (
                    <div
                      key={dayIdx + "-" + slot.id}
                      className={`${base} ${cls} animate-fadeIn`}
                      style={{ transition: "all .2s cubic-bezier(.4,0,.2,1)" }}
                      onClick={() =>
                        !disabled && (wasOriginal || !busy) && onToggle?.(sObj)
                      }
                      title={
                        busy && !wasOriginal
                          ? "Giờ này đã bận"
                          : sel
                          ? "Bỏ chọn"
                          : "Chọn giờ"
                      }
                    >
                      {text}
                    </div>
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
            <span className="h-4 w-4 rounded border bg-red-50 border-red-200" />{" "}
            GV bận
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded border bg-gray-100" /> Phòng bận
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded border bg-blue-600" /> Đã chọn
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded border bg-blue-500" /> Slot cũ
          </div>
        </div>
      </div>
    </div>
  );
}
