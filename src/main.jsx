// E:\Semester9\360Edu\src\main.jsx  NgocHung
//Khoi dong app
// Đây là entry point (điểm vào) của ứng dụng React khi Vite chạy.
// Nó tạo root DOM (nơi React sẽ render vào HTML thật).
// Import global CSS và component App.
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

// Disable console colors for cleaner logs
if (typeof console !== "undefined") {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (...args) => originalLog(...args);
  console.error = (...args) => originalError(...args);
  console.warn = (...args) => originalWarn(...args);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>
);
