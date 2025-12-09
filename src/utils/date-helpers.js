// Date helper functions for calendar components

export function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function addDays(d, n) {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + n);
  return nd;
}

export function addWeeks(d, n) {
  return addDays(d, n * 7);
}

export function subWeeks(d, n) {
  return addDays(d, -n * 7);
}

export function fmt(date, pattern) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  if (pattern === "dd/MM") return `${dd}/${mm}`;
  if (pattern === "dd/MM/yyyy") return `${dd}/${mm}/${yyyy}`;
  if (pattern === "yyyy-MM-dd") return `${yyyy}-${mm}-${dd}`;
  if (pattern === "MMMM yyyy") {
    const months = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];
    return `${months[date.getMonth()]}, ${yyyy}`;
  }
  return date.toISOString();
}

export const WEEK_DAYS = [
  { id: 1, short: "T2", full: "Thứ Hai" },
  { id: 2, short: "T3", full: "Thứ Ba" },
  { id: 3, short: "T4", full: "Thứ Tư" },
  { id: 4, short: "T5", full: "Thứ Năm" },
  { id: 5, short: "T6", full: "Thứ Sáu" },
  { id: 6, short: "T7", full: "Thứ Bảy" },
  { id: 7, short: "CN", full: "Chủ Nhật" },
];
