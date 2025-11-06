// E:\Semester9\360Edu\src\main.jsx  NgocHung
//Khoi dong app
// Đây là entry point (điểm vào) của ứng dụng React khi Vite chạy.
// Nó tạo root DOM (nơi React sẽ render vào HTML thật).
// Import global CSS và component App.
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext"; // ✅

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
