# Schedule API Integration Guide

## Backend GET Endpoints Required

Để frontend hiển thị dữ liệu thực từ database, backend cần implement các GET endpoints sau:

### 1. Get All Semesters
```
GET /api/semesters
```
**Response:**
```json
[
  {
    "id": 1,
    "name": "Spring 2025",
    "startDate": "2025-01-15",
    "endDate": "2025-05-15"
  },
  {
    "id": 2,
    "name": "Summer 2025",
    "startDate": "2025-05-20",
    "endDate": "2025-08-15"
  }
]
```

### 2. Get All Time Slots
```
GET /api/slots
```
**Response:**
```json
[
  {
    "id": 1,
    "code": "Slot 1",
    "startTime": "07:30",
    "endTime": "09:00"
  },
  {
    "id": 2,
    "code": "Slot 2",
    "startTime": "09:10",
    "endTime": "10:40"
  }
]
```

### 3. Get Classes by Semester
```
GET /api/classes?semesterId={semesterId}
```
**Response:**
```json
[
  {
    "id": 101,
    "name": "SE1234",
    "code": "SE1234",
    "semesterId": 1
  },
  {
    "id": 102,
    "name": "PRJ301",
    "code": "PRJ301",
    "semesterId": 1
  }
]
```

### 4. Get Class Schedules by Semester
```
GET /api/class-schedules?semesterId={semesterId}
```
**Response:**
```json
[
  {
    "id": 1,
    "classId": 101,
    "slotId": 1,
    "dayOfWeek": "MONDAY",
    "startTime": "07:30",
    "endTime": "09:00"
  },
  {
    "id": 2,
    "classId": 102,
    "slotId": 2,
    "dayOfWeek": "TUESDAY",
    "startTime": "09:10",
    "endTime": "10:40"
  }
]
```

**dayOfWeek values:** `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY`

### 5. Get Attendance (Optional)
```
GET /api/class-schedules/{scheduleId}/attendance
```
**Response:**
```json
[
  {
    "id": 1,
    "student": "Nguyễn Văn A",
    "status": "present",
    "time": "07:35"
  },
  {
    "id": 2,
    "student": "Trần Thị B",
    "status": "late",
    "time": "07:45"
  }
]
```

**status values:** `present`, `absent`, `late`

---

## Frontend API Calls - Test Data Structure

Để kiểm tra structure trong DB, frontend sẽ gọi các API theo thứ tự sau:

### Step 1: Load Semesters (On Page Load)
```javascript
// File: src/pages/admin/schedule/ScheduleManagement.jsx
// Line: useEffect initialization

// API Call:
GET /api/semesters

// Expected Response:
[
  {
    "id": 1,
    "name": "Spring 2025",
    "startDate": "2025-01-15",
    "endDate": "2025-05-15"
  }
]

// Frontend transforms to:
[
  {
    id: 1,
    value: "1",        // String for Select component
    label: "Spring 2025",
    startDate: "2025-01-15",
    endDate: "2025-05-15"
  }
]
```

### Step 2: Load Time Slots (On Page Load)
```javascript
// API Call:
GET /api/slots

// Expected Response:
[
  {
    "id": 1,
    "code": "Slot 1",
    "startTime": "07:30",
    "endTime": "09:00"
  },
  {
    "id": 2,
    "code": "Slot 2",
    "startTime": "09:10",
    "endTime": "10:40"
  }
]

// Frontend transforms to:
[
  {
    id: 1,
    label: "Slot 1",
    time: "07:30-09:00",
    startTime: "07:30",
    endTime: "09:00"
  }
]
```

### Step 3: Load Classes by Semester (When Semester Selected)
```javascript
// API Call:
GET /api/classes?semesterId=1

// Expected Response:
[
  {
    "id": 101,
    "name": "SE1234",
    "code": "SE1234",
    "semesterId": 1
  },
  {
    "id": 102,
    "name": "PRJ301",
    "code": "PRJ301",
    "semesterId": 1
  }
]

// Used internally to create classMap for lookup
```

