import { http } from "../http";

/**
 * Service cho gửi thông báo email cho phụ huynh
 */
export const parentNotificationService = {
  /**
   * Gửi thông báo cho phụ huynh theo sessionId
   * @param {number} sessionId - ID của session
   * @returns {Promise} - Số lượng email đã gửi
   */
  sendBySession: async (sessionId) => {
    const response = await http.post(
      `/teacher/parent-notification/send/${sessionId}`
    );
    return response.data;
  },

  /**
   * Gửi thông báo cho phụ huynh theo classId và date
   * @param {number} classId - ID của lớp
   * @param {string} date - Ngày (format: YYYY-MM-DD)
   * @param {number|null} slotId - ID của time slot (optional)
   * @returns {Promise} - Số lượng email đã gửi
   */
  sendByClassAndDate: async (classId, date, slotId = null) => {
    const response = await http.post(
      `/teacher/parent-notification/send-by-class`,
      null,
      { params: { classId, date, slotId } }
    );
    return response.data;
  },
};
