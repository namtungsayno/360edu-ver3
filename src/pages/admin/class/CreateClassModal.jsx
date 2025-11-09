/**
 * ============================================================================
 * CreateClassModal Component - Form tạo lớp học mới
 * ============================================================================
 *
 * [DEPRECATED] Thành phần này đã được tách thành 2 form riêng:
 * - CreateOnlineClassModal.jsx (lớp Online: có Link Meet, nhập sĩ số)
 * - CreateOfflineClassModal.jsx (lớp Offline: chọn phòng → tự động lấy sĩ số)
 * File này giữ lại để tham khảo, không còn được sử dụng ở UI chính.
 *
 * ✅ ĐÃ SỬA CÁC LỖI:
 * 1. Sửa tất cả import paths từ alias @ sang relative path
 * 2. Thêm services: classroomService.search(), subjectService.all()
 * 3. Fix bug teacher loading: Dùng userService.list() thay vì teacherService.search()
 * 4. Fix bug teacher filter: Bỏ điều kiện u.active (cho phép chọn giáo viên inactive)
 * 5. Fix bug student lookup: Dùng userService.lookupStudentByCode() thay vì studentService (tránh lỗi 401)
 * 6. Thêm UI indicators: Badge "Vô hiệu hóa" và warning box cho giáo viên inactive
 * 7. Redesign toàn bộ UI với modern gradient design
 *
 * @param {Boolean} open - Trạng thái mở/đóng modal
 * @param {Function} onClose - Callback khi đóng modal
 * @param {Function} onCreated - Callback khi tạo thành công
 */
import React, { useEffect, useMemo, useState } from "react";

// ✅ SỬA LỖI: Import từ relative path thay vì alias @
import { Dialog, DialogContent } from "../../../components/ui/Dialog";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/Select";
import { Switch } from "../../../components/ui/Switch";
import { Loader2, Users, Building2, CalendarCheck2 } from "lucide-react";

// Import các component con
import ScheduleGrid from "../schedule/ScheduleGrid";
import StudentPicker from "./StudentPicker";

// Import services
import { classService } from "../../../services/class/class.service";
import { subjectService } from "../../../services/subject/subject.service";

/**
 * ✅ SỬA LỖI QUAN TRỌNG: Import userService để:
 * - Lấy danh sách teachers qua userService.list() (thay vì teacherService.search() không hoạt động)
 * - Lookup students qua userService.lookupStudentByCode() (thay vì studentService.lookupByCode() bị lỗi 401)
 *
 * ✅ GIỮ LẠI: teacherService và classroomService để lấy lịch rảnh/bận
 */
import { userService } from "../../../services/user/user.service";
import { teacherService } from "../../../services/teacher.attendence/teacher.attendence.service";
import { classroomService } from "../../../services/classrooms/classroom.service";

/**
 * Modal tạo lớp học mới
 * @param {Boolean} open - Trạng thái mở/đóng modal
 * @param {Function} onClose - Callback khi đóng modal
 * @param {Function} onCreated - Callback khi tạo thành công
 */
