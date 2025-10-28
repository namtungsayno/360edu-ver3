// Tách phần logic xử lý (fetch API, auth, form, …) khỏi UI.
// Tái sử dụng code ở nhiều component mà không cần lặp lại.
//  Quy tắc bắt buộc
// Quy tắc	Giải thích
// Bắt đầu bằng use	Ví dụ: useAuth, useFetch, useDebounce
// Viết thường (camelCase)	File: useAuth.js, useFetch.js
// Chỉ gọi hook bên trong React function	Không gọi trong if, loop, hay ngoài component
// Không return JSX	Custom hook chỉ trả về data hoặc function, không trả UI

// src/hooks/useAuth.js
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

export const useAuth = () => {
  return useContext(AuthContext);
};
