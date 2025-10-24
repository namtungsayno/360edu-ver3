// AuthLayout: Dành cho login/register, không có navbar.

import { Outlet, Link } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/home" className="text-3xl font-bold text-yellow-400 hover:text-yellow-300">
            360Edu
          </Link>
          <p className="text-gray-400 mt-2">Learning Platform</p>
        </div>
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
