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

// Helper: Lấy ngày theo múi giờ Việt Nam (UTC+7)
const getVietnamDate = (date = new Date()) => {
  const d = new Date(date);
  // Chuyển sang múi giờ Việt Nam
  const vietnamOffset = 7 * 60; // UTC+7 in minutes
  const localOffset = d.getTimezoneOffset();
  const vietnamTime = new Date(d.getTime() + (vietnamOffset + localOffset) * 60 * 1000);
  return vietnamTime;
};

// Helper: Format date sang YYYY-MM-DD theo múi giờ Việt Nam
const formatDateToYMD = (date = new Date()) => {
  const d = getVietnamDate(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  link.download = `${filename}_${formatDateToYMD()}.xls`;
  link.click();
  URL.revokeObjectURL(link.href);
};

// Hàm xuất HTML report (có thể in/save as PDF) - Phiên bản chuyên nghiệp
const exportToHTML = (reportData, filename, startDate, endDate) => {
  const { overview, teacherRevenue, subjectRevenue, revenueByDay } = reportData;
  
  // Chuẩn hóa ngày để so sánh (bỏ phần time)
  const normalizeDate = (d) => {
    const date = new Date(d);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  };
  
  const startTime = normalizeDate(startDate);
  const endTime = normalizeDate(endDate);
  
  // Lọc dữ liệu theo khoảng thời gian được chọn
  const filteredRevenueByDay = (revenueByDay || []).filter(item => {
    if (!item.date) return false;
    const itemTime = normalizeDate(item.date);
    return itemTime >= startTime && itemTime <= endTime;
  });
  
  // Tính tổng doanh thu trong khoảng thời gian
  const periodRevenue = filteredRevenueByDay.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const periodPayments = filteredRevenueByDay.reduce((sum, item) => sum + (item.paymentCount || 0), 0);
  
  // Tính tổng doanh thu giáo viên và môn học (đã được lọc theo thời gian từ API)
  const teacherTotalRevenue = (teacherRevenue || []).reduce((sum, t) => sum + (t.totalRevenue || 0), 0);
  const subjectTotalRevenue = (subjectRevenue || []).reduce((sum, s) => sum + (s.totalRevenue || 0), 0);
  
  // Sử dụng dữ liệu đã tính hoặc từ overview
  const pendingRevenue = overview?.pendingRevenue || 0;
  const pendingPayments = overview?.pendingPayments || 0;
  
  // Tính max revenue cho biểu đồ bar
  const maxTeacherRevenue = Math.max(...(teacherRevenue || []).map(t => t.totalRevenue || 0), 1);
  
  // Format ngày cho báo cáo
  const formatDate = (date) => date.toLocaleDateString("vi-VN");
  const reportPeriod = `Từ ${formatDate(startDate)} đến ${formatDate(endDate)}`;
  
  // Tính số ngày trong khoảng
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  const avgDailyRevenue = daysDiff > 0 ? Math.round(periodRevenue / daysDiff) : 0;

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Báo Cáo Doanh Thu - 360edu</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      background: #f5f7fa; 
      color: #2c3e50;
      line-height: 1.6;
    }
    .container { 
      max-width: 1200px; 
      margin: 0 auto; 
      padding: 30px;
    }
    
    /* HEADER */
    .report-header {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: white;
      padding: 40px;
      border-radius: 20px;
      margin-bottom: 30px;
      box-shadow: 0 10px 40px rgba(59, 130, 246, 0.3);
    }
    .company-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
    }
    .company-name {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .company-details {
      font-size: 13px;
      opacity: 0.9;
      text-align: right;
    }
    .report-title {
      text-align: center;
      padding: 20px 0;
    }
    .report-title h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .report-period {
      font-size: 16px;
      opacity: 0.9;
      background: rgba(255,255,255,0.15);
      padding: 8px 20px;
      border-radius: 30px;
      display: inline-block;
    }
    
    /* STATS CARDS */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 25px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      border-left: 4px solid;
      transition: transform 0.2s;
    }
    .stat-card:hover { transform: translateY(-2px); }
    .stat-card.blue { border-color: #3b82f6; }
    .stat-card.green { border-color: #10b981; }
    .stat-card.orange { border-color: #f59e0b; }
    .stat-card.purple { border-color: #8b5cf6; }
    .stat-label {
      font-size: 13px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
    }
    .stat-value.green { color: #10b981; }
    .stat-value.orange { color: #f59e0b; }
    .stat-change {
      font-size: 12px;
      margin-top: 8px;
      color: #64748b;
    }
    
    /* CHARTS SECTION */
    .charts-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 25px;
      margin-bottom: 30px;
    }
    .chart-card {
      background: white;
      border-radius: 16px;
      padding: 25px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }
    .chart-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
    }
    
    /* BAR CHART */
    .bar-chart { padding: 10px 0; }
    .bar-item {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
    }
    .bar-label {
      width: 150px;
      font-size: 13px;
      color: #475569;
      flex-shrink: 0;
    }
    .bar-track {
      flex: 1;
      height: 28px;
      background: #f1f5f9;
      border-radius: 6px;
      overflow: hidden;
      margin: 0 15px;
    }
    .bar-fill {
      height: 100%;
      border-radius: 6px;
      display: flex;
      align-items: center;
      padding-left: 10px;
      font-size: 12px;
      font-weight: 600;
      color: white;
      transition: width 0.5s ease;
    }
    .bar-fill.blue { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
    .bar-fill.green { background: linear-gradient(90deg, #10b981, #34d399); }
    .bar-fill.orange { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    .bar-fill.purple { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
    .bar-fill.pink { background: linear-gradient(90deg, #ec4899, #f472b6); }
    .bar-value {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
      width: 120px;
      text-align: right;
    }
    
    /* TABLES */
    .table-section {
      background: white;
      border-radius: 16px;
      padding: 25px;
      margin-bottom: 25px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }
    .section-badge {
      background: #dbeafe;
      color: #1d4ed8;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      background: #f8fafc;
      padding: 14px 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e2e8f0;
    }
    td {
      padding: 14px 12px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
      color: #334155;
    }
    tr:hover td { background: #f8fafc; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-bold { font-weight: 600; }
    .text-green { color: #10b981; }
    .text-orange { color: #f59e0b; }
    .text-blue { color: #3b82f6; }
    .rank-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 12px;
    }
    .rank-1 { background: #fef3c7; color: #d97706; }
    .rank-2 { background: #e2e8f0; color: #475569; }
    .rank-3 { background: #fed7aa; color: #c2410c; }
    .rank-default { background: #f1f5f9; color: #64748b; }
    .total-row td {
      background: #f8fafc;
      font-weight: 600;
      border-top: 2px solid #e2e8f0;
    }
    
    /* SUMMARY & NOTES */
    .summary-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 25px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: white;
      border-radius: 16px;
      padding: 25px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }
    .summary-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 15px;
    }
    .summary-text {
      font-size: 14px;
      color: #64748b;
      line-height: 1.7;
    }
    .highlight { 
      background: #fef3c7; 
      padding: 2px 6px; 
      border-radius: 4px;
      font-weight: 600;
      color: #92400e;
    }
    
    /* FOOTER */
    .report-footer {
      background: white;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }
    .footer-date {
      text-align: center;
      font-size: 14px;
      color: #64748b;
      margin-bottom: 30px;
    }
    .signatures {
      display: flex;
      justify-content: space-around;
    }
    .signature-box {
      text-align: center;
      min-width: 200px;
    }
    .signature-title {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 60px;
    }
    .signature-line {
      border-top: 1px solid #cbd5e1;
      padding-top: 10px;
      font-size: 13px;
      color: #64748b;
    }
    .copyright {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #94a3b8;
    }
    
    /* PRINT STYLES */
    @media print {
      body { background: white; }
      .container { padding: 0; max-width: none; }
      .chart-card, .table-section, .summary-card, .report-footer { 
        box-shadow: none; 
        break-inside: avoid;
      }
      .report-header { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- HEADER -->
    <div class="report-header">
      <div class="company-info">
        <div>
          <div class="company-name">🎓 360EDU</div>
          <div style="opacity: 0.8; margin-top: 5px;">Hệ thống Quản lý Giáo dục Trực tuyến</div>
        </div>
        <div class="company-details">
          <div>Ngày xuất báo cáo: ${getVietnamDate().toLocaleDateString("vi-VN")}</div>
          <div>Người lập: Quản trị viên</div>
        </div>
      </div>
      <div class="report-title">
        <h1>📊 Báo Cáo Doanh Thu</h1>
        <div class="report-period">${reportPeriod}</div>
      </div>
    </div>
    
    <!-- STATS CARDS -->
    <div class="stats-row">
      <div class="stat-card green">
        <div class="stat-label">Doanh Thu Kỳ Báo Cáo</div>
        <div class="stat-value green">${formatCurrency(periodRevenue)}</div>
        <div class="stat-change">${daysDiff} ngày (${formatDate(startDate)} - ${formatDate(endDate)})</div>
      </div>
      <div class="stat-card blue">
        <div class="stat-label">Doanh Thu Trung Bình/Ngày</div>
        <div class="stat-value">${formatCurrency(avgDailyRevenue)}</div>
        <div class="stat-change">${periodPayments} giao dịch trong kỳ</div>
      </div>
      <div class="stat-card orange">
        <div class="stat-label">Chờ Thanh Toán</div>
        <div class="stat-value orange">${formatCurrency(pendingRevenue)}</div>
        <div class="stat-change">${pendingPayments} đơn chờ xử lý</div>
      </div>
    </div>
    
    <!-- CHARTS ROW -->
    <div class="charts-row" style="grid-template-columns: 1fr;">
      <!-- Bar Chart: Doanh thu theo Giáo viên -->
      <div class="chart-card">
        <div class="chart-title">📈 Doanh Thu Theo Giáo Viên (Top 5) <span style="font-size: 11px; color: #10b981; font-weight: 400;">[Trong kỳ báo cáo]</span></div>
        <div class="bar-chart">
          ${(teacherRevenue || []).slice(0, 5).map((t, idx) => {
            const percent = Math.round((t.totalRevenue / maxTeacherRevenue) * 100);
            const colors = ['blue', 'green', 'orange', 'purple', 'pink'];
            return `
              <div class="bar-item">
                <div class="bar-label">${t.teacherName}</div>
                <div class="bar-track">
                  <div class="bar-fill ${colors[idx]}" style="width: ${percent}%"></div>
                </div>
                <div class="bar-value">${formatCurrency(t.totalRevenue)}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
    
    <!-- TABLE: Doanh thu theo Môn học -->
    <div class="table-section">
      <div class="section-header">
        <div class="section-title">📚 Doanh Thu Theo Môn Học <span style="font-size: 12px; color: #10b981; font-weight: 400;">[Trong kỳ báo cáo]</span></div>
        <div class="section-badge">${(subjectRevenue || []).length} môn học</div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 60px;">STT</th>
            <th>Môn Học</th>
            <th class="text-center">Số Lớp</th>
            <th class="text-center">Học Sinh</th>
            <th class="text-right">Doanh Thu</th>
            <th class="text-right">Tỷ Trọng</th>
          </tr>
        </thead>
        <tbody>
          ${(subjectRevenue || []).map((s, idx) => {
            const percentage = subjectTotalRevenue > 0 ? ((s.totalRevenue / subjectTotalRevenue) * 100).toFixed(1) : 0;
            const rankClass = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : 'rank-default';
            return `
              <tr>
                <td><span class="rank-badge ${rankClass}">${idx + 1}</span></td>
                <td class="font-bold">${s.subjectName}</td>
                <td class="text-center text-blue font-bold">${s.totalClasses}</td>
                <td class="text-center">${s.totalStudents}</td>
                <td class="text-right text-green font-bold">${formatCurrency(s.totalRevenue)}</td>
                <td class="text-right">${percentage}%</td>
              </tr>
            `;
          }).join('')}
          <tr class="total-row">
            <td colspan="2">TỔNG CỘNG KỲ BÁO CÁO</td>
            <td class="text-center">${(subjectRevenue || []).reduce((sum, s) => sum + (s.totalClasses || 0), 0)}</td>
            <td class="text-center">${(subjectRevenue || []).reduce((sum, s) => sum + (s.totalStudents || 0), 0)}</td>
            <td class="text-right text-green font-bold">${formatCurrency(subjectTotalRevenue)}</td>
            <td class="text-right">100%</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- TABLE: Doanh thu theo Ngày trong kỳ -->
    <div class="table-section">
      <div class="section-header">
        <div class="section-title">📅 Doanh Thu Theo Ngày (Trong Kỳ Báo Cáo)</div>
        <div class="section-badge">${filteredRevenueByDay.length} ngày</div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 60px;">STT</th>
            <th>Ngày</th>
            <th class="text-center">Số Giao Dịch</th>
            <th class="text-right">Doanh Thu</th>
            <th class="text-right">Tỷ Trọng</th>
          </tr>
        </thead>
        <tbody>
          ${filteredRevenueByDay.map((d, idx) => {
            const percentage = periodRevenue > 0 ? ((d.revenue / periodRevenue) * 100).toFixed(1) : 0;
            const dateStr = d.date ? new Date(d.date).toLocaleDateString("vi-VN") : d.label;
            return `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td class="font-bold">${dateStr}</td>
                <td class="text-center">${d.paymentCount || 0}</td>
                <td class="text-right text-green font-bold">${formatCurrency(d.revenue)}</td>
                <td class="text-right">${percentage}%</td>
              </tr>
            `;
          }).join('')}
          <tr class="total-row">
            <td colspan="2">TỔNG CỘNG KỲ BÁO CÁO</td>
            <td class="text-center font-bold">${periodPayments}</td>
            <td class="text-right text-green font-bold">${formatCurrency(periodRevenue)}</td>
            <td class="text-right">100%</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- TABLE: Doanh thu theo Giáo viên (chi tiết) -->
    <div class="table-section">
      <div class="section-header">
        <div class="section-title">👨‍🏫 Chi Tiết Doanh Thu Giáo Viên <span style="font-size: 12px; color: #10b981; font-weight: 400;">[Trong kỳ báo cáo]</span></div>
        <div class="section-badge">${(teacherRevenue || []).length} giáo viên</div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 60px;">Hạng</th>
            <th>Giáo Viên</th>
            <th>Email</th>
            <th class="text-center">Số Lớp</th>
            <th class="text-center">Học Sinh</th>
            <th class="text-right">Doanh Thu</th>
            <th class="text-right">Chờ TT</th>
          </tr>
        </thead>
        <tbody>
          ${(teacherRevenue || []).map((t, idx) => {
            const rankClass = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : 'rank-default';
            return `
              <tr>
                <td><span class="rank-badge ${rankClass}">${idx + 1}</span></td>
                <td class="font-bold">${t.teacherName}</td>
                <td style="color: #64748b; font-size: 13px;">${t.teacherEmail}</td>
                <td class="text-center text-blue font-bold">${t.totalClasses}</td>
                <td class="text-center">${t.totalStudents}</td>
                <td class="text-right text-green font-bold">${formatCurrency(t.totalRevenue)}</td>
                <td class="text-right text-orange">${formatCurrency(t.pendingRevenue)}</td>
              </tr>
            `;
          }).join('')}
          <tr class="total-row">
            <td colspan="3">TỔNG CỘNG KỲ BÁO CÁO</td>
            <td class="text-center">${(teacherRevenue || []).reduce((sum, t) => sum + (t.totalClasses || 0), 0)}</td>
            <td class="text-center">${(teacherRevenue || []).reduce((sum, t) => sum + (t.totalStudents || 0), 0)}</td>
            <td class="text-right text-green font-bold">${formatCurrency(teacherTotalRevenue)}</td>
            <td class="text-right text-orange">${formatCurrency((teacherRevenue || []).reduce((sum, t) => sum + (t.pendingRevenue || 0), 0))}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- SUMMARY & NOTES -->
    <div class="summary-section">
      <div class="summary-card">
        <div class="summary-title">📋 Tổng Kết Kỳ Báo Cáo</div>
        <div class="summary-text">
          Trong kỳ báo cáo từ <span class="highlight">${formatDate(startDate)}</span> đến <span class="highlight">${formatDate(endDate)}</span> (${daysDiff} ngày),
          hệ thống đã ghi nhận doanh thu <span class="highlight">${formatCurrency(periodRevenue)}</span> với ${periodPayments} giao dịch.
          Trung bình mỗi ngày đạt <span class="highlight">${formatCurrency(avgDailyRevenue)}</span>.
          <br/><br/>
          <em style="color: #64748b; font-size: 12px;">* Tất cả số liệu doanh thu trong báo cáo này đều được lọc theo kỳ báo cáo đã chọn.</em>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-title">💡 Nhận Xét</div>
        <div class="summary-text">
          ${teacherRevenue && teacherRevenue[0] ? `Giáo viên <strong>${teacherRevenue[0].teacherName}</strong> đứng đầu về doanh thu với ${formatCurrency(teacherRevenue[0].totalRevenue)}.` : ''}
          ${subjectRevenue && subjectRevenue[0] ? ` Môn <strong>${subjectRevenue[0].subjectName}</strong> có doanh thu cao nhất.` : ''}
          ${pendingPayments > 0 ? ` Cần xử lý <strong>${pendingPayments} đơn</strong> đang chờ thanh toán với tổng giá trị <strong>${formatCurrency(pendingRevenue)}</strong>.` : ' Tất cả đơn hàng đã được thanh toán.'}
        </div>
      </div>
    </div>
    
    <!-- FOOTER -->
    <div class="report-footer">
      <div class="footer-date">
        Ngày ${endDate.getDate()} tháng ${endDate.getMonth() + 1} năm ${endDate.getFullYear()}
      </div>
      <div class="signatures">
        <div class="signature-box">
          <div class="signature-title">NGƯỜI LẬP BIỂU</div>
          <div class="signature-line">(Ký, họ tên)</div>
        </div>
        <div class="signature-box">
          <div class="signature-title">QUẢN TRỊ VIÊN</div>
          <div class="signature-line">(Ký, họ tên)</div>
        </div>
        <div class="signature-box">
          <div class="signature-title">GIÁM ĐỐC</div>
          <div class="signature-line">(Ký, đóng dấu)</div>
        </div>
      </div>
      <div class="copyright">
        © ${getVietnamDate().getFullYear()} 360edu - Hệ thống Quản lý Giáo dục Trực tuyến | Báo cáo được tạo tự động
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${formatDateToYMD()}.html`;
  link.click();
  URL.revokeObjectURL(link.href);
};

// Component nút xuất báo cáo với Modal chọn ngày
function ExportReportButton({
  overview,
  teacherRevenue,
  subjectRevenue,
  revenueByDay,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [exporting, setExporting] = useState(null);
  const { success, error } = useToast();
  const menuRef = useRef(null);
  
  // State cho date picker - mặc định là tháng hiện tại (theo giờ Việt Nam)
  const todayVN = getVietnamDate();
  const todayStr = formatDateToYMD();
  const defaultStartDate = new Date(todayVN.getFullYear(), todayVN.getMonth(), 1);
  const [startDate, setStartDate] = useState(formatDateToYMD(defaultStartDate));
  const [endDate, setEndDate] = useState(todayStr);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mở modal chọn ngày cho báo cáo đầy đủ
  const handleSelectReport = (type) => {
    if (type === "full-html") {
      setSelectedType(type);
      setShowModal(true);
      setIsOpen(false);
    } else {
      handleExport(type);
    }
  };

  // Xuất báo cáo đầy đủ với date range - GỌI API MỚI ĐỂ LỌC THEO THỜI GIAN
  const handleExportWithDateRange = async () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      error("Ngày bắt đầu phải nhỏ hơn ngày kết thúc!");
      return;
    }
    
    setExporting("full-html");
    try {
      // Gọi API để lấy dữ liệu theo date range
      const [teacherRes, subjectRes] = await Promise.all([
        reportApi.getTeacherRevenueBetween(startDate, endDate),
        reportApi.getSubjectRevenueBetween(startDate, endDate),
      ]);
      
      const filteredTeacherRevenue = teacherRes.data || [];
      const filteredSubjectRevenue = subjectRes.data || [];
      
      exportToHTML(
        { 
          overview, 
          teacherRevenue: filteredTeacherRevenue, 
          subjectRevenue: filteredSubjectRevenue, 
          revenueByDay 
        },
        "360edu_baocao",
        start,
        end
      );
      success("Xuất báo cáo thành công! Mở file HTML và in ra PDF nếu cần.");
      setShowModal(false);
    } catch (e) {
      console.error("Export error:", e);
      error("Có lỗi khi xuất báo cáo. Vui lòng thử lại.");
    } finally {
      setExporting(null);
    }
  };

  // Các preset thời gian nhanh (theo múi giờ Việt Nam)
  const datePresets = [
    { label: "Hôm nay", getValue: () => {
      const t = formatDateToYMD();
      return { start: t, end: t };
    }},
    { label: "7 ngày qua", getValue: () => {
      const t = getVietnamDate();
      const s = new Date(t.getTime() - 6 * 24 * 60 * 60 * 1000); // 7 ngày bao gồm hôm nay
      return { start: formatDateToYMD(s), end: formatDateToYMD(t) };
    }},
    { label: "30 ngày qua", getValue: () => {
      const t = getVietnamDate();
      const s = new Date(t.getTime() - 29 * 24 * 60 * 60 * 1000); // 30 ngày bao gồm hôm nay
      return { start: formatDateToYMD(s), end: formatDateToYMD(t) };
    }},
    { label: "Tháng này", getValue: () => {
      const t = getVietnamDate();
      const s = new Date(t.getFullYear(), t.getMonth(), 1);
      return { start: formatDateToYMD(s), end: formatDateToYMD(t) };
    }},
    { label: "Tháng trước", getValue: () => {
      const t = getVietnamDate();
      const s = new Date(t.getFullYear(), t.getMonth() - 1, 1);
      const e = new Date(t.getFullYear(), t.getMonth(), 0);
      return { start: formatDateToYMD(s), end: formatDateToYMD(e) };
    }},
    { label: "Quý này", getValue: () => {
      const t = new Date();
      const quarter = Math.floor(t.getMonth() / 3);
      const s = new Date(t.getFullYear(), quarter * 3, 1);
      return { start: s.toISOString().split('T')[0], end: t.toISOString().split('T')[0] };
    }},
  ];

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

        default:
          break;
      }
    } catch (e) {
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
      label: "📊 BÁO CÁO ĐẦY ĐỦ",
      desc: "Chọn khoảng thời gian để xuất",
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      featured: true,
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
    <>
      {/* Modal chọn ngày */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">📊 Xuất Báo Cáo Đầy Đủ</h3>
                  <p className="text-blue-100 text-sm">Chọn khoảng thời gian báo cáo</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {/* Preset buttons */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn nhanh:
                </label>
                <div className="flex flex-wrap gap-2">
                  {datePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const { start, end } = preset.getValue();
                        setStartDate(start);
                        setEndDate(end);
                      }}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Date inputs */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    max={todayStr}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    max={todayStr}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Preview info */}
              <div className="bg-blue-50 rounded-lg p-3 mb-6">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Kỳ báo cáo:</span>{" "}
                  {new Date(startDate).toLocaleDateString("vi-VN")} - {new Date(endDate).toLocaleDateString("vi-VN")}
                  <span className="text-blue-600 ml-2">
                    ({Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1} ngày)
                  </span>
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleExportWithDateRange}
                  disabled={exporting === "full-html"}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {exporting === "full-html" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang xuất...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Xuất báo cáo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Button và Dropdown */}
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
                  onClick={() => handleSelectReport(option.id)}
                  disabled={exporting === option.id}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left group disabled:opacity-50 ${
                    option.featured 
                      ? "bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 border border-rose-200 mb-2" 
                      : "hover:bg-gray-50"
                  }`}
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
                    <p className={`font-medium text-sm ${option.featured ? "text-rose-700" : "text-gray-900"}`}>
                      {option.label}
                    </p>
                    <p className="text-xs text-gray-400">{option.desc}</p>
                  </div>
                  {option.featured && (
                    <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Chọn ngày
                    </span>
                  )}
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
    </>
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

// Component biểu đồ doanh thu theo ngày/tháng/năm - Modern Bar Chart với trend indicators
function RevenueChart({ data, loading, filterMode = "day" }) {
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

  // Tìm item có doanh thu cao nhất
  const maxRevenueItem = data.reduce(
    (max, d) => (d.revenue > (max?.revenue || 0) ? d : max),
    null
  );

  // Label cho peak
  const peakLabel =
    filterMode === "day"
      ? "Ngày cao điểm"
      : filterMode === "month"
      ? "Tháng cao điểm"
      : "Năm cao điểm";

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

      {/* Peak Highlight */}
      {maxRevenueItem && maxRevenueItem.revenue > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 rounded-xl border border-amber-200">
          <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-xs text-amber-600">{peakLabel}</span>
            <p className="text-sm font-bold text-amber-800">
              {maxRevenueItem.label}: {formatCurrency(maxRevenueItem.revenue)} (
              {maxRevenueItem.paymentCount} GD)
            </p>
          </div>
        </div>
      )}

      {/* Bar Chart - Responsive */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 overflow-x-auto">
        <div
          className="flex items-end gap-1 h-40"
          style={{
            minHeight: "160px",
            minWidth: data.length > 15 ? `${data.length * 35}px` : "100%",
          }}
        >
          {data.map((item, idx) => {
            const heightPercent =
              maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
            const isLast = idx === data.length - 1;
            const hasRevenue = item.revenue > 0;
            const isPeak = item === maxRevenueItem;

            // Determine bar color based on position and value
            let barColorClass = "bg-gray-200";
            if (hasRevenue) {
              if (isPeak) {
                barColorClass =
                  "bg-gradient-to-t from-amber-500 via-yellow-400 to-amber-300";
              } else if (isLast) {
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
                style={{
                  minWidth: filterMode === "day" ? "28px" : "50px",
                  maxWidth: filterMode === "year" ? "100px" : "60px",
                }}
              >
                {/* Bar */}
                <div className="flex-1 w-full flex items-end justify-center px-0.5">
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ease-out hover:opacity-80 cursor-pointer ${barColorClass} ${
                      isPeak
                        ? "shadow-lg shadow-amber-300/50"
                        : hasRevenue && isLast
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
                  className={`text-[10px] mt-1.5 font-medium ${
                    isPeak
                      ? "text-amber-600 font-bold"
                      : isLast
                      ? "text-blue-600 font-bold"
                      : hasRevenue
                      ? "text-gray-600"
                      : "text-gray-400"
                  }`}
                >
                  {item.label}
                </span>

                {/* Current indicator */}
                {isLast && !isPeak && (
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
          <span>
            {filterMode === "day"
              ? "Ngày"
              : filterMode === "month"
              ? "Tháng"
              : "Năm"}{" "}
            cao nhất
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          <span>Hiện tại</span>
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

  // Filter mode: "day" | "month" | "year"
  const [filterMode, setFilterMode] = useState("day");
  const [filterValue, setFilterValue] = useState(30); // 7, 14, 30 for day; 3, 6, 12 for month; 5 for year

  // Calculate days to fetch based on filter mode and value
  const daysToFetch = useMemo(() => {
    if (filterMode === "day") return filterValue;
    if (filterMode === "month") return filterValue * 31; // Approximate
    if (filterMode === "year") return filterValue * 365;
    return 30;
  }, [filterMode, filterValue]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadRevenueByDay();
  }, [daysToFetch]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overviewRes, teacherRes, topRes, subjectRes, dayRes] =
        await Promise.all([
          reportApi.getOverview(),
          reportApi.getTeacherRevenue(),
          reportApi.getTopTeacher().catch(() => ({ data: null })),
          reportApi.getSubjectRevenue(),
          reportApi.getRevenueByDay(daysToFetch),
        ]);

      const totalDayRevenue = (dayRes.data || []).reduce(
        (sum, d) => sum + (d.revenue || 0),
        0
      );
      setOverview(overviewRes.data);
      setTeacherRevenue(teacherRes.data || []);
      setTopTeacher(topRes.data);
      setSubjectRevenue(subjectRes.data || []);
      setRevenueByDay(dayRes.data || []);
    } catch (e) {
      error("Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const loadRevenueByDay = async () => {
    try {
      const res = await reportApi.getRevenueByDay(daysToFetch);
      setRevenueByDay(res.data || []);
    } catch (e) {}
  };

  // Aggregate data based on filter mode
  const chartData = useMemo(() => {
    if (!revenueByDay || revenueByDay.length === 0) return [];

    if (filterMode === "day") {
      // Return raw data for day view (limit to filterValue)
      return revenueByDay.slice(-filterValue);
    }

    if (filterMode === "month") {
      // Aggregate by month - cần sort theo thứ tự thời gian
      const now = new Date();
      const currentMonth = now.getMonth(); // 0-11
      const currentYear = now.getFullYear();

      // Tạo danh sách các tháng cần hiển thị (từ cũ đến mới)
      const monthsToShow = [];
      for (let i = filterValue - 1; i >= 0; i--) {
        const targetDate = new Date(currentYear, currentMonth - i, 1);
        const month = targetDate.getMonth() + 1; // 1-12
        const year = targetDate.getFullYear();
        monthsToShow.push({
          key: `${year}-${String(month).padStart(2, "0")}`,
          label: `T${month}`,
          month,
          year,
          revenue: 0,
          paymentCount: 0,
        });
      }

      // Map revenue data vào các tháng
      revenueByDay.forEach((item) => {
        // Parse date from label (format: "DD/MM")
        const parts = item.label?.split("/");
        if (parts && parts.length >= 2) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]);

          // Xác định năm dựa trên logic: nếu tháng > tháng hiện tại thì là năm trước
          let year = currentYear;
          if (month > currentMonth + 1) {
            year = currentYear - 1;
          }

          const key = `${year}-${String(month).padStart(2, "0")}`;
          const monthData = monthsToShow.find((m) => m.key === key);
          if (monthData) {
            monthData.revenue += item.revenue || 0;
            monthData.paymentCount += item.paymentCount || 0;
          }
        }
      });

      return monthsToShow.map(({ label, revenue, paymentCount }) => ({
        label,
        revenue,
        paymentCount,
      }));
    }

    if (filterMode === "year") {
      // Aggregate by year
      const yearMap = new Map();
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      // Initialize last N years
      for (let i = filterValue - 1; i >= 0; i--) {
        const y = currentYear - i;
        yearMap.set(y, { label: String(y), revenue: 0, paymentCount: 0 });
      }

      revenueByDay.forEach((item) => {
        const parts = item.label?.split("/");
        if (parts && parts.length >= 2) {
          const month = parseInt(parts[1]);
          // Xác định năm
          let year = currentYear;
          if (month > currentMonth) {
            year = currentYear - 1;
          }

          if (yearMap.has(year)) {
            const y = yearMap.get(year);
            y.revenue += item.revenue || 0;
            y.paymentCount += item.paymentCount || 0;
          }
        }
      });
      return Array.from(yearMap.values());
    }

    return revenueByDay;
  }, [revenueByDay, filterMode, filterValue]);

  // Get filter description
  const filterDescription = useMemo(() => {
    if (filterMode === "day") return `${filterValue} ngày gần nhất`;
    if (filterMode === "month") return `${filterValue} tháng gần nhất`;
    if (filterMode === "year") return `${filterValue} năm gần nhất`;
    return "";
  }, [filterMode, filterValue]);

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
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-200">
            <BarChart3 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Báo cáo & Thống kê
            </h1>
            <p className="text-sm text-gray-500">
              Tổng quan hoạt động và doanh thu hệ thống 360edu
            </p>
          </div>
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
          {/* Revenue by day/month/year chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Doanh thu theo thời gian
                </h2>
                <p className="text-sm text-gray-500">
                  Biểu đồ doanh thu {filterDescription}
                </p>
              </div>

              {/* Filter Controls */}
              <div className="flex items-center gap-2">
                {/* Mode Tabs */}
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => {
                      setFilterMode("day");
                      setFilterValue(30);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      filterMode === "day"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Ngày
                  </button>
                  <button
                    onClick={() => {
                      setFilterMode("month");
                      setFilterValue(6);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      filterMode === "month"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Tháng
                  </button>
                  <button
                    onClick={() => {
                      setFilterMode("year");
                      setFilterValue(5);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      filterMode === "year"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Năm
                  </button>
                </div>

                {/* Value Select */}
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(Number(e.target.value))}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[100px]"
                >
                  {filterMode === "day" && (
                    <>
                      <option value={7}>7 ngày</option>
                      <option value={14}>14 ngày</option>
                      <option value={30}>30 ngày</option>
                    </>
                  )}
                  {filterMode === "month" && (
                    <>
                      <option value={3}>3 tháng</option>
                      <option value={6}>6 tháng</option>
                      <option value={12}>12 tháng</option>
                    </>
                  )}
                  {filterMode === "year" && (
                    <>
                      <option value={3}>3 năm</option>
                      <option value={5}>5 năm</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            <RevenueChart
              data={chartData}
              loading={false}
              filterMode={filterMode}
            />
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
