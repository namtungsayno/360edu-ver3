//src/components/common/HeroSection.jsx
import { ArrowRight, PlayCircle, Sparkles, Star, TrendingUp, GraduationCap, Video } from "lucide-react";
import { Button } from "../ui/Button";
import { ImageWithFallback } from "../ui/ImageWithFallback";

export default function HeroSection({ onNavigate }) {
  return (
    <section id="home" className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 md:py-32 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          {/* Left Content */}
          <div className="space-y-6 animate-fadeIn flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full border border-blue-200 shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>Hệ thống Quản lý Giáo dục Toàn diện</span>
            </div>
            
            <h1 className="bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 bg-clip-text text-transparent">
              Học tập linh hoạt với 360edu
            </h1>
            
            <p className="text-gray-600 leading-relaxed">
              Nền tảng giáo dục hiện đại hỗ trợ 3 hình thức học tập: <span className="text-blue-600">Học Online</span>, <span className="text-purple-600">Học Offline</span> tại trung tâm, và <span className="text-pink-600">Khóa học Video</span> theo nhu cầu. Trải nghiệm học tập tối ưu với đội ngũ giáo viên chuyên nghiệp.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-2 shadow-lg hover:shadow-xl transition-all duration-300 group" 
                size="lg"
                onClick={() => onNavigate({ type: "subjects" })}
              >
                <GraduationCap className="w-5 h-5" />
                Xem lớp học
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
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

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="group cursor-pointer">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all group-hover:scale-110">
                  500+
                </div>
                <p className="text-gray-600 flex items-center gap-1">
                  Học viên
                  <TrendingUp className="w-3 h-3 text-green-500" />
                </p>
              </div>
              <div className="group cursor-pointer">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent transition-all group-hover:scale-110">
                  50+
                </div>
                <p className="text-gray-600 flex items-center gap-1">
                  Khóa học
                  <Star className="w-3 h-3 text-yellow-500" />
                </p>
              </div>
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

          {/* Right Image - Smaller and Centered */}
          <div className="relative flex items-center justify-center">
            {/* Main Image - Smaller */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500 w-[85%] mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 z-10"></div>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758874573116-2bc02232eef1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGxlYXJuaW5nJTIwb25saW5lfGVufDF8fHx8MTc2MDY3ODIwNXww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Students learning online"
                className="w-full h-auto"
              />
            </div>
            
            {/* Floating Card - Video */}
            <div className="absolute bottom-4 left-2 bg-white p-4 rounded-xl shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-300 animate-float">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <PlayCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-900 text-sm">Video miễn phí</p>
                  <p className="text-gray-600 text-xs">Xem trước khóa học</p>
                </div>
              </div>
            </div>

            {/* Floating Card - Rating */}
            <div className="absolute top-4 right-2 bg-white p-3 rounded-xl shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-300 animate-float delay-500">
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
