//src/pages/guest/About.jsx
import { useOutletContext } from "react-router-dom";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Award, 
  Target, 
  Heart, 
  Star, 
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Clock,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";

export default function About() {
  const { onNavigate } = useOutletContext();

  const stats = [
    { icon: Users, value: "500+", label: "Học viên", color: "text-blue-600", bg: "bg-blue-100" },
    { icon: GraduationCap, value: "50+", label: "Giáo viên", color: "text-purple-600", bg: "bg-purple-100" },
    { icon: BookOpen, value: "100+", label: "Lớp học", color: "text-green-600", bg: "bg-green-100" },
    { icon: Award, value: "95%", label: "Hài lòng", color: "text-orange-600", bg: "bg-orange-100" },
  ];

  const values = [
    {
      icon: Target,
      title: "Tầm nhìn",
      description: "Trở thành trung tâm giáo dục hàng đầu, mang đến nền tảng học tập hiện đại và toàn diện cho mọi học viên.",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: Heart,
      title: "Sứ mệnh",
      description: "Đồng hành cùng học viên trên con đường phát triển bản thân, kiến tạo tương lai tươi sáng thông qua giáo dục chất lượng.",
      color: "from-pink-500 to-rose-600"
    },
    {
      icon: Star,
      title: "Giá trị cốt lõi",
      description: "Chất lượng - Tận tâm - Sáng tạo - Chuyên nghiệp. Mỗi học viên là một cá nhân đặc biệt cần được quan tâm riêng biệt.",
      color: "from-amber-500 to-orange-600"
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Đội ngũ giáo viên chất lượng",
      description: "Giáo viên có trình độ chuyên môn cao, giàu kinh nghiệm và tâm huyết với nghề"
    },
    {
      icon: Zap,
      title: "Phương pháp giảng dạy hiện đại",
      description: "Áp dụng các phương pháp giáo dục tiên tiến, kết hợp công nghệ trong giảng dạy"
    },
    {
      icon: TrendingUp,
      title: "Theo dõi tiến độ học tập",
      description: "Hệ thống quản lý học tập giúp phụ huynh và học viên theo dõi kết quả thường xuyên"
    },
    {
      icon: Users,
      title: "Lớp học quy mô nhỏ",
      description: "Sĩ số lớp hợp lý giúp giáo viên quan tâm đến từng học viên một cách tốt nhất"
    },
    {
      icon: BookOpen,
      title: "Chương trình đa dạng",
      description: "Nhiều môn học và cấp độ khác nhau, phù hợp với nhu cầu của từng học viên"
    },
    {
      icon: CheckCircle,
      title: "Cam kết kết quả",
      description: "Cam kết đầu ra rõ ràng, hỗ trợ học viên đạt được mục tiêu học tập"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
            <GraduationCap className="w-4 h-4 mr-2" />
            Trung tâm giáo dục 360edu
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Đồng hành cùng bạn trên
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
              con đường tri thức
            </span>
          </h1>
          
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed">
            360edu là trung tâm giáo dục toàn diện, kết hợp phương pháp giảng dạy truyền thống 
            với công nghệ hiện đại, mang đến trải nghiệm học tập tốt nhất cho mọi học viên.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => onNavigate({ type: "classes" })}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Khám phá lớp học
            </Button>
            <Button
              onClick={() => onNavigate({ type: "teachers" })}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <Users className="w-5 h-5 mr-2" />
              Gặp gỡ giáo viên
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-16 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white shadow-xl border-0 hover:shadow-2xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <stat.icon className={`w-7 h-7 ${stat.color}`} />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Vision, Mission, Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
              <Target className="w-4 h-4 mr-2" />
              Về chúng tôi
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tầm nhìn & Sứ mệnh
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chúng tôi tin rằng giáo dục là nền tảng để xây dựng tương lai tươi sáng cho mỗi cá nhân
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((item, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-0">
                <div className={`h-2 bg-gradient-to-r ${item.color}`}></div>
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
              <CheckCircle className="w-4 h-4 mr-2" />
              Lý do chọn chúng tôi
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn 360edu?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chúng tôi cam kết mang đến chất lượng giáo dục tốt nhất với nhiều ưu điểm vượt trội
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 hover:border-blue-200">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                    <feature.icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left - Info */}
              <div className="p-10 md:p-12 text-white">
                <Badge className="mb-6 bg-white/20 text-white border-white/30">
                  <MapPin className="w-4 h-4 mr-2" />
                  Liên hệ với chúng tôi
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Bạn có câu hỏi?<br />Hãy liên hệ ngay!
                </h2>
                <p className="text-white/80 mb-8 leading-relaxed">
                  Đội ngũ tư vấn của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. 
                  Đừng ngần ngại liên hệ để được tư vấn miễn phí.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">Địa chỉ</p>
                      <p className="text-white/80 text-sm">123 Nguyễn Văn Linh, Quận 7, TP.HCM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">Điện thoại</p>
                      <p className="text-white/80 text-sm">0123 456 789</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-white/80 text-sm">contact@360edu.vn</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">Giờ làm việc</p>
                      <p className="text-white/80 text-sm">Thứ 2 - Chủ nhật: 7:00 - 21:00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right - CTA */}
              <div className="bg-white/10 backdrop-blur-sm p-10 md:p-12 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Đăng ký tư vấn miễn phí
                </h3>
                <p className="text-white/80 mb-8">
                  Để lại thông tin, chúng tôi sẽ liên hệ tư vấn chi tiết về các khóa học phù hợp với bạn.
                </p>
                <div className="space-y-4">
                  <Button
                    onClick={() => onNavigate({ type: "register" })}
                    size="lg"
                    className="w-full bg-white text-blue-600 hover:bg-gray-100 shadow-xl"
                  >
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Đăng ký học ngay
                  </Button>
                  <Button
                    onClick={() => onNavigate({ type: "classes" })}
                    size="lg"
                    variant="outline"
                    className="w-full border-white text-white hover:bg-white/10"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    Xem danh sách lớp học
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}