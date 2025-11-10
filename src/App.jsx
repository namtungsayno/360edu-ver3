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
  const { toasts, removeToast, success, error, warning, info } =
    useNotification();

  // Set global toast instance để có thể sử dụng toast.success() ở bất kỳ đâu
  useEffect(() => {
    setToastInstance({ success, error, warning, info });
  }, [success, error, warning, info]);

  return (
    <>
      <AppRouter />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

export default App;
