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
} from "lucide-react";
import PageTitle from "../../../components/common/PageTitle";
import { Card } from "../../../components/ui/Card";
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
    <div className="container mx-auto px-4 py-8">
      <PageTitle
        title="Lịch sử thanh toán"
        subtitle="Theo dõi lịch sử thanh toán học phí"
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Tổng giao dịch</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Thành công</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Đang chờ</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Tổng số tiền</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(stats.totalAmount)}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Child Filter */}
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-600" />
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả con</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterStatus("paid")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === "paid"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Đã thanh toán
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === "pending"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Đang chờ
            </button>
            <button
              onClick={() => setFilterStatus("failed")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === "failed"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Thất bại
            </button>
          </div>
        </div>
      </Card>

      {/* Payment List */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Danh sách giao dịch</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : payments.length > 0 ? (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Payment Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Wallet className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">
                          {payment.className}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {payment.description}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Học sinh:</span>{" "}
                            {payment.childName}
                          </div>
                          <div>
                            <span className="font-medium">Phương thức:</span>{" "}
                            {getPaymentMethodLabel(payment.paymentMethod)}
                          </div>
                          <div>
                            <span className="font-medium">Mã giao dịch:</span>{" "}
                            {payment.transactionId}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(payment.date).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Amount and Status */}
                  <div className="flex flex-col items-end gap-3">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(payment.amount)}
                    </p>
                    {getStatusBadge(payment.status)}
                    {payment.status === "COMPLETED" && (
                      <button
                        onClick={() => downloadReceipt(payment.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không có lịch sử thanh toán</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PaymentHistory;
