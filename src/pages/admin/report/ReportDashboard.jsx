import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  DollarSign,
  Award,
  Loader2,
  ChevronUp,
  ChevronDown,
  GraduationCap,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  FileSpreadsheet,
  FileText,
  X,
  Check,
} from "lucide-react";
import { reportApi } from "../../../services/report/report.api";
import { useToast } from "../../../hooks/use-toast";

// Format number với dấu chấm ngăn cách hàng nghìn
const formatNumber = (num) => {
  if (num == null) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Format tiền VNĐ
const formatCurrency = (amount) => {
  if (amount == null) return "0 ₫";
  return formatNumber(amount) + " ₫";
};

// Hàm xuất Excel (dùng Tab separator để Excel tự nhận dạng cột)
const exportToExcel = (data, filename, columns) => {
  // columns là array của {key, label, format}
  // format: "currency" | "number" | "text"

  const formatValue = (value, format) => {
    if (value == null || value === "") return "";
    if (format === "currency") {
      return Number(value).toLocaleString("vi-VN") + " ₫";
    }
    if (format === "number") {
      return Number(value).toLocaleString("vi-VN");
    }
    return String(value);
  };

  // Header row
  const headerRow = columns.map((col) => col.label).join("\t");

  // Data rows
  const dataRows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];
        return formatValue(value, col.format);
      })
      .join("\t")
  );

  const content = [headerRow, ...dataRows].join("\n");

  // BOM + content cho UTF-8
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + content], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.xls`;
  link.click();
  URL.revokeObjectURL(link.href);
};

// Hàm xuất HTML report (có thể in/save as PDF)
const exportToHTML = (reportData, filename) => {
  const { overview, teacherRevenue, subjectRevenue } = reportData;

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Báo cáo 360edu - ${new Date().toLocaleDateString("vi-VN")}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; background: #f8fafc; }
    .report-container { max-width: 1000px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; }
    .header h1 { color: #1e40af; font-size: 28px; margin-bottom: 8px; }
    .header p { color: #64748b; font-size: 14px; }
    .section { margin-bottom: 32px; }
    .section-title { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #3b82f6; display: inline-block; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .stat-card { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 20px; border-radius: 12px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: 700; color: #1e293b; }
    .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; font-weight: 600; color: #475569; font-size: 12px; text-transform: uppercase; }
    td { color: #1e293b; font-size: 14px; }
    tr:hover { background: #f8fafc; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .text-green { color: #16a34a; }
    .text-orange { color: #ea580c; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .badge-blue { background: #dbeafe; color: #1d4ed8; }
    .badge-purple { background: #ede9fe; color: #7c3aed; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; }
    @media print {
      body { padding: 0; background: white; }
      .report-container { box-shadow: none; padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="header">
      <h1>📊 Báo cáo Thống kê 360edu</h1>
      <p>Ngày xuất: ${new Date().toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</p>
    </div>

    <div class="section">
      <h2 class="section-title">📈 Tổng quan</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value text-green">${formatCurrency(
            overview?.totalRevenue
          )}</div>
          <div class="stat-label">Tổng doanh thu</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${formatCurrency(
            overview?.monthlyRevenue
          )}</div>
          <div class="stat-label">Doanh thu tháng này</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${formatNumber(overview?.totalStudents)}</div>
          <div class="stat-label">Tổng học sinh</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${formatNumber(overview?.totalTeachers)}</div>
          <div class="stat-label">Tổng giáo viên</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">👨‍🏫 Doanh thu theo Giáo viên</h2>
      <table>
        <thead>
          <tr>
            <th>Hạng</th>
            <th>Giáo viên</th>
            <th class="text-right">Doanh thu</th>
            <th class="text-right">Chờ TT</th>
            <th class="text-center">Số lớp</th>
            <th class="text-center">Học sinh</th>
          </tr>
        </thead>
        <tbody>
          ${(teacherRevenue || [])
            .map(
              (t, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td><strong>${
                t.teacherName
              }</strong><br/><small style="color:#64748b">${
                t.teacherEmail
              }</small></td>
              <td class="text-right text-green"><strong>${formatCurrency(
                t.totalRevenue
              )}</strong></td>
              <td class="text-right text-orange">${formatCurrency(
                t.pendingRevenue
              )}</td>
              <td class="text-center"><span class="badge badge-blue">${
                t.totalClasses
              }</span></td>
              <td class="text-center"><span class="badge badge-purple">${
                t.totalStudents
              }</span></td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2 class="section-title">📚 Doanh thu theo Môn học</h2>
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Môn học</th>
            <th class="text-right">Doanh thu</th>
            <th class="text-center">Số lớp</th>
            <th class="text-center">Học sinh</th>
          </tr>
        </thead>
        <tbody>
          ${(subjectRevenue || [])
            .map(
              (s, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td><strong>${s.subjectName}</strong></td>
              <td class="text-right text-green"><strong>${formatCurrency(
                s.totalRevenue
              )}</strong></td>
              <td class="text-center"><span class="badge badge-blue">${
                s.totalClasses
              }</span></td>
              <td class="text-center"><span class="badge badge-purple">${
                s.totalStudents
              }</span></td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <div class="footer">
      <p>Báo cáo được tạo tự động bởi hệ thống 360edu</p>
      <p>© ${new Date().getFullYear()} 360edu - Hệ thống quản lý giáo dục</p>
    </div>
  </div>
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.html`;
  link.click();
  URL.revokeObjectURL(link.href);
};

