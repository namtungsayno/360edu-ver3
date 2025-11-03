import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Search, Plus, Newspaper, Eye, Edit, EyeOff, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/Tabs";
import Modal from "../../../components/ui/Modal";

export default function NewsList() {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const [selected, setSelected] = useState(null);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);

	// Dữ liệu mẫu - sau này sẽ fetch từ API
	const [news, setNews] = useState([
		{
			id: 1,
			title: "Khai giảng khóa học Lập trình Python mùa Thu 2025",
			excerpt: "Trung tâm 360edu trân trọng thông báo khai giảng khóa học Lập trình Python cơ bản dành cho người mới bắt đầu...",
			content: "Nội dung chi tiết về khóa học Python...",
			author: "Admin",
			date: "18/10/2025",
			status: "published",
			views: 245,
			tags: ["Khóa học mới", "Lập trình"]
		},
		{
			id: 2,
			title: "Thông báo lịch nghỉ lễ 20/10",
			excerpt: "Kính gửi quý phụ huynh và các em học viên, nhân dịp kỷ niệm ngày Phụ nữ Việt Nam 20/10...",
			content: "Chi tiết về lịch nghỉ lễ...",
			author: "Admin",
			date: "15/10/2025",
			status: "published",
			views: 523,
			tags: ["Thông báo", "Lịch học"]
		},
		{
			id: 3,
			title: "Chương trình ưu đãi tháng 10 - Giảm 20%",
			excerpt: "Nhân dịp khai trương cơ sở mới, 360edu triển khai chương trình ưu đãi đặc biệt với mức giảm giá lên đến 20%...",
			content: "Chi tiết chương trình ưu đãi...",
			author: "Admin",
			date: "10/10/2025",
			status: "published",
			views: 892,
			tags: ["Ưu đãi", "Khuyến mãi"]
		},
		{
			id: 4,
			title: "Cập nhật tính năng mới trên hệ thống",
			excerpt: "Chúng tôi vừa hoàn thành việc nâng cấp hệ thống với nhiều tính năng mới hữu ích...",
			content: "Chi tiết các tính năng mới...",
			author: "Admin",
			date: "08/10/2025",
			status: "draft",
			views: 0,
			tags: ["Hệ thống", "Cập nhật"]
		},
		{
			id: 5,
			title: "Kết quả thi học kỳ I năm học 2024-2025",
			excerpt: "Trung tâm xin công bố kết quả học tập của các em học viên trong kỳ thi học kỳ I...",
			content: "Bảng kết quả chi tiết...",
			author: "Admin",
			date: "05/10/2025",
			status: "hidden",
			views: 156,
			tags: ["Kết quả học tập", "Thi cử"]
		},
	]);

	const getStatusBadge = (status) => {
		switch (status) {
			case "published":
				return (
					<Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
						Đã đăng
					</Badge>
				);
			case "draft":
				return (
					<Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
						Nháp
					</Badge>
				);
			case "hidden":
				return (
					<Badge variant="secondary" className="bg-slate-100 text-slate-800 border-slate-200">
						Đã ẩn
					</Badge>
				);
			default:
				return (
					<Badge variant="secondary" className="bg-slate-100 text-slate-800 border-slate-200">
						Chưa xác định
					</Badge>
				);
		}
	};

	const handleView = (item) => {
		setSelected(item);
		setIsPreviewOpen(true);
	};

	const handleToggleStatus = (id) => {
		setNews((prev) =>
			prev.map((n) =>
				n.id === id
					? {
							...n,
							status: n.status === "published" ? "hidden" : "published",
						}
					: n
			)
		);
	};

	const filteredNews = news.filter(item =>
		item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
		item.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
	<div className="p-6 space-y-6 max-w-7xl mx-auto">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Quản lý tin tức</h1>
					<p className="text-slate-600 mt-1">Quản lý và đăng tin tức, thông báo cho học viên và phụ huynh</p>
				</div>
				<Button onClick={() => navigate("/home/admin/news/create")}>
					<Plus className="h-4 w-4 mr-2" />
					Tạo tin tức mới
				</Button>
			</div>

			{/* Danh sách tin tức */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Danh sách tin tức</CardTitle>
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
							<Input
								placeholder="Tìm kiếm tin tức..."
								className="pl-10 w-80"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="all" className="space-y-4">
						<TabsList>
							<TabsTrigger value="all">Tất cả ({news.length})</TabsTrigger>
							<TabsTrigger value="published">Đã đăng ({news.filter(n => n.status === "published").length})</TabsTrigger>
							<TabsTrigger value="draft">Nháp ({news.filter(n => n.status === "draft").length})</TabsTrigger>
							<TabsTrigger value="hidden">Đã ẩn ({news.filter(n => n.status === "hidden").length})</TabsTrigger>
						</TabsList>

						<TabsContent value="all" className="space-y-4">
							{filteredNews.map((item) => (
								<Card key={item.id} className="hover:shadow-md transition-shadow">
									<CardContent className="p-6">
										<div className="flex gap-6">
											<div className="flex items-center justify-center h-24 w-24 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white flex-shrink-0 self-center">
												<Newspaper className="h-10 w-10" />
											</div>
                      
											<div className="flex-1 space-y-3">
												<div className="flex items-start justify-between">
													<div className="flex-1">
														<h3 className="text-lg font-semibold mb-2">{item.title}</h3>
														<p className="text-sm text-slate-600">{item.excerpt}</p>
													</div>
													<div className="ml-4 mt-7">
														{getStatusBadge(item.status)}
													</div>
												</div>

												<div className="flex flex-wrap gap-2">
													{item.tags.map((tag, index) => (
														<Badge key={index} variant="outline" className="text-xs border border-slate-200 bg-slate-50 text-slate-700">
															{tag}
														</Badge>
													))}
												</div>

												<div className="flex items-center justify-between pt-2 border-t">
													<div className="flex items-center gap-4 text-sm text-slate-600">
														<div className="flex items-center gap-2">
															<Calendar className="h-4 w-4" />
															<span>{item.date}</span>
														</div>
														<div className="flex items-center gap-2">
															<Eye className="h-4 w-4" />
															<span>{item.views} lượt xem</span>
														</div>
														<span>Bởi: {item.author}</span>
													</div>
													<div className="flex gap-2">
														<Button
															variant="outline"
															size="sm"
															onClick={() => handleView(item)}
														>
															<Eye className="h-4 w-4 mr-2" />
															Xem
														</Button>
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																navigate("/home/admin/news/create", {
																	state: { draft: item },
																})
															}
														>
															<Edit className="h-4 w-4 mr-2" />
															Sửa
														</Button>
														{item.status === "published" ? (
															<Button
																variant="outline"
																size="sm"
																onClick={() => handleToggleStatus(item.id)}
															>
																<EyeOff className="h-4 w-4 mr-2" />
																Ẩn
															</Button>
														) : (
															<Button
																variant="outline"
																size="sm"
																onClick={() => handleToggleStatus(item.id)}
															>
																<Eye className="h-4 w-4 mr-2" />
																Hiện
															</Button>
														)}
													</div>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</TabsContent>

						<TabsContent value="published" className="space-y-4">
							{filteredNews.filter(n => n.status === "published").map((item) => (
								<Card key={item.id} className="hover:shadow-md transition-shadow">
									<CardContent className="p-6">
										<h3 className="text-lg font-semibold mb-2">{item.title}</h3>
										<p className="text-sm text-slate-600 mb-3">{item.excerpt}</p>
										<div className="flex items-center gap-4 text-sm text-slate-600">
											<span>{item.date}</span>
											<span>{item.views} lượt xem</span>
										</div>
									</CardContent>
								</Card>
							))}
						</TabsContent>

						<TabsContent value="draft" className="space-y-4">
							{filteredNews.filter(n => n.status === "draft").map((item) => (
								<Card key={item.id} className="hover:shadow-md transition-shadow">
									<CardContent className="p-6">
										<h3 className="text-lg font-semibold mb-2">{item.title}</h3>
										<p className="text-sm text-slate-600">{item.excerpt}</p>
									</CardContent>
								</Card>
							))}
						</TabsContent>

						<TabsContent value="hidden" className="space-y-4">
							{filteredNews.filter(n => n.status === "hidden").map((item) => (
								<Card key={item.id} className="hover:shadow-md transition-shadow">
									<CardContent className="p-6">
										<h3 className="text-lg font-semibold mb-2">{item.title}</h3>
										<p className="text-sm text-slate-600">{item.excerpt}</p>
									</CardContent>
								</Card>
							))}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{/* Thống kê */}
			<div className="grid gap-6 md:grid-cols-4">
				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium">Tổng tin tức</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{news.length}</div>
						<p className="text-xs text-slate-500 mt-1">Bài viết</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium">Đã đăng</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-green-600">{news.filter(n => n.status === "published").length}</div>
						<p className="text-xs text-slate-500 mt-1">Bài viết</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium">Nháp</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-yellow-600">{news.filter(n => n.status === "draft").length}</div>
						<p className="text-xs text-slate-500 mt-1">Bài viết</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-sm font-medium">Lượt xem tháng này</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{news.reduce((sum, n) => sum + n.views, 0)}</div>
						<p className="text-xs text-slate-500 mt-1">Lượt</p>
					</CardContent>
				</Card>
			</div>

			{/* Preview Modal */}
			<Modal open={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title={selected?.title}>
				{selected && (
					<div className="space-y-4">
						<div className="flex items-center gap-4 text-sm text-slate-600">
							<div className="flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								<span>{selected.date}</span>
							</div>
							<span>Bởi: {selected.author}</span>
						</div>
						<p className="text-slate-700">{selected.excerpt}</p>
						<div className="prose max-w-none">
							<p className="whitespace-pre-line text-sm text-slate-800">{selected.content}</p>
						</div>
						{selected.tags?.length ? (
							<div className="flex flex-wrap gap-2 pt-2">
								{selected.tags.map((t, i) => (
									<Badge key={i} variant="outline" className="text-xs">{t}</Badge>
								))}
							</div>
						) : null}
					</div>
				)}
			</Modal>
		</div>
	);
}
