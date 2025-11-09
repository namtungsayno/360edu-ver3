# 🎓 360edu - Hệ thống quản lý giáo dục

Hệ thống quản lý giáo dục toàn diện với React + Vite + Tailwind CSS

## ✨ Tính năng mới: Toast Notification System

Hệ thống thông báo toast đẹp và chuyên nghiệp đã được tích hợp hoàn chỉnh:

- ✅ **4 loại toast**: Success ✅, Error ❌, Warning ⚠️, Info ℹ️
- ✅ **Animation mượt mà**: Slide-in từ phải, tự động đóng sau 3 giây
- ✅ **Tiếng Việt**: Tất cả thông báo đều bằng tiếng Việt
- ✅ **Responsive**: Hoạt động tốt trên mọi thiết bị
- ✅ **Dễ sử dụng**: Hook-based hoặc global toast object
- ✅ **Có thể đóng thủ công**: Click nút X để đóng ngay

### 📖 Xem hướng dẫn chi tiết

👉 **[TOAST_USAGE.md](./TOAST_USAGE.md)** - Hướng dẫn sử dụng đầy đủ với ví dụ

### 🎨 Demo

Truy cập trang `/admin/toast-demo` để xem demo tất cả các loại toast

## 🚀 Quick Start

```bash
# Cài đặt dependencies
npm install

# Chạy dev server
npm run dev

# Build cho production
npm run build
```

## 💡 Sử dụng Toast - Quick Guide

### Cách 1: Sử dụng Hook (Khuyến nghị)

```jsx
import { useToast } from "../../hooks/use-toast";

function MyComponent() {
  const { success, error, warning, info } = useToast();

  const handleSave = async () => {
    try {
      await api.save(data);
      success("Đã lưu thành công!");
    } catch (err) {
      error("Lưu thất bại. Vui lòng thử lại.");
    }
  };

  return <button onClick={handleSave}>Lưu</button>;
}
```

### Cách 2: Global Toast Object

```jsx
import { toast } from "../../hooks/use-toast";

// Có thể gọi ở bất kỳ đâu, không cần hook
toast.success("Thành công!");
toast.error("Có lỗi xảy ra!");
toast.warning("Cảnh báo!");
toast.info("Thông tin!");
```

## 📦 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router v6
- **State Management**: Context API
- **Backend**: Java Spring Boot + PostgreSQL

## 📁 Cấu trúc Project

```
360edu-ver3/
├── src/
│   ├── components/
│   │   ├── ui/              # UI components
│   │   │   ├── Toast.jsx    # ← Toast component mới
│   │   │   ├── Button.jsx
│   │   │   └── ...
│   │   └── common/          # Common components
│   ├── context/
│   │   ├── NotificationContext.jsx  # ← Context quản lý toast
│   │   ├── AuthContext.jsx
│   │   └── ...
│   ├── hooks/
│   │   ├── use-toast.js     # ← Hook để sử dụng toast
│   │   └── ...
│   ├── pages/
│   │   ├── admin/           # Admin pages
│   │   ├── teacher/         # Teacher pages
│   │   ├── auth/            # Login, Register
│   │   └── guest/           # Public pages
│   ├── services/            # API services
│   └── router/              # Routes config
├── TOAST_USAGE.md           # ← Hướng dẫn sử dụng toast chi tiết
└── README.md
```

## 🎯 Tính năng đã tích hợp Toast

Các trang sau đã sử dụng toast notification:

- ✅ **Login / Register** - Thông báo đăng nhập/đăng ký thành công/thất bại
- ✅ **User Management** - CRUD users với toast
- ✅ **Teacher Management** - CRUD teachers với toast
- ✅ **Subject Management** - CRUD subjects với toast
- ✅ **Room Management** - CRUD rooms với toast
- ✅ **Class Management** - CRUD classes với toast

## 🎨 Toast Types

| Type        | Màu        | Icon | Sử dụng cho                            |
| ----------- | ---------- | ---- | -------------------------------------- |
| **Success** | Xanh lá    | ✅   | Tạo/cập nhật/xóa thành công            |
| **Error**   | Đỏ         | ❌   | Lỗi API, validation, thao tác thất bại |
| **Warning** | Vàng       | ⚠️   | Cảnh báo, xác nhận trước khi xóa       |
| **Info**    | Xanh dương | ℹ️   | Thông tin chung, hướng dẫn             |

## 📝 Best Practices

### ✅ Nên làm

```jsx
// Sử dụng tiếng Việt rõ ràng
success("Đã tạo lớp học thành công");

// Thêm emoji cho sinh động
success("Đăng nhập thành công! Chào mừng bạn trở lại 👋");

// Hướng dẫn khi có lỗi
error("Email đã tồn tại. Vui lòng sử dụng email khác");

// Delay khi chuyển trang
success("Đăng nhập thành công!");
setTimeout(() => navigate("/dashboard"), 500);
```

### ❌ Không nên làm

```jsx
// Không dùng tiếng Anh
error("Login failed"); // ❌

// Không để message quá dài
error("Có lỗi xảy ra trong quá trình..."); // ❌

// Không lạm dụng toast
info("Bạn đã click vào nút"); // ❌
```

## 🔧 Development Commands

```bash
# Chạy dev server (http://localhost:5173)
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🎓 Documentation

- **[TOAST_USAGE.md](./TOAST_USAGE.md)** - Hướng dẫn sử dụng toast đầy đủ
- **[TOAST_NOTIFICATION.md](./TOAST_NOTIFICATION.md)** - Technical docs

## 🐛 Troubleshooting

### Toast không hiển thị?

1. Kiểm tra `NotificationProvider` đã wrap App trong `main.jsx`
2. Kiểm tra `ToastContainer` đã được render trong `App.jsx`
3. Xem console có lỗi không

### Toast hiển thị nhưng không có animation?

1. Kiểm tra `index.css` đã có keyframes `slideInRight`
2. Clear cache và reload

## 📄 License

Copyright © 2024 360edu Team

---

**Developed with ❤️ by 360edu Team** 🎓
