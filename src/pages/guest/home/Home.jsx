/**
 * HOME PAGE - Trang chủ của website
 * 
 * Route: /home
 * Layout: GuestLayout
 * 
 * Components:
 * - Banner: Banner chính với CTA buttons
 * - Footer: Footer thông tin liên hệ
 * 
 * Chức năng:
 * - Trang landing đầu tiên khi user vào website
 * - Giới thiệu về 360edu và các hình thức học tập
 * - Điều hướng đến các trang con (lớp học, khóa học)
 */

import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { Video, Users, Calendar, Book, Award, TrendingUp, BookOpen, Clock, MapPin, UserCheck, ArrowRight, GraduationCap, Star, TrendingUpIcon } from "lucide-react";
import Banner from "../../../components/common/Banner";
import { Footer } from "../../../components/common/Footer";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { classService } from "../../../services/class/class.service";
import { newsService } from "../../../services/news/news.service";

export default function Home() {
  // Nhận onNavigate function từ GuestLayout qua context
  const { onNavigate } = useOutletContext();
  const [classes, setClasses] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Tất cả");

  // Fetch classes from API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await classService.list();
        setClasses(data || []);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // Fetch news from API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await newsService.getNews({ 
          status: "published",
          sortBy: "date",
          order: "desc",
          size: 3
        });
        setNews(response.items || []);
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setNewsLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Get unique subjects for filters
  const subjects = ["Tất cả", ...new Set(classes.map(cls => cls.subjectName).filter(Boolean))];

  // Filter classes
  const filteredClasses = activeFilter === "Tất cả" 
    ? classes.slice(0, 6) 
    : classes.filter(cls => cls.subjectName === activeFilter).slice(0, 6);

  // Mock teachers data
  const teachers = [
    {
      id: 1,
      name: "Thầy Nguyễn Văn A",
      subject: "Toán học",
      experience: "10 năm kinh nghiệm",
      students: 500,
      courses: 12,
      rating: 4.9,
      achievements: ["Giáo viên xuất sắc 2023", "Thạc sĩ Toán học"],
      avatar: null
    },
    {
      id: 2,
      name: "Cô Trần Thị B",
      subject: "Tiếng Anh",
      experience: "8 năm kinh nghiệm",
      students: 600,
      courses: 15,
      rating: 4.8,
      achievements: ["IELTS 8.5", "Cambridge Certified Teacher"],
      avatar: null
    },
    {
      id: 3,
      name: "Thầy Lê Văn C",
      subject: "Vật lý",
      experience: "12 năm kinh nghiệm",
      students: 450,
      courses: 10,
      rating: 4.9,
      achievements: ["Giảng viên đại học", "Tiến sĩ Vật lý"],
      avatar: null
    },
    {
      id: 4,
      name: "Cô Phạm Thị D",
      subject: "Hóa học",
      experience: "7 năm kinh nghiệm",
      students: 380,
      courses: 8,
      rating: 4.7,
      achievements: ["Thạc sĩ Hóa học", "Giáo viên ưu tú"],
      avatar: null
    }
  ];

  const features = [
    {
      icon: Video,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Học Online",
      description: "Tham gia lớp học trực tuyến với thời gian linh hoạt, tương tác trực tiếp với giáo viên"
    },
    {
      icon: Users,
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
      title: "Học Offline",
      description: "Học tập tại trung tâm với cơ sở vật chất hiện đại và môi trường học tập chuyên nghiệp"
    },
    {
      icon: Video,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Khóa học Video",
      description: "Học theo nhu cầu với khóa video bài giảng phong phú, xem lại không giới hạn"
    },
    {
      icon: Calendar,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      title: "Quản lý lịch học",
      description: "Theo dõi lịch học, điểm danh và nhận thông báo thay đổi lịch tự động"
    },
    {
      icon: Book,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      title: "Tài liệu học tập",
      description: "Truy cập tài liệu, bài giảng và đề thi mọi lúc mọi nơi"
    },
    {
      icon: Award,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      title: "Theo dõi kết quả",
      description: "Xem điểm số, báo cáo học tập và tiến độ của bạn một cách chi tiết"
    }
  ];

  return (
    <>
      {/* Banner - Phần banner chính */}
      <Banner onNavigate={onNavigate} />
      
      {/* Features Section - Tính năng nổi bật */}
      <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-blue-600 font-medium">Tính năng</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              360edu cung cấp giải pháp quản lý giáo dục toàn diện với các tính năng hiện đại, giúp tối ưu hóa trải nghiệm học tập
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200"
              >
                <CardContent className="p-6">
                  <div className={`w-14 h-14 ${feature.iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Popular Classes Section - Lớp học phổ biến */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span className="text-blue-600 font-medium">Lớp học trực tuyến</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Tìm lớp học theo môn học
              </h2>
              <p className="text-gray-600">
                Chọn môn học yêu thích và tham gia các lớp học phù hợp với trình độ của bạn
              </p>
            </div>
          </div>

          {/* Subject Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setActiveFilter(subject)}
                className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                  activeFilter === subject
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>

          {/* Classes Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Không có lớp học nào</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((cls) => {
                const gradients = [
                  'from-blue-500 to-blue-600',
                  'from-purple-500 to-purple-600',
                  'from-green-500 to-green-600',
                  'from-orange-500 to-orange-600',
                  'from-red-500 to-red-600',
                  'from-pink-500 to-pink-600'
                ];
                const gradient = gradients[cls.id % gradients.length];
                const currentStudents = cls.currentStudents || 0;
                const maxStudents = cls.maxStudents || 30;
                const enrollmentPercentage = (currentStudents / maxStudents) * 100;

                return (
                  <Card 
                    key={cls.id}
                    className="group hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
                    onClick={() => onNavigate({ type: "class", classId: cls.id })}
                  >
                    {/* Image Header with Gradient */}
                    <div className={`h-32 bg-gradient-to-br ${gradient} relative`}>
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm">
                          {cls.subjectName || "Môn học"}
                        </Badge>
                        <Badge className={cls.online ? "bg-green-500" : "bg-blue-500"}>
                          {cls.online ? "Online" : "Offline"}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-5">
                      {/* Title */}
                      <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {cls.name || "Tên lớp học"}
                      </h3>

                      {/* Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <UserCheck className="w-4 h-4" />
                          <span>Giảng viên: {cls.teacherFullName || "Đang cập nhật"}</span>
                        </div>
                        
                        {Array.isArray(cls.schedule) && cls.schedule.length > 0 ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>Thứ {cls.schedule[0].dayOfWeek}, {cls.schedule[0].startTime?.slice(0,5)} - {cls.schedule[0].endTime?.slice(0,5)}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>Thứ 2,4,6 • 19:00 - 21:00</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Khai giảng: {cls.startDate || "01/11/2024"}</span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600">Đã đăng ký</span>
                          <span className="font-medium text-blue-600">{currentStudents}/{maxStudents}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${enrollmentPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <p className="text-xs text-gray-500">Học phí</p>
                          <p className="text-lg font-bold text-blue-600">
                            {cls.fee ? `${cls.fee.toLocaleString()}đ` : "2.500.000đ"}
                          </p>
                        </div>
                        <Button 
                          size="sm"
                          className="group-hover:bg-blue-700 transition-colors"
                        >
                          Đăng ký
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* View All Button */}
          <div className="text-center mt-12">
            <Button 
              onClick={() => onNavigate({ type: "classes" })}
              size="lg"
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
            >
              Xem tất cả lớp học
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* Teachers Section - Đội ngũ giáo viên */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-4">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-green-600 font-medium">Giáo viên xuất sắc</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Đội ngũ giáo viên
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Học cùng các giáo viên giàu kinh nghiệm, tâm huyết và chuyên nghiệp
            </p>
          </div>

          {/* Teachers Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teachers.map((teacher) => (
              <Card 
                key={teacher.id}
                className="group hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <CardContent className="p-6 text-center">
                  {/* Avatar */}
                  <div className="relative mx-auto mb-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold mx-auto group-hover:scale-110 transition-transform">
                      {teacher.name.charAt(teacher.name.indexOf(' ') + 1)}
                    </div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-900">{teacher.rating}</span>
                    </div>
                  </div>

                  {/* Name & Subject */}
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {teacher.name}
                  </h3>
                  <Badge className="mb-3">{teacher.subject}</Badge>
                  <p className="text-sm text-gray-600 mb-4">
                    {teacher.experience}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-center gap-4 mb-4 pb-4 border-b">
                    <div className="text-center">
                      <p className="text-xl font-bold text-blue-600">{teacher.students}</p>
                      <p className="text-xs text-gray-500">Học viên</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-blue-600">{teacher.courses}</p>
                      <p className="text-xs text-gray-500">Khóa học</p>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="space-y-2 mb-4">
                    {teacher.achievements.map((achievement, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                        <Award className="w-3 h-3 text-yellow-500" />
                        <span className="line-clamp-1">{achievement}</span>
                      </div>
                    ))}
                  </div>

                  {/* View Profile Button */}
                  <Button 
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    Xem hồ sơ
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* View All Teachers Button */}
          <div className="text-center mt-12">
            <Button 
              onClick={() => onNavigate({ type: "teachers" })}
              size="lg"
              variant="outline"
              className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            >
              Xem tất cả giáo viên
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* News Section - Tin tức & Sự kiện */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 rounded-full mb-4">
              <BookOpen className="w-5 h-5 text-pink-600" />
              <span className="text-pink-600 font-medium">Tin tức mới</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tin tức & Sự kiện
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Cập nhật những tin tức mới nhất về các khóa học, chương trình và thành tích của 360edu
            </p>
          </div>

          {/* News Grid */}
          {newsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            </div>
          ) : news.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item, index) => {
                  // Gradient colors for news cards
                  const gradients = [
                    "from-orange-400 to-red-500",
                    "from-purple-400 to-pink-500", 
                    "from-blue-400 to-cyan-500"
                  ];
                  const gradient = gradients[index % gradients.length];

                  // Parse tags if it's a string
                  const tags = typeof item.tags === 'string' 
                    ? item.tags.split(',').map(t => t.trim()).filter(Boolean)
                    : (Array.isArray(item.tags) ? item.tags : []);

                  // Format date
                  const formatDate = (dateString) => {
                    if (!dateString) return '';
                    const date = new Date(dateString);
                    return date.toLocaleDateString('vi-VN', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    });
                  };

                  return (
                    <Card 
                      key={item.id}
                      className="group hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
                    >
                      {/* Image/Gradient Header */}
                      <div className={`h-48 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BookOpen className="w-16 h-16 text-white opacity-50" />
                          </div>
                        )}
                        {tags.length > 0 && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-white text-gray-900">
                              {tags[0]}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-6">
                        {/* Date and Reading Time */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(item.createdDate)}</span>
                          </div>
                          {item.readTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{item.readTime} phút</span>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                          {item.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {item.excerpt || item.content?.substring(0, 150) + '...' || 'Mô tả ngắn về tin tức này...'}
                        </p>

                        {/* Read More Link */}
                        <button 
                          className="text-pink-600 hover:text-pink-700 font-medium text-sm flex items-center gap-1"
                          onClick={() => onNavigate({ type: "news", id: item.id })}
                        >
                          Đọc thêm
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* View All News Button */}
              <div className="text-center mt-12">
                <Button 
                  onClick={() => onNavigate({ type: "news" })}
                  size="lg"
                  variant="outline"
                  className="border-2 border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white"
                >
                  Xem tất cả tin tức
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Chưa có tin tức nào
            </div>
          )}
        </div>
      </section>
      
      {/* Footer - Thông tin liên hệ */}
      <Footer />
    </>
  );
}