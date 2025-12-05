// src/components/payment/PaymentQRModal.jsx
// Modal hiển thị QR code thanh toán học phí - Layout ngang đẹp

import { useState, useEffect, useRef } from "react";
import { X, Copy, CheckCircle2, Loader2, Phone } from "lucide-react";
import { paymentService } from "../../services/payment/payment.service";
import { useToast } from "../../hooks/use-toast";

export default function PaymentQRModal({ isOpen, onClose, classId, className, onPaymentCreated }) {
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [copied, setCopied] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && classId) {
      loadPaymentQR();
    }
    if (!isOpen) {
      setPaymentData(null);
      setCopied(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, classId]);

  const loadPaymentQR = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getPaymentQR(classId);
      setPaymentData(data);
      if (onPaymentCreated) onPaymentCreated(data);
    } catch (e) {
      console.error("Failed to load payment QR:", e);
      const msg = e?.response?.data?.message || e?.message || "Không thể tạo QR thanh toán";
      showError(msg, "Lỗi");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleCopyContent = () => {
    if (paymentData?.content) {
      navigator.clipboard.writeText(paymentData.content);
      setCopied(true);
      success("Đã sao chép!");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount || 0) + "đ";
  };

  // Click outside to close
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Thanh toán học phí</h2>
            {className && <p className="text-sm text-gray-500 mt-0.5">{className}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="mt-3 text-gray-500">Đang tạo mã QR...</p>
          </div>
        ) : paymentData ? (
          <>
            {/* Main Content - 2 columns */}
            <div className="flex">
              {/* Left - QR Code */}
              <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 border-r p-6">
                <img
                  src={paymentData.qrImageUrl}
                  alt="VietQR"
                  className="w-full h-auto max-h-96 object-contain"
                  onError={(e) => {
                    e.target.src = "/assets/images/qr-placeholder.png";
                  }}
                />
              </div>

              {/* Right - Payment Details */}
              <div className="w-1/2 p-8 flex flex-col justify-center">
                {/* Amount */}
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Số tiền thanh toán</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {formatCurrency(paymentData.amount)}
                  </p>
                </div>

                {/* Transfer Content */}
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Nội dung chuyển khoản</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 px-4 py-3 rounded-lg font-mono text-sm font-medium text-gray-800 break-all">
                      {paymentData.content}
                    </div>
                    <button
                      onClick={handleCopyContent}
                      className={`flex-shrink-0 p-3 rounded-lg transition-all ${
                        copied 
                          ? "bg-green-100 text-green-600" 
                          : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                      }`}
                      title="Sao chép"
                    >
                      {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-600">Tự động xác nhận trong 1-5 phút</span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="px-6 py-4 bg-amber-50 border-t border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-amber-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Bạn sẽ được <strong>tự động ghi danh</strong> sau khi thanh toán thành công</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Phone className="w-4 h-4" />
                <span>Hỗ trợ: <a href="tel:0123456789" className="text-blue-600 font-medium">0123 456 789</a></span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-16 text-gray-500">
            Không có dữ liệu thanh toán
          </div>
        )}
      </div>
    </div>
  );
}
