import { Link, useLocation } from "react-router-dom";

export default function Navigation({ items, className = "" }) {
  const location = useLocation();
  
  return (
    <nav className={`flex space-x-6 ${className}`}>
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            location.pathname === item.path
              ? "bg-yellow-500 text-black"
              : "text-gray-300 hover:text-white hover:bg-gray-700"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
