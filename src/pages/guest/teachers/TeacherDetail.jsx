/**
 * TEACHER DETAIL PAGE - Trang chi tiết giáo viên
 * 
 * Route: /home/teachers/:id
 * Layout: GuestLayout
 * 
 * Hiển thị thông tin chi tiết về giáo viên bao gồm:
 * - Thông tin cá nhân (tên, ảnh, học vị, chuyên môn)
 * - Thống kê (học viên, lớp học, đánh giá)
 * - Kinh nghiệm & thành tích
 * - Môn học giảng dạy
 * - Lịch dạy (mock data)
 * - Đánh giá từ học viên (mock data)
 */

import { useParams, useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, Mail, Phone, Award, BookOpen, Users, Star, 
  Calendar, Clock, GraduationCap, TrendingUp, CheckCircle,
  Briefcase, FileText
} from "lucide-react";
import { teacherService } from "../../../services/teacher/teacher.service";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";

export default function TeacherDetail() {
  const { id } = useParams();
  const { onNavigate } = useOutletContext();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch teacher data from API
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const data = await teacherService.list();
        const teacherData = data?.find(t => t.id === Number.parseInt(id, 10));
        
        if (teacherData) {
          // Merge real data with mock data for missing fields
          const enrichedTeacher = {
            // Real data from DB
            id: teacherData.id,
            userId: teacherData.userId,
            name: teacherData.fullName || teacherData.username,
            email: teacherData.email,
            phone: teacherData.phoneNumber,
            subjects: teacherData.subjectNames || [teacherData.subjectName],
            mainSubject: teacherData.subjectName,
            degree: teacherData.degree || "Thạc sĩ",
            specialization: teacherData.specialization,
            classCount: teacherData.classCount || 0,
            active: teacherData.active,
            
            // Mock data for fields not in DB
            avatar: null,
            rating: 4.8,
            totalStudents: 450,
            totalReviews: 89,
            yearsOfExperience: 8,
            bio: `${teacherData.fullName || "Giáo viên"} là một giảng viên giàu kinh nghiệm với nhiều năm trong lĩnh vực giáo dục. ${teacherData.specialization ? `Chuyên sâu về ${teacherData.specialization}.` : ""} Cam kết mang đến những bài giảng chất lượng và hỗ trợ học viên đạt được mục tiêu học tập.`,
            achievements: [
              teacherData.degree,
              teacherData.specialization,
              "Giáo viên xuất sắc năm 2023",
              "Hơn 500 học viên đã tốt nghiệp"
            ].filter(Boolean),
            certifications: [
              {
                id: 1,
                name: teacherData.degree || "Thạc sĩ Giáo dục",
                issuer: "Đại học Quốc gia",
                year: "2015",
                description: "Chứng chỉ giảng dạy chuyên nghiệp"
              },
              {
                id: 2,
                name: "Chứng chỉ Sư phạm",
                issuer: "Bộ Giáo dục & Đào tạo",
                year: "2016",
                description: "Chứng nhận năng lực giảng dạy"
              },
              {
                id: 3,
                name: teacherData.specialization || "Chuyên ngành chuyên sâu",
                issuer: "Trung tâm Đào tạo Quốc tế",
                year: "2018",
                description: "Chứng chỉ chuyên môn cao cấp"
              }
            ],
            professionalExperience: [
              {
                id: 1,
                title: "Giảng viên chính",
                organization: "Trường Đại học FPT",
                period: "2018 - Hiện tại",
                description: "Giảng dạy các môn chuyên ngành, hướng dẫn đồ án và luận văn tốt nghiệp"
              },
              {
                id: 2,
                title: "Giáo viên",
                organization: "Trung tâm Giáo dục 360edu",
                period: "2015 - 2018",
                description: "Giảng dạy các khóa học chuyên sâu và đào tạo học viên"
              }
            ],
            skills: teacherData.subjectNames || [teacherData.subjectName],
            schedule: [
              { day: "Thứ 2", slots: ["08:00 - 10:00", "14:00 - 16:00"] },
              { day: "Thứ 4", slots: ["09:00 - 11:00", "15:00 - 17:00"] },
              { day: "Thứ 6", slots: ["08:00 - 10:00", "13:00 - 15:00"] }
            ]
          };
          setTeacher(enrichedTeacher);
        }
      } catch (error) {
        console.error("Failed to fetch teacher:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <div className="flex gap-8">
                <div className="w-48 h-48 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-64"></div>
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => onNavigate({ type: "teachers" })}
            className="mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại danh sách
          </Button>
          <div className="text-center py-12">
            <p className="text-gray-600">Không tìm thấy thông tin giáo viên</p>
          </div>
        </div>
      </div>
    );
  }

  const nameParts = (teacher.name || "").trim().split(" ");
  const lastInitial = nameParts.length ? nameParts[nameParts.length - 1].charAt(0) : "?";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => onNavigate({ type: "teachers" })}
          className="mb-6 hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại danh sách
        </Button>

        {/* Header Card - Profile Overview */}
        <Card className="mb-6 overflow-hidden shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-48 h-48 rounded-full ring-4 ring-purple-100 overflow-hidden bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    {teacher.avatar ? (
                      <img 
                        src={teacher.avatar} 
                        alt={teacher.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl font-bold text-white">{lastInitial}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{teacher.name}</h1>
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                      <span className="text-lg text-gray-700">{teacher.degree}</span>
                      {teacher.specialization && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">{teacher.specialization}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Rating */}
                  <div className="text-center bg-yellow-50 px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-2xl font-bold text-gray-900">{teacher.rating}</span>
                    </div>
                    <p className="text-xs text-gray-600">{teacher.totalReviews} đánh giá</p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-600 mb-4 leading-relaxed">{teacher.bio}</p>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 mb-4">
                  {teacher.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{teacher.email}</span>
                    </div>
                  )}
                  {teacher.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{teacher.phone}</span>
                    </div>
                  )}
                </div>

                {/* Subjects */}
                <div className="flex flex-wrap gap-2">
                  {teacher.subjects.map((subject, idx) => (
                    <Badge key={idx} className="bg-purple-100 text-purple-700">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{teacher.totalStudents}</p>
              <p className="text-sm text-gray-600">Học viên</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{teacher.classCount}</p>
              <p className="text-sm text-gray-600">Lớp học</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{teacher.yearsOfExperience}+</p>
              <p className="text-sm text-gray-600">Năm kinh nghiệm</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{teacher.rating}</p>
              <p className="text-sm text-gray-600">Đánh giá</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Certifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-bold">Chứng chỉ nghề nghiệp</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teacher.certifications.map((cert) => (
                    <div key={cert.id} className="flex gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{cert.name}</h3>
                        <p className="text-sm text-gray-600 mb-1">{cert.issuer}</p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            Năm {cert.year}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{cert.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Professional Experience */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-bold">Kinh nghiệm làm việc</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teacher.professionalExperience.map((exp) => (
                    <div key={exp.id} className="relative pl-6 pb-4 border-l-2 border-purple-200 last:pb-0">
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-purple-500 rounded-full border-2 border-white"></div>
                      <h3 className="font-semibold text-gray-900 mb-1">{exp.title}</h3>
                      <p className="text-sm text-purple-600 font-medium mb-1">{exp.organization}</p>
                      <p className="text-xs text-gray-500 mb-2">{exp.period}</p>
                      <p className="text-sm text-gray-600">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-bold">Thành tích nổi bật</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teacher.achievements.map((achievement, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                      <span className="text-gray-700">{achievement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Teaching Schedule */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-bold">Lịch dạy</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teacher.schedule.map((item, idx) => (
                    <div key={idx} className="border-l-4 border-purple-500 pl-3">
                      <p className="font-semibold text-gray-900 mb-1">{item.day}</p>
                      {item.slots.map((slot, slotIdx) => (
                        <div key={slotIdx} className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>{slot}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
