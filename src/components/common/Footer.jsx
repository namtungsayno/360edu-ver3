// src/components/common/Footer.jsx
import { Mail, Phone, MapPin, Facebook, Youtube, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg p-2">
                <Logo />
              </div>
              <div>
                <h3 className="text-white text-xl font-bold">360edu</h3>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Hệ thống quản lý giáo dục toàn diện với 3 hình thức học tập: Online, Offline và Video courses.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white mb-4">Liên kết nhanh</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/home" className="hover:text-blue-400 transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/home/classes" className="hover:text-blue-400 transition-colors">
                  Lớp học
                </Link>
              </li>
              <li>
                <Link to="/home/teachers" className="hover:text-blue-400 transition-colors">
                  Giáo viên
                </Link>
              </li>
              <li>
                <Link to="/home/news" className="hover:text-blue-400 transition-colors">
                  Tin tức
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white mb-4">Hỗ trợ</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/home/faq" className="hover:text-blue-400 transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-blue-400 transition-colors">
                  Hướng dẫn đăng ký
                </Link>
              </li>
              <li>
                <Link to="/home/payment-policy" className="hover:text-blue-400 transition-colors">
                  Chính sách thanh toán
                </Link>
              </li>
              <li>
                <Link to="/home/terms" className="hover:text-blue-400 transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link to="/home/privacy" className="hover:text-blue-400 transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white mb-4">Liên hệ</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                <span>Đại học FPT, Khu Công nghệ cao Hòa Lạc, Km 29, Đại lộ Thăng Long, Thạch Thất, Hà Nội</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                <span>024 7300 1866</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                <span>contact@360edu.vn</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
