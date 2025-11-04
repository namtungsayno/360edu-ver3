/**
 * Pagination component for subject management
 * Matches User.jsx pagination structure
 */
export default function SubjectPagination({
  page,
  size,
  total,
  onPageChange,
  onSizeChange,
}) {
  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>
          Trang {page + 1} / {totalPages} — Tổng {total} bản ghi
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Số bản ghi / trang:</label>
          <select
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex gap-1">
          <button
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            disabled={page === 0}
            onClick={() => onPageChange(0)}
          >
            «
          </button>
          <button
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
          >
            Trước
          </button>
          <button
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
          >
            Sau
          </button>
          <button
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(totalPages - 1)}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
