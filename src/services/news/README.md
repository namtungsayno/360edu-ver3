# News Management API

Tài liệu hướng dẫn sử dụng API cho phần quản lý tin tức (News Management).

## Cấu trúc file

```
src/
├── constants/
│   └── api.endpoints.js       # Khai báo tất cả các endpoint
├── services/
│   ├── http.js                # Axios instance cấu hình sẵn
│   └── news/
│       ├── news.service.js    # Service layer cho News API
│       └── README.md          # File này
└── pages/
    └── admin/
        └── news/
            ├── NewsList.jsx   # Trang danh sách (đã kết nối API)
            └── CreateNews.jsx # Trang tạo/sửa (đã kết nối API)
```

## Backend API Endpoints

API base URL: `http://localhost:8080/api`

### 1. Lấy danh sách tin tức
```
GET /news
Query params:
  - page: số trang (mặc định 1)
  - size: số item/trang (mặc định 10)
  - search: từ khóa tìm kiếm
  - status: lọc theo trạng thái (published, draft, hidden)
  - sortBy: sắp xếp theo field (date, views, title)
  - order: thứ tự (asc, desc)

Response:
{
  "items": [...],
  "total": 50,
  "page": 1,
  "size": 10
}
```

### 2. Lấy chi tiết tin tức
```
GET /news/:id

Response:
{
  "id": 1,
  "title": "Tiêu đề",
  "excerpt": "Mô tả ngắn",
  "content": "Nội dung",
  "author": "Admin",
  "date": "2025-11-03",
  "status": "published",
  "views": 245,
  "tags": ["tag1", "tag2"]
}
```

### 3. Tạo tin tức mới
```
POST /news
Body:
{
  "title": "Tiêu đề",
  "excerpt": "Mô tả ngắn",
  "content": "Nội dung chi tiết",
  "status": "draft",
  "author": "Admin",
  "date": "2025-11-03",
  "tags": ["tag1", "tag2"]
}

Response: Tin tức vừa tạo
```

### 4. Cập nhật tin tức
```
PUT /news/:id
Body: (giống POST)

Response: Tin tức đã cập nhật
```

### 5. Xóa tin tức
```
DELETE /news/:id

Response: { message: "Deleted successfully" }
```

### 6. Toggle trạng thái
```
PATCH /news/:id/toggle-status

Response: 
{
  "id": 1,
  "status": "hidden"  // hoặc "published"
}
```

### 7. Cập nhật trạng thái
```
PATCH /news/:id/status
Body:
{
  "status": "published"  // hoặc "draft", "hidden"
}

Response: Tin tức đã cập nhật
```

### 8. Tăng lượt xem
```
POST /news/:id/view

Response:
{
  "views": 246
}
```

## Sử dụng trong Frontend

### Import service
```javascript
import { newsService } from '@/services/news/news.service';
```

### Lấy danh sách
```javascript
const fetchNews = async () => {
  try {
    const response = await newsService.getNews({
      page: 1,
      size: 20,
      search: "python",
      status: "published"
    });
    setNews(response.items || response.data || response);
  } catch (error) {
    console.error(error);
  }
};
```

### Tạo tin tức
```javascript
const createNews = async () => {
  try {
    await newsService.createNews({
      title: "Tiêu đề mới",
      excerpt: "Mô tả",
      content: "Nội dung",
      status: "published",
      author: "Admin",
      date: "2025-11-03",
      tags: ["tag1"]
    });
    alert("Tạo thành công!");
  } catch (error) {
    alert(error.displayMessage);
  }
};
```

### Cập nhật tin tức
```javascript
const updateNews = async (id) => {
  try {
    await newsService.updateNews(id, {
      title: "Tiêu đề đã sửa",
      // ... các field khác
    });
    alert("Cập nhật thành công!");
  } catch (error) {
    alert(error.displayMessage);
  }
};
```

### Toggle trạng thái
```javascript
const toggleStatus = async (id) => {
  try {
    await newsService.toggleStatus(id);
    // Refresh danh sách hoặc update UI
  } catch (error) {
    alert(error.displayMessage);
  }
};
```

## Error Handling

Tất cả các hàm đều throw error khi có lỗi. Error object có thuộc tính `displayMessage` để hiển thị cho user:

```javascript
try {
  await newsService.createNews(data);
} catch (error) {
  // error.displayMessage - thông báo lỗi từ backend hoặc message mặc định
  alert(error.displayMessage || "Có lỗi xảy ra");
}
```

## Mock Data Fallback

`NewsList.jsx` có fallback về mock data nếu API lỗi, giúp phát triển UI mà không cần backend hoàn chỉnh ngay.

## Lưu ý khi triển khai Backend

1. **CORS**: Backend cần enable CORS cho `http://localhost:5173` (Vite dev server)
2. **Authentication**: Thêm JWT token vào header nếu cần:
   ```javascript
   http.interceptors.request.use((config) => {
     const token = localStorage.getItem('token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   ```
3. **Response format**: Đảm bảo backend trả về format nhất quán (có thể là `{ data: {...} }` hoặc trực tiếp object)
4. **Status codes**: Sử dụng HTTP status code chuẩn (200, 201, 400, 404, 500...)

## Test API với cURL

```bash
# Lấy danh sách
curl http://localhost:8080/api/news

# Tạo tin tức
curl -X POST http://localhost:8080/api/news \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test News",
    "excerpt": "Test excerpt",
    "content": "Test content",
    "status": "draft",
    "author": "Admin",
    "date": "2025-11-03",
    "tags": ["test"]
  }'

# Cập nhật
curl -X PUT http://localhost:8080/api/news/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'

# Toggle status
curl -X PATCH http://localhost:8080/api/news/1/toggle-status

# Xóa
curl -X DELETE http://localhost:8080/api/news/1
```
