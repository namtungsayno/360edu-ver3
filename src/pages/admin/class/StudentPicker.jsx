/**
 * ============================================================================
 * StudentPicker Component - Component để thêm học sinh vào lớp học
 * ============================================================================
 *
 * ✅ ĐÃ SỬA:
 * 1. Sửa import paths từ alias @ sang relative path
 * 2. Thêm validation kiểm tra trùng lặp học sinh
 * 3. Redesign UI với gradient styling và icons
 * 4. Thêm error handling chi tiết
 * 5. Support Enter key để thêm học sinh nhanh
 *
 * @param {Function} onAdd - Callback khi thêm học sinh mới
 * @param {Array} value - Danh sách học sinh đã thêm
 * @param {Function} onRemove - Callback khi xóa học sinh
 * @param {Function} lookupApi - API để tìm học sinh theo code (userService.lookupStudentByCode)
 */
import React, { useState } from "react";

// ✅ SỬA: Import từ relative path thay vì alias @
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { X, Plus, Loader2, User2, Search } from "lucide-react";

/**
 * ✅ REDESIGN: Component StudentChip - Hiển thị thông tin học sinh dạng chip
 * Gradient styling với hover effects
 *
 * @param {Object} s - Thông tin học sinh { id, code, fullName, email }
 * @param {Function} onRemove - Callback khi click nút xóa
 */
function StudentChip({ s, onRemove }) {
  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-2 transition-all hover:shadow-md">
      <div className="bg-blue-500 p-1.5 rounded-full">
        <User2 className="h-3 w-3 text-white" />
      </div>
      <div className="flex-1">
        <span className="font-medium text-gray-900 text-sm">{s.fullName}</span>
        <span className="text-gray-500 text-xs ml-2">#{s.code}</span>
      </div>
      <button
        onClick={() => onRemove?.(s.id)}
        className="hover:bg-red-100 p-1 rounded-full transition-colors group"
        title="Xóa học sinh"
      >
        <X className="h-4 w-4 text-gray-400 group-hover:text-red-600" />
      </button>
    </div>
  );
}

export default function StudentPicker({
  onAdd,
  value = [],
  onRemove,
  lookupApi,
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * ✅ FUNCTION: Thêm học sinh mới
   * - Validate input không rỗng
   * - Kiểm tra trùng lặp
   * - Gọi lookupApi để tìm học sinh
   * - Handle errors
   */
  async function add() {
    // ✅ VALIDATION: Kiểm tra input không rỗng
    if (!code.trim()) {
      setError("Vui lòng nhập mã học sinh");
      return;
    }

    // ✅ VALIDATION: Kiểm tra trùng lặp (học sinh đã được thêm vào danh sách chưa)
    if (value.some((s) => s.code === code.trim())) {
      setError("Học sinh này đã được thêm");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const s = await lookupApi(code.trim());
      onAdd?.(s);
      setCode("");
    } catch (err) {
      setError(err.displayMessage || "Không tìm thấy học sinh với mã này");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* FIXED: Input section với style đẹp hơn */}
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-4 hover:border-blue-400 transition-colors">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Nhập mã học sinh (VD: HS0001) và nhấn Enter"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") add();
              }}
              className="pl-10 h-11 border-gray-300 focus:border-blue-500"
              disabled={loading}
            />
          </div>
          <Button
            onClick={add}
            disabled={loading || !code.trim()}
            className="h-11 px-6 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Thêm
              </>
            )}
          </Button>
        </div>

        {/* FIXED: Hiển thị lỗi nếu có */}
        {error && (
          <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
            <div className="w-1 h-4 bg-red-600 rounded"></div>
            {error}
          </div>
        )}
      </div>

      {/* FIXED: Danh sách học sinh với header */}
      {value.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700">
              Đã thêm {value.length} học sinh
            </h4>
            <div className="text-xs text-gray-500">Click × để xóa</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {value.map((s) => (
              <StudentChip key={s.id} s={s} onRemove={onRemove} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <User2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Chưa có học sinh nào</p>
          <p className="text-xs mt-1">Nhập mã học sinh để thêm vào lớp</p>
        </div>
      )}
    </div>
  );
}
