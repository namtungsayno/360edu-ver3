// pages/parent/payment/PaymentHistory.jsx
import { useEffect, useState } from "react";
import {
  Wallet,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Filter,
  User,
  TrendingUp,
  Receipt,
} from "lucide-react";
import { parentApi } from "../../../services/parent/parent.api";

const PaymentHistory = () => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState("all");
  const [payments, setPayments] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all"); // all | completed | pending | failed
  const [filterMonth, setFilterMonth] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    fetchChildren();
    fetchPayments();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [selectedChild, filterStatus, filterMonth]);

  const fetchChildren = async () => {
    try {
      const response = await parentApi.getChildren();
      setChildren(response);
    } catch (error) {
      console.error("Error fetching children:", error);
      setChildren([]);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {
        childId: selectedChild === "all" ? undefined : selectedChild,
        status: filterStatus === "all" ? undefined : filterStatus.toUpperCase(),
      };
      const response = await parentApi.getPaymentHistory(params);
      setPayments(response.payments || []);
      setStats(
        response.stats || {
          total: 0,
          completed: 0,
          pending: 0,
          totalAmount: 0,
        }
      );
    } catch (error) {
      console.error("Error fetching payments:", error);
      setPayments([]);
      setStats({ total: 0, completed: 0, pending: 0, totalAmount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PAID: {
        label: "Đã thanh toán",
        icon: CheckCircle,
        className: "bg-green-100 text-green-800 border-green-300",
        iconClass: "text-green-600",
      },
      PENDING: {
        label: "Đang chờ",
        icon: Clock,
        className: "bg-yellow-100 text-yellow-800 border-yellow-300",
        iconClass: "text-yellow-600",
      },
      FAILED: {
        label: "Thất bại",
        icon: XCircle,
        className: "bg-red-100 text-red-800 border-red-300",
        iconClass: "text-red-600",
      },
      CANCELLED: {
        label: "Đã hủy",
        icon: XCircle,
        className: "bg-gray-100 text-gray-800 border-gray-300",
        iconClass: "text-gray-600",
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}
      >
        <Icon className={`w-4 h-4 ${config.iconClass}`} />
        {config.label}
      </span>
    );
  };

  const getPaymentMethodLabel = (method) => {
    const methodLabels = {
      BANK_TRANSFER: "Chuyển khoản",
      CREDIT_CARD: "Thẻ tín dụng",
      QR_CODE: "QR Code",
      CASH: "Tiền mặt",
    };
    return methodLabels[method] || method;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const downloadReceipt = (paymentId) => {
    // TODO: Implement download receipt functionality
    console.log("Download receipt for payment:", paymentId);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-violet-600 via-violet-700 to-purple-700 text-white">
        <div className="px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border-2 border-white/30">
                <Wallet className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Lịch sử thanh toán</h1>
                <p className="text-violet-200 mt-1">
                  Theo dõi các giao dịch học phí
                </p>
              </div>
            </div>

            {/* Child Filter in Header */}
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 border border-white/20">
                <select
                  value={selectedChild}
                  onChange={(e) => setSelectedChild(e.target.value)}
                  className="bg-transparent text-white border-none focus:outline-none cursor-pointer"
                >
                  <option value="all" className="text-gray-900">
                    Tất cả con
                  </option>
                  {children.map((child) => (
                    <option
                      key={child.id}
                      value={child.id}
                      className="text-gray-900"
                    >
                      {child.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-violet-200">Tổng giao dịch</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-violet-200">Thành công</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-violet-200">Đang chờ</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold">
                    {formatCurrency(stats.totalAmount)}
                  </p>
                  <p className="text-xs text-violet-200">Tổng số tiền</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Status Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterStatus === "all"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterStatus("paid")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterStatus === "paid"
                  ? "bg-green-600 text-white shadow-lg shadow-green-200"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Đã thanh toán
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterStatus === "pending"
                  ? "bg-yellow-500 text-white shadow-lg shadow-yellow-200"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Đang chờ
            </button>
            <button
              onClick={() => setFilterStatus("failed")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterStatus === "failed"
                  ? "bg-red-600 text-white shadow-lg shadow-red-200"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Thất bại
            </button>
          </div>
        </div>

        {/* Payment List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
              Danh sách giao dịch
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>
            </div>
          ) : payments.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Payment Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Wallet className="w-6 h-6 text-violet-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">
                            {payment.className}
                          </h3>
                          <p className="text-sm text-gray-500 mb-3">
                            {payment.description}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="w-4 h-4" />
                              <span>{payment.childName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <CreditCard className="w-4 h-4" />
                              <span>
                                {getPaymentMethodLabel(payment.paymentMethod)}
                              </span>
                            </div>
                            <div className="text-gray-400 text-xs">
                              Mã GD: {payment.transactionId}
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(payment.date).toLocaleString("vi-VN")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Amount and Status */}
                    <div className="flex flex-col items-end gap-3">
                      <p className="text-2xl font-bold text-violet-600">
                        {formatCurrency(payment.amount)}
                      </p>
                      {getStatusBadge(payment.status)}
                      {payment.status === "COMPLETED" && (
                        <button
                          onClick={() => downloadReceipt(payment.id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Tải hóa đơn
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">
                Không có lịch sử thanh toán
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Các giao dịch sẽ xuất hiện ở đây
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
