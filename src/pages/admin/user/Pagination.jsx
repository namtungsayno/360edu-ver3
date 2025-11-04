// src/pages/admin/user/Pagination.jsx
/**
 * Pagination component (dumb UI)
 * Props:
 * - page: number (0-based)
 * - size: number
 * - total: number
 * - onPageChange(p: number)
 * - onSizeChange(s: number)
 */
export default function Pagination({
  page,
  size,
  total,
  onPageChange,
  onSizeChange,
}) {
  const totalPages = Math.max(1, Math.ceil(total / size));
  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
      <div className="text-sm text-gray-600">
        Trang <b>{page + 1}</b> / {totalPages} — Tổng <b>{total}</b> bản ghi
      </div>

      <div className="flex items-center gap-2">
        <select
          className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm"
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n} / trang
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <button
            className="h-9 rounded-md border px-3 text-sm disabled:opacity-50"
            onClick={() => onPageChange(0)}
            disabled={!canPrev}
          >
            «
          </button>
          <button
            className="h-9 rounded-md border px-3 text-sm disabled:opacity-50"
            onClick={() => onPageChange(page - 1)}
            disabled={!canPrev}
          >
            Trước
          </button>
          <button
            className="h-9 rounded-md border px-3 text-sm disabled:opacity-50"
            onClick={() => onPageChange(page + 1)}
            disabled={!canNext}
          >
            Sau
          </button>
          <button
            className="h-9 rounded-md border px-3 text-sm disabled:opacity-50"
            onClick={() => onPageChange(totalPages - 1)}
            disabled={!canNext}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
