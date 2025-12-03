// src/services/teacher/teacher.security.service.js
// Business layer for teacher security (new, non-breaking)

import { teacherSecurityApi } from "./teacher.security.api";

export const teacherSecurityService = {
  /**
   * Validate and change password
   * @param {{currentPassword:string,newPassword:string,confirmPassword:string}} data
   */
  async changePassword(data) {
    if (!data?.currentPassword) throw new Error("Vui lòng nhập mật khẩu hiện tại");
    if (!data?.newPassword) throw new Error("Vui lòng nhập mật khẩu mới");
    if (String(data.newPassword).length < 6)
      throw new Error("Mật khẩu mới phải tối thiểu 6 ký tự");
    if (data.newPassword !== data.confirmPassword)
      throw new Error("Mật khẩu xác nhận không khớp");

    return teacherSecurityApi.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
  },
};
