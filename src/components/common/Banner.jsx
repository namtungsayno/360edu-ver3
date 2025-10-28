/**
 * BANNER COMPONENT - Phần banner chính của trang chủ
 * 
 * Trang sử dụng: /home (Trang chủ)
 * 
 * Chức năng:
 * - Hiển thị thông tin chính về 360edu
 * - Call-to-action buttons dẫn đến lớp học và khóa học
 * - Hiển thị số liệu thống kê (học viên, khóa học, giáo viên)
 * - Ảnh minh họa với floating cards
 * - Responsive design với animations
 */

import { ArrowRight, PlayCircle, Sparkles, Star, TrendingUp, GraduationCap, Video } from "lucide-react";
import { Button } from "../ui/Button";
import { ImageWithFallback } from "../ui/ImageWithFallback";

export default function Banner({ onNavigate }) {
  return (
    <section id="home" className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 md:py-32 overflow-hidden">
      {/* CÁC HIỆU ỨNG NỀN ĐỘNG - Tạo depth và visual appeal */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          {/* NỘI DUNG CHÍNH - Bên trái */}
          <div className="space-y-6 animate-fadeIn flex flex-col justify-center">
            {/* Badge giới thiệu */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full border border-blue-200 shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>Hệ thống Quản lý Giáo dục Toàn diện</span>
            </div>

            {/* Tiêu đề chính với gradient text */}
            <h1 className="bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 bg-clip-text text-transparent">
              Học tập linh hoạt với 360edu
            </h1>

            {/* Mô tả chi tiết về 3 hình thức học tập */}
            <p className="text-gray-600 leading-relaxed">
              Nền tảng giáo dục hiện đại hỗ trợ 3 hình thức học tập: <span className="text-blue-600">Học Online</span>, <span className="text-purple-600">Học Offline</span> tại trung tâm, và <span className="text-pink-600">Khóa học Video</span> theo nhu cầu. Trải nghiệm học tập tối ưu với đội ngũ giáo viên chuyên nghiệp.
            </p>

            {/* CÁC NÚT CALL-TO-ACTION */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Button chính - Xem lớp học */}
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-2 shadow-lg hover:shadow-xl transition-all duration-300 group"
                size="lg"
                onClick={() => onNavigate({ type: "subjects" })}
              >
                <GraduationCap className="w-5 h-5" />
                Xem lớp học
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              {/* Button phụ - Khóa học Video */}
              <Button
                variant="outline"
                className="gap-2 border-2 hover:bg-gray-50 group"
                size="lg"
                onClick={() => onNavigate({ type: "courses" })}
              >
                <Video className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Khóa học Video
              </Button>
            </div>

            {/* THỐNG KÊ SỐ LIỆU - 3 cột responsive */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              {/* Số học viên */}
              <div className="group cursor-pointer">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all group-hover:scale-110">
                  500+
                </div>
                <p className="text-gray-600 flex items-center gap-1">
                  Học viên
                  <TrendingUp className="w-3 h-3 text-green-500" />
                </p>
              </div>
              
              {/* Số khóa học */}
              <div className="group cursor-pointer">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent transition-all group-hover:scale-110">
                  50+
                </div>
                <p className="text-gray-600 flex items-center gap-1">
                  Khóa học
                  <Star className="w-3 h-3 text-yellow-500" />
                </p>
              </div>
              
              {/* Số giáo viên */}
              <div className="group cursor-pointer">
                <div className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent transition-all group-hover:scale-110">
                  30+
                </div>
                <p className="text-gray-600 flex items-center gap-1">
                  Giáo viên
                  <Sparkles className="w-3 h-3 text-blue-500" />
                </p>
              </div>
            </div>
          </div>

          {/* PHẦN ẢNH MINH HỌA - Bên phải, chiếm 85% width */}
          <div className="relative flex items-center justify-center">
            {/* Ảnh chính với gradient overlay */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500 w-[85%] mx-auto">
              {/* Gradient overlay cho depth */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 z-10"></div>
              
              {/* Ảnh banner từ assets */}
              <ImageWithFallback
               src="/assets/images/banner.jpg"
                className="w-full h-auto"
              />
            </div>
            
            {/* FLOATING CARD - Video miễn phí (góc dưới trái) */}
            <div className="absolute bottom-4 left-2 bg-white p-4 rounded-xl shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-300 animate-float">
              <div className="flex items-center gap-3">
                {/* Icon video với gradient background */}
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <PlayCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-900 text-sm">Video miễn phí</p>
                  <p className="text-gray-600 text-xs">Xem trước khóa học</p>
                </div>
              </div>
            </div>

            {/* FLOATING CARD - Rating (góc trên phải) */}
            <div className="absolute top-4 right-2 bg-white p-3 rounded-xl shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-300 animate-float delay-500">
              {/* 5 sao đánh giá */}
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 text-xs">Đánh giá 4.9/5</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
