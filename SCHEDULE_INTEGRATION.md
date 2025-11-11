# Schedule Management - Backend Integration

## Overview
Tích hợp frontend schedule management với backend API thực. Thay vì sử dụng dữ liệu giả (mock data), giờ đây giao diện sẽ lấy dữ liệu từ backend API.

## Thay đổi chính

### 1. API Service Layer (`src/services/schedule/`)

#### `schedule.api.js`
- **OLD**: Gọi các endpoint giả như `/api/slots`, `/api/class-schedules`
- **NEW**: Gọi endpoint thực từ backend:
  - `GET /api/semesters` - Lấy danh sách học kỳ
  - `GET /api/timeslots` - Lấy danh sách khung thời gian
  - `GET /api/classes` - Lấy danh sách lớp học (đã bao gồm schedule)
  - `GET /api/teachers` - Lấy danh sách giáo viên

#### `schedule.service.js`
- **Cập nhật logic**: Xử lý dữ liệu từ backend API theo đúng format
- **Data transformation**: Chuyển đổi `ClassResponse` thành format phù hợp với UI grid
- **Fallback**: Vẫn giữ fallback data nếu API call thất bại

### 2. Components Update

#### `ScheduleManagement.jsx`
- Loại bỏ dependency `teacherService`
- Sử dụng `scheduleService.getTeachers()` thay vì `teacherService.list()`
- Cập nhật tên method từ `getSlots()` thành `getTimeSlots()`

## Backend API Structure

### ClassResponse Format
```json
{
  "id": 1,
  "name": "SE1234 - Software Engineering",
  "code": "SE1234",
  "semesterId": 1,
  "subjectId": 2,
  "teacherId": 3,
  "roomId": 4,
  "startDate": "2024-01-15",
  "endDate": "2024-05-15",
  "maxStudents": 40,
  "description": "...",
  "status": "STUDYING",
  "schedule": [
    {
      "dayOfWeek": 1,
      "timeSlotId": 1,
      "startTime": "16:00:00",
      "endTime": "18:00:00"
    },
    {
      "dayOfWeek": 3,
      "timeSlotId": 2,
      "startTime": "18:00:00",
      "endTime": "20:00:00"
    }
  ],
  "sessionsGenerated": 15,
  "subjectName": "Software Engineering",
  "teacherFullName": "Nguyễn Văn Xuân",
  "roomName": "DE-201",
  "online": false,
  "currentStudents": null
}
```

### Frontend Schedule Item Format
Dữ liệu được chuyển đổi thành:
```javascript
{
  id: "1-1-1", // classId-dayOfWeek-timeSlotId
  classId: 1,
  className: "SE1234",
  classFullName: "SE1234 - Software Engineering",
  day: 1, // 1=Mon, 2=Tue, ..., 7=Sun
  dayName: "MON",
  slotId: 1,
  startTime: "16:00:00",
  endTime: "18:00:00",
  teacherId: 3,
  teacherName: "Nguyễn Văn Xuân",
  subjectId: 2,
  subjectName: "Software Engineering",
  roomId: 4,
  room: "DE-201",
  studentCount: 0,
  maxStudents: 40,
  isOnline: false,
  meetLink: null,
  status: "STUDYING"
}
```

## Testing Guide

### 1. Backend Setup
Đảm bảo backend đang chạy trên `http://localhost:8080`

### 2. Frontend Setup
```bash
cd 360edu-ver3
npm run dev
```

### 3. Test Cases

#### Test 1: Load Semesters
- Truy cập schedule management page
- Verify dropdown "Học kỳ" được populate từ API
- Check network tab: `GET /api/semesters`

#### Test 2: Load Teachers
- Verify dropdown "GV" được populate từ API
- Check network tab: `GET /api/teachers`

#### Test 3: Load Time Slots
- Verify time slots xuất hiện đúng trong grid
- Check network tab: `GET /api/timeslots`

#### Test 4: Load Schedule Data
- Select một học kỳ
- Verify schedule grid hiển thị classes từ backend
- Check network tab: `GET /api/classes`
- Verify classes được filter theo `semesterId` đã chọn

#### Test 5: Fallback Behavior
- Stop backend server
- Reload page
- Verify fallback mock data vẫn hiển thị
- Check console warnings về API failures

### 4. Debug Tips

#### Network Tab
```
GET http://localhost:8080/api/semesters
GET http://localhost:8080/api/timeslots  
GET http://localhost:8080/api/teachers
GET http://localhost:8080/api/classes
```

#### Console Logs
```javascript
console.log("Backend schedule data:", scheduleItems); // In schedule.service.js
```

#### Common Issues
1. **CORS Error**: Đảm bảo backend có `@CrossOrigin(origins = "*")` 
2. **Auth Issues**: Kiểm tra JWT token trong localStorage
3. **Empty Data**: Kiểm tra database có dữ liệu classes/schedules không
4. **Wrong API Base**: Verify `.env` file có `VITE_API_BASE=http://localhost:8080/api`

## Data Flow

1. User select semester → `setSelectedSemester()`
2. `useEffect` trigger → `scheduleService.getScheduleBySemester(semesterId)`
3. API call → `GET /api/classes`
4. Backend returns classes with schedule array
5. Frontend transforms data for grid display
6. UI renders schedule grid with real data

## Features

### ✅ Working
- Load semesters from backend
- Load teachers from backend  
- Load time slots from backend
- Load and display class schedules from backend
- Semester filtering
- Teacher filtering
- Online/Offline class filtering
- Fallback to mock data on API failure

### 🔄 Pending (Backend API Required)
- Student attendance data
- Meeting link information
- Real-time student count
- Class session management

## Cấu trúc Database

Để hiểu rõ data flow, tham khảo entities:
- `Clazz` → Class information
- `ClassSchedule` → Weekly recurring schedule  
- `TimeSlot` → Time periods
- `Teacher` → Teacher info with User relation
- `Semester` → Academic periods
- `Subject` → Course subjects
- `Room` → Classroom information

## Next Steps

1. **Add more endpoints** cho attendance, student count
2. **Implement caching** để tránh duplicate API calls
3. **Add real-time updates** với WebSocket
4. **Optimize queries** để giảm N+1 problem
5. **Add error handling** UI cho network failures