// Component nút xuất báo cáo
function ExportReportButton({
  overview,
  teacherRevenue,
  subjectRevenue,
  revenueByDay,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(null);
  const { success, error } = useToast();
  const menuRef = useRef(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async (type) => {
    setExporting(type);
    try {
      switch (type) {
        case "overview-csv":
          exportToExcel([overview], "360edu_tongquan", [
            {
              key: "totalRevenue",
              label: "Tổng doanh thu",
              format: "currency",
            },
            {
              key: "monthlyRevenue",
              label: "Doanh thu tháng",
              format: "currency",
            },
            {
              key: "weeklyRevenue",
              label: "Doanh thu tuần",
              format: "currency",
            },
            {
              key: "pendingRevenue",
              label: "Chờ thanh toán",
              format: "currency",
            },
            { key: "totalStudents", label: "Tổng học sinh", format: "number" },
            { key: "totalTeachers", label: "Tổng giáo viên", format: "number" },
            { key: "publicClasses", label: "Lớp PUBLIC", format: "number" },
            { key: "draftClasses", label: "Lớp DRAFT", format: "number" },
          ]);
          success("Xuất báo cáo tổng quan thành công!");
          break;

        case "teacher-csv":
          exportToExcel(teacherRevenue, "360edu_doanhthu_giaovien", [
            { key: "teacherName", label: "Tên giáo viên", format: "text" },
            { key: "teacherEmail", label: "Email", format: "text" },
            {
              key: "totalRevenue",
              label: "Tổng doanh thu",
              format: "currency",
            },
            {
              key: "pendingRevenue",
              label: "Chờ thanh toán",
              format: "currency",
            },
            { key: "totalClasses", label: "Số lớp", format: "number" },
            { key: "totalStudents", label: "Số học sinh", format: "number" },
          ]);
          success("Xuất doanh thu giáo viên thành công!");
          break;

        case "subject-csv":
          exportToExcel(subjectRevenue, "360edu_doanhthu_monhoc", [
            { key: "subjectName", label: "Tên môn học", format: "text" },
            {
              key: "totalRevenue",
              label: "Tổng doanh thu",
              format: "currency",
            },
            { key: "totalClasses", label: "Số lớp", format: "number" },
            { key: "totalStudents", label: "Số học sinh", format: "number" },
          ]);
          success("Xuất doanh thu môn học thành công!");
          break;

        case "daily-csv":
          exportToExcel(revenueByDay, "360edu_doanhthu_theongay", [
            { key: "label", label: "Ngày", format: "text" },
            { key: "revenue", label: "Doanh thu", format: "currency" },
            { key: "paymentCount", label: "Số giao dịch", format: "number" },
          ]);
          success("Xuất doanh thu theo ngày thành công!");
          break;

        case "full-html":
          exportToHTML(
            { overview, teacherRevenue, subjectRevenue, revenueByDay },
            "360edu_full_report"
          );
          success(
            "Xuất báo cáo đầy đủ thành công! Mở file HTML và in ra PDF nếu cần."
          );
          break;

        default:
          break;
      }
    } catch (e) {
      console.error("Export error:", e);
      error("Có lỗi khi xuất báo cáo");
    } finally {
      setExporting(null);
      setIsOpen(false);
    }
  };

  const exportOptions = [
    {
      id: "full-html",
      icon: FileText,
      label: "Báo cáo đầy đủ",
      desc: "HTML (có thể in PDF)",
      color: "text-rose-500",
      bgColor: "bg-rose-50",
    },
    {
      id: "overview-csv",
      icon: FileSpreadsheet,
      label: "Tổng quan",
      desc: "Excel/CSV",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      id: "teacher-csv",
      icon: FileSpreadsheet,
      label: "Doanh thu Giáo viên",
      desc: "Excel/CSV",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      id: "subject-csv",
      icon: FileSpreadsheet,
      label: "Doanh thu Môn học",
      desc: "Excel/CSV",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      id: "daily-csv",
      icon: FileSpreadsheet,
      label: "Doanh thu theo ngày",
      desc: "Excel/CSV",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30"
      >
        <Download className="h-4 w-4" />
        <span>Xuất báo cáo</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
            <p className="font-semibold text-gray-900 text-sm">
              Chọn loại báo cáo
            </p>
            <p className="text-xs text-gray-500">Xuất dữ liệu sang file</p>
          </div>

          <div className="p-2">
            {exportOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleExport(option.id)}
                disabled={exporting === option.id}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left group disabled:opacity-50"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${option.bgColor} flex items-center justify-center transition-transform group-hover:scale-110`}
                >
                  {exporting === option.id ? (
                    <Loader2
                      className={`h-5 w-5 ${option.color} animate-spin`}
                    />
                  ) : (
                    <option.icon className={`h-5 w-5 ${option.color}`} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">
                    {option.label}
                  </p>
                  <p className="text-xs text-gray-400">{option.desc}</p>
                </div>
                {exporting === option.id && (
                  <span className="text-xs text-blue-500">Đang xuất...</span>
                )}
              </button>
            ))}
          </div>

          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              💡 File HTML có thể mở và in ra PDF
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Component Card thống kê
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = "blue",
  size = "normal",
}) {
  const colorClasses = {
    blue: "from-blue-500 to-indigo-600",
    green: "from-green-500 to-emerald-600",
    purple: "from-purple-500 to-violet-600",
    orange: "from-orange-500 to-amber-600",
    pink: "from-pink-500 to-rose-600",
    cyan: "from-cyan-500 to-teal-600",
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${
        size === "large" ? "p-6" : "p-5"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p
            className={`font-bold text-gray-900 ${
              size === "large" ? "text-3xl" : "text-2xl"
            }`}
          >
            {value}
          </p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <div
              className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend === "up" ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

// Component bảng xếp hạng giáo viên
function TeacherRankingTable({ data, loading }) {
  const [sortConfig, setSortConfig] = useState({
    key: "totalRevenue",
    direction: "desc",
  });

  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      if (sortConfig.direction === "asc") {
        return a[sortConfig.key] - b[sortConfig.key];
      }
      return b[sortConfig.key] - a[sortConfig.key];
    });
  }, [data, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey)
      return <ChevronUp className="h-4 w-4 text-gray-300" />;
    return sortConfig.direction === "desc" ? (
      <ChevronDown className="h-4 w-4 text-blue-600" />
    ) : (
      <ChevronUp className="h-4 w-4 text-blue-600" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>Chưa có dữ liệu doanh thu</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Hạng
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Giáo viên
            </th>
            <th
              className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => handleSort("totalRevenue")}
            >
              <div className="flex items-center justify-end gap-1">
                Doanh thu
                <SortIcon columnKey="totalRevenue" />
              </div>
            </th>
            <th
              className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => handleSort("pendingRevenue")}
            >
              <div className="flex items-center justify-end gap-1">
                Chờ TT
                <SortIcon columnKey="pendingRevenue" />
              </div>
            </th>
            <th
              className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => handleSort("totalClasses")}
            >
              <div className="flex items-center justify-center gap-1">
                Lớp
                <SortIcon columnKey="totalClasses" />
              </div>
            </th>
            <th
              className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => handleSort("totalStudents")}
            >
              <div className="flex items-center justify-center gap-1">
                Học sinh
                <SortIcon columnKey="totalStudents" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((teacher, idx) => (
            <tr
              key={teacher.teacherId}
              className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                idx < 3
                  ? "bg-gradient-to-r from-amber-50/30 to-transparent"
                  : ""
              }`}
            >
              <td className="py-3 px-4">
                {idx < 3 ? (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      idx === 0
                        ? "bg-gradient-to-br from-yellow-400 to-amber-500"
                        : idx === 1
                        ? "bg-gradient-to-br from-gray-300 to-gray-400"
                        : "bg-gradient-to-br from-orange-400 to-amber-600"
                    }`}
                  >
                    {idx + 1}
                  </div>
                ) : (
                  <span className="text-gray-500 font-medium pl-2.5">
                    {idx + 1}
                  </span>
                )}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  {teacher.teacherAvatar ? (
                    <img
                      src={teacher.teacherAvatar}
                      alt={teacher.teacherName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow">
                      {teacher.teacherName?.charAt(0)?.toUpperCase() || "T"}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {teacher.teacherName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {teacher.teacherEmail}
                    </p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-right">
                <span className="font-bold text-green-600">
                  {formatCurrency(teacher.totalRevenue)}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <span className="text-orange-500 font-medium">
                  {formatCurrency(teacher.pendingRevenue)}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  {teacher.totalClasses}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                  {teacher.totalStudents}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Component biểu đồ doanh thu theo ngày - Modern Bar Chart với trend indicators
function RevenueChart({ data, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-sm text-gray-400">Đang tải biểu đồ...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>Chưa có dữ liệu doanh thu</p>
      </div>
    );
  }

  const totalRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const maxRevenue = Math.max(...data.map((d) => d.revenue || 0), 1);
  const totalTransactions = data.reduce(
    (sum, d) => sum + (d.paymentCount || 0),
    0
  );

  // Tính trend: So sánh nửa sau với nửa đầu
  const midPoint = Math.floor(data.length / 2);
  const firstHalfRevenue = data
    .slice(0, midPoint)
    .reduce((sum, d) => sum + (d.revenue || 0), 0);
  const secondHalfRevenue = data
    .slice(midPoint)
    .reduce((sum, d) => sum + (d.revenue || 0), 0);
  const trendPercent =
    firstHalfRevenue > 0
      ? (
          ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) *
          100
        ).toFixed(1)
      : secondHalfRevenue > 0
      ? 100
      : 0;
  const isUpTrend = secondHalfRevenue >= firstHalfRevenue;

  // Tìm ngày có doanh thu cao nhất
  const maxRevenueDay = data.reduce(
    (max, d) => (d.revenue > (max?.revenue || 0) ? d : max),
    null
  );

  if (totalRevenue === 0) {
    return (
      <div className="text-center py-10 bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
          <BarChart3 className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">
          Chưa có doanh thu trong kỳ này
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Biểu đồ sẽ hiển thị khi có giao dịch
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Trend Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-xs text-green-600 font-medium">
              Tổng doanh thu
            </span>
          </div>
          <p className="text-lg font-bold text-green-700">
            {formatCurrency(totalRevenue)}
          </p>
        </div>

        {/* Trend Indicator */}
        <div
          className={`rounded-xl p-3 border ${
            isUpTrend
              ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
              : "bg-gradient-to-br from-orange-50 to-red-50 border-orange-100"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {isUpTrend ? (
              <TrendingUp className="w-4 h-4 text-blue-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-orange-500" />
            )}
            <span
              className={`text-xs font-medium ${
                isUpTrend ? "text-blue-600" : "text-orange-600"
              }`}
            >
              Xu hướng
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <p
              className={`text-lg font-bold ${
                isUpTrend ? "text-blue-700" : "text-orange-700"
              }`}
            >
              {isUpTrend ? "+" : ""}
              {trendPercent}%
            </p>
            <span
              className={`text-xs ${
                isUpTrend ? "text-blue-500" : "text-orange-500"
              }`}
            >
              {isUpTrend ? "tăng" : "giảm"}
            </span>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-3 border border-purple-100">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-purple-600 font-medium">
              Giao dịch
            </span>
          </div>
          <p className="text-lg font-bold text-purple-700">
            {totalTransactions}
          </p>
        </div>
      </div>

      {/* Peak Day Highlight */}
      {maxRevenueDay && maxRevenueDay.revenue > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 rounded-xl border border-amber-200">
          <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-xs text-amber-600">Ngày cao điểm</span>
            <p className="text-sm font-bold text-amber-800">
              {maxRevenueDay.label}: {formatCurrency(maxRevenueDay.revenue)} (
              {maxRevenueDay.paymentCount} GD)
            </p>
          </div>
        </div>
      )}

      {/* Bar Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div
          className="flex items-end gap-1 h-40"
          style={{ minHeight: "160px" }}
        >
          {data.map((item, idx) => {
            const heightPercent =
              maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
            const isToday = idx === data.length - 1;
            const hasRevenue = item.revenue > 0;
            const isPeak = item === maxRevenueDay;

            // Determine bar color based on position and value
            let barColorClass = "bg-gray-200";
            if (hasRevenue) {
              if (isPeak) {
                barColorClass =
                  "bg-gradient-to-t from-amber-500 via-yellow-400 to-amber-300";
              } else if (isToday) {
                barColorClass =
                  "bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400";
              } else {
                barColorClass =
                  "bg-gradient-to-t from-blue-400 via-blue-300 to-blue-200";
              }
            }

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center group relative"
                style={{ minWidth: "20px", maxWidth: "50px" }}
              >
                {/* Bar */}
                <div className="flex-1 w-full flex items-end justify-center px-0.5">
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ease-out hover:opacity-80 cursor-pointer ${barColorClass} ${
                      isPeak
                        ? "shadow-lg shadow-amber-300/50"
                        : hasRevenue && isToday
                        ? "shadow-md shadow-blue-300/50"
                        : ""
                    }`}
                    style={{
                      height: hasRevenue
                        ? `${Math.max(heightPercent, 8)}%`
                        : "4px",
                      minHeight: hasRevenue ? "12px" : "4px",
                    }}
                  >
                    {/* Peak indicator */}
                    {isPeak && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                        <span className="text-amber-500 text-lg">👑</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-8 opacity-0 group-hover:opacity-100 transition-all duration-200 z-30 pointer-events-none">
                  <div
                    className={`text-white text-xs rounded-lg px-3 py-2 shadow-xl whitespace-nowrap ${
                      isPeak ? "bg-amber-600" : "bg-gray-800"
                    }`}
                  >
                    <p className="font-bold text-center">{item.label}</p>
                    <p
                      className={`font-bold ${
                        isPeak ? "text-yellow-200" : "text-green-400"
                      }`}
                    >
                      {formatCurrency(item.revenue)}
                    </p>
                    <p className="text-gray-300 text-center">
                      {item.paymentCount} giao dịch
                    </p>
                    <div
                      className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${
                        isPeak ? "bg-amber-600" : "bg-gray-800"
                      }`}
                    ></div>
                  </div>
                </div>

                {/* X Label */}
                <span
                  className={`text-[9px] mt-1.5 ${
                    isPeak
                      ? "text-amber-600 font-bold"
                      : isToday
                      ? "text-blue-600 font-bold"
                      : hasRevenue
                      ? "text-gray-600"
                      : "text-gray-400"
                  }`}
                >
                  {item.label}
                </span>

                {/* Today dot */}
                {isToday && !isPeak && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-0.5 animate-pulse"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-blue-400 to-blue-200"></div>
          <span>Doanh thu</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-amber-500 to-amber-300"></div>
          <span>Ngày cao nhất</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          <span>Hôm nay</span>
        </div>
      </div>
    </div>
  );
}

// Component Top Teacher Card
function TopTeacherCard({ teacher, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Trophy className="h-10 w-10 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">Chưa có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="relative inline-block mb-3">
        {teacher.teacherAvatar ? (
          <img
            src={teacher.teacherAvatar}
            alt={teacher.teacherName}
            className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 shadow-lg"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-2xl border-4 border-amber-300 shadow-lg">
            {teacher.teacherName?.charAt(0)?.toUpperCase() || "T"}
          </div>
        )}
        <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
          <Trophy className="h-4 w-4 text-white" />
        </div>
      </div>
      <h3 className="font-bold text-gray-900 text-lg">{teacher.teacherName}</h3>
      <p className="text-sm text-gray-500 mb-3">{teacher.teacherEmail}</p>
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3">
        <p className="text-xs text-amber-600 font-medium mb-1">
          Tổng doanh thu
        </p>
        <p className="text-xl font-bold text-amber-600">
          {formatCurrency(teacher.totalRevenue)}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="bg-blue-50 rounded-lg p-2">
          <p className="text-xs text-blue-600">{teacher.totalClasses} lớp</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-2">
          <p className="text-xs text-purple-600">
            {teacher.totalStudents} học sinh
          </p>
        </div>
      </div>
    </div>
  );
}

// Component Doanh thu theo môn học
function SubjectRevenueList({ data, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BookOpen className="h-10 w-10 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">Chưa có dữ liệu</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.totalRevenue || 0), 1);

  return (
    <div className="space-y-3">
      {data.slice(0, 5).map((subject, idx) => {
        const percentage =
          maxRevenue > 0 ? (subject.totalRevenue / maxRevenue) * 100 : 0;
        return (
          <div key={subject.subjectId} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">
                  #{idx + 1}
                </span>
                <span className="font-medium text-gray-900 text-sm">
                  {subject.subjectName}
                </span>
              </div>
              <span className="font-semibold text-green-600 text-sm">
                {formatCurrency(subject.totalRevenue)}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>{subject.totalClasses} lớp</span>
              <span>{subject.totalStudents} học sinh</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ReportDashboard() {
  const { error } = useToast();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [teacherRevenue, setTeacherRevenue] = useState([]);
  const [topTeacher, setTopTeacher] = useState(null);
  const [revenueByDay, setRevenueByDay] = useState([]);
  const [subjectRevenue, setSubjectRevenue] = useState([]);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadRevenueByDay();
  }, [days]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overviewRes, teacherRes, topRes, subjectRes, dayRes] =
        await Promise.all([
          reportApi.getOverview(),
          reportApi.getTeacherRevenue(),
          reportApi.getTopTeacher().catch(() => ({ data: null })),
          reportApi.getSubjectRevenue(),
          reportApi.getRevenueByDay(days),
        ]);

      // Debug: Log API responses
      console.log("📊 Report API Responses:", {
        overview: overviewRes.data,
        teacherRevenue: teacherRes.data,
        topTeacher: topRes.data,
        subjectRevenue: subjectRes.data,
        revenueByDay: dayRes.data,
      });

      // Debug: Chi tiết revenueByDay
      console.log("📈 Revenue By Day Details:", dayRes.data);
      const totalDayRevenue = (dayRes.data || []).reduce(
        (sum, d) => sum + (d.revenue || 0),
        0
      );
      console.log("📈 Total revenue in chart period:", totalDayRevenue);

      setOverview(overviewRes.data);
      setTeacherRevenue(teacherRes.data || []);
      setTopTeacher(topRes.data);
      setSubjectRevenue(subjectRes.data || []);
      setRevenueByDay(dayRes.data || []);
    } catch (e) {
      console.error("Report load error:", e);
      error("Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const loadRevenueByDay = async () => {
    try {
      const res = await reportApi.getRevenueByDay(days);
      setRevenueByDay(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Đang tải báo cáo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-blue-600" />
            Báo cáo & Thống kê
          </h1>
          <p className="text-gray-500 mt-1">
            Tổng quan hoạt động và doanh thu hệ thống 360edu
          </p>
        </div>
        <ExportReportButton
          overview={overview}
          teacherRevenue={teacherRevenue}
          subjectRevenue={subjectRevenue}
          revenueByDay={revenueByDay}
        />
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Tổng doanh thu"
          value={formatCurrency(overview?.totalRevenue)}
          subtitle="Đã thanh toán"
          icon={DollarSign}
          color="green"
          size="large"
        />
        <StatCard
          title="Doanh thu tháng này"
          value={formatCurrency(overview?.monthlyRevenue)}
          trend={overview?.monthGrowthPercent >= 0 ? "up" : "down"}
          trendValue={`${
            overview?.monthGrowthPercent >= 0 ? "+" : ""
          }${overview?.monthGrowthPercent?.toFixed(1)}% so với tháng trước`}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Doanh thu tuần này"
          value={formatCurrency(overview?.weeklyRevenue)}
          icon={Calendar}
          color="purple"
        />
        <StatCard
          title="Chờ thanh toán"
          value={formatCurrency(overview?.pendingRevenue)}
          subtitle={`${overview?.pendingPayments || 0} giao dịch`}
          icon={Target}
          color="orange"
        />
      </div>

      {/* Second row stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <StatCard
          title="Học sinh"
          value={formatNumber(overview?.totalStudents)}
          icon={Users}
          color="cyan"
        />
        <StatCard
          title="HS mới tháng này"
          value={formatNumber(overview?.newStudentsThisMonth)}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Giáo viên"
          value={formatNumber(overview?.totalTeachers)}
          icon={GraduationCap}
          color="purple"
        />
        <StatCard
          title="GV đang dạy"
          value={formatNumber(overview?.activeTeachers)}
          icon={GraduationCap}
          color="blue"
        />
        <StatCard
          title="Lớp PUBLIC"
          value={formatNumber(overview?.publicClasses)}
          icon={BookOpen}
          color="green"
        />
        <StatCard
          title="Lớp DRAFT"
          value={formatNumber(overview?.draftClasses)}
          icon={BookOpen}
          color="orange"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Revenue chart + Teacher ranking */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue by day chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Doanh thu theo ngày
                </h2>
                <p className="text-sm text-gray-500">
                  Biểu đồ doanh thu {days} ngày gần nhất
                </p>
              </div>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>7 ngày</option>
                <option value={14}>14 ngày</option>
                <option value={30}>30 ngày</option>
                <option value={60}>60 ngày</option>
              </select>
            </div>
            <RevenueChart data={revenueByDay} loading={false} />
          </div>

          {/* Teacher ranking table */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <div className="mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                Bảng xếp hạng doanh thu giáo viên
              </h2>
              <p className="text-sm text-gray-500">
                Doanh thu mỗi giáo viên đã kiếm về cho 360edu
              </p>
            </div>
            <TeacherRankingTable data={teacherRevenue} loading={false} />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Top Teacher */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <div className="mb-4 text-center">
              <h2 className="font-bold text-gray-900 flex items-center justify-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Giáo viên xuất sắc nhất
              </h2>
              <p className="text-sm text-gray-500">Top 1 doanh thu</p>
            </div>
            <TopTeacherCard teacher={topTeacher} loading={false} />
          </div>

          {/* Subject Revenue */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <div className="mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-600" />
                Doanh thu theo môn học
              </h2>
              <p className="text-sm text-gray-500">
                Top 5 môn có doanh thu cao nhất
              </p>
            </div>
            <SubjectRevenueList data={subjectRevenue} loading={false} />
          </div>

          {/* Payment success rate */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Tỷ lệ thanh toán
            </h2>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg
                  className="w-24 h-24 transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#paymentGradient)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${
                      (overview?.paymentSuccessRate || 0) * 2.51
                    } 251`}
                  />
                  <defs>
                    <linearGradient
                      id="paymentGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-green-600">
                    {overview?.paymentSuccessRate?.toFixed(0) || 0}%
                  </span>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Đã thanh toán</span>
                  <span className="font-semibold text-green-600">
                    {overview?.paidPayments || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Đang chờ</span>
                  <span className="font-semibold text-orange-500">
                    {overview?.pendingPayments || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
