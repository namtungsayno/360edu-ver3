// src/services/payment/payment.service.js
// Business logic wrapper for payment API

import { paymentApi } from "./payment.api";

export const paymentService = {
  /**
   * Student: Lấy QR thanh toán cho lớp học
   * @param {number} classId
   */
  async getPaymentQR(classId) {
    if (!classId) throw new Error("classId is required");
    return paymentApi.createPayment(classId);
  },

  /**
   * Admin: Lấy danh sách payments
   * @param {Object} filters - { status, studentName, classId, from, to, page, size }
   */
  async listPayments(filters = {}) {
    const params = {
      page: filters.page || 0,
      size: filters.size || 20,
    };
    if (filters.status) params.status = filters.status;
    if (filters.studentName) params.studentName = filters.studentName;
    if (filters.classId) params.classId = filters.classId;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;

    return paymentApi.getPayments(params);
  },

  /**
   * Admin: Lấy chi tiết 1 payment
   */
  async getPayment(id) {
    if (!id) throw new Error("Payment ID is required");
    return paymentApi.getPaymentById(id);
  },

  /**
   * Admin: Lấy thống kê payments
   */
  async getStats() {
    return paymentApi.getStats();
  },

  /**
   * Admin: Xác nhận thanh toán thủ công
   */
  async confirm(id) {
    if (!id) throw new Error("Payment ID is required");
    return paymentApi.confirmPayment(id);
  },

  /**
   * Student: Lấy lịch sử thanh toán của chính mình (phân trang)
   * @param {number} page
   * @param {number} size
   * @returns {Promise<{content: Array, totalElements: number, totalPages: number, number: number}>}
   */
  async getMyHistory(page = 0, size = 10) {
    return paymentApi.getMyHistory({ page, size });
  },
};
