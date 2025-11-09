# 🔔 Hướng dẫn sử dụng Toast Notification

## Tổng quan

Hệ thống toast notification đã được tích hợp vào toàn bộ ứng dụng 360edu với thiết kế đẹp, animation mượt mà và hỗ trợ đầy đủ tiếng Việt.

## Các loại Toast

### 1. **Success** (Thành công) ✅

- Màu xanh lá
- Dùng cho: Tạo mới, cập nhật, xóa thành công
- Icon: CheckCircle

### 2. **Error** (Lỗi) ❌

- Màu đỏ
- Dùng cho: Lỗi validation, lỗi API, thao tác thất bại
- Icon: XCircle

### 3. **Warning** (Cảnh báo) ⚠️

- Màu vàng
- Dùng cho: Cảnh báo người dùng, xác nhận trước khi xóa
- Icon: AlertTriangle

### 4. **Info** (Thông tin) ℹ️

- Màu xanh dương
- Dùng cho: Thông tin chung, hướng dẫn
- Icon: Info

## Cách sử dụng

### Cách 1: Sử dụng Hook (Khuyến nghị)

```jsx
import { useToast } from "../../hooks/use-toast";

function MyComponent() {
  const { success, error, warning, info } = useToast();

  const handleCreate = async () => {
    try {
      await api.create(data);
      success("Đã tạo thành công!");
    } catch (err) {
      error("Tạo thất bại. Vui lòng thử lại.");
    }
  };

  return <button onClick={handleCreate}>Tạo mới</button>;
}
```

### Cách 2: Sử dụng Toast Object (Global)

```jsx
import { toast } from "../../hooks/use-toast";

// Có thể gọi ở bất kỳ đâu, không cần hook
function handleLogin() {
  toast.success("Đăng nhập thành công!");
}

// Trong service hoặc utility function
export async function loginUser(credentials) {
  try {
    const user = await api.login(credentials);
    toast.success("Đăng nhập thành công! Chào mừng bạn trở lại 👋");
    return user;
  } catch (err) {
    toast.error("Tên đăng nhập hoặc mật khẩu không chính xác");
    throw err;
  }
}
```

## Tùy chỉnh Title và Message

```jsx
// Chỉ message (title mặc định)
success("Đã lưu thành công!");

// Custom title và message
success("Thông tin chi tiết về thành công", "Hoàn thành");
error("Vui lòng kiểm tra lại thông tin đã nhập", "Validation Error");
```

## Ví dụ thực tế

