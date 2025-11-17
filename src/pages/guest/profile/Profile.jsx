export default function Profile() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Thông tin cá nhân</h1>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Họ và tên</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
              placeholder="Nhập họ và tên"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
              placeholder="Nhập email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Số điện thoại</label>
            <input 
              type="tel" 
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
              placeholder="Nhập số điện thoại"
            />
          </div>
          <div className="flex space-x-4">
            <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors">
              Cập nhật thông tin
            </button>
            <button className="border border-gray-600 text-gray-300 hover:bg-gray-700 font-bold py-3 px-6 rounded-lg transition-colors">
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}