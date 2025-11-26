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
  Briefcase, FileText, Facebook, Linkedin
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
        const teacherData = await teacherService.getProfile(Number.parseInt(id, 10));
        if (teacherData) {
          setTeacher(teacherData);
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

  const nameParts = (teacher.fullName || teacher.username || "").trim().split(" ");
  const lastInitial = nameParts.length ? nameParts[nameParts.length - 1].charAt(0) : "?";
  
  // Use real data from API with fallbacks
  const displayName = teacher.fullName || teacher.username;
  const displayDegree = teacher.degree || "Giảng viên";
  const displayRating = teacher.rating || 0;
  const displayYearsExp = teacher.yearsOfExperience || 0;
  const displayBio = teacher.bio || `${displayName} là giảng viên tại hệ thống 360edu.`;
  const displayCertificates = teacher.certificates || [];
  const displayExperiences = teacher.experiences || [];
  const displayEducations = teacher.educations || [];
  const displayAchievements = teacher.achievements ? teacher.achievements.split('\n').filter(Boolean) : [];
  const displaySubjects = teacher.subjects || (teacher.subjectNames ? teacher.subjectNames : [teacher.subjectName]).filter(Boolean);
  const displayWorkplace = teacher.workplace || null;
  const displayLinkedin = teacher.linkedinUrl || null;
  const displayFacebook = teacher.facebookUrl || null;

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
                    {teacher.avatarUrl ? (
                      <img 
                        src={teacher.avatarUrl} 
                        alt={displayName}
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayName}</h1>
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                      <span className="text-lg text-gray-700">{displayDegree}</span>
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
                      <span className="text-2xl font-bold text-gray-900">{displayRating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-gray-600">Đánh giá</p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-600 mb-4 leading-relaxed">{displayBio}</p>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 mb-4">
                  {teacher.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{teacher.email}</span>
                    </div>
                  )}
                  {teacher.phoneNumber && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{teacher.phoneNumber}</span>
                    </div>
                  )}
                  {displayWorkplace && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-sm">{displayWorkplace}</span>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {(displayLinkedin || displayFacebook) && (
                  <div className="flex gap-3 mb-4">
                    {displayLinkedin && (
                      <a 
                        href={displayLinkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                    {displayFacebook && (
                      <a 
                        href={displayFacebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        <Facebook className="w-4 h-4" />
                        Facebook
                      </a>
                    )}
                  </div>
                )}

                {/* Subjects */}
                <div className="flex flex-wrap gap-2">
                  {displaySubjects.map((subject) => (
                    <Badge key={subject} className="bg-purple-100 text-purple-700">
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
              <p className="text-3xl font-bold text-gray-900 mb-1">{teacher.studentCount || 0}</p>
              <p className="text-sm text-gray-600">Học viên</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{teacher.classCount || 0}</p>
              <p className="text-sm text-gray-600">Lớp học</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{displayYearsExp}+</p>
              <p className="text-sm text-gray-600">Năm kinh nghiệm</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{displayRating.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Đánh giá</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Certifications */}
            {displayCertificates.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xl font-bold">Chứng chỉ nghề nghiệp</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayCertificates.map((cert, index) => (
                      <div key={`cert-${cert.id || index}`} className="flex gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{cert.title}</h3>
                          <p className="text-sm text-gray-600 mb-1">{cert.organization}</p>
                          {cert.year && (
                            <div className="flex items-center gap-2">
                              <Badge className="bg-purple-100 text-purple-700 text-xs">
                                Năm {cert.year}
                              </Badge>
                            </div>
                          )}
                          {cert.description && (
                            <p className="text-sm text-gray-500 mt-2">{cert.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Professional Experience */}
            {displayExperiences.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xl font-bold">Kinh nghiệm làm việc</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayExperiences.map((exp, index) => (
                      <div key={`exp-${exp.id || index}`} className="relative pl-6 pb-4 border-l-2 border-purple-200 last:pb-0">
                        <div className="absolute -left-2 top-0 w-4 h-4 bg-purple-500 rounded-full border-2 border-white"></div>
                        <h3 className="font-semibold text-gray-900 mb-1">{exp.position}</h3>
                        <p className="text-sm text-purple-600 font-medium mb-1">{exp.company}</p>
                        <p className="text-xs text-gray-500 mb-2">
                          {exp.startYear} {exp.endYear ? `- ${exp.endYear}` : '- Hiện tại'}
                        </p>
                        {exp.description && (
                          <p className="text-sm text-gray-600">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {displayEducations.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xl font-bold">Học vấn</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayEducations.map((edu, index) => (
                      <div key={`edu-${edu.id || index}`} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h3 className="font-semibold text-gray-900 mb-1">{edu.degree}</h3>
                        <p className="text-sm text-blue-600 font-medium mb-1">{edu.school}</p>
                        {edu.year && (
                          <p className="text-xs text-gray-500">Năm {edu.year}</p>
                        )}
                        {edu.description && (
                          <p className="text-sm text-gray-600 mt-2">{edu.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Achievements */}
            {displayAchievements.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xl font-bold">Thành tích nổi bật</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayAchievements.map((achievement) => (
                      <div key={achievement} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                        <span className="text-gray-700">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Teaching Schedule - Optional, hide if no schedule */}
            {teacher.schedule && teacher.schedule.length > 0 && (
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
                      <div key={`schedule-${idx}`} className="border-l-4 border-purple-500 pl-3">
                        <p className="font-semibold text-gray-900 mb-1">{item.day}</p>
                        {item.slots.map((slot, slotIdx) => (
                          <div key={`slot-${idx}-${slotIdx}`} className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-3 h-3" />
                            <span>{slot}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
