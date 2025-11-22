// Context trong React dùng để:
// Chia sẻ dữ liệu toàn ứng dụng mà không phải truyền props qua nhiều cấp.
// Ví dụ: thông tin user login, dark/light mode, ngôn ngữ, cấu hình hệ thống,…
//  Giúp tránh việc “props drilling” (truyền props lòng vòng nhiều component).

// src/context/AuthContext.jsx
// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { authService } from "../services/auth/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // khởi tạo từ localStorage
  const [user, setUser] = useState(authService.loadSavedUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Thử gọi /auth/me để xác thực lại user lưu trong localStorage
      const fresh = await authService.revalidate();
      if (!mounted) return;
      setUser(fresh); // nếu null → UI chuyển guest
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async ({ username, password, remember }) => {
    const me = await authService.login({ username, password, remember });
    setUser(me);
    return me;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    //
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
