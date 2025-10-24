// Context trong React dùng để:
// Chia sẻ dữ liệu toàn ứng dụng mà không phải truyền props qua nhiều cấp.
// Ví dụ: thông tin user login, dark/light mode, ngôn ngữ, cấu hình hệ thống,…
//  Giúp tránh việc “props drilling” (truyền props lòng vòng nhiều component).

// src/context/AuthContext.jsx
import { createContext , useState, useEffect } from "react"

// 1️⃣ Tạo Context
const AuthContext = createContext()

// 2️⃣ Tạo Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 3️⃣ Khi app khởi động, kiểm tra localStorage hoặc token còn không
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  // 4️⃣ Hàm đăng nhập
  const login = (userData) => {
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  // 5️⃣ Hàm đăng xuất
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  // 6️⃣ Trả về Provider chia sẻ giá trị
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
