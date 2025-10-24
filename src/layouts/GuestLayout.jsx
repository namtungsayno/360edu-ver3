import { Outlet } from "react-router-dom";
import Navigation from "../components/common/Navigation";

export default function GuestLayout() {
  const navigationItems = [
    { path: "/home", label: "Home" },
    { path: "/home/profile", label: "Profile" },
    { path: "/home/admin", label: "Admin" },
    { path: "/home/login", label: "Login" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-yellow-400">360Edu</h1>
              <span className="ml-2 text-sm text-gray-400">Learning Platform</span>
            </div>
            <Navigation items={navigationItems} />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}


