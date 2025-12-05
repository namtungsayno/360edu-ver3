export const formatCurrency = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "0 ₫";
  return `${n.toLocaleString("vi-VN")} ₫`;
};

// Convert day to Vietnamese label
// Accepts both JS convention (0=Sun) and ISO convention (1=Mon..7=Sun)
export const dayLabelVi = (day) => {
  switch (day) {
    case 0: // Sunday (JS convention)
    case 7: // Sunday (ISO convention)
      return "CN";
    case 1:
      return "Thứ 2";
    case 2:
      return "Thứ 3";
    case 3:
      return "Thứ 4";
    case 4:
      return "Thứ 5";
    case 5:
      return "Thứ 6";
    case 6:
      return "Thứ 7";
    default:
      return `Thứ ${day}`;
  }
};
