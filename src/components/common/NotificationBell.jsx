import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck, X, Loader2, ArrowRight } from "lucide-react";
import NotificationService from "../../services/notification/notification.service";
import { useToast } from "../../hooks/use-toast";

const NotificationBell = ({ variant = "default" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch unread count periodically
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const count = await NotificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {}
  };

  const fetchNotifications = async (reset = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const currentPage = reset ? 0 : page;
      const data = await NotificationService.getNotifications(currentPage, 10);

      if (reset) {
        setNotifications(data.content);
        setPage(1);
      } else {
        setNotifications((prev) => [...prev, ...data.content]);
        setPage((prev) => prev + 1);
      }

      setHasMore(!data.last);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải thông báo",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);

    if (willOpen) {
      fetchNotifications(true);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await NotificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast({
        title: "Thành công",
        description: "Đã đánh dấu tất cả đã đọc",
      });
    } catch (error) {}
  };

  const handleNotificationClick = (notification) => {
    // Đánh dấu đã đọc
    if (!notification.isRead) {
      NotificationService.markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    // Đóng dropdown và navigate đến link nếu có
    setIsOpen(false);
    if (notification.link) {
      // Xử lý các link cũ không còn tồn tại
      let targetLink = notification.link;

      // Map các link cũ sang link mới
      const linkMappings = {
        "/home/student/schedule": "/home/my-schedule",
        "/home/student/courses": "/home/courses",
      };

      // Kiểm tra và thay thế link cũ
      for (const [oldPath, newPath] of Object.entries(linkMappings)) {
        if (targetLink.startsWith(oldPath)) {
          targetLink = targetLink.replace(oldPath, newPath);
          break;
        }
      }

      navigate(targetLink);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await NotificationService.deleteNotification(id);
      const notification = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));

      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {}
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loading) {
      fetchNotifications();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className={`relative p-2.5 rounded-full transition-all duration-200 ${
          variant === "header"
            ? "text-white hover:bg-white/20 active:scale-95"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800 active:scale-95"
        }`}
        aria-label="Thông báo"
      >
        <Bell className={`h-5 w-5 ${isOpen ? "fill-current" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1.5 flex items-center justify-center text-[11px] font-bold text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-full shadow-lg animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-lg">Thông báo</h3>
                {unreadCount > 0 && (
                  <p className="text-blue-100 text-sm mt-0.5">
                    {unreadCount} thông báo chưa đọc
                  </p>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <CheckCheck className="h-4 w-4" />
                  Đọc tất cả
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div
            className="max-h-[420px] overflow-y-auto bg-gray-50/50"
            onScroll={handleScroll}
          >
            {notifications.length === 0 && !loading ? (
              <div className="py-16 px-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Bell className="h-10 w-10 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">
                  Không có thông báo nào
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Các thông báo mới sẽ hiển thị ở đây
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
                      onClick={() => handleNotificationClick(notification)}
                      className={`group flex items-start gap-3 p-4 cursor-pointer transition-all duration-200 hover:bg-white ${
                        !notification.isRead
                          ? "bg-blue-50/80 border-l-4 border-l-blue-500"
                          : "bg-white border-l-4 border-l-transparent"
                      }`}
                    >
                      {/* Color dot indicator */}
                      <div
                        className={`flex-shrink-0 w-3 h-3 rounded-full mt-1.5 ${style.dotColor}`}
                      ></div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm leading-snug ${
                              !notification.isRead
                                ? "font-semibold text-gray-900"
                                : "font-medium text-gray-700"
                            }`}
                          >
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="flex-shrink-0 w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-400">
                            {NotificationService.formatTime(
                              notification.createdAt
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Actions - hiển thị khi hover */}
                      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.isRead && (
                          <button
                            onClick={(e) =>
                              handleMarkAsRead(notification.id, e)
                            }
                            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                            title="Đánh dấu đã đọc"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(notification.id, e)}
                          className="p-2 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          title="Xóa thông báo"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Loading more */}
                {loading && (
                  <div className="py-6 flex justify-center bg-white">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="bg-white border-t border-gray-100">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/home/notifications");
                }}
                className="w-full py-3.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                Xem tất cả thông báo
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
