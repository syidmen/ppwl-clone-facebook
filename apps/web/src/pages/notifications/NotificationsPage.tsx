import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { useAuthStore } from "../../stores/auth.store";
import { useNotificationStore, type Notification } from "../../stores/notification.store";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    user_id: "me",
    actor_id: "2",
    type: "like",
    post_id: "10",
    comment_id: null,
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    actor: {
      id: "2",
      name: "Budi Santoso",
      username: "budi",
      avatar_url: null,
    },
    post: { id: "10", content: "Postingan pertamaku di sini!" },
  },
  {
    id: "2",
    user_id: "me",
    actor_id: "3",
    type: "comment",
    post_id: "10",
    comment_id: "5",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    actor: {
      id: "3",
      name: "Siti Rahayu",
      username: "siti",
      avatar_url: null,
    },
    post: { id: "10", content: "Postingan pertamaku di sini!" },
  },
  {
    id: "3",
    user_id: "me",
    actor_id: "4",
    type: "like",
    post_id: "11",
    comment_id: null,
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    actor: {
      id: "4",
      name: "Andi Wijaya",
      username: "andi",
      avatar_url: null,
    },
    post: { id: "11", content: "Berbagi foto hari ini." },
  },
];

function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: string) => void;
}) {
  const getLabel = () => {
    if (notification.type === "like") return "menyukai postinganmu";
    if (notification.type === "comment") return "mengomentari postinganmu";
    if (notification.type === "follow") return "mulai mengikutimu";
    return "";
  };

  const getInitial = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div
      onClick={() => !notification.is_read && onRead(notification.id)}
      className={`flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-colors ${
        notification.is_read
          ? "bg-white dark:bg-gray-900"
          : "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900"
      }`}
    >
      {/* Avatar */}
      <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center overflow-hidden">
        {notification.actor.avatar_url ? (
          <img
            src={notification.actor.avatar_url}
            alt={notification.actor.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
            {getInitial(notification.actor.name)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 dark:text-gray-200">
          <span className="font-semibold">{notification.actor.name}</span>{" "}
          {getLabel()}
          {notification.post && (
            <span className="text-gray-500 dark:text-gray-400">
              {" "}
              &mdash;{" "}
              <span className="italic">
                &ldquo;
                {notification.post.content.length > 40
                  ? notification.post.content.slice(0, 40) + "…"
                  : notification.post.content}
                &rdquo;
              </span>
            </span>
          )}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
            locale: localeId,
          })}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.is_read && (
        <div className="w-2.5 h-2.5 mt-1.5 shrink-0 rounded-full bg-indigo-500" />
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
    setLoading,
  } = useNotificationStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !token) {
      // Pakai mock jika belum login / endpoint belum siap
      setNotifications(MOCK_NOTIFICATIONS, MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications, data.unreadCount);
      } else {
        setNotifications(MOCK_NOTIFICATIONS, MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length);
      }
    } catch {
      setNotifications(MOCK_NOTIFICATIONS, MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length);
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
    if (token) {
      try {
        await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/notifications/${id}/read`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch {
        // silent
      }
    }
  };

  const handleMarkAllRead = async () => {
    markAllAsRead();
    if (token) {
      try {
        await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/notifications/read-all`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch {
        // silent
      }
    }
  };

  // Pull-to-refresh touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const dist = e.touches[0].clientY - touchStartY;
    if (dist > 0) setPullDistance(Math.min(dist, 80));
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
      {/* Pull indicator */}
      {pullDistance > 0 && (
        <div
          className="flex justify-center items-center text-indigo-500 transition-all"
          style={{ height: pullDistance, overflow: "hidden" }}
        >
          <RefreshCw
            size={20}
            className={pullDistance > 60 ? "animate-spin" : ""}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="text-indigo-600 dark:text-indigo-400" size={22} />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Notifikasi
          </h1>
          {unreadCount > 0 && (
            <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              <CheckCheck size={15} />
              Tandai semua dibaca
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            aria-label="Refresh notifikasi"
          >
            <RefreshCw
              size={17}
              className={isRefreshing || isLoading ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && notifications.length === 0 && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-gray-900 animate-pulse"
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
            <Bell size={32} className="text-indigo-300 dark:text-indigo-600" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Belum ada notifikasi
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Notifikasi akan muncul saat ada aktivitas di postinganmu
          </p>
        </div>
      )}

      {/* Notification list */}
      {notifications.length > 0 && (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={handleMarkAsRead} />
          ))}
        </div>
      )}
    </div>
  );
}