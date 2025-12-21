export const formatCurrency = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "0 VNĐ";
  return `${n.toLocaleString("vi-VN")} VNĐ`;
};

/**
 * Format date to Vietnamese format (dd/MM/yyyy)
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted date string (dd/MM/yyyy)
 */
export const formatDateVN = (date) => {
  if (!date) return "";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "";
  }
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
