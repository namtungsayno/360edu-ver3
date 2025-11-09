export const formatCurrency = (amount) =>
  `${amount?.toLocaleString?.() ?? 0} ₫`;

// Convert ISO day (1=Mon..7=Sun) to Vietnamese short label
export const dayLabelVi = (day) => {
  switch (day) {
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
    case 7:
      return "CN";
    default:
      return `Thứ ${day}`;
  }
};
