import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Loader2,
  ArrowLeft,
  RefreshCw,
  Inbox,
} from "lucide-react";
import NotificationService from "../../services/notification/notification.service";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
} from "../../components/ui/Card";

const AllNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchNotifications(true);
  }, [filter]);

  const fetchNotifications = async (reset = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const currentPage = reset ? 0 : page;
      const data = await NotificationService.getNotifications(currentPage, 20);

      let filteredContent = data.content;
      if (filter === "unread") {
        filteredContent = data.content.filter((n) => !n.isRead);
      } else if (filter === "read") {
        filteredContent = data.content.filter((n) => n.isRead);
      }

      if (reset) {
        setNotifications(filteredContent);
        setPage(1);
      } else {
        setNotifications((prev) => [...prev, ...filteredContent]);
        setPage((prev) => prev + 1);
      }

      setHasMore(!data.last);
    } catch (error) {
      showError("Không thể tải thông báo");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      // Silent fail
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      success("Đã đánh dấu tất cả đã đọc");
    } catch (error) {
      showError("Không thể đánh dấu đã đọc");
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleDelete = async (id) => {
    try {
      await NotificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      success("Thông báo đã được xóa");
    } catch (error) {
      showError("Không thể xóa thông báo");
    }
  };

  const handleRefresh = () => {
    fetchNotifications(true);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const totalCount = notifications.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Quay lại</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30">
                <Bell className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Thông báo
                </h1>
                <p className="text-gray-500 mt-1">
                  {unreadCount > 0
                    ? `Bạn có ${unreadCount} thông báo chưa đọc`
                    : "Tất cả thông báo đã được đọc"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Làm mới</span>
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Đọc tất cả</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              <p className="text-sm text-gray-500">Tổng số</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
              <p className="text-sm text-gray-500">Chưa đọc</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {totalCount - unreadCount}
              </p>
              <p className="text-sm text-gray-500">Đã đọc</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-white/60 backdrop-blur-sm rounded-xl w-fit">
          {[
            { value: "all", label: "Tất cả" },
            { value: "unread", label: "Chưa đọc" },
            { value: "read", label: "Đã đọc" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === tab.value
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-500">Đang tải thông báo...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Inbox className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-700 mb-1">
                Không có thông báo nào
              </p>
              <p className="text-sm text-gray-500 text-center">
                {filter === "unread"
                  ? "Bạn đã đọc tất cả thông báo!"
                  : filter === "read"
                  ? "Chưa có thông báo nào được đọc"
                  : "Các thông báo mới sẽ hiển thị ở đây"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => {
                const style = NotificationService.getNotificationStyle(
                  notification.type
                );
                return (
                  <div
                    key={notification.id}
                    className={`group flex items-start gap-4 p-5 hover:bg-blue-50/50 transition-all cursor-pointer ${
                      !notification.isRead
                        ? "bg-gradient-to-r from-blue-50/80 to-transparent border-l-4 border-blue-500"
                        : "border-l-4 border-transparent"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${style.bgColor}`}
                    >
                      <span className="text-2xl">{style.icon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`font-semibold leading-snug ${
                            !notification.isRead
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.title}
                          {!notification.isRead && (
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full ml-2 animate-pulse" />
                          )}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                        <span className="inline-block w-1 h-1 bg-gray-300 rounded-full" />
                        {NotificationService.formatTime(notification.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                          title="Đánh dấu đã đọc"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        className="p-2 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                        title="Xóa thông báo"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More */}
          {hasMore && !loading && notifications.length > 0 && (
            <div className="p-5 text-center border-t border-gray-100 bg-gray-50/50">
              <Button
                variant="outline"
                onClick={() => fetchNotifications()}
                disabled={loadingMore}
                className="min-w-[200px]"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Đang tải...
                  </>
                ) : (
                  "Xem thêm thông báo"
                )}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AllNotifications;
