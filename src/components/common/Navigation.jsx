//E:\Semester9\360Edu\src\components\common\Navigation.jsx NgocHung

// import { Link, useLocation } from "react-router-dom";

// export default function Navigation({ items, className = "" }) {
//   const location = useLocation();

//   return (
//     <nav className={`flex space-x-6 ${className}`}>
//       {items.map((item) => (
//         <Link
//           key={item.path}
//           to={item.path}
//           className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
//             location.pathname === item.path
//               ? "bg-yellow-500 text-black"
//               : "text-gray-300 hover:text-white hover:bg-gray-700"
//           }`}
//         >
//           {item.label}
//         </Link>
//       ))}
//     </nav>
//   );
// }
import { Link, useLocation } from "react-router-dom";

export default function Navigation({ items, className = "" }) {
  const location = useLocation();

  return (
    <nav className={`flex space-x-2 ${className}`}>
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={
              "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 " +
              (isActive
                ? "bg-slate-900 text-white" // hoặc bg-yellow-500 text-black nếu bạn thích
                : "text-slate-600 hover:text-slate-900 hover:bg-gray-100")
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