### Step 4: Load Class Schedules by Semester (When Semester Selected)
```javascript
// File: src/services/schedule/schedule.service.js
// Function: getScheduleBySemester(semesterId)

// API Call:
GET /api/class-schedules?semesterId=1

// Expected Response:
[
  {
    "id": 1,
    "classId": 101,
    "slotId": 1,
    "dayOfWeek": "MONDAY",
    "startTime": "07:30",
    "endTime": "09:00"
  },
  {
    "id": 2,
    "classId": 102,
    "slotId": 2,
    "dayOfWeek": "TUESDAY",
    "startTime": "09:10",
    "endTime": "10:40"
  },
  {
    "id": 3,
    "classId": 101,
    "slotId": 1,
    "dayOfWeek": "WEDNESDAY",
    "startTime": "07:30",
    "endTime": "09:00"
  }
]

// Frontend transforms to:
[
  {
    id: 1,
    classId: 101,
    className: "SE1234",         // From classMap
    classCode: "SE1234",         // From classMap
    day: 1,                      // Converted from "MONDAY"
    slotId: 1,
    startTime: "07:30",
    endTime: "09:00",
    dayOfWeek: "MONDAY",
    teacherId: null,             // TODO: Add to backend
    teacherName: "TBA",
    subjectName: "SE1234",
    room: null,                  // TODO: Add to backend
    studentCount: 0,             // TODO: Add to backend
    isOnline: false,             // TODO: Add to backend
    meetLink: null,
    status: "scheduled"
  }
]

// Note: Multiple classes can share same day + slot
// Example: Monday Slot 1 có thể có SE1234, DBI202, PRJ301
```

### Step 5: Load Attendance (When Click "Chi tiết" Button)
```javascript
// API Call:
GET /api/class-schedules/1/attendance

// Expected Response:
[
  {
    "id": 1,
    "student": "Nguyễn Văn A",
    "status": "present",
    "time": "07:35"
  },
  {
    "id": 2,
    "student": "Trần Thị B",
    "status": "late",
    "time": "07:45"
  }
]

// Displayed as-is in Dialog Table
```

---

## Database Structure Checklist

### Tables Required:

#### 1. **semesters**
```sql
CREATE TABLE semesters (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);
```

#### 2. **slots**
```sql
CREATE TABLE slots (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);
```

#### 3. **classes**
```sql
CREATE TABLE classes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    semester_id BIGINT NOT NULL,
    FOREIGN KEY (semester_id) REFERENCES semesters(id)
);
```

#### 4. **class_schedules**
```sql
CREATE TABLE class_schedules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    class_id BIGINT NOT NULL,
    slot_id BIGINT NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,  -- MONDAY, TUESDAY, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (slot_id) REFERENCES slots(id)
);
```

#### 5. **attendance** (Optional)
```sql
CREATE TABLE attendance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    schedule_id BIGINT NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,  -- present, absent, late
    time TIME,
    FOREIGN KEY (schedule_id) REFERENCES class_schedules(id)
);
```

---

## Sample Data for Testing

### Insert Sample Semesters:
```sql
INSERT INTO semesters (id, name, start_date, end_date) VALUES
(1, 'Spring 2025', '2025-01-15', '2025-05-15'),
(2, 'Summer 2025', '2025-05-20', '2025-08-15'),
(3, 'Fall 2025', '2025-09-01', '2025-12-20');
```

### Insert Sample Slots:
```sql
INSERT INTO slots (id, code, start_time, end_time) VALUES
(1, 'Slot 1', '07:30:00', '09:00:00'),
(2, 'Slot 2', '09:10:00', '10:40:00'),
(3, 'Slot 3', '10:50:00', '12:20:00'),
(4, 'Slot 4', '12:50:00', '14:20:00'),
(5, 'Slot 5', '14:30:00', '16:00:00'),
(6, 'Slot 6', '16:10:00', '17:40:00');
```

### Insert Sample Classes:
```sql
INSERT INTO classes (id, name, code, semester_id) VALUES
(101, 'SE1234', 'SE1234', 1),
(102, 'PRJ301', 'PRJ301', 1),
(103, 'DBI202', 'DBI202', 1),
(104, 'SWE201', 'SWE201', 1),
(105, 'IOT102', 'IOT102', 1);
```

### Insert Sample Class Schedules:
```sql
INSERT INTO class_schedules (id, class_id, slot_id, day_of_week, start_time, end_time) VALUES
-- Monday
(1, 101, 1, 'MONDAY', '07:30:00', '09:00:00'),
(2, 102, 2, 'MONDAY', '09:10:00', '10:40:00'),
(3, 103, 1, 'MONDAY', '07:30:00', '09:00:00'),  -- Multiple classes in same slot

-- Tuesday
(4, 104, 1, 'TUESDAY', '07:30:00', '09:00:00'),
(5, 105, 3, 'TUESDAY', '10:50:00', '12:20:00'),

-- Wednesday
(6, 101, 1, 'WEDNESDAY', '07:30:00', '09:00:00'),
(7, 102, 2, 'WEDNESDAY', '09:10:00', '10:40:00'),

-- Thursday
(8, 103, 2, 'THURSDAY', '09:10:00', '10:40:00'),

-- Friday
(9, 104, 1, 'FRIDAY', '07:30:00', '09:00:00'),
(10, 105, 4, 'FRIDAY', '12:50:00', '14:20:00');
```

