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

import { useOutletContext, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Video,
  Users,
  Calendar,
  Book,
  Award,
  TrendingUp,
  BookOpen,
  Clock,
  UserCheck,
  ArrowRight,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Banner from "../../../components/common/Banner";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { ImageWithFallback } from "../../../components/ui/ImageWithFallback";
import { classService } from "../../../services/class/class.service";
import { newsService } from "../../../services/news/news.service";
import { teacherService } from "../../../services/teacher/teacher.service";
import { dayLabelVi, formatDateVN } from "../../../helper/formatters";
import { stripHtmlTags, stripAndTruncate } from "../../../utils/html-helpers";

export default function Home() {
  // Nhận onNavigate function từ GuestLayout qua context
  const { onNavigate } = useOutletContext();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [news, setNews] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [teachersLoading, setTeachersLoading] = useState(true);

  // Carousel states
  // Tự động chuyển slide (slideshow)
  useEffect(() => {
    if (classes.length <= 4) return;
    const interval = setInterval(() => {
      setClassesIndex((prev) => {
        if (prev + 4 >= classes.length) return 0;
        return prev + 1;
      });
    }, 3000); // 3 giây
    return () => clearInterval(interval);
  }, [classes.length]);
  // Render grid cho carousel với hiệu ứng
  const gradients = [
    "from-blue-500 via-blue-600 to-indigo-600",
    "from-purple-500 via-purple-600 to-pink-600",
    "from-green-500 via-emerald-600 to-teal-600",
    "from-orange-500 via-amber-600 to-yellow-600",
    "from-red-500 via-rose-600 to-pink-600",
    "from-cyan-500 via-blue-600 to-indigo-600",
  ];
  function renderClassGrid(classesArr) {
    return classesArr.map((cls) => {
      const gradient = gradients[cls.id % gradients.length];
      const currentStudents = cls.currentStudents || 0;
      const maxStudents = cls.maxStudents || 30;
      const enrollmentPercentage = (currentStudents / maxStudents) * 100;
      const teacherInitial = (cls.teacherFullName || "G")
        .charAt(0)
        .toUpperCase();
      return (
        <Card
          key={cls.id}
          className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-200 flex flex-col h-full"
          onClick={() => onNavigate({ type: "class", classId: cls.id })}
        >
          {/* Image Header with Gradient & Overlay */}
          <div className={`h-40 bg-gradient-to-br ${gradient} relative`}>
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all"></div>
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <Badge className="bg-white/95 text-gray-900 backdrop-blur-sm shadow-lg w-fit">
                  {cls.subjectName || "Môn học"}
                </Badge>
                <Badge
                  className={
                    cls.online
                      ? "bg-green-500/90 backdrop-blur-sm shadow-lg w-fit"
                      : "bg-blue-500/90 backdrop-blur-sm shadow-lg w-fit"
                  }
                >
                  {cls.online ? "🌐 Online" : "📍 Offline"}
                </Badge>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-full p-2 shadow-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          <CardContent className="p-5 relative flex-1 flex flex-col">
            {/* Teacher Avatar - Overlapping */}
            <div className="absolute -top-10 right-4">
              <div className="w-20 h-20 rounded-full bg-white ring-4 ring-white shadow-xl flex items-center justify-center overflow-hidden">
                {cls.teacherAvatarUrl ? (
                  <ImageWithFallback
                    src={cls.teacherAvatarUrl}
                    alt={cls.teacherFullName}
                    className="w-full h-full object-cover rounded-full"
                    fallbackSrc="/assets/images/banner.jpg"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">
                      {teacherInitial}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors pr-20">
              {cls.name || "Tên lớp học"}
            </h3>
            {/* Teacher Name */}
            <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span className="font-medium">
                {cls.teacherFullName || "Đang cập nhật"}
              </span>
            </p>
            {/* Info */}
            <div className="space-y-2 mb-4">
              {Array.isArray(cls.schedule) && cls.schedule.length > 0 ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {dayLabelVi(cls.schedule[0].dayOfWeek)},{" "}
                    {cls.schedule[0].startTime?.slice(0, 5)} -{" "}
                    {cls.schedule[0].endTime?.slice(0, 5)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Thứ Hai, Tư, Sáu • 19:00 - 21:00</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Khai giảng: {formatDateVN(cls.startDate) || "01/11/2024"}
                </span>
              </div>
            </div>
            {/* Spacer to push content below to bottom */}
            <div className="flex-1"></div>
            {/* Enrollment Progress */}
            <div className="mb-4 bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-600 font-medium">
                  Tình trạng đăng ký
                </span>
                <span className="font-bold text-blue-600">
                  {currentStudents}/{maxStudents} học viên
                </span>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    enrollmentPercentage >= 100
                      ? "bg-red-600"
                      : "bg-gradient-to-r from-blue-500 to-purple-500"
                  }`}
                  style={{ width: `${Math.min(enrollmentPercentage, 100)}%` }}
                />
              </div>
              <div className="mt-2 text-xs">
                {enrollmentPercentage >= 100 ? (
                  <span className="text-red-800 font-medium">
                    🚫 Đã đầy chỗ
                  </span>
                ) : enrollmentPercentage >= 80 ? (
                  <span className="text-red-600 font-medium">
                    ⚡ Sắp đầy chỗ!
                  </span>
                ) : enrollmentPercentage >= 50 ? (
                  <span className="text-orange-600 font-medium">
                    🔥 Đang hot
                  </span>
                ) : (
                  <span className="text-green-600 font-medium">
                    ✨ Còn nhiều chỗ
                  </span>
                )}
              </div>
            </div>
            {/* CTA Button */}
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg group-hover:shadow-xl transition-all">
              <span className="font-medium">Xem chi tiết lớp học</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      );
    });
  }
  const [classesIndex, setClassesIndex] = useState(0);
  const [teachersIndex, setTeachersIndex] = useState(0);
  const [newsIndex, setNewsIndex] = useState(0);

  // Fetch classes from API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await classService.list();
        setClasses(data || []);
      } catch (error) {
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
          page: 0,
          size: 3,
        });
        const newsData = response.content || response.data || response || [];
        // Filter published news and take first 3
        const publishedNews = newsData
          .filter((n) => n.status?.toLowerCase() === "published")
          .slice(0, 3);
        setNews(publishedNews);
      } catch (error) {
      } finally {
        setNewsLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Carousel navigation functions
  const handleClassesNext = () => {
    if (classes.length <= 4) return;
    if (classesIndex + 4 >= classes.length) {
      setClassesIndex(0);
    } else {
      setClassesIndex(classesIndex + 1);
    }
  };

  const handleClassesPrev = () => {
    if (classes.length <= 4) return;
    if (classesIndex === 0) {
      setClassesIndex(classes.length - 4);
    } else {
      setClassesIndex(classesIndex - 1);
    }
  };

  const handleTeachersNext = () => {
    if (teachersIndex + 4 < teachers.length) {
      setTeachersIndex(teachersIndex + 1);
    }
  };

  const handleTeachersPrev = () => {
    if (teachersIndex > 0) {
      setTeachersIndex(teachersIndex - 1);
    }
  };

  const handleNewsNext = () => {
    if (newsIndex + 4 < news.length) {
      setNewsIndex(newsIndex + 1);
    }
  };

  const handleNewsPrev = () => {
    if (newsIndex > 0) {
      setNewsIndex(newsIndex - 1);
    }
  };

  // Get items for carousel display (4 items for all sections)
  const displayedClasses = classes.slice(classesIndex, classesIndex + 4);
  const displayedTeachers = teachers.slice(teachersIndex, teachersIndex + 4);
  const displayedNews = news.slice(newsIndex, newsIndex + 4);

  // Fetch teachers from API
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await teacherService.list();
        // Merge real data with mock data for missing fields
        const enrichedTeachers = (data || []).map((teacher) => ({
          id: teacher.id,
          userId: teacher.userId,
          name: teacher.fullName || teacher.username,
          subject:
            teacher.subjectNames?.join(", ") ||
            teacher.subjectName ||
            "Chưa xác định",
          experience: teacher.yearsOfExperience
            ? `${teacher.yearsOfExperience} năm kinh nghiệm`
            : teacher.degree || "Giáo viên",
          courses: teacher.classCount || 0,
          rating: teacher.rating || 0,
          achievements: [
            teacher.degree,
            stripHtmlTags(teacher.specialization),
          ].filter(Boolean),
          avatar: teacher.avatarUrl,
          bio: teacher.bio,
          workplace: teacher.workplace,
        }));
        setTeachers(enrichedTeachers.slice(0, 10)); // Show first 10 teachers for carousel
      } catch (error) {
      } finally {
        setTeachersLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const features = [
    {
      icon: Video,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Học Online",
      description:
        "Tham gia lớp học trực tuyến với thời gian linh hoạt, tương tác trực tiếp với giáo viên",
    },
    {
      icon: Users,
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
      title: "Học Offline",
      description:
        "Học tập tại trung tâm với cơ sở vật chất hiện đại và môi trường học tập chuyên nghiệp",
    },
    {
      icon: Calendar,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      title: "Quản lý lịch học",
      description:
        "Theo dõi lịch học, điểm danh và nhận thông báo thay đổi lịch tự động",
    },
    {
      icon: Book,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      title: "Tài liệu học tập",
      description: "Truy cập tài liệu, bài giảng và đề thi mọi lúc mọi nơi",
    },
    {
      icon: Award,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      title: "Theo dõi kết quả",
      description:
        "Xem điểm số, báo cáo học tập và tiến độ của bạn một cách chi tiết",
    },
    {
      icon: TrendingUp,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Nâng cao kỹ năng",
      description:
        "Phát triển kỹ năng toàn diện với chương trình đào tạo chuẩn quốc tế",
    },
  ];

  return (
    <>
      {/* Banner - Phần banner chính */}
      <Banner onNavigate={onNavigate} />

      {/* Features Section - Tính năng nổi bật */}
      <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-8">
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
              360edu cung cấp giải pháp quản lý giáo dục toàn diện với các tính
              năng hiện đại, giúp tối ưu hóa trải nghiệm học tập
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200"
              >
                <CardContent className="p-8 pt-8">
                  <div
                    className={`w-14 h-14 ${feature.iconBg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
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
        <div className="max-w-screen-2xl mx-auto px-6 md:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span className="text-blue-600 font-medium">
                  Lớp học trực tuyến
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Lớp học nổi bật
              </h2>
              <p className="text-gray-600">
                Tham gia các lớp học phù hợp với trình độ của bạn
              </p>
            </div>
          </div>

          {/* Carousel Container */}
          <div className="relative">
            {/* Navigation Arrows */}
            {classes.length > 4 && (
              <>
                <button
                  onClick={handleClassesPrev}
                  disabled={classesIndex === 0}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <button
                  onClick={handleClassesNext}
                  disabled={classesIndex + 4 >= classes.length}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
              </>
            )}
            {/* Navigation Arrows */}
            {classes.length > 4 && (
              <>
                <button
                  onClick={handleClassesPrev}
                  disabled={classesIndex === 0}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <button
                  onClick={handleClassesNext}
                  disabled={classesIndex + 4 >= classes.length}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
              </>
            )}

            {/* Classes Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Đang tải...</p>
              </div>
            ) : displayedClasses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Không có lớp học nào</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderClassGrid(displayedClasses)}
              </div>
            )}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <Button
              onClick={() => onNavigate({ type: "classes" })}
              size="lg"
              variant="outline-primary"
            >
              Xem tất cả lớp học
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Teachers Section - Đội ngũ giáo viên */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-4">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-green-600 font-medium">
                Giáo viên xuất sắc
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Đội ngũ giáo viên
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Học cùng các giáo viên giàu kinh nghiệm, tâm huyết và chuyên
              nghiệp
            </p>
          </div>

          {/* Carousel Container */}
          <div className="relative">
            {/* Navigation Arrows */}
            {teachers.length > 4 && (
              <>
                <button
                  onClick={handleTeachersPrev}
                  disabled={teachersIndex === 0}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <button
                  onClick={handleTeachersNext}
                  disabled={teachersIndex + 4 >= teachers.length}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
              </>
            )}

            {/* Teachers Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teachersLoading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, idx) => (
                  <Card key={idx} className="animate-pulse overflow-hidden">
                    <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                    <CardContent className="p-6">
                      <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto -mt-14 mb-4 border-4 border-white"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : displayedTeachers.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  Chưa có giáo viên nào
                </div>
              ) : (
                displayedTeachers.map((teacher) => {
                  const nameParts = (teacher.name || "").trim().split(" ");
                  const lastInitial = nameParts.length
                    ? nameParts[nameParts.length - 1].charAt(0)
                    : "?";
                  return (
                    <Card
                      key={teacher.id}
                      className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer border-2 border-transparent hover:border-purple-200 flex flex-col h-full"
                      onClick={() =>
                        onNavigate({
                          type: "teacher",
                          teacherId: teacher.userId,
                        })
                      }
                    >
                      {/* Header Background with Gradient */}
                      <div className="h-32 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 relative flex-shrink-0">
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      </div>

                      <CardContent className="p-5 text-center relative flex-1 flex flex-col">
                        {/* Avatar - Overlapping the header */}
                        <div className="relative mx-auto -mt-16 mb-4">
                          <div className="w-28 h-28 rounded-full ring-4 ring-white shadow-xl overflow-hidden mx-auto bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                            {teacher.avatar ? (
                              <ImageWithFallback
                                src={teacher.avatar}
                                alt={teacher.name}
                                className="w-full h-full object-cover rounded-full"
                                fallbackSrc="/assets/images/banner.jpg"
                              />
                            ) : (
                              <span className="text-3xl font-bold text-white">
                                {lastInitial}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Name & Subject */}
                        <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-1">
                          {teacher.name}
                        </h3>
                        <div className="flex flex-wrap justify-center gap-1 mb-2 min-h-[28px]">
                          {(() => {
                            const subjects = teacher.subject?.split(",").map(s => s.trim()).filter(Boolean) || [];
                            const displaySubjects = subjects.slice(0, 2);
                            const remaining = subjects.length - 2;
                            const hiddenSubjects = subjects.slice(2);
                            return (
                              <>
                                {displaySubjects.map((subj, idx) => (
                                  <Badge key={idx} className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                                    {subj}
                                  </Badge>
                                ))}
                                {remaining > 0 && (
                                  <div className="relative group/tooltip">
                                    <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs cursor-pointer hover:bg-gray-200">
                                      +{remaining}
                                    </Badge>
                                    {/* Tooltip */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50">
                                      <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl min-w-[200px] max-w-[280px]">
                                        <p className="font-semibold mb-2 text-center border-b border-gray-600 pb-1">Môn học khác</p>
                                        <div className={`${hiddenSubjects.length > 3 ? 'grid grid-cols-2 gap-x-3 gap-y-1' : 'space-y-1'}`}>
                                          {hiddenSubjects.map((subj, idx) => (
                                            <p key={idx} className="text-gray-300 truncate">• {subj}</p>
                                          ))}
                                        </div>
                                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-800"></div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2 min-h-[32px]">
                          {teacher.experience}
                        </p>

                        {/* Stats - Chỉ hiển thị số lớp học */}
                        <div className="flex items-center justify-center gap-4 mb-3 pb-3 border-b border-gray-100">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <BookOpen className="w-3 h-3 text-purple-600" />
                              <p className="text-base font-bold text-gray-900">
                                {teacher.courses}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500">Lớp học</p>
                          </div>
                        </div>

                        {/* Achievements */}
                        <div className="space-y-1.5 mb-3 min-h-[50px]">
                          {teacher.achievements
                            .slice(0, 2)
                            .map((achievement, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded"
                              >
                                <Award className="w-3 h-3 text-yellow-500 shrink-0" />
                                <span className="line-clamp-1 text-left">
                                  {achievement}
                                </span>
                              </div>
                            ))}
                        </div>

                        {/* Spacer to push button to bottom */}
                        <div className="flex-1"></div>

                        {/* View Profile Button */}
                        <Button
                          size="sm"
                          variant="outline-purple"
                          className="w-full"
                        >
                          <GraduationCap className="w-4 h-4 mr-2" />
                          Xem hồ sơ
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* View All Teachers Button */}
          <div className="text-center mt-12">
            <Button
              onClick={() => onNavigate({ type: "teachers" })}
              size="lg"
              variant="outline-success"
            >
              Xem tất cả giáo viên
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* News Section - Tin tức & Sự kiện */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
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
              Cập nhật những tin tức mới nhất về các khóa học, chương trình và
              thành tích của 360edu
            </p>
          </div>

          {/* Carousel Container */}
          <div className="relative">
            {/* Navigation Arrows */}
            {news.length > 4 && (
              <>
                <button
                  onClick={handleNewsPrev}
                  disabled={newsIndex === 0}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <button
                  onClick={handleNewsNext}
                  disabled={newsIndex + 4 >= news.length}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
              </>
            )}

            {/* News Grid */}
            {newsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
              </div>
            ) : displayedNews.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {displayedNews.map((item, index) => {
                    // Gradient colors for news cards
                    const gradients = [
                      "from-orange-400 to-red-500",
                      "from-purple-400 to-pink-500",
                      "from-blue-400 to-cyan-500",
                    ];
                    const gradient = gradients[index % gradients.length];

                    // Parse tags if it's a string
                    const tags =
                      typeof item.tags === "string"
                        ? item.tags
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean)
                        : Array.isArray(item.tags)
                        ? item.tags
                        : [];

                    // Format date
                    const formatDate = (dateString) => {
                      if (!dateString) return "";
                      const date = new Date(dateString);
                      const day = date.getDate().toString().padStart(2, "0");
                      const month = (date.getMonth() + 1)
                        .toString()
                        .padStart(2, "0");
                      const year = date.getFullYear();
                      return `${day}/${month}/${year}`;
                    };

                    return (
                      <Card
                        key={item.id}
                        className="group hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full"
                        onClick={() => navigate(`/home/news/${item.id}`)}
                      >
                        {/* Image/Gradient Header */}
                        <div className="h-180 relative overflow-hidden bg-gray-100">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div
                              className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
                            >
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

                        <CardContent className="p-6 flex-1 flex flex-col">
                          {/* Date */}
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(item.createdAt)}</span>
                          </div>

                          {/* Title */}
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                            {item.title}
                          </h3>

                          {/* Excerpt */}
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                            {stripAndTruncate(
                              item.excerpt || item.content,
                              150
                            ) || "Mô tả ngắn về tin tức này..."}
                          </p>

                          {/* Read More Link */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/home/news/${item.id}`);
                            }}
                            className="text-pink-600 hover:text-pink-700 font-medium text-sm flex items-center gap-1 mt-auto"
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
                    variant="outline-pink"
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
        </div>
      </section>
    </>
  );
}
