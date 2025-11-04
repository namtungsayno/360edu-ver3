/**
 * MOCK DATA cho News Management
 * Sử dụng khi backend chưa sẵn sàng hoặc để testing
 */

export const mockNewsData = [
	{
		id: 1,
		title: "Khai giảng khóa học Lập trình Python mùa Thu 2025",
		excerpt: "Trung tâm 360edu trân trọng thông báo khai giảng khóa học Lập trình Python cơ bản dành cho người mới bắt đầu. Khóa học bắt đầu từ ngày 25/10/2025.",
		content: `Trung tâm 360edu trân trọng thông báo khai giảng khóa học Lập trình Python cơ bản dành cho người mới bắt đầu.

**Thông tin khóa học:**
- Thời gian: 3 tháng (12 buổi)
- Lịch học: Thứ 2, 4, 6 (19h00 - 21h00)
- Học phí: 3.500.000 VNĐ
- Ưu đãi đăng ký sớm: Giảm 15%

**Nội dung học:**
1. Cơ bản về Python
2. Cấu trúc dữ liệu
3. OOP trong Python
4. Xử lý file và database
5. Xây dựng ứng dụng thực tế

**Đăng ký ngay:** Liên hệ hotline 1900.xxx hoặc đăng ký trực tuyến tại website.`,
		author: "Admin",
		date: "2025-10-18",
		status: "published",
		views: 245,
		tags: ["Khóa học mới", "Lập trình", "Python"]
	},
	{
		id: 2,
		title: "Thông báo lịch nghỉ lễ 20/10",
		excerpt: "Kính gửi quý phụ huynh và các em học viên, nhân dịp kỷ niệm ngày Phụ nữ Việt Nam 20/10, trung tâm xin thông báo lịch nghỉ học.",
		content: `Kính gửi quý phụ huynh và các em học viên,

Nhân dịp kỷ niệm ngày Phụ nữ Việt Nam 20/10/2025, trung tâm 360edu xin thông báo:

**Lịch nghỉ:**
- Thứ 7 ngày 19/10/2025
- Chủ nhật ngày 20/10/2025

**Lịch học bù:**
- Sẽ được thông báo cụ thể tới từng lớp
- Học viên vui lòng theo dõi thông báo từ giáo viên

Trung tâm kính chúc các bà, các cô giáo và các em học sinh nữ một ngày 20/10 thật vui vẻ và ý nghĩa!

Trân trọng,
Ban Giám hiệu 360edu`,
		author: "Admin",
		date: "2025-10-15",
		status: "published",
		views: 523,
		tags: ["Thông báo", "Lịch học"]
	},
	{
		id: 3,
		title: "Chương trình ưu đãi tháng 10 - Giảm 20%",
		excerpt: "Nhân dịp khai trương cơ sở mới, 360edu triển khai chương trình ưu đãi đặc biệt với mức giảm giá lên đến 20% cho tất cả các khóa học.",
		content: `🎉 CHƯƠNG TRÌNH ƯU ĐÃI THÁNG 10 🎉

Nhân dịp khai trương cơ sở mới tại quận 7, trung tâm 360edu triển khai chương trình ưu đãi đặc biệt:

**Ưu đãi:**
- Giảm 20% học phí cho tất cả khóa học
- Tặng kèm tài liệu học tập trị giá 500.000đ
- Miễn phí 1 buổi học thử

**Điều kiện:**
- Áp dụng cho học viên đăng ký mới
- Thời gian: từ 01/10 - 31/10/2025
- Đóng học phí trước ngày 25/10

**Liên hệ ngay:**
📞 Hotline: 1900.xxx.xxx
🌐 Website: 360edu.vn
📍 Địa chỉ: 123 Nguyễn Văn Linh, Q.7, TP.HCM`,
		author: "Admin",
		date: "2025-10-10",
		status: "published",
		views: 892,
		tags: ["Ưu đãi", "Khuyến mãi"]
	},
	{
		id: 4,
		title: "Cập nhật tính năng mới trên hệ thống",
		excerpt: "Chúng tôi vừa hoàn thành việc nâng cấp hệ thống với nhiều tính năng mới hữu ích giúp việc học tập và quản lý trở nên dễ dàng hơn.",
		content: `Hệ thống quản lý học tập 360edu vừa được nâng cấp với các tính năng mới:

**Tính năng mới:**
1. Xem điểm trực tuyến
2. Theo dõi lịch học real-time
3. Nhận thông báo qua email/SMS
4. Chat trực tiếp với giáo viên
5. Nộp bài tập online

**Hướng dẫn sử dụng:**
- Video hướng dẫn đã được gửi qua email
- Tài liệu chi tiết tại mục "Hỗ trợ"

**Lưu ý:**
- Vui lòng cập nhật app lên phiên bản mới nhất
- Liên hệ IT support nếu gặp vấn đề

Chúng tôi cam kết mang đến trải nghiệm học tập tốt nhất cho học viên!`,
		author: "Admin",
		date: "2025-10-08",
		status: "draft",
		views: 0,
		tags: ["Hệ thống", "Cập nhật"]
	},
	{
		id: 5,
		title: "Kết quả thi học kỳ I năm học 2024-2025",
		excerpt: "Trung tâm xin công bố kết quả học tập của các em học viên trong kỳ thi học kỳ I năm học 2024-2025. Phụ huynh có thể tra cứu điểm trên hệ thống.",
		content: `THÔNG BÁO KẾT QUẢ HỌC TẬP

Trung tâm 360edu xin công bố kết quả kỳ thi học kỳ I năm học 2024-2025.

**Cách tra cứu:**
1. Đăng nhập vào hệ thống với tài khoản học viên
2. Vào mục "Kết quả học tập"
3. Chọn "Học kỳ I - 2024-2025"

**Thống kê chung:**
- Tỷ lệ đậu: 95%
- Điểm trung bình: 8.2/10
- Số học sinh giỏi: 45%
- Số học sinh khá: 40%

**Lưu ý:**
- Học sinh có điểm dưới 5.0 sẽ được học bù
- Lịch học bù sẽ thông báo riêng
- Liên hệ giáo viên nếu có thắc mắc

Chúc mừng các em đã hoàn thành tốt học kỳ!`,
		author: "Admin",
		date: "2025-10-05",
		status: "hidden",
		views: 156,
		tags: ["Kết quả học tập", "Thi cử"]
	},
	{
		id: 6,
		title: "Tuyển sinh khóa học AI & Machine Learning",
		excerpt: "Cơ hội tham gia khóa học AI & Machine Learning dành cho học viên có nền tảng lập trình. Số lượng có hạn, đăng ký ngay!",
		content: `🚀 KHÓA HỌC AI & MACHINE LEARNING 🚀

**Đối tượng:**
- Đã có kiến thức Python cơ bản
- Sinh viên/người đi làm muốn chuyển sang AI
- Muốn nâng cao kỹ năng lập trình

**Nội dung:**
1. Toán học cho AI (Linear Algebra, Calculus)
2. Machine Learning cơ bản
3. Deep Learning & Neural Networks
4. Computer Vision
5. Natural Language Processing
6. Dự án thực tế

**Thông tin:**
- Thời gian: 6 tháng
- Học phí: 15.000.000 VNĐ
- Giảng viên: Thạc sĩ có kinh nghiệm 10+ năm
- Số lượng: 20 học viên/lớp

**Đăng ký:** Đến 30/11/2025`,
		author: "Admin",
		date: "2025-10-28",
		status: "published",
		views: 1205,
		tags: ["Khóa học mới", "AI", "Machine Learning"]
	},
	{
		id: 7,
		title: "Thông báo bảo trì hệ thống",
		excerpt: "Hệ thống sẽ tạm ngưng hoạt động để bảo trì định kỳ vào cuối tuần này. Vui lòng lưu ý để sắp xếp công việc phù hợp.",
		content: `THÔNG BÁO BẢO TRÌ HỆ THỐNG

Kính gửi quý phụ huynh và học viên,

Để nâng cao chất lượng dịch vụ, hệ thống 360edu sẽ tiến hành bảo trì:

**Thời gian bảo trì:**
- Bắt đầu: 22:00 ngày 09/11/2025
- Kết thúc: 06:00 ngày 10/11/2025

**Ảnh hưởng:**
- Website và app tạm thời không truy cập được
- Không thể xem điểm, lịch học online
- Tính năng thanh toán tạm ngưng

**Khuyến nghị:**
- Tải tài liệu cần thiết trước thời gian bảo trì
- Liên hệ hotline trong trường hợp khẩn cấp

Trân trọng cảm ơn sự thông cảm của quý vị!`,
		author: "Admin",
		date: "2025-11-01",
		status: "draft",
		views: 0,
		tags: ["Thông báo", "Hệ thống"]
	},
	{
		id: 8,
		title: "Chúc mừng học viên đạt giải Hackathon 2025",
		excerpt: "Chúc mừng đội tuyển học viên 360edu đã xuất sắc giành giải Nhất cuộc thi Hackathon cấp thành phố năm 2025!",
		content: `🏆 CHÚC MỪNG CHIẾN THẮNG! 🏆

Trung tâm 360edu tự hào thông báo:

Đội tuyển "CodeMasters" gồm 5 học viên của trung tâm đã xuất sắc giành **Giải Nhất** tại cuộc thi:
- 📌 Hackathon TP.HCM 2025
- 🎯 Chủ đề: Smart City Solutions
- 💰 Giá trị giải thưởng: 50.000.000 VNĐ

**Thành viên:**
1. Nguyễn Văn A (Team Leader)
2. Trần Thị B
3. Lê Văn C
4. Phạm Thị D
5. Hoàng Văn E

**Dự án:** Hệ thống quản lý giao thông thông minh sử dụng AI

Chúc mừng các em! Đây là niềm tự hào của toàn thể 360edu! 🎉`,
		author: "Admin",
		date: "2025-10-25",
		status: "published",
		views: 678,
		tags: ["Thành tích", "Hackathon", "Giải thưởng"]
	}
];

/**
 * Hàm giả lập API delay
 * @param {number} ms - Thời gian delay (milliseconds)
 */
export const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Hàm lọc và tìm kiếm mock data
 * @param {Object} params - Query parameters
 * @returns {Object} - Filtered data với pagination
 */
export const filterMockNews = (params = {}) => {
	const { search = "", status = "", page = 1, size = 100 } = params;
	
	let filtered = [...mockNewsData];

	// Filter by search
	if (search) {
		const searchLower = search.toLowerCase();
		filtered = filtered.filter(item => 
			item.title.toLowerCase().includes(searchLower) ||
			item.excerpt.toLowerCase().includes(searchLower) ||
			item.content.toLowerCase().includes(searchLower)
		);
	}

	// Filter by status
	if (status && status !== "all") {
		filtered = filtered.filter(item => item.status === status);
	}

	// Pagination
	const total = filtered.length;
	const startIndex = (page - 1) * size;
	const endIndex = startIndex + size;
	const items = filtered.slice(startIndex, endIndex);

	return {
		items,
		total,
		page: Number(page),
		size: Number(size),
		totalPages: Math.ceil(total / size)
	};
};
