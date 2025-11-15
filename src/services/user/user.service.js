// src/services/user.service.js
import { userApi } from "./user.api";

const normalizeRole = (roles = []) => {
  const first = (roles[0] || "")
    .toString()
    .replace(/^ROLE_/, "")
    .toUpperCase();
  if (["TEACHER", "STUDENT", "PARENT"].includes(first)) return first;
  return first || "STUDENT";
};

export const userService = {
  async list(params = {}) {
    const rawData = await userApi.list(params);
    const raw = Array.isArray(rawData?.content)
      ? rawData.content
      : rawData || [];

    // (đã bỏ debug log)

    // Chuẩn hoá shape cho UI
    return raw.map((u) => ({
      id: u.id,
      // ✅ Ưu tiên: fullName từ BE → full_name từ DB → username (fallback khi NULL)
      // ⚠️ Lưu ý: Đây chỉ là giải pháp tạm thời. Nên update DB để có fullName thực.
      fullName: u.fullName || u.full_name || u.username || `User #${u.id}`,
      email: u.email || "",
      phone: u.phoneNumber || u.phone_number || "",
      role: u.role || normalizeRole(u.roles || []),
      active: typeof u.active === "boolean" ? u.active : false,
      joinDate: u.joinDate || u.createdAt || u.created_at || "",
      // classCount không còn dùng ở danh sách (realtime check khi toggle)
    }));
  },

  // ✅ tạo giáo viên đúng luồng auth (khác với create generic)
  async createTeacher(payload) {
    // Validate subjectIds presence before calling API
    if (!Array.isArray(payload.subjectIds) || payload.subjectIds.length === 0) {
      throw new Error(
        "At least one subject must be selected to create a teacher"
      );
    }
    return userApi.createTeacher(payload);
  },

  async updateStatus(userId, active) {
    return userApi.updateStatus(userId, active);
  },

  /**
   * ✅ THÊM MỚI: Tìm học sinh theo code/ID/tên
   * Giải quyết lỗi 401 khi gọi /api/students/lookup
   * Thay vì gọi endpoint riêng, sử dụng danh sách users đã có quyền truy cập
   *
   * @param {string} code - Mã học sinh (ID, tên, hoặc email)
   * @returns {Promise<Object>} - Thông tin học sinh { id, code, fullName, email, phone }
   * @throws {Error} - Nếu không tìm thấy học sinh
   */
  async lookupStudentByCode(code) {
    // BƯỚC 1: Lấy toàn bộ danh sách users từ API có sẵn quyền
    const allUsers = await this.list();
    const searchTerm = String(code).trim().toLowerCase();

    // BƯỚC 2: Tìm chính xác theo ID trước (ưu tiên tìm ID trùng khớp hoàn toàn)
    let student = allUsers.find(
      (u) => u.role === "STUDENT" && String(u.id) === searchTerm
    );

    // BƯỚC 3: Nếu không tìm thấy theo ID, tìm theo tên hoặc email (partial match)
    if (!student) {
      student = allUsers.find(
        (u) =>
          u.role === "STUDENT" &&
          (u.fullName?.toLowerCase().includes(searchTerm) ||
            u.email?.toLowerCase().includes(searchTerm))
      );
    }

    // BƯỚC 4: Throw error nếu không tìm thấy học sinh nào
    if (!student) {
      throw new Error(`Không tìm thấy học sinh với mã/ID: ${code}`);
    }

    // BƯỚC 5: Trả về object theo format StudentPicker component mong đợi
    return {
      id: student.id,
      code: String(student.id), // Dùng ID làm code hiển thị
      fullName: student.fullName,
      email: student.email,
      phone: student.phone,
    };
  },

  //  // (tuỳ chọn) dùng khi form edit người dùng
  // async update(userId, data) {
  //   return userApi.update(userId, data);
  // },
};
