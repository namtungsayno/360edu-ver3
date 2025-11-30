/**
 * IMAGE UTILITIES - Xử lý URL ảnh từ server
 */

/**
 * Lấy full URL của ảnh từ server
 * @param {string} imageUrl - URL tương đối từ server (vd: /uploads/news-images/abc.jpg)
 * @returns {string} Full URL để hiển thị ảnh
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Nếu đã là full URL (http/https), return luôn
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Nếu là base64, return luôn
  if (imageUrl.startsWith('data:image/')) {
    return imageUrl;
  }
  
  // Nếu là relative URL, thêm base URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  return `${baseUrl}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
};

/**
 * Placeholder image khi không có ảnh hoặc load lỗi
 */
export const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjI2cHgiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
