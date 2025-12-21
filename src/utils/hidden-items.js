// src/utils/hidden-items.js
// Quản lý danh sách ẩn (soft hide) cho Class và Course bằng localStorage
// Không thay đổi database - chỉ ẩn ở phía Frontend

const STORAGE_KEYS = {
  HIDDEN_CLASSES: "360edu_hidden_classes",
  HIDDEN_COURSES: "360edu_hidden_courses",
};

// ============ GENERIC HELPERS ============

/**
 * Lấy danh sách ID đã ẩn từ localStorage
 * @param {string} key - Storage key
 * @returns {Set<number>} Set of hidden IDs
 */
const getHiddenSet = (key) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return new Set();
    const arr = JSON.parse(data);
    return new Set(arr.map((id) => Number(id)));
  } catch {
    return new Set();
  }
};

/**
 * Lưu danh sách ID đã ẩn vào localStorage
 * @param {string} key - Storage key
 * @param {Set<number>} set - Set of hidden IDs
 */
const saveHiddenSet = (key, set) => {
  try {
    const arr = Array.from(set);
    localStorage.setItem(key, JSON.stringify(arr));
  } catch {
    // localStorage might be full or disabled
  }
};

// ============ CLASS FUNCTIONS ============

/**
 * Lấy danh sách Class ID đã ẩn
 * @returns {Set<number>}
 */
export const getHiddenClassIds = () => {
  return getHiddenSet(STORAGE_KEYS.HIDDEN_CLASSES);
};

/**
 * Kiểm tra Class có bị ẩn không
 * @param {number} classId
 * @returns {boolean}
 */
export const isClassHidden = (classId) => {
  const set = getHiddenSet(STORAGE_KEYS.HIDDEN_CLASSES);
  return set.has(Number(classId));
};

/**
 * Ẩn một Class
 * @param {number} classId
 */
export const hideClass = (classId) => {
  const set = getHiddenSet(STORAGE_KEYS.HIDDEN_CLASSES);
  set.add(Number(classId));
  saveHiddenSet(STORAGE_KEYS.HIDDEN_CLASSES, set);
};

/**
 * Hiện lại một Class
 * @param {number} classId
 */
export const showClass = (classId) => {
  const set = getHiddenSet(STORAGE_KEYS.HIDDEN_CLASSES);
  set.delete(Number(classId));
  saveHiddenSet(STORAGE_KEYS.HIDDEN_CLASSES, set);
};

/**
 * Toggle trạng thái ẩn/hiện của Class
 * @param {number} classId
 * @returns {boolean} Trạng thái mới (true = đang ẩn)
 */
export const toggleClassVisibility = (classId) => {
  const set = getHiddenSet(STORAGE_KEYS.HIDDEN_CLASSES);
  const id = Number(classId);
  if (set.has(id)) {
    set.delete(id);
    saveHiddenSet(STORAGE_KEYS.HIDDEN_CLASSES, set);
    return false; // Đã hiện
  } else {
    set.add(id);
    saveHiddenSet(STORAGE_KEYS.HIDDEN_CLASSES, set);
    return true; // Đã ẩn
  }
};

/**
 * Kiểm tra Class đã kết thúc chưa (sau 24h của endDate)
 * @param {string} endDate - ISO date string
 * @returns {boolean}
 */
export const isClassEnded = (endDate) => {
  if (!endDate) return false;
  const end = new Date(endDate);
  // Đặt về cuối ngày (23:59:59.999)
  end.setHours(23, 59, 59, 999);
  const now = new Date();
  return now > end;
};

/**
 * Kiểm tra Class có thể ẩn được không
 * Điều kiện: Class đã PUBLIC và đã kết thúc (sau endDate)
 * @param {object} cls - Class object
 * @returns {boolean}
 */
export const canHideClass = (cls) => {
  if (!cls) return false;
  // Chỉ có thể ẩn các lớp PUBLIC đã kết thúc
  return cls.status === "PUBLIC" && isClassEnded(cls.endDate);
};

// ============ COURSE FUNCTIONS ============

/**
 * Lấy danh sách Course ID đã ẩn
 * @returns {Set<number>}
 */
export const getHiddenCourseIds = () => {
  return getHiddenSet(STORAGE_KEYS.HIDDEN_COURSES);
};

/**
 * Kiểm tra Course có bị ẩn không
 * @param {number} courseId
 * @returns {boolean}
 */
export const isCourseHidden = (courseId) => {
  const set = getHiddenSet(STORAGE_KEYS.HIDDEN_COURSES);
  return set.has(Number(courseId));
};

/**
 * Ẩn một Course
 * @param {number} courseId
 */
export const hideCourse = (courseId) => {
  const set = getHiddenSet(STORAGE_KEYS.HIDDEN_COURSES);
  set.add(Number(courseId));
  saveHiddenSet(STORAGE_KEYS.HIDDEN_COURSES, set);
};

/**
 * Hiện lại một Course
 * @param {number} courseId
 */
export const showCourse = (courseId) => {
  const set = getHiddenSet(STORAGE_KEYS.HIDDEN_COURSES);
  set.delete(Number(courseId));
  saveHiddenSet(STORAGE_KEYS.HIDDEN_COURSES, set);
};

/**
 * Toggle trạng thái ẩn/hiện của Course
 * @param {number} courseId
 * @returns {boolean} Trạng thái mới (true = đang ẩn)
 */
export const toggleCourseVisibility = (courseId) => {
  const set = getHiddenSet(STORAGE_KEYS.HIDDEN_COURSES);
  const id = Number(courseId);
  if (set.has(id)) {
    set.delete(id);
    saveHiddenSet(STORAGE_KEYS.HIDDEN_COURSES, set);
    return false; // Đã hiện
  } else {
    set.add(id);
    saveHiddenSet(STORAGE_KEYS.HIDDEN_COURSES, set);
    return true; // Đã ẩn
  }
};

// ============ FILTER HELPERS ============

/**
 * Lọc danh sách classes, bỏ qua các class đã ẩn
 * @param {Array} classes - Danh sách class
 * @returns {Array} Danh sách class chưa bị ẩn
 */
export const filterHiddenClasses = (classes) => {
  if (!Array.isArray(classes)) return [];
  const hiddenSet = getHiddenClassIds();
  return classes.filter((c) => !hiddenSet.has(Number(c.id)));
};

/**
 * Lọc danh sách courses, bỏ qua các course đã ẩn
 * @param {Array} courses - Danh sách course
 * @returns {Array} Danh sách course chưa bị ẩn
 */
export const filterHiddenCourses = (courses) => {
  if (!Array.isArray(courses)) return [];
  const hiddenSet = getHiddenCourseIds();
  return courses.filter((c) => !hiddenSet.has(Number(c.id)));
};
