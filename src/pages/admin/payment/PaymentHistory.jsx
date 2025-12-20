// src/pages/admin/payment/PaymentHistory.jsx
// Admin page để quản lý lịch sử thanh toán

import { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  DollarSign,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Wallet,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { paymentService } from "../../../services/payment/payment.service";
import { useToast } from "../../../hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/Dialog";
import { Button } from "../../../components/ui/Button";

const STATUS_LABELS = {
  PENDING: {
    label: "Chờ thanh toán",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  PAID: {
    label: "Đã thanh toán",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  FAILED: {
    label: "Thất bại",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-gray-100 text-gray-800",
    icon: XCircle,
  },
};

export default function PaymentHistory() {
  const { success, error: showError } = useToast();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    classId: "",
  });
  const [searchInput, setSearchInput] = useState("");

  // Sort state
  const [sortField, setSortField] = useState("createdAt"); // createdAt | paidAt
  const [sortDir, setSortDir] = useState("desc"); // asc | desc

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    paymentId: null,
    studentName: "",
    amount: 0,
    className: "",
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, filters, sortField, sortDir]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, statsRes] = await Promise.all([
        paymentService.listPayments({
          ...filters,
          page,
          size,
          sortBy: sortField,
          sortDir: sortDir,
        }),
        paymentService.getStats(),
      ]);

      setPayments(paymentsRes.content || []);
      setTotalPages(paymentsRes.totalPages || 0);
      setTotalElements(paymentsRes.totalElements || 0);
      setStats(statsRes);
    } catch (e) {
      showError("Không thể tải dữ liệu thanh toán", "Lỗi");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    setFilters((prev) => ({ ...prev, search: searchInput }));
  };

  const handleStatusFilter = (status) => {
    setPage(0);
    setFilters((prev) => ({ ...prev, status: status || "" }));
  };

  // Handle column sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDir((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      // New field, default to desc (newest first)
      setSortField(field);
      setSortDir("desc");
    }
    setPage(0);
  };

  // Render sort icon for column header
  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
    }
    return sortDir === "desc" ? (
      <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
    ) : (
      <ArrowUp className="w-3.5 h-3.5 text-emerald-600" />
    );
  };

  const openConfirmDialog = (payment) => {
    setConfirmDialog({
      open: true,
      paymentId: payment.id,
      studentName: payment.studentName,
      amount: payment.amount,
      className: payment.className,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      paymentId: null,
      studentName: "",
      amount: 0,
      className: "",
    });
  };

  const handleConfirmPayment = async () => {
    if (!confirmDialog.paymentId) return;
    try {
      await paymentService.confirm(confirmDialog.paymentId);
      success(
        "Đã xác nhận thanh toán thành công! Học sinh đã được tự động đăng ký vào lớp."
      );
      closeConfirmDialog();
      loadData();
    } catch (e) {
      showError(e?.displayMessage || "Xác nhận thất bại", "Lỗi");
    }
  };

  const formatCurrency = (amount) => {
    const formatted = new Intl.NumberFormat("vi-VN").format(amount || 0);
    return `${formatted} VND`;
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 min-h-screen">
      {/* ============ HEADER ============ */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-200">
              <Wallet className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý thanh toán
              </h1>
              <p className="text-sm text-gray-500">
                Theo dõi lịch sử thanh toán học phí trong hệ thống
              </p>
            </div>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
        </div>
      </div>

      {/* ============ STATS CARDS ============ */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Tổng đã thu</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(stats.totalPaidAmount)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">
                  Chờ thanh toán
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.pendingCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">
                  Đã thanh toán
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.paidCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">
                  Tổng giao dịch
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.totalCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
          </div>
        </div>
      )}

      {/* ============ TOOLBAR ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên học sinh, tên lớp..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ thanh toán</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>

          <button
            onClick={handleSearch}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* ============ DATA TABLE ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Học sinh
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Lớp học
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Số tiền
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Nội dung chuyển khoản
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Trạng thái
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Thời gian tạo</span>
                    {renderSortIcon("createdAt")}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort("paidAt")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Thời gian TT</span>
                    {renderSortIcon("paidAt")}
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                      <p className="mt-2">Đang tải...</p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && payments.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    Không có dữ liệu thanh toán
                  </td>
                </tr>
              )}
              {!loading &&
                payments.length > 0 &&
                payments.map((p) => {
                  const statusInfo =
                    STATUS_LABELS[p.status] || STATUS_LABELS.PENDING;
                  const StatusIcon = statusInfo.icon;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {p.studentName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {p.studentEmail}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {p.className}
                          </p>
                          <p className="text-sm text-gray-500">
                            {p.teacherName} - {p.subjectName}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-emerald-600">
                          {formatCurrency(p.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p
                          className="text-sm text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded break-all"
                        >
                          {p.content}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDateTime(p.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDateTime(p.paidAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {p.status === "PENDING" && (
                            <button
                              onClick={() => openConfirmDialog(p)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Xác nhận đã thanh toán"
                            >
                              <CheckSquare className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <p className="text-sm text-gray-600">
              Trang {page + 1} / {Math.max(1, totalPages)} — Tổng{" "}
              {totalElements} bản ghi
            </p>
            <div className="flex items-center gap-4">
              {/* Size selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Số bản ghi / trang:
                </span>
                <select
                  value={size}
                  onChange={(e) => {
                    setSize(Number(e.target.value));
                    setPage(0);
                  }}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              {/* Page navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-sm">
                  {page + 1} / {Math.max(1, totalPages)}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page >= totalPages - 1}
                  className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Payment Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={closeConfirmDialog}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <DialogTitle>Xác nhận thanh toán</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                Kiểm tra kỹ trước khi xác nhận
              </p>
            </div>
          </div>
        </DialogHeader>

        <DialogContent>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Học sinh:</span>
                <span className="font-medium text-gray-900">
                  {confirmDialog.studentName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lớp học:</span>
                <span className="font-medium text-gray-900">
                  {confirmDialog.className}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-bold text-lg text-green-600">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(confirmDialog.amount || 0)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Sau khi xác nhận, học sinh sẽ được{" "}
                <strong>tự động đăng ký</strong> vào lớp học này.
              </p>
            </div>
          </div>
        </DialogContent>

        <DialogFooter>
          <Button variant="outline" onClick={closeConfirmDialog}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleConfirmPayment}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Xác nhận thanh toán
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