### 1. Đăng nhập

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    const user = await login(formData);
    success("Đăng nhập thành công! Chào mừng bạn trở lại 👋");

    // Delay để user thấy toast
    setTimeout(() => {
      navigate("/dashboard");
    }, 500);
  } catch (ex) {
    error(ex.message || "Tên đăng nhập hoặc mật khẩu không chính xác");
  } finally {
    setSubmitting(false);
  }
};
```

### 2. Tạo mới User

```jsx
const handleCreateUser = async (userData) => {
  try {
    await userService.create(userData);
    success("Đã tạo người dùng mới thành công");
    loadUsers(); // Refresh list
    closeModal();
  } catch (err) {
    error("Không thể tạo người dùng. Vui lòng thử lại.");
  }
};
```

### 3. Cập nhật thông tin

```jsx
const handleUpdate = async () => {
  try {
    await userService.update(userId, formData);
    success("Cập nhật thông tin thành công");
  } catch (err) {
    if (err.status === 409) {
      error("Email đã tồn tại trong hệ thống");
    } else {
      error("Cập nhật thất bại. Vui lòng thử lại.");
    }
  }
};
```

### 4. Xóa với xác nhận

```jsx
const handleDelete = async (id) => {
  // Có thể dùng warning trước
  warning("Bạn có chắc chắn muốn xóa không?");

  const confirmed = window.confirm("Xác nhận xóa?");
  if (!confirmed) return;

  try {
    await userService.delete(id);
    success("Đã xóa thành công");
    loadUsers();
  } catch (err) {
    error("Không thể xóa. Vui lòng thử lại.");
  }
};
```

### 5. Upload file

```jsx
const handleUpload = async (file) => {
  try {
    info("Đang tải lên...");
    const result = await uploadService.upload(file);
    success("Tải lên thành công!");
    return result;
  } catch (err) {
    error("Tải lên thất bại. Vui lòng kiểm tra file và thử lại.");
  }
};
```

## Best Practices

### ✅ Nên làm

1. **Sử dụng tiếng Việt rõ ràng**

   ```jsx
   success("Đã tạo lớp học thành công");
   error("Không thể kết nối đến máy chủ");
   ```

2. **Thêm emoji cho sinh động**

   ```jsx
   success("Đăng nhập thành công! Chào mừng bạn trở lại 👋");
   success("Đã lưu! Thông tin của bạn đã được cập nhật 🎉");
   ```

3. **Hướng dẫn người dùng khi có lỗi**

   ```jsx
   error("Email đã tồn tại. Vui lòng sử dụng email khác");
   warning("Mật khẩu phải có ít nhất 8 ký tự");
   ```

4. **Delay khi chuyển trang sau thành công**
   ```jsx
   success("Đăng nhập thành công!");
   setTimeout(() => navigate("/dashboard"), 500);
   ```

### ❌ Không nên làm

1. **Không dùng tiếng Anh**

   ```jsx
   error("Login failed"); // ❌
   error("Đăng nhập thất bại"); // ✅
   ```

2. **Không để message quá dài**

   ```jsx
   error("Có lỗi xảy ra trong quá trình xử lý yêu cầu của bạn..."); // ❌
   error("Xử lý thất bại. Vui lòng thử lại."); // ✅
   ```

3. **Không lạm dụng toast**
   ```jsx
   // Không cần toast cho mọi thao tác nhỏ
   info("Bạn đã click vào nút"); // ❌
   ```

## Styling

Toast tự động:

- ✅ Hiển thị ở góc trên bên phải
- ✅ Animation slide-in từ phải
- ✅ Tự đóng sau 3 giây
- ✅ Có thể đóng thủ công bằng nút X
- ✅ Hover để xem rõ hơn (shadow tăng)
- ✅ Responsive trên mobile

## Troubleshooting

### Toast không hiển thị?

1. Kiểm tra `NotificationProvider` đã wrap App chưa (trong `main.jsx`)
2. Kiểm tra `ToastContainer` đã được render trong `App.jsx`
3. Kiểm tra console có lỗi không

### Toast hiển thị nhưng không có animation?

1. Kiểm tra file `index.css` đã có `@keyframes slideInRight`
2. Clear cache và reload page

### Muốn thay đổi thời gian tự đóng?

Mặc định là 3 giây (3000ms). Không thể thay đổi qua API hiện tại, nhưng có thể chỉnh trong `Toast.jsx`:

```jsx
// Trong Toast.jsx
const Toast = ({ duration = 5000 }) => {
  // Đổi thành 5 giây
  // ...
};
```

## Migration từ Alert cũ

Nếu code cũ đang dùng `alert()`:

```jsx
// Cũ ❌
alert("Đã lưu!");

// Mới ✅
const { success } = useToast();
success("Đã lưu!");
```

Nếu code cũ đang dùng console.log:

```jsx
// Cũ ❌
console.log("User created");

// Mới ✅
success("Đã tạo người dùng thành công");
```

## Tích hợp với các trang

Tất cả các trang sau đã được tích hợp toast:

- ✅ Login / Register
- ✅ User Management (CRUD)
- ✅ Teacher Management
- ✅ Subject Management
- ✅ Room Management
- ✅ Class Management (đang cập nhật)

Các trang khác đang được cập nhật dần.

---

**Developed by 360edu Team** 🎓
