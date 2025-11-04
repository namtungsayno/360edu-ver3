# News Management - Admin Pages

Quản lý tin tức cho hệ thống 360edu.

## Cấu trúc file

```
src/pages/admin/news/
├── NewsList.jsx        # Trang danh sách tin tức
├── CreateNews.jsx      # Trang tạo/sửa tin tức
├── mockData.js         # Dữ liệu mock để testing
└── README.md           # File này
```

## Mock Data (`mockData.js`)

### Mục đích
- Phát triển UI mà không cần backend
- Testing và demo tính năng
- Fallback khi API lỗi

### Nội dung
- **mockNewsData**: Mảng 8 tin tức mẫu với đầy đủ field
- **delay()**: Hàm giả lập API delay
- **filterMockNews()**: Hàm filter và pagination cho mock data

### Sử dụng

#### Import mock data
```javascript
import { mockNewsData, filterMockNews } from "./mockData";
```

#### Sử dụng trực tiếp
```javascript
setNews(mockNewsData);
```

#### Sử dụng với filter
```javascript
const result = filterMockNews({
  search: "python",
  status: "published",
  page: 1,
  size: 10
});
// result = { items: [...], total: 2, page: 1, size: 10, totalPages: 1 }
```

## NewsList.jsx

### Chức năng
- Hiển thị danh sách tin tức
- Tìm kiếm theo tiêu đề/mô tả
- Lọc theo trạng thái (published/draft/hidden)
- Xem nhanh nội dung (modal)
- Chỉnh sửa tin tức
- Toggle trạng thái ẩn/hiện
- Thống kê: tổng tin, đã đăng, nháp, lượt xem

### Data Flow
1. Component mount → gọi `fetchNews()`
2. Gọi API `newsService.getNews()`
3. Nếu thành công → set `news` state
4. Nếu lỗi → fallback về `mockNewsData`

### States
- `news`: Danh sách tin tức
- `searchQuery`: Từ khóa tìm kiếm
- `selected`: Tin tức đang xem preview
- `isPreviewOpen`: Trạng thái modal
- `loading`: Loading state
- `error`: Error message

## CreateNews.jsx

### Chức năng
- Tạo tin tức mới
- Chỉnh sửa tin tức hiện có
- Quản lý tags
- Validation form
- Submit qua API

### Form Fields
- **title**: Tiêu đề (bắt buộc)
- **excerpt**: Mô tả ngắn (bắt buộc)
- **content**: Nội dung chi tiết (bắt buộc)
- **status**: Trạng thái (draft/published/hidden)
- **author**: Tác giả (auto-fill)
- **date**: Ngày đăng
- **tags**: Danh sách tags

### Edit Mode
Nhận draft qua `location.state`:
```javascript
navigate("/home/admin/news/create", {
  state: { draft: newsItem }
});
```

## Luồng hoạt động

### Xem danh sách
```
User → /home/admin/news
     → NewsList render
     → fetchNews() gọi API
     → Hiển thị danh sách hoặc mock data (nếu API lỗi)
```

### Tạo tin mới
```
User → Click "Tạo tin tức mới"
     → Navigate to /home/admin/news/create
     → Điền form
     → Click "Đăng tin tức" hoặc "Lưu nháp"
     → API createNews()
     → Navigate về /home/admin/news
```

### Sửa tin
```
User → Click "Sửa" trên tin tức
     → Navigate to /home/admin/news/create (với draft)
     → Form load sẵn data
     → Chỉnh sửa
     → Click "Cập nhật tin"
     → API updateNews()
     → Navigate về /home/admin/news
```

### Toggle trạng thái
```
User → Click "Ẩn" hoặc "Hiện"
     → API toggleStatus()
     → Update UI
```

## Lưu ý khi phát triển

### Khi backend chưa sẵn sàng
- `NewsList` tự động fallback về mock data khi API lỗi
- Mock data có 8 tin mẫu với đầy đủ trạng thái
- UI hoạt động bình thường với mock data

### Khi tích hợp backend
- Đảm bảo API response format khớp với frontend expect
- Test error handling (network error, 404, 500...)
- Kiểm tra pagination nếu có nhiều tin

### Testing
```javascript
// Test với mock data
import { mockNewsData } from "./mockData";
console.log(mockNewsData.length); // 8

// Test filter
import { filterMockNews } from "./mockData";
const result = filterMockNews({ status: "published" });
console.log(result.total); // Số tin published
```

## Dependencies

### UI Components
- Card, CardContent, CardHeader, CardTitle
- Input, Button, Badge, Label
- Textarea, Select
- Tabs, Modal

### Icons (lucide-react)
- Search, Plus, Newspaper, Eye, Edit
- EyeOff, Calendar, ArrowLeft, X, Loader2

### Router
- useNavigate, useLocation (react-router-dom)

### Services
- newsService (src/services/news/news.service.js)
