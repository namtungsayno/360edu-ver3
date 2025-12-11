// src/pages/student/PaymentHistory.jsx
// Trang lịch sử thanh toán cho học sinh

import { useEffect, useState } from "react";
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Receipt,
  BookOpen
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { paymentService } from "../../services/payment/payment.service";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadPayments();
  }, [page]);

  const loadPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await paymentService.getMyHistory(page, pageSize);
      setPayments(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      console.error("Failed to load payment history:", err);
      setError("Không thể tải lịch sử thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã thanh toán
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Chờ thanh toán
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Thất bại
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    const datePart = d.toLocaleDateString("sv-SE");
    const timePart = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    return `${datePart} ${timePart}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Receipt className="w-8 h-8" />
                <h1 className="text-3xl font-bold">Lịch sử thanh toán</h1>
              </div>
              <p className="text-green-100 text-base max-w-2xl mx-auto">
                Xem lại các giao dịch thanh toán học phí của bạn
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold">{totalElements}</div>
                <div className="text-xs text-green-100">Giao dịch</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold">
                  {payments.filter(p => p.status === "PAID").length}
                </div>
                <div className="text-xs text-green-100">Đã thanh toán</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              Danh sách giao dịch
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">Đang tải...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
                <Button onClick={loadPayments} className="mt-4">
                  Thử lại
                </Button>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Chưa có giao dịch nào</p>
                <p className="text-gray-400 text-sm mt-2">
                  Các giao dịch thanh toán học phí sẽ hiển thị ở đây
                </p>
              </div>
            ) : (
              <>
                {/* Payment List */}
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="border rounded-xl p-4 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left - Class Info */}
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {payment.className}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {payment.subjectName} • GV: {payment.teacherName}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>Tạo: {formatDate(payment.createdAt)}</span>
                              {payment.paidAt && (
                                <>
                                  <span>•</span>
                                  <span>Thanh toán: {formatDate(payment.paidAt)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right - Amount & Status */}
                        <div className="flex items-center gap-4 md:flex-shrink-0">
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {formatCurrency(payment.amount)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Mã: {payment.orderCode}
                            </div>
                          </div>
                          {getStatusBadge(payment.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Trang {page + 1} / {totalPages} ({totalElements} giao dịch)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 0}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Trước
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= totalPages - 1}
                      >
                        Sau
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
