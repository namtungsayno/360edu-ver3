//E:\Semester9\360Edu\src\App.jsx   Ngoc Hung
//Nạp router, là file component gốc của toàn bộ ứng dụng
//Router quyết định layout nào + trang nào hiển thị
// Là component gốc (root component).
// Quyết định hệ thống routing (điều hướng trang) nào sẽ được dùng.
// Chứa <AppRouter />.

import { useEffect } from "react";
import AppRouter from "./router";
import { ToastContainer } from "./components/ui/Toast";
import { useNotification } from "./hooks/use-notification";
import { setToastInstance } from "./hooks/use-toast";

function App() {
  const notification = useNotification();
  const { toasts, removeToast } = notification;

  // Set global toast instance MỘT LẦN khi mount
  // Dùng ref để tránh re-render
  useEffect(() => {
    setToastInstance({
      success: notification.success,
      error: notification.error,
      warning: notification.warning,
      info: notification.info,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <AppRouter />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

export default App;
