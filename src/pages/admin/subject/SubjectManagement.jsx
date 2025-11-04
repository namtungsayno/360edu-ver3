import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "../../../components/common/SearchBar";
import DataTable from "../../../components/common/DataTable";
import { Button } from "../../../components/ui/Button";
import { getAllSubjects } from "../../../services/subject/subject.api";

function StatusBadge({ value }) {
  const isActive = value === true || value === "active" || value === 1 || value === "SHOW" || value === "HienThi";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isActive ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
      {isActive ? "Available" : "Unavailable"}
    </span>
  );
}

export default function SubjectManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getAllSubjects();
        if (!mounted) return;
        const rows = (data?.data || data || []).map((s, idx) => ({
          id: s.id ?? s.subjectId ?? idx,
          code: s.code ?? s.subjectCode ?? s.maMon ?? "",
          name: s.name ?? s.subjectName ?? s.tenMon ?? "",
          numCourses: s.numCourses ?? s.courseCount ?? s.soKhoa ?? 0,
          numClasses: s.numClasses ?? s.classCount ?? s.soLop ?? 0,
          status: s.active ?? s.status ?? s.trangThai ?? false,
        }));
        setItems(rows);
      } catch (e) {
        if (!mounted) return;
        setError(e?.displayMessage || e?.message || "Không tải được danh sách môn học");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [query]);

  const handleCreateSubject = useCallback(() => {
    navigate("/home/admin/subject/create");
  }, [navigate]);

  const handleEditSubject = useCallback((item) => {
    navigate(`/home/admin/subject/${item.id}/edit`);
  }, [navigate]);

  const handleDeleteSubject = useCallback((item) => {
    if (globalThis.confirm(`Bạn có chắc chắn muốn xóa môn học "${item.name}" không?`)) {
      console.log("Delete subject:", item);
      // Implement delete logic when API is ready
    }
  }, []);

  const columns = useMemo(
    () => [
      { 
        key: "code", 
        label: "Mã môn học",
        render: (value) => (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
              <span className="text-blue-600 text-xs font-bold">{value.substring(0, 2)}</span>
            </div>
            <span className="font-semibold text-blue-600">{value}</span>
          </div>
        )
      },
      { 
        key: "name", 
        label: "Tên môn học",
        render: (value) => (
          <span className="font-medium text-gray-800">{value}</span>
        )
      },
      { 
        key: "numCourses", 
        label: "Số khóa học",
        render: (value) => (
          <span className="text-gray-700">{value}</span>
        )
      },
      { 
        key: "numClasses", 
        label: "Số lớp học",
        render: (value) => (
          <span className="text-gray-700">{value}</span>
        )
      },
      {
        key: "status",
        label: "Trạng thái",
        render: (value) => <StatusBadge value={value} />,
      },
      {
        key: "actions",
        label: "Thao tác",
        render: (value, item) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditSubject(item)}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteSubject(item)}
              className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        ),
      },
    ],
    [handleEditSubject, handleDeleteSubject]
  );

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý môn học</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin các môn học trong hệ thống</p>
        </div>
        <Button 
          onClick={handleCreateSubject}
          className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span>+</span>
          <span>Thêm môn học</span>
        </Button>
      </div>

      {/* Search and Table Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Danh sách môn học</h3>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Bộ lọc
              </Button>
              <SearchBar 
                placeholder="Tìm kiếm môn học..." 
                value={query} 
                onChange={setQuery}
                className="w-80"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden">
          <DataTable 
            data={items} 
            columns={columns} 
            loading={loading} 
            error={error} 
            variant="clean" 
          />
        </div>
      </div>
    </div>
  );
}