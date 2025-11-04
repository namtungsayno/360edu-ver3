import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Search, Plus, Newspaper, Eye, Edit, EyeOff, Calendar, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/Tabs";
import Modal from "../../../components/ui/Modal";
import { newsService } from "../../../services/news/news.service";
import { mockNewsData } from "./mockData";

export default function NewsList() {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const [selected, setSelected] = useState(null);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Dữ liệu tin tức từ API
	const [news, setNews] = useState([]);

	// Fetch danh sách tin tức khi component mount
	useEffect(() => {
		fetchNews();
	}, []);

	const fetchNews = async () => {
		try {
			setLoading(true);
			setError(null);
			
			// TODO: Uncomment khi backend sẵn sàng
			// Real API call
			// const response = await newsService.getNews({
			// 	page: 1,
			// 	size: 100,
			// });
			// const newsData = response.items || response.data || response || [];
			// setNews(newsData);
			
			// Tạm thời dùng mock data để test UI
			setNews(mockNewsData);
			
		} catch (err) {
			console.error("Failed to fetch news:", err);
			setError(err.displayMessage || "Không thể tải danh sách tin tức");
			// Fallback to mock data nếu API lỗi
			setNews(mockNewsData);
		} finally {
			setLoading(false);
		}
	};

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

	const handleToggleStatus = async (id) => {
		try {
			// TODO: Uncomment khi backend sẵn sàng
			// await newsService.toggleStatus(id);
			
			// Giả lập delay API (để test UX)
			await new Promise(resolve => setTimeout(resolve, 300));
			
			// Tạm thời chỉ cập nhật UI (mock behavior)
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
			
			// Thông báo thành công
			const currentStatus = news.find(n => n.id === id)?.status;
			const action = currentStatus === "published" ? "ẩn" : "hiện";
			console.log(`Toggle status success: ${action} tin tức ID ${id}`);
			
		} catch (err) {
			console.error("Failed to toggle status:", err);
			alert(err.displayMessage || "Không thể cập nhật trạng thái");
		}
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

			{/* Loading State */}
			{loading && (
				<Card>
					<CardContent className="p-12 flex flex-col items-center justify-center">
						<Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
						<p className="text-slate-600">Đang tải danh sách tin tức...</p>
					</CardContent>
				</Card>
			)}

			{/* Error State */}
			{error && !loading && (
				<Card>
					<CardContent className="p-12 flex flex-col items-center justify-center">
						<div className="text-red-600 mb-2">⚠️</div>
						<p className="text-slate-600 mb-4">{error}</p>
						<Button onClick={fetchNews} variant="outline">
							Thử lại
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Danh sách tin tức */}
			{!loading && !error && (
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
			)}

			{/* Thống kê */}
			{!loading && !error && (
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
			)}

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
