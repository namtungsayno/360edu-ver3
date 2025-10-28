// Constants, enums
Lưu các hằng số (constants) và định nghĩa tĩnh trong hệ thống.
Ví dụ: tên route, role người dùng, endpoint API,…

roles.js → chứa vai trò người dùng (admin, teacher, student,…)

export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};


routes.js → chứa tên các route frontend (đường dẫn trang)

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
};


api.endpoints.js → chứa các endpoint backend

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  USERS: '/users',
  COURSES: '/courses',
};