### Insert Sample Attendance:
```sql
INSERT INTO attendance (id, schedule_id, student_name, status, time) VALUES
(1, 1, 'Nguyễn Văn A', 'present', '07:35:00'),
(2, 1, 'Trần Thị B', 'present', '07:33:00'),
(3, 1, 'Lê Văn C', 'late', '07:45:00'),
(4, 1, 'Phạm Thị D', 'absent', NULL),
(5, 1, 'Hoàng Văn E', 'present', '07:32:00');
```

---

## Testing API Response

### Test Endpoint 1: Get Semesters
```bash
curl http://localhost:8080/api/semesters
```
**Expected:** List of 3 semesters

### Test Endpoint 2: Get Slots
```bash
curl http://localhost:8080/api/slots
```
**Expected:** List of 6 slots

### Test Endpoint 3: Get Classes
```bash
curl http://localhost:8080/api/classes?semesterId=1
```
**Expected:** List of 5 classes

### Test Endpoint 4: Get Class Schedules
```bash
curl http://localhost:8080/api/class-schedules?semesterId=1
```
**Expected:** List of 10 schedule entries (including multiple classes per slot)

### Test Endpoint 5: Get Attendance
```bash
curl http://localhost:8080/api/class-schedules/1/attendance
```
**Expected:** List of 5 attendance records

---

## Spring Boot Controller Example

```java
package com.example.api.controller;

import com.example.api.dto.*;
import com.example.api.service.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Configure CORS properly
public class ScheduleController {

    private final SemesterService semesterService;
    private final SlotService slotService;
    private final ClassService classService;
    private final ClassScheduleService scheduleService;

    public ScheduleController(
        SemesterService semesterService,
        SlotService slotService,
        ClassService classService,
        ClassScheduleService scheduleService
    ) {
        this.semesterService = semesterService;
        this.slotService = slotService;
        this.classService = classService;
        this.scheduleService = scheduleService;
    }

    @GetMapping("/semesters")
    public List<SemesterDto> getAllSemesters() {
        return semesterService.findAll();
    }

    @GetMapping("/slots")
    public List<SlotDto> getAllSlots() {
        return slotService.findAll();
    }

    @GetMapping("/classes")
    public List<ClassDto> getClassesBySemester(@RequestParam Long semesterId) {
        return classService.findBySemester(semesterId);
    }

    @GetMapping("/class-schedules")
    public List<ClassScheduleDto> getSchedulesBySemester(@RequestParam Long semesterId) {
        return scheduleService.findBySemester(semesterId);
    }

    @GetMapping("/class-schedules/{scheduleId}/attendance")
    public List<AttendanceDto> getAttendance(@PathVariable Long scheduleId) {
        return scheduleService.getAttendance(scheduleId);
    }
}
```

---

## Frontend Integration

Frontend đã được cấu hình để:
1. Gọi API thực khi backend có sẵn
2. Tự động fallback sang mock data nếu API lỗi
3. Transform data từ backend sang format phù hợp với UI
4. Map `dayOfWeek` (MONDAY, TUESDAY, ...) sang số (1-7) cho grid display

**Base URL:** Configure trong `src/config/axios.config.js`

---

## TODO for Backend Team

### Required Fields to Add Later:
Các field sau cần bổ sung vào response để frontend hiển thị đầy đủ:

1. **Teacher Info** - Thêm vào ClassScheduleDto hoặc endpoint riêng:
   - `teacherId`
   - `teacherName`

2. **Room Info** - Thêm vào ClassScheduleDto:
   - `room` (ví dụ: "DE-201", "LAB-01")
   - `isOnline` (boolean)
   - `meetLink` (cho lớp online)

3. **Student Count** - Thêm vào ClassDto:
   - `studentCount` (số học viên đã đăng ký)

4. **Status** - Thêm vào ClassScheduleDto:
   - `status` ("scheduled", "completed", "cancelled")

### Example Extended ClassScheduleDto:
```java
public record ClassScheduleDto(
    Long id,
    Long classId,
    Long slotId,
    String dayOfWeek,
    String startTime,
    String endTime,
    // Extended fields
    Long teacherId,
    String teacherName,
    String room,
    Boolean isOnline,
    String meetLink,
    String status
) {}
```
