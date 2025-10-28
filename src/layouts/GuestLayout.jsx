//src/layouts/GuestLayout.jsx NgocHung
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/common/Header";

export default function GuestLayout() {
const navigate = useNavigate();
const location = useLocation();
const [currentPage, setCurrentPage] = useState({ type: "home" });

// Update current page based on URL
useEffect(() => {
  const path = location.pathname;
  if (path === "/home") {
    setCurrentPage({ type: "home" });
  } else if (path.includes("/profile")) {
    setCurrentPage({ type: "profile" });
  } else if (path.includes("/courses")) {
    setCurrentPage({ type: "courses" });
  } else if (path.includes("/subjects")) {
    setCurrentPage({ type: "subjects" });
  } else if (path.includes("/teachers")) {
    setCurrentPage({ type: "teachers" });
  } else if (path.includes("/news")) {
    setCurrentPage({ type: "news" });
  } else if (path.includes("/about")) {
    setCurrentPage({ type: "about" });
  }
}, [location.pathname]);

const onNavigate = (page) => {
  switch (page.type) {
    case "home":
      navigate("/home");
      break;
    case "login":
      navigate("/home/login");
      break;
    case "register":
      // TODO: Create register route
      console.log("Register page not implemented yet");
      break;
    case "profile":
      navigate("/home/profile");
      break;
    case "courses":
      // TODO: Create courses route
      console.log("Courses page not implemented yet");
      break;
    case "subjects":
      // TODO: Create subjects route
      console.log("Subjects page not implemented yet");
      break;
    case "teachers":
      // TODO: Create teachers route
      console.log("Teachers page not implemented yet");
      break;
    case "news":
      // TODO: Create news route
      console.log("News page not implemented yet");
      break;
    case "about":
      // TODO: Create about route
      console.log("About page not implemented yet");
      break;
    default:
      console.log("Unknown navigation:", page);
  }
};

return (
<div className="min-h-screen bg-white text-gray-900">
<Header onNavigate={onNavigate} currentPage={currentPage} />
<main>
<Outlet context={{ onNavigate }} />
</main>
</div>
);
}

