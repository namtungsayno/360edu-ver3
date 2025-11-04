/**
 * NEWS SERVICE - Xử lý tất cả các API calls liên quan đến tin tức
 * Sử dụng: import { newsService } from '@/services/news/news.service';
 */

import { http } from "../http";
import { API_ENDPOINTS } from "../../constants/api.endpoints";

export const newsService = {
  /**
   * Lấy danh sách tin tức
   * @param {Object} params - Query parameters
   * @param {number} params.page - Số trang (mặc định 1)
   * @param {number} params.size - Số lượng item/trang (mặc định 10)
   * @param {string} params.search - Từ khóa tìm kiếm
   * @param {string} params.status - Lọc theo trạng thái (published, draft, hidden)
   * @param {string} params.sortBy - Sắp xếp theo field (date, views, title)
   * @param {string} params.order - Thứ tự (asc, desc)
   * @returns {Promise} Response chứa data: { items, total, page, size }
   */
  async getNews(params = {}) {
    try {
      const response = await http.get(API_ENDPOINTS.NEWS.LIST, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching news:", error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết 1 tin tức
   * @param {string|number} id - ID của tin tức
   * @returns {Promise} Response chứa data của tin tức
   */
  async getNewsById(id) {
    try {
      const response = await http.get(API_ENDPOINTS.NEWS.DETAIL(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching news ${id}:`, error);
      throw error;
    }
  },

  /**
   * Tạo tin tức mới
   * @param {Object} newsData - Dữ liệu tin tức
   * @param {string} newsData.title - Tiêu đề
   * @param {string} newsData.excerpt - Mô tả ngắn
   * @param {string} newsData.content - Nội dung chi tiết
   * @param {string} newsData.status - Trạng thái (draft, published, hidden)
   * @param {string} newsData.author - Tác giả
   * @param {string} newsData.date - Ngày đăng (YYYY-MM-DD)
   * @param {Array<string>} newsData.tags - Danh sách tags
   * @returns {Promise} Response chứa data của tin tức vừa tạo
   */
  async createNews(newsData) {
    try {
      const response = await http.post(API_ENDPOINTS.NEWS.CREATE, newsData);
      return response.data;
    } catch (error) {
      console.error("Error creating news:", error);
      throw error;
    }
  },

  /**
   * Cập nhật tin tức
   * @param {string|number} id - ID của tin tức
   * @param {Object} newsData - Dữ liệu tin tức cần cập nhật
   * @returns {Promise} Response chứa data của tin tức đã cập nhật
   */
  async updateNews(id, newsData) {
    try {
      const response = await http.put(API_ENDPOINTS.NEWS.UPDATE(id), newsData);
      return response.data;
    } catch (error) {
      console.error(`Error updating news ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa tin tức
   * @param {string|number} id - ID của tin tức
   * @returns {Promise} Response xác nhận xóa thành công
   */
  async deleteNews(id) {
    try {
      const response = await http.delete(API_ENDPOINTS.NEWS.DELETE(id));
      return response.data;
    } catch (error) {
      console.error(`Error deleting news ${id}:`, error);
      throw error;
    }
  },

  /**
   * Toggle trạng thái published/hidden
   * @param {string|number} id - ID của tin tức
   * @returns {Promise} Response chứa trạng thái mới
   */
  async toggleStatus(id) {
    try {
      const response = await http.patch(API_ENDPOINTS.NEWS.TOGGLE_STATUS(id));
      return response.data;
    } catch (error) {
      console.error(`Error toggling status for news ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái tin tức
   * @param {string|number} id - ID của tin tức
   * @param {string} status - Trạng thái mới (draft, published, hidden)
   * @returns {Promise} Response chứa tin tức đã cập nhật
   */
  async updateStatus(id, status) {
    try {
      const response = await http.patch(API_ENDPOINTS.NEWS.UPDATE_STATUS(id), {
        status,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for news ${id}:`, error);
      throw error;
    }
  },

  /**
   * Tăng lượt xem cho tin tức
   * @param {string|number} id - ID của tin tức
   * @returns {Promise} Response chứa số lượt xem mới
   */
  async incrementView(id) {
    try {
      const response = await http.post(API_ENDPOINTS.NEWS.INCREMENT_VIEW(id));
      return response.data;
    } catch (error) {
      console.error(`Error incrementing view for news ${id}:`, error);
      throw error;
    }
  },
};
