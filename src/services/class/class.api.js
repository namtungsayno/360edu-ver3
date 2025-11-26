import { http } from "../http";
export const classApi = {
  create: (payload) => http.post(`/classes`, payload).then((r) => r.data),
  list: (params = {}) => {
    console.log("📋 [CLASS_API] Calling GET /classes with params:", params);
    return http.get(`/classes`, { params }).then((r) => {
      console.log("📚 [CLASS_API] Received", r.data.length, "classes from backend");
      // Log first 3 classes
      r.data.slice(0, 3).forEach(c => 
        console.log(`   Class: id=${c.id}, name=${c.name}, teacher=${c.teacherFullName}, schedules=${c.schedule?.length || 0}`)
      );
      return r.data;
    });
  },
};
