import React, { useEffect, useMemo, useState } from "react";
import { timeslotService } from "../../../services/timeslot/timeslot.service";
import { Check, X, Clock, User, Home, Lock } from "lucide-react";

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

/**
 * Lấy thứ trong tuần (0-6, 0 = Chủ nhật) từ ngày
 */
function getDayOfWeek(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.getDay();
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
  startDate = null, // Ngày bắt đầu đã chọn (yyyy-MM-dd)
  requireStartDayFirst = false, // Bắt buộc chọn slot ngày bắt đầu trước
  // Khi phòng/GV thay đổi, không nên loại trừ originalSelected khỏi busy check
  excludeOriginalFromRoomBusy = true, // true = loại trừ slot cũ khỏi room busy (phòng không đổi)
  excludeOriginalFromTeacherBusy = true, // true = loại trừ slot cũ khỏi teacher busy (GV không đổi)
}) {
  const [internalSlots, setInternalSlots] = useState([]);

  // Xác định thứ của ngày bắt đầu (0-6, 0 = CN)
  const startDayOfWeek = useMemo(() => getDayOfWeek(startDate), [startDate]);

  // Kiểm tra xem đã chọn slot nào ở ngày bắt đầu chưa
  const hasSelectedStartDaySlot = useMemo(() => {
    if (!requireStartDayFirst || startDayOfWeek === null) return true;
    return selected.some((s) => {
      const d = new Date(s.isoStart);
      return d.getDay() === startDayOfWeek;
    });
  }, [selected, startDayOfWeek, requireStartDayFirst]);

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
    // Chỉ loại trừ originalSelected nếu GV không đổi
    if (excludeOriginalFromTeacherBusy && isOriginalSelected(slotObj))
      return false;
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
    // Chỉ loại trừ originalSelected nếu phòng không đổi
    if (excludeOriginalFromRoomBusy && isOriginalSelected(slotObj))
      return false;
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

  const weekdayNames = [
    { short: "T2", full: "Thứ 2" },
    { short: "T3", full: "Thứ 3" },
    { short: "T4", full: "Thứ 4" },
    { short: "T5", full: "Thứ 5" },
    { short: "T6", full: "Thứ 6" },
    { short: "T7", full: "Thứ 7" },
    { short: "CN", full: "Chủ nhật" },
  ];

  return (
    <div className="space-y-4">
      {/* Modern Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Header Row */}
            <div className="grid grid-cols-8">
              {/* Time Column Header */}
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 border-r border-b border-gray-200">
                <div className="flex flex-col items-center justify-center h-full">
                  <Clock className="h-5 w-5 text-gray-400 mb-1" />
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Slot
                  </div>
                </div>
              </div>

              {/* Day Headers - Chỉ hiển thị thứ, không hiển thị ngày tháng */}
              {weekdayNames.map((day, index) => {
                const date = weekDates[index];
                const jsDay = date.getDay(); // 0 = CN, 1-6 = T2-T7
                const isStartDay =
                  requireStartDayFirst &&
                  startDayOfWeek !== null &&
                  jsDay === startDayOfWeek;
                const isDimmed =
                  requireStartDayFirst &&
                  startDayOfWeek !== null &&
                  !hasSelectedStartDaySlot &&
                  jsDay !== startDayOfWeek;

                return (
                  <div
                    key={day.short}
                    className={`relative p-4 border-b border-gray-200 ${
                      index < 6 ? "border-r border-gray-100" : ""
                    } bg-gradient-to-br ${
                      isStartDay
                        ? "from-emerald-500 via-emerald-600 to-teal-600"
                        : isDimmed
                        ? "from-gray-300 via-gray-400 to-gray-500"
                        : "from-indigo-500 via-indigo-600 to-purple-600"
                    } transition-all duration-300`}
                  >
                    {isStartDay && (
                      <div className="absolute top-2 right-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                      </div>
                    )}
                    {isDimmed && (
                      <div className="absolute top-2 right-2">
                        <Lock className="h-3 w-3 text-white/60" />
                      </div>
                    )}
                    <div className="text-center">
                      <div
                        className={`text-lg font-bold ${
                          isDimmed ? "text-white/60" : "text-white"
                        }`}
                      >
                        {day.short}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          isDimmed ? "text-white/40" : "text-white/70"
                        }`}
                      >
                        {day.full}
                      </div>
                      {isStartDay && (
                        <div className="mt-1 text-[10px] text-white/90 font-medium bg-white/20 rounded px-1.5 py-0.5 inline-block">
                          Ngày bắt đầu
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time Slots */}
            {timeSlots.map((slot, slotIndex) => (
              <div
                key={slot.id}
                className={`grid grid-cols-8 ${
                  slotIndex !== timeSlots.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                {/* Slot Label */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-r border-gray-200">
                  <div className="flex flex-col justify-center h-full min-h-[80px]">
                    <div className="inline-flex items-center justify-center w-fit mx-auto px-3 py-1 rounded-full bg-gray-100 mb-2">
                      <span className="text-sm font-bold text-gray-700">
                        {slot.name || `Slot ${slot.id}`}
                      </span>
                    </div>
                    <div className="text-center text-xs text-gray-500 font-medium">
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </div>
                </div>

                {/* Day Cells */}
                {Array(7)
                  .fill(0)
                  .map((_, dayIdx) => {
                    const d = weekDates[dayIdx];
                    const jsDay = d.getDay(); // 0 = CN, 1-6 = T2-T7
                    const sObj = buildSlot(d, slot);
                    const sel = isSelected(sObj);
                    const wasOriginal = isOriginalSelected(sObj);
                    const teacherB = isTeacherBusySlot(sObj);
                    const roomB = isRoomBusySlot(sObj);
                    const busy = teacherB || roomB;

                    // Kiểm tra xem cell này có bị khóa không (chưa chọn slot ngày bắt đầu)
                    const isStartDay =
                      requireStartDayFirst &&
                      startDayOfWeek !== null &&
                      jsDay === startDayOfWeek;
                    const isDayLocked =
                      requireStartDayFirst &&
                      startDayOfWeek !== null &&
                      !hasSelectedStartDaySlot &&
                      jsDay !== startDayOfWeek;
                    // Ngày bắt đầu: cho phép click nếu không disabled và (là slot cũ HOẶC không bận)
                    // Ngày khác: cho phép click nếu không disabled, không bị lock, và (là slot cũ HOẶC không bận)
                    const canClick =
                      !disabled && !isDayLocked && (wasOriginal || !busy);

                    return (
                      <div
                        key={dayIdx + "-" + slot.id}
                        onClick={() => canClick && onToggle?.(sObj)}
                        className={`p-2 min-h-[100px] transition-all duration-200 ${
                          dayIdx < 6 ? "border-r border-gray-100" : ""
                        } ${isStartDay && !sel ? "bg-emerald-50/50" : ""} ${
                          isDayLocked ? "bg-gray-50/50" : ""
                        } ${
                          canClick
                            ? "cursor-pointer hover:bg-gray-50"
                            : isDayLocked
                            ? "cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <div className="h-full flex items-center justify-center relative">
                          {/* Icon khóa nhỏ ở góc cho các ngày bị lock */}
                          {isDayLocked && !sel && (
                            <div className="absolute top-0 right-0 p-1">
                              <Lock className="h-3 w-3 text-gray-400" />
                            </div>
                          )}

                          {sel ? (
                            <div
                              className={`flex flex-col items-center gap-2 p-3 rounded-xl text-white shadow-lg transform hover:scale-105 transition-transform ${
                                isStartDay
                                  ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200"
                                  : "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200"
                              }`}
                            >
                              <Check className="h-5 w-5" />
                              <span className="text-xs font-semibold">
                                {wasOriginal ? "Slot cũ" : "Đã chọn"}
                              </span>
                            </div>
                          ) : teacherB ? (
                            <div
                              className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-red-50 to-rose-100 border border-red-200 text-red-600 ${
                                isDayLocked ? "opacity-60" : ""
                              }`}
                            >
                              <User className="h-5 w-5" />
                              <span className="text-xs font-semibold">
                                GV bận
                              </span>
                            </div>
                          ) : roomB ? (
                            <div
                              className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 text-gray-500 ${
                                isDayLocked ? "opacity-60" : ""
                              }`}
                            >
                              <Home className="h-5 w-5" />
                              <span className="text-xs font-semibold">
                                P. bận
                              </span>
                            </div>
                          ) : (
                            <div
                              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-dashed transition-all ${
                                isDayLocked
                                  ? "border-gray-200 text-gray-400 opacity-60"
                                  : isStartDay
                                  ? "border-emerald-300 text-emerald-500 hover:border-emerald-400 hover:bg-emerald-50/50"
                                  : "border-gray-200 text-gray-400 hover:border-emerald-300 hover:text-emerald-500 hover:bg-emerald-50/50"
                              }`}
                            >
                              <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
                                <span className="text-lg leading-none">+</span>
                              </div>
                              <span className="text-xs font-medium">Trống</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <span className="font-semibold text-gray-700">Chú thích:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-dashed border-gray-300"></div>
          <span className="text-gray-600">Trống</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-100 border border-red-300"></div>
          <span className="text-gray-600">GV bận</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-200 border border-gray-300"></div>
          <span className="text-gray-600">Phòng bận</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm"></div>
          <span className="text-gray-600">Đã chọn</span>
        </div>
        {requireStartDayFirst && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm"></div>
              <span className="text-gray-600">Ngày bắt đầu</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center relative">
                <Lock className="w-2 h-2 text-gray-400" />
              </div>
              <span className="text-gray-600">Đang khóa</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
