import React, { useEffect, useMemo, useState } from "react";
import { timeslotService } from "../../../services/timeslot/timeslot.service";

// Minimal date helpers (keep in sync with ScheduleManagement)
function addDays(d, n) {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + n);
  return nd;
}
function fmt(date, pattern) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  if (pattern === "dd/MM") return `${dd}/${mm}`;
  if (pattern === "yyyy-MM-dd") return `${yyyy}-${mm}-${dd}`;
  return date.toISOString();
}

// Build slot object from date and timeslot
function buildSlot(date, slot) {
  const [sh, sm] = (slot.startTime || "16:00").split(":").map(Number);
  const [eh, em] = (slot.endTime || "18:00").split(":").map(Number);
  const s = new Date(date);
  s.setHours(sh, sm, 0, 0);
  const e = new Date(date);
  e.setHours(eh, em, 0, 0);
  return { isoStart: s.toISOString(), isoEnd: e.toISOString(), day: s.getDay(), slotId: slot.id };
}

/**
 * ScheduleGrid - lightweight weekly grid used for picking slots
 * Props:
 *  - weekStart: Date (Monday)
 *  - teacherBusy: Array of { day, slotId } (optional)
 *  - selected: Array of { isoStart, isoEnd }
 *  - onToggle: fn(slot)
 *  - disabled: bool
 */
export default function ScheduleGrid({
  weekStart,
  teacherBusy = [],
  selected = [],
  onToggle,
  disabled = false,
}) {
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const slots = await timeslotService.list();
        if (Array.isArray(slots) && slots.length) setTimeSlots(slots);
        else
          setTimeSlots([
            { id: 1, startTime: "16:00", endTime: "18:00", name: "Slot 1" },
            { id: 2, startTime: "18:00", endTime: "20:00", name: "Slot 2" },
            { id: 3, startTime: "20:00", endTime: "22:00", name: "Slot 3" },
          ]);
      } catch {
        setTimeSlots([
          { id: 1, startTime: "16:00", endTime: "18:00", name: "Slot 1" },
          { id: 2, startTime: "18:00", endTime: "20:00", name: "Slot 2" },
          { id: 3, startTime: "20:00", endTime: "22:00", name: "Slot 3" },
        ]);
      }
    })();
  }, []);

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  function isSelected(slotObj) {
    return selected.some(
      (x) => x.isoStart === slotObj.isoStart && x.isoEnd === slotObj.isoEnd
    );
  }

  function isBusy(dayIdx, slotId) {
    return teacherBusy.some((b) => String(b.day) === String(dayIdx) && String(b.slotId || b.timeSlotId) === String(slotId));
  }

  function getCellClass(selectedCell, busyCell) {
    if (selectedCell) return "bg-blue-600 text-white border-blue-700";
    if (busyCell) return "bg-red-50 text-red-700 border-red-200";
    return "bg-white hover:bg-gray-50";
  }

  function getCellText(selectedCell, busyCell) {
    if (selectedCell) return "Đã chọn";
    if (busyCell) return "Bận";
    return "Trống";
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1000px]">
        <div className="grid grid-cols-8 gap-2 mb-2">
          <div className="p-2 text-center text-sm font-medium bg-gray-50 border rounded">Slot</div>
          {weekDates.map((d) => (
            <div key={fmt(d, "yyyy-MM-dd")} className="p-2 text-center text-sm font-medium bg-indigo-600 text-white rounded">
              {fmt(d, "dd/MM")}
            </div>
          ))}
        </div>

        {timeSlots.map((slot) => (
          <div key={slot.id} className="grid grid-cols-8 gap-2 mb-2">
            <div className="p-2 bg-white border rounded text-sm">
              <div className="font-medium">{slot.name || `Slot ${slot.id}`}</div>
              <div className="text-xs text-gray-500">
                {slot.startTime} - {slot.endTime}
              </div>
            </div>
            {weekDates.map((d) => {
              const sObj = buildSlot(d, slot);
              const selectedCell = isSelected(sObj);
              const busyCell = isBusy(((d.getDay() || 7) - 0), slot.id);
              const base = "h-[70px] rounded border flex items-center justify-center text-sm";
              const cls = getCellClass(selectedCell, busyCell);
              const text = getCellText(selectedCell, busyCell);
              return (
                <button
                  key={fmt(d, "yyyy-MM-dd") + "-" + slot.id}
                  className={`${base} ${cls}`}
                  type="button"
                  disabled={disabled || busyCell}
                  onClick={() => onToggle?.(sObj)}
                  title={busyCell ? "Giờ này đã bận" : "Chọn giờ"}
                >
                  {text}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
