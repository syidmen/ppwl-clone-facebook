import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useAuthStore } from "../../stores/auth.store";
import {
  useNotificationStore,
  type Notification
} from "../../stores/notification.store";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function NotificationItem({
  notification,
  onRead
}: {
  notification: Notification;
  onRead: (id: string) => void;
}) {
  const action =
    notification.type === "like"
      ? "menyukai postinganmu"
      : "mengomentari postinganmu";

  const actorName = notification.actor?.name ?? "Seseorang";
  const initials = actorName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      onClick={() => !notification.is_read && onRead(notification.id)}
      className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
        notification.is_read
          ? "bg-white hover:bg-gray-100"
          : "bg-[#E7F3FF] hover:bg-[#DBECFF]"
      } cursor-pointer`}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
        {notification.actor?.avatar_url ? (
          <img
            src={notification.actor.avatar_url}
            alt={actorName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm font-bold text-gray-700">
            {initials}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-900 leading-tight">
          <span className="font-bold hover:underline">{actorName}</span> {action}
          {notification.post && (
            <span className="text-gray-500">
              {" - "}
              <span className="italic">
                "
                {notification.post.content.length > 35
                  ? `${notification.post.content.slice(0, 35)}...`
                  : notification.post.content}
                "
              </span>
            </span>
          )}
        </p>

        <p className={`mt-1 text-xs ${!notification.is_read ? 'text-[#0866FF] font-semibold' : 'text-gray-500'}`}>
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
            locale: localeId
          })}
        </p>
      </div>

      {!notification.is_read && (
        <div className="h-3 w-3 shrink-0 rounded-full bg-[#0866FF] ml-2" />
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const { token, isAuthenticated } = useAuthStore();
  const {
    notifications,
    unreadCount,
    isLoading,
    setNotifications,
    markAsRead,
    markAllAsRead,
    setLoading
  } = useNotificationStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setNotifications([], 0);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data.notifications ?? [], data.unreadCount ?? 0);
    } catch {
      setNotifications([], 0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, setNotifications, setLoading]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleMarkAsRead = async (id: string) => {
    markAsRead(id);

    if (!token) return;

    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {
    }
  };

  const handleMarkAllRead = async () => {
    markAllAsRead();

    if (!token) return;

    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {
      // Keep optimistic update
    }
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setTouchStartY(event.touches[0].clientY);
    }
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (touchStartY === null) return;

    const distance = event.touches[0].clientY - touchStartY;
    if (distance > 0) setPullDistance(Math.min(distance, 80));
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60) handleRefresh();
    setTouchStartY(null);
    setPullDistance(0);
  };

  return (
    <div className="min-h-[calc(100vh-55.99px)] w-full bg-[#F0F2F5] px-4 pt-4 pb-12">
      <div
        className="relative max-w-[680px] mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {pullDistance > 0 && (
          <div
            className="flex items-center justify-center text-[#0866FF] transition-all"
            style={{ height: pullDistance, overflow: "hidden" }}
          >
            <RefreshCw
              size={20}
              className={pullDistance > 60 ? "animate-spin" : ""}
            />
          </div>
        )}

        {/* Header Notifikasi */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="text-[#0866FF]" size={24} />
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              Notifikasi
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#E41E3F] px-2 py-0.5 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 text-xs font-bold text-[#0866FF] hover:underline"
              >
                <CheckCheck size={15} />
                Tandai semua dibaca
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="rounded-full p-2 text-gray-500 bg-gray-100 transition-colors hover:bg-gray-200 disabled:opacity-50"
              aria-label="Refresh notifikasi"
            >
              <RefreshCw
                size={16}
                className={isRefreshing || isLoading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* Skeleton Loading Loader */}
        {isLoading && notifications.length === 0 && (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex animate-pulse items-center gap-3 rounded-lg bg-white p-3"
              >
                <div className="h-12 w-12 shrink-0 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/4 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State UI */}
        {!isLoading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <Bell size={36} className="text-gray-400" />
            </div>
            <p className="font-bold text-gray-800">
              Belum ada notifikasi
            </p>
            <p className="mt-1 text-sm text-gray-500 max-w-xs">
              Notifikasi akan muncul saat ada aktivitas suka atau komentar di postinganmu.
            </p>
          </div>
        )}

        {/* List Item Rendering */}
        {notifications.length > 0 && (
          <div className="flex flex-col gap-1">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={handleMarkAsRead}
              />
            ))}
          </div>
        )}
      </div> 
    </div>
  );
}
