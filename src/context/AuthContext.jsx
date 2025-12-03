// Context trong React dùng để:
// Chia sẻ dữ liệu toàn ứng dụng mà không phải truyền props qua nhiều cấp.
// Ví dụ: thông tin user login, dark/light mode, ngôn ngữ, cấu hình hệ thống,…
//  Giúp tránh việc “props drilling” (truyền props lòng vòng nhiều component).

// src/context/AuthContext.jsx
// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useMemo } from "react";
import { authService } from "../services/auth/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // khởi tạo từ localStorage
  const [user, setUser] = useState(authService.loadSavedUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Không còn /me để hydrate → chỉ cần bỏ loading sau tick đầu
    const t = setTimeout(() => setLoading(false), 0);
    return () => clearTimeout(t);
  }, []);

  const login = async ({ username, password, remember }) => {
    const me = await authService.login({ username, password, remember });
    setUser(me);
    return me;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      
      // Clear all state
      sessionStorage.clear();
      
      // Force reload to clear any cached state
      window.location.href = '/home/login';
    }
  };

  const value = useMemo(() => ({ user, setUser, loading, login, logout }), [user, loading]);

  return (
    //
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
