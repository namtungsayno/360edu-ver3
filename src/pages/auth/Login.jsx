import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login data:", formData);
    // TODO: Implement login logic
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Đăng nhập</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
            placeholder="Nhập email của bạn"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Mật khẩu</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
            placeholder="Nhập mật khẩu"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Đăng nhập
        </button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-gray-400">
          Chưa có tài khoản?{" "}
          <Link to="/home/register" className="text-yellow-400 hover:text-yellow-300">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
