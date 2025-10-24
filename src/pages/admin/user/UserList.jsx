import { useEffect, useState } from "react";
import api, { mockApi } from "../../services/api";
import Card from "../../../components/common/Card";
import DataTable from "../../../components/common/DataTable";

export default function User() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        // Try real API first; fallback to mock
        const res = await api.get("/users");
        if (isMounted) setUsers(res.data || []);
      } catch (_) {
        const res = await mockApi.getUsers();
        if (isMounted) setUsers(res);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", render: (value) => (
      <span className={`px-2 py-1 rounded text-xs ${
        value === "admin" ? "bg-red-900 text-red-300" :
        value === "teacher" ? "bg-blue-900 text-blue-300" :
        "bg-green-900 text-green-300"
      }`}>
        {value}
      </span>
    )},
    { key: "status", label: "Status", render: (value) => (
      <span className={`px-2 py-1 rounded text-xs ${
        value === "active" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
      }`}>
        {value}
      </span>
    )},
    { key: "joinDate", label: "Join Date" },
    { 
      key: "actions", 
      label: "Actions", 
      render: (_, row) => (
        <div className="flex space-x-2">
          <button className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
          <button className="text-red-400 hover:text-red-300 text-sm">Delete</button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
        <p className="text-gray-300">Manage user accounts and permissions</p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-yellow-400">{users.length}</div>
          <div className="text-gray-400 text-sm">Total Users</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-400">
            {users.filter(u => u.status === "active").length}
          </div>
          <div className="text-gray-400 text-sm">Active Users</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-400">
            {users.filter(u => u.role === "teacher").length}
          </div>
          <div className="text-gray-400 text-sm">Teachers</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-400">
            {users.filter(u => u.role === "student").length}
          </div>
          <div className="text-gray-400 text-sm">Students</div>
        </Card>
      </div>

      {/* User Table */}
      <Card title="All Users">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex space-x-4">
            <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded">
              Add User
            </button>
            <button className="border border-gray-600 text-gray-300 hover:bg-gray-700 font-bold py-2 px-4 rounded">
              Export
            </button>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search users..."
              className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-yellow-500 focus:outline-none"
            />
            <select className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-yellow-500 focus:outline-none">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
        </div>
        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          error={error}
        />
      </Card>
    </div>
  );
}


