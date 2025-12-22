// src/components/payment/PaymentQRModal.jsx
// Modal hiển thị QR code thanh toán học phí - Layout ngang đẹp

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Copy, CheckCircle2, Loader2, Phone, Clock, AlertTriangle, Check } from "lucide-react";
import { paymentService } from "../../services/payment/payment.service";
import { paymentApi } from "../../services/payment/payment.api";
import { useToast } from "../../hooks/use-toast";

// Thời gian hết hạn QR code (15 phút)
const QR_EXPIRY_MINUTES = 15;
// Polling interval để check payment status (5 giây)
const POLLING_INTERVAL = 5000;

export default function PaymentQRModal({
  isOpen,
  onClose,
  classId,
  className,
  onPaymentCreated,
  onPaymentSuccess, // Callback khi thanh toán thành công
}) {
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("PENDING"); // PENDING, PAID, FAILED
  const [isPaid, setIsPaid] = useState(false);
  const modalRef = useRef(null);
  const pollingRef = useRef(null);
  
  // Countdown state
  const [timeLeft, setTimeLeft] = useState(QR_EXPIRY_MINUTES * 60); // seconds
  const [isExpired, setIsExpired] = useState(false);

  // Check payment status function
  const checkPaymentStatus = useCallback(async () => {
    if (!paymentData?.paymentId || isPaid || isExpired) return;
    
    try {
      const statusData = await paymentApi.checkPaymentStatus(paymentData.paymentId);
      console.log("🔄 Payment status check:", statusData);
      
      if (statusData.isPaid) {
        setPaymentStatus("PAID");
        setIsPaid(true);
        // Stop polling
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        // Show success message
        success("Thanh toán thành công! Bạn đã được ghi danh vào lớp học.", "Thành công");
        
        // Callback to parent
        if (onPaymentSuccess) {
          onPaymentSuccess(statusData);
        }
        
        // Auto close after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (e) {
      console.error("Payment status check error:", e);
      // Don't show error to user, just continue polling
    }
  }, [paymentData?.paymentId, isPaid, isExpired, success, onPaymentSuccess, onClose]);

  useEffect(() => {
    console.log("🔍 PaymentQRModal useEffect - isOpen:", isOpen, "classId:", classId);
    if (isOpen && classId) {
      console.log("🔍 PaymentQRModal - calling loadPaymentQR...");
      loadPaymentQR();
      // Reset countdown when modal opens
      setTimeLeft(QR_EXPIRY_MINUTES * 60);
      setIsExpired(false);
      setIsPaid(false);
      setPaymentStatus("PENDING");
    }
    if (!isOpen) {
      setPaymentData(null);
      setCopied(false);
      setTimeLeft(QR_EXPIRY_MINUTES * 60);
      setIsExpired(false);
      setIsPaid(false);
      setPaymentStatus("PENDING");
      // Stop polling when modal closes
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, classId]);

  // Start polling when paymentData is available
  useEffect(() => {
    if (!paymentData?.paymentId || isPaid || isExpired) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    // Initial check
    checkPaymentStatus();
    
    // Start polling
    pollingRef.current = setInterval(checkPaymentStatus, POLLING_INTERVAL);
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [paymentData?.paymentId, isPaid, isExpired, checkPaymentStatus]);

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen || !paymentData || isExpired || isPaid) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, paymentData, isExpired]);

  const loadPaymentQR = async () => {
    console.log("💰 loadPaymentQR called - classId:", classId);
    setLoading(true);
    try {
      console.log("💰 Calling paymentService.getPaymentQR...");
      const data = await paymentService.getPaymentQR(classId);
      console.log("💰 Payment data received:", data);
      setPaymentData(data);
      if (onPaymentCreated) onPaymentCreated(data);
    } catch (e) {
      console.error("❌ loadPaymentQR error:", e);
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Không thể tạo QR thanh toán";
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

  // Format countdown time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Refresh QR code when expired
  const handleRefreshQR = () => {
    setTimeLeft(QR_EXPIRY_MINUTES * 60);
    setIsExpired(false);
    loadPaymentQR();
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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden my-auto"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Thanh toán học phí
            </h2>
            {className && (
              <p className="text-sm text-gray-500 mt-0.5">{className}</p>
            )}
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
              <div className="w-1/2 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 border-r p-6">
                {/* Countdown Timer */}
                <div className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-full ${
                  isExpired 
                    ? "bg-red-100 text-red-700" 
                    : timeLeft <= 60 
                      ? "bg-amber-100 text-amber-700" 
                      : "bg-blue-100 text-blue-700"
                }`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-semibold">
                    {isExpired ? "Hết hạn" : formatTime(timeLeft)}
                  </span>
                </div>

                {/* QR Code or Expired State */}
                {isExpired ? (
                  <div className="flex flex-col items-center justify-center p-8">
                    <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
                    <p className="text-gray-700 font-medium text-center mb-4">
                      Mã QR đã hết hạn
                    </p>
                    <button
                      onClick={handleRefreshQR}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Tạo mã mới
                    </button>
                  </div>
                ) : (
                  <img
                    src={paymentData.qrImageUrl}
                    alt="VietQR"
                    className="w-full h-auto max-h-80 object-contain"
                    onError={(e) => {
                      e.target.src = "/assets/images/qr-placeholder.png";
                    }}
                  />
                )}
              </div>

              {/* Right - Payment Details */}
              <div className="w-1/2 p-8 flex flex-col justify-center">
                {/* Amount */}
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">
                    Số tiền thanh toán
                  </p>
                  <p className="text-4xl font-bold text-blue-600">
                    {formatCurrency(paymentData.amount)}
                  </p>
                </div>

                {/* Transfer Content */}
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">
                    Nội dung chuyển khoản
                  </p>
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
                      {copied ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Status */}
                {isPaid ? (
                  <div className="flex items-center gap-2 text-sm bg-green-100 px-4 py-3 rounded-lg">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium">
                      Thanh toán thành công! Đang chuyển hướng...
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                    <span className="text-gray-600">
                      Đang chờ thanh toán... (tự động xác nhận trong 1-5 phút)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Note */}
            <div className="px-6 py-4 bg-amber-50 border-t border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-amber-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>
                  Bạn sẽ được <strong>tự động ghi danh</strong> sau khi thanh
                  toán thành công
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Phone className="w-4 h-4" />
                <span>
                  Hỗ trợ:{" "}
                  <a
                    href="tel:0123456789"
                    className="text-blue-600 font-medium"
                  >
                    0123 456 789
                  </a>
                </span>
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
