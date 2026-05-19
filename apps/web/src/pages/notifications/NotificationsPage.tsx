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

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    user_id: "me",
    actor_id: "2",
    type: "like",
    post_id: "10",
    comment_id: null,
    message: "Budi Santoso menyukai postinganmu",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    actor: {
      id: "2",
      name: "Budi Santoso",
      username: "budi",
      avatar_url: null
    },
    post: { id: "10", content: "Postingan pertamaku di sini!" }
  },
  {
    id: "2",
    user_id: "me",
    actor_id: "3",
    type: "comment",
    post_id: "10",
    comment_id: "5",
    message: "Siti Rahayu mengomentari postinganmu",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    actor: {
      id: "3",
      name: "Siti Rahayu",
      username: "siti",
      avatar_url: null
    },
    post: { id: "10", content: "Postingan pertamaku di sini!" }
  },
  {
    id: "3",
    user_id: "me",
    actor_id: "4",
    type: "like",
    post_id: "11",
    comment_id: null,
    message: "Andi Wijaya menyukai postinganmu",
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    actor: {
      id: "4",
      name: "Andi Wijaya",
      username: "andi",
      avatar_url: null
    },
    post: { id: "11", content: "Berbagi foto hari ini." }
  }
];

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
      className={`flex items-start gap-3 rounded-2xl p-4 transition-colors ${
        notification.is_read
          ? "bg-white dark:bg-gray-900"
          : "border border-indigo-100 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/40"
      } ${notification.is_read ? "" : "cursor-pointer"}`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-200 dark:bg-indigo-800">
        {notification.actor?.avatar_url ? (
          <img
            src={notification.actor.avatar_url}
            alt={actorName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
            {initials}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-800 dark:text-gray-200">
          <span className="font-semibold">{actorName}</span> {action}
          {notification.post && (
            <span className="text-gray-500 dark:text-gray-400">
              {" - "}
              <span className="italic">
                "
                {notification.post.content.length > 40
                  ? `${notification.post.content.slice(0, 40)}...`
                  : notification.post.content}
                "
              </span>
            </span>
          )}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
            locale: localeId
          })}
        </p>
      </div>

      {!notification.is_read && (
        <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500" />
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
      setNotifications(
        MOCK_NOTIFICATIONS,
        MOCK_NOTIFICATIONS.filter((notification) => !notification.is_read).length
      );
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
      setNotifications(
        MOCK_NOTIFICATIONS,
        MOCK_NOTIFICATIONS.filter((notification) => !notification.is_read).length
      );
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
      // Keep the optimistic UI update.
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
      // Keep the optimistic UI update.
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
    <div
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {pullDistance > 0 && (
        <div
          className="flex items-center justify-center text-indigo-500 transition-all"
          style={{ height: pullDistance, overflow: "hidden" }}
        >
          <RefreshCw
            size={20}
            className={pullDistance > 60 ? "animate-spin" : ""}
          />
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="text-indigo-600 dark:text-indigo-400" size={22} />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Notifikasi
          </h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              <CheckCheck size={15} />
              Tandai semua dibaca
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
            aria-label="Refresh notifikasi"
          >
            <RefreshCw
              size={17}
              className={isRefreshing || isLoading ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      {isLoading && notifications.length === 0 && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex animate-pulse items-start gap-3 rounded-2xl bg-white p-4 dark:bg-gray-900"
            >
              <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30">
            <Bell size={32} className="text-indigo-300 dark:text-indigo-600" />
          </div>
          <p className="font-medium text-gray-500 dark:text-gray-400">
            Belum ada notifikasi
          </p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Notifikasi akan muncul saat ada aktivitas di postinganmu
          </p>
        </div>
      )}

      {notifications.length > 0 && (
        <div className="flex flex-col gap-2">
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
  );
}
