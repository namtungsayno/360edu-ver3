//src/pages/guest/TeacherList.jsx
import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { teacherService } from "../../../services/teacher/teacher.service";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Award } from "lucide-react";

export default function TeacherList() {
  const { onNavigate } = useOutletContext();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

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
          subject: teacher.subjectNames?.join(", ") || teacher.subjectName || "Chưa xác định",
          experience: teacher.yearsOfExperience ? `${teacher.yearsOfExperience} năm kinh nghiệm` : (teacher.degree || "Giáo viên"),
          courses: teacher.classCount || 0,
          rating: teacher.rating || 0,
          achievements: [
            teacher.degree,
            teacher.specialization
          ].filter(Boolean),
          avatar: teacher.avatarUrl,
          bio: teacher.bio,
          workplace: teacher.workplace
        }));
        setTeachers(enrichedTeachers);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Đội ngũ giáo viên</h1>
          <p className="text-gray-600">Gặp gỡ đội ngũ giáo viên chuyên nghiệp và giàu kinh nghiệm</p>
        </div>
        
        {loading ? (
          // Loading skeleton
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <Card key={idx} className="animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Chưa có giáo viên nào
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teachers.map((teacher) => {
              const nameParts = (teacher.name || "").trim().split(" ");
              const lastInitial = nameParts.length ? nameParts[nameParts.length - 1].charAt(0) : "?";
              
              return (
                <Card 
                  key={teacher.id}
                  className="group hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Avatar Background */}
                  <div className="h-56 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center relative">
                    {teacher.avatar ? (
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <img 
                          src={teacher.avatar} 
                          alt={teacher.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-white/20 border-4 border-white shadow-lg flex items-center justify-center">
                        <span className="text-6xl font-bold text-white">{lastInitial}</span>
                      </div>
                    )}
                    {/* Rating badge */}
                    <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-xs font-bold">
                      ⭐ {teacher.rating}
                    </div>
                  </div>
                  
                  <CardContent className="p-4 flex flex-col">
                    <h3 className="text-lg font-semibold mb-1">{teacher.name}</h3>
                    <Badge className="mb-2">{teacher.subject}</Badge>
                    <p className="text-gray-600 text-sm mb-3">{teacher.experience}</p>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-center gap-6 mb-3 pb-3 border-b">
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">{teacher.courses}</p>
                        <p className="text-xs text-gray-500">Lớp học</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-yellow-600">{teacher.rating > 0 ? teacher.rating.toFixed(1) : 'N/A'}</p>
                        <p className="text-xs text-gray-500">Đánh giá</p>
                      </div>
                    </div>
                    
                    {/* Achievements - Fixed height container */}
                    <div className="h-12 mb-3 overflow-hidden">
                      {teacher.achievements.length > 0 && (
                        <div className="space-y-1">
                          {teacher.achievements.slice(0, 2).map((achievement, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                              <Award className="w-3 h-3 text-yellow-500 shrink-0" />
                              <span className="line-clamp-1">{achievement}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Button always at bottom */}
                    <Button 
                      onClick={() => onNavigate({ type: "teacher", teacherId: teacher.userId })}
                      className="w-full bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm mt-auto"
                      size="sm"
                    >
                      Xem hồ sơ
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}