// src/services/payment/payment.api.js
// API endpoints for payment operations

import { http } from "../http";

export const paymentApi = {
  /**
   * Student: Create payment for a class and get QR code
   * @param {number} classId
   * @returns {Promise<{paymentId, classId, studentId, amount, content, qrImageUrl}>}
   */
  createPayment: (classId) =>
    http.post(`/payments/class/${classId}`).then((r) => r.data),

  /**
   * Admin: Get list of payments with filters
   * @param {Object} params - { status, studentName, classId, from, to, page, size }
   */
  getPayments: (params = {}) =>
    http.get("/payments", { params }).then((r) => r.data),

  /**
   * Admin: Get payment details
   * @param {number} id
   */
  getPaymentById: (id) => http.get(`/payments/${id}`).then((r) => r.data),

  /**
   * Admin: Get payment stats
   */
  getStats: () => http.get("/payments/stats").then((r) => r.data),

  /**
   * Admin: Confirm payment manually
   * @param {number} id
   */
  confirmPayment: (id) =>
    http.post(`/payments/${id}/confirm`).then((r) => r.data),
};
