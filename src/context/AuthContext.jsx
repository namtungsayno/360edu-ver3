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
  // khởi tạo từ localStorage - nhưng sẽ validate sau
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate saved user on mount
    const validateSavedUser = () => {
      const savedUser = authService.loadSavedUser();
      const token = localStorage.getItem('edu360_jwt');
      
      // Only restore user if we have both user data and valid token
      if (savedUser && token) {
        setUser(savedUser);
      } else if (savedUser && !token) {
        // User data exists but no token - invalid state, clear it
        localStorage.removeItem('auth_user');
        setUser(null);
      }
      
      setLoading(false);
    };
    
    validateSavedUser();
  }, []);

  const login = async ({ username, password, remember }) => {
    const me = await authService.login({ username, password, remember });
    setUser(me);
    return me;
  };

  // Set user directly without calling login API (used for Google OAuth)
  const setUserDirectly = (userData) => {
    setUser(userData);
    // Lưu đồng nhất với authService: sử dụng cùng key 'auth_user'
    if (userData) {
      try {
        const normalized = {
          ...userData,
          roles: (userData.roles || []).map((r) => String(r).replace(/^ROLE_/, '').toLowerCase()),
        };
        localStorage.setItem('auth_user', JSON.stringify(normalized));
      } catch {}
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      } finally {
      // Clear user state immediately
      setUser(null);
      
      // Clear all localStorage
      localStorage.clear();
      
      // Clear all sessionStorage (including Google OAuth code)
      sessionStorage.clear();
      
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Add timestamp to ensure cache is cleared
      const timestamp = new Date().getTime();
      
      // Force reload with cache clear
      window.location.href = `/home/login?t=${timestamp}`;
    }
  };

  const value = useMemo(() => ({ user, setUser, setUserDirectly, loading, login, logout }), [user, loading]);

  return (
    //
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