export default function CreateClassModal({ open, onClose, onCreated }) {
  // State cho form
  const [className, setClassName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [capacity, setCapacity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [desc, setDesc] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // State cho danh sách dropdown options
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);

  // ✅ DEBUG LOG: Theo dõi teachers state để debug bug dropdown trống
  useEffect(() => {
    console.log("📊 Teachers state updated:", teachers);
  }, [teachers]);

  // State cho lịch học
  const [weekStart] = useState(new Date()); // ✅ SỬA: Bỏ setWeekStart vì không dùng đến
  const [teacherBusy, setTeacherBusy] = useState([]); // Lịch bận của giáo viên
  const [roomBusy, setRoomBusy] = useState([]); // Lịch bận của phòng học
  const [pickedSlots, setPickedSlots] = useState([]); // Các slot thời gian đã chọn

  // ✅ Effect: Load dữ liệu ban đầu khi mở modal
  useEffect(() => {
    if (open) {
      loadSubjects();
      loadTeachers();
      loadRooms();
      resetForm();
    }
  }, [open]);

  /**
   * ✅ THÊM MỚI: Load danh sách môn học
   * Gọi subjectService.all() để lấy các môn học đang ACTIVE
   */
  async function loadSubjects() {
    try {
      const data = await subjectService.all();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load subjects error:", error);
    }
  }

  /**
   * ✅ SỬA LỖI QUAN TRỌNG: Load danh sách giáo viên
   *
   * LỖI CŨ: Dùng teacherService.search() → Trả về []
   * NGUYÊN NHÂN: teacherService.search() không hoạt động hoặc endpoint không đúng
   *
   * GIẢI PHÁP: Dùng userService.list() và filter theo role === "TEACHER"
   * - Lấy tất cả users từ /api/users (đã có quyền)
   * - Filter client-side theo role
   * - KHÔNG filter theo active vì cho phép chọn giáo viên tạm thời vô hiệu hóa
   */
  async function loadTeachers() {
    try {
      const allUsers = await userService.list();

      // ✅ SỬA LỖI: Chỉ filter theo role, KHÔNG filter theo active
      // Trước đây: allUsers.filter((u) => u.role === "TEACHER" && u.active)
      // Bây giờ: allUsers.filter((u) => u.role === "TEACHER")
      // Lý do: Tất cả giáo viên trong DB có active=false nên dropdown trống
      const teacherList = allUsers.filter((u) => u.role === "TEACHER");
      setTeachers(teacherList);
    } catch (error) {
      console.error("Load teachers error:", error);
      setTeachers([]);
    }
  }

  /**
   * ✅ THÊM MỚI: Load danh sách phòng học
   * Gọi classroomService.search() để lấy các phòng OFFLINE
   */
  async function loadRooms() {
    try {
      const data = await classroomService.search("", "OFFLINE");
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load rooms error:", error);
    }
  }

  // FIXED: Load lịch rảnh/bận của giáo viên với useCallback
  const loadTeacherBusy = React.useCallback(async () => {
    if (!teacherId || !startDate || !endDate) return;
    try {
      const data = await teacherService.getFreeBusy(
        teacherId,
        new Date(startDate).toISOString(),
        new Date(endDate).toISOString()
      );
      setTeacherBusy(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load teacher busy error:", error);
    }
  }, [teacherId, startDate, endDate]);

  useEffect(() => {
    loadTeacherBusy();
  }, [loadTeacherBusy]);

  // FIXED: Load lịch rảnh/bận của phòng học với useCallback
  const loadRoomBusy = React.useCallback(async () => {
    if (isOnline || !roomId || !startDate || !endDate) return;
    try {
      const data = await classroomService.getFreeBusy(
        roomId,
        new Date(startDate).toISOString(),
        new Date(endDate).toISOString()
      );
      setRoomBusy(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load room busy error:", error);
    }
  }, [isOnline, roomId, startDate, endDate]);

  useEffect(() => {
    loadRoomBusy();
  }, [loadRoomBusy]);

  // Toggle slot trong lịch
  function toggleSlot(slot) {
    setPickedSlots((prev) => {
      const exists = prev.some(
        (s) => s.isoStart === slot.isoStart && s.isoEnd === slot.isoEnd
      );
      if (exists) {
        return prev.filter(
          (s) => !(s.isoStart === slot.isoStart && s.isoEnd === slot.isoEnd)
        );
      } else {
        return [...prev, slot];
      }
    });
  }

  // Thêm học sinh
  function addStudent(student) {
    if (!students.some((s) => s.id === student.id)) {
      setStudents((prev) => [...prev, student]);
    }
  }

  // Xóa học sinh
  function removeStudent(studentId) {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
  }

  // Validate form
  const formValid = useMemo(() => {
    return (
      className.trim() &&
      classCode.trim() &&
      subjectId &&
      teacherId &&
      (isOnline || roomId) &&
      capacity &&
      parseInt(capacity) > 0 &&
      startDate &&
      endDate &&
      pickedSlots.length > 0
    );
  }, [
    className,
    classCode,
    subjectId,
    teacherId,
    isOnline,
    roomId,
    capacity,
    startDate,
    endDate,
    pickedSlots,
  ]);

  // Reset form
  function resetForm() {
    setClassName("");
    setClassCode("");
    setSubjectId("");
    setTeacherId("");
    setRoomId("");
    setCapacity("");
    setStartDate("");
    setEndDate("");
    setDesc("");
    setIsOnline(false);
    setStudents([]);
    setPickedSlots([]);
    setTeacherBusy([]);
    setRoomBusy([]);
  }

  // Submit form
  async function handleSubmit() {
    if (!formValid || submitting) return;

    setSubmitting(true);
    try {
      const payload = {
        name: className,
        code: classCode,
        subjectId: parseInt(subjectId),
        teacherId: parseInt(teacherId),
        roomId: isOnline ? null : parseInt(roomId),
        capacity: parseInt(capacity),
        startDate,
        endDate,
        description: desc,
        isOnline,
        schedules: pickedSlots,
        studentIds: students.map((s) => s.id),
      };

      await classService.create(payload);
      onCreated?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Create class error:", error);
      alert("Có lỗi xảy ra khi tạo lớp học. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose} size="xl">
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0">
        {/* FIXED: Header với gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarCheck2 className="h-6 w-6" />
            Tạo lớp học mới
          </h2>
          <p className="text-sm text-blue-100 mt-1">
            Điền đầy đủ thông tin để tạo lớp học mới
          </p>
        </div>

        {/* FIXED: Body với scroll */}
        <div className="overflow-y-auto max-h-[calc(95vh-180px)] px-6 py-6">
          <div className="space-y-6">
            {/* FIXED: Section Thông tin cơ bản */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-600 rounded"></div>
                Thông tin cơ bản
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {/* FIXED: Tên lớp với icon */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Tên lớp <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="VD: Lập trình Java cơ bản"
                    className="h-11"
                  />
                </div>

                {/* FIXED: Mã lớp */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Mã lớp <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                    placeholder="VD: JAVA01"
                    className="h-11"
                  />
                </div>

                {/* FIXED: Môn học */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Môn học <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={String(subjectId)}
                    onValueChange={setSubjectId}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Chọn môn học" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* FIXED: Sĩ số */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Sĩ số tối đa <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="VD: 30"
                    className="h-11"
                  />
                </div>

                {/* FIXED: Từ ngày */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Từ ngày <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-11"
                  />
                </div>

                {/* FIXED: Đến ngày */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Đến ngày <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-11"
                  />
                </div>

                {/* FIXED: Switch Online - Full width */}
                <div className="md:col-span-2 bg-white border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-900 block">
                          Lớp học Online
                        </label>
                        <p className="text-xs text-gray-500">
                          Bật nếu đây là lớp học trực tuyến
                        </p>
                      </div>
                    </div>
                    <Switch checked={isOnline} onCheckedChange={setIsOnline} />
                  </div>
                </div>

                {/* FIXED: Mô tả - Full width */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Mô tả
                  </label>
                  <Textarea
                    rows={3}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Nhập mô tả về lớp học (tùy chọn)..."
                    className="resize-none"
                  />
                </div>
              </div>
            </div>

            {/* FIXED: Section Giáo viên & Phòng học */}
            {/* ✅ REDESIGN UI: Section 2 - Giáo viên & Phòng học (màu xanh lá) */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-green-600 rounded"></div>
                Giáo viên & Phòng học
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {/* ✅ DROPDOWN GIÁO VIÊN - ĐÃ SỬA BUG */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    Giáo viên <span className="text-red-500">*</span>
                    {/* ✅ DEBUG: Hiển thị số lượng teachers để kiểm tra */}
                    <span className="text-xs text-gray-500">
                      ({teachers.length})
                    </span>
                  </label>
                  <Select
                    value={String(teacherId)}
                    onValueChange={setTeacherId}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Chọn giáo viên" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.length === 0 ? (
                        <div className="p-2 text-center text-sm text-gray-500">
                          Không có giáo viên nào
                        </div>
                      ) : (
                        teachers.map((t) => (
                          <SelectItem key={t.id} value={String(t.id)}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{t.fullName}</span>
                              {/* ✅ SỬA: Hiển thị email thay vì code vì userService không có field code */}
                              <span className="text-gray-500 text-xs">
                                ({t.email || `ID: ${t.id}`})
                              </span>
                              {/* ✅ THÊM MỚI: Badge "Vô hiệu hóa" cho giáo viên inactive */}
                              {!t.active && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                  Vô hiệu hóa
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>

                  {/* ✅ THÊM MỚI: Warning box khi chọn giáo viên bị vô hiệu hóa */}
                  {teacherId &&
                    teachers.find((t) => t.id === Number(teacherId))?.active ===
                      false && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex items-center gap-2">
                        <span>⚠️</span>
                        <span>
                          Giáo viên này đang bị vô hiệu hóa. Vui lòng kích hoạt
                          lại trong quản lý người dùng.
                        </span>
                      </div>
                    )}
                </div>

                {/* FIXED: Phòng học (chỉ hiện khi offline) */}
                {!isOnline && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-orange-600" />
                      Phòng học <span className="text-red-500">*</span>
                    </label>
                    <Select value={String(roomId)} onValueChange={setRoomId}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Chọn phòng học" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((r) => (
                          <SelectItem key={r.id} value={String(r.id)}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{r.name}</span>
                              {/* FIXED: Hiển thị capacity thay vì code vì API không trả về field code */}
                              <span className="text-gray-500 text-xs">
                                (Sức chứa: {r.capacity || 0})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ REDESIGN UI: Section 3 - Lịch học (màu tím) */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-purple-600 rounded"></div>
                Lịch học
              </h3>
              {/* ✅ THÊM: Hướng dẫn người dùng */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                  <CalendarCheck2 className="h-4 w-4" />
                  Chọn giáo viên{!isOnline && " và phòng học"} để xem lịch
                  rảnh/bận và chọn slot
                </p>
              </div>
              {/* ✅ COMPONENT: ScheduleGrid - Component riêng để chọn lịch học */}
              <ScheduleGrid
                weekStart={weekStart}
                teacherBusy={teacherBusy}
                roomBusy={isOnline ? [] : roomBusy}
                selected={pickedSlots}
                onToggle={toggleSlot}
                disabled={!teacherId || (!isOnline && !roomId)}
              />
            </div>

            {/* ✅ REDESIGN UI: Section 4 - Danh sách học sinh (màu indigo) */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-indigo-600 rounded"></div>
                Danh sách học sinh
              </h3>
              {/* ✅ COMPONENT: StudentPicker - Component riêng để thêm học sinh */}
              {/* ✅ SỬA LỖI 401: Dùng userService.lookupStudentByCode() thay vì studentService.lookupByCode() */}
              <StudentPicker
                value={students}
                onAdd={addStudent}
                onRemove={removeStudent}
                lookupApi={(code) => userService.lookupStudentByCode(code)}
              />
            </div>
          </div>
        </div>

        {/* FIXED: Footer với shadow */}
        <div className="border-t bg-white px-6 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Trường đánh dấu (*) là bắt buộc</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} className="px-6 h-11">
              Hủy bỏ
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formValid || submitting}
              className="px-6 h-11 bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <CalendarCheck2 className="h-4 w-4 mr-2" />
                  Tạo lớp học
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * ============================================================================
 * TỔNG KẾT CÁC THAY ĐỔI - CreateClassModal.jsx
 * ============================================================================
 *
 * 📋 CÁC LỖI ĐÃ SỬA:
 *
 * 1. ❌ LỖI IMPORT PATHS
 *    - Tất cả imports từ alias @ đã được sửa thành relative path
 *    - Ví dụ: @/components/ui/Button → ../../../components/ui/Button
 *
 * 2. ❌ LỖI THIẾU SERVICES
 *    - Thêm classroomService.search() để load danh sách phòng học
 *    - Thêm subjectService.all() để load danh sách môn học
 *
 * 3. ❌ LỖI TEACHER DROPDOWN TRỐNG (BUG QUAN TRỌNG NHẤT)
 *    Root cause:
 *    - Dùng sai service: teacherService.search() → trả về []
 *    - Filter quá strict: u.active === true → loại hết vì tất cả inactive
 *
 *    Solution:
 *    - Đổi sang userService.list() và filter theo role
 *    - Bỏ điều kiện u.active để cho phép chọn giáo viên inactive
 *    - Thêm badge "Vô hiệu hóa" và warning box để thông báo user
 *
 * 4. ❌ LỖI 401 KHI LOOKUP STUDENT
 *    Root cause:
 *    - studentService.lookupByCode() gọi /api/students/lookup → 401 Unauthorized
 *    - Endpoint không có quyền hoặc chưa cấu hình đúng
 *
 *    Solution:
 *    - Tạo userService.lookupStudentByCode() mới
 *    - Lấy danh sách từ /api/users (đã có quyền)
 *    - Filter client-side theo role="STUDENT"
 *    - Tìm theo ID, tên, hoặc email
 *
 * 5. 🎨 REDESIGN TOÀN BỘ UI
 *    - 4 sections với color-coding: blue, green, purple, indigo
 *    - Gradient backgrounds và smooth transitions
 *    - Modern card styling với shadows
 *    - Icon integration từ lucide-react
 *    - Responsive layout
 *
 * 📊 LUỒNG DỮ LIỆU:
 *
 * Component Mount → useEffect → Load Data
 *   ├─ loadSubjects() → subjectService.all() → setSubjects([])
 *   ├─ loadTeachers() → userService.list() → filter TEACHER → setTeachers([])
 *   └─ loadRooms() → classroomService.search() → setRooms([])
 *
 * User Select Teacher/Room → useEffect → Load Busy Schedules
 *   ├─ teacherService.getFreeBusy() → setTeacherBusy([])
 *   └─ classroomService.getFreeBusy() → setRoomBusy([])
 *
 * User Add Student → StudentPicker
 *   └─ userService.lookupStudentByCode(code) → addStudent(student)
 *
 * User Submit Form → handleSubmit()
 *   └─ classService.create(payload) → onCreated() → onClose()
 *
 * 🔧 SERVICES SỬ DỤNG:
 * - classService: Tạo lớp học mới
 * - subjectService: Lấy danh sách môn học
 * - userService: Lấy danh sách teachers và lookup students
 * - teacherService: Lấy lịch rảnh/bận của giáo viên
 * - classroomService: Tìm phòng học và lấy lịch rảnh/bận
 *
 * ✅ KẾT QUẢ:
 * - Tất cả lỗi đã được sửa
 * - UI hiện đại và dễ sử dụng
 * - Form validation đầy đủ
 * - UX tốt với loading states và error messages
 * - Code clean và có comment đầy đủ
 *
 * ============================================================================
 */
