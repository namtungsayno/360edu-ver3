// Helper to detect schedule conflicts between a target class and already enrolled classes
// Each class schedule item format expected: { dayOfWeek: number (1-7), timeSlotId: number, startDate, endDate }

export function buildScheduleIndex(enrolledDetails = []) {
  const index = []; // array of {day,slot,startDate,endDate,classId}
  for (const c of enrolledDetails) {
    if (!Array.isArray(c.schedule)) continue;
    for (const s of c.schedule) {
      // Prefer explicit slot id; fallback to normalized time range string HH:MM-HH:MM
      const startStr = (s.startTime || '').slice(0,5);
      const endStr = (s.endTime || '').slice(0,5);
      const slotValue = s.timeSlotId || s.timeSlot || s.timeSlot_id || (startStr && endStr ? `${startStr}-${endStr}` : s.startTime || s.start);
      index.push({
        day: s.dayOfWeek,
        slot: slotValue,
        start: c.startDate,
        end: c.endDate,
        classId: c.id || c.classId
      });
    }
  }
  return index;
}

function dateOverlap(aStart, aEnd, bStart, bEnd) {
  if (!aStart || !aEnd || !bStart || !bEnd) return true; // conservative
  return !(aEnd < bStart || bEnd < aStart);
}

export function hasConflict(targetClassDetail, enrolledIndex) {
  if (!targetClassDetail || !Array.isArray(targetClassDetail.schedule)) return false;
  for (const s of targetClassDetail.schedule) {
    const startStr = (s.startTime || '').slice(0,5);
    const endStr = (s.endTime || '').slice(0,5);
    const slot = s.timeSlotId || s.timeSlot || s.timeSlot_id || (startStr && endStr ? `${startStr}-${endStr}` : s.startTime || s.start);
    const day = s.dayOfWeek;
    for (const e of enrolledIndex) {
      if (e.day === day && e.slot === slot && dateOverlap(e.start, e.end, targetClassDetail.startDate, targetClassDetail.endDate)) {
        return true;
      }
    }
  }
  return false;
}

// Build index by fetching details (when list API does not include schedule)
export async function buildIndexByFetchingDetails(myClasses, fetchDetailFn) {
  if (!Array.isArray(myClasses) || myClasses.length === 0) return [];
  const details = await Promise.all(
    myClasses.map(c => fetchDetailFn(c.classId || c.id).catch(() => null))
  );
  return buildScheduleIndex(details.filter(Boolean));
}
