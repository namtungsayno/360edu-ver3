//Nạp router, là file component gốc của toàn bộ ứng dụng
//Router quyết định layout nào + trang nào hiển thị
// Là component gốc (root component).
// Quyết định hệ thống routing (điều hướng trang) nào sẽ được dùng.
// Chứa <AppRouter />.

import AppRouter from "./router";

function App() {
  return <AppRouter />;
}

export default App;
