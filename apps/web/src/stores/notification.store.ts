import { create } from "zustand";

export type Notification = {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: "like" | "comment";
  post_id: string | null;
  comment_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  actor: {
    id: string;
    name: string;
    username: string;
    avatar_url: string | null;
  } | null;
  post: {
    id: string;
    content: string;
  } | null;
};

type NotificationStore = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  setNotifications: (notifications: Notification[], unreadCount: number) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setLoading: (loading: boolean) => void;
  incrementUnread: () => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  setNotifications: (notifications, unreadCount) =>
    set({ notifications, unreadCount }),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id
          ? { ...notification, is_read: true }
          : notification
      ),
      unreadCount: Math.max(
        0,
        state.notifications.filter(
          (notification) => !notification.is_read && notification.id !== id
        ).length
      )
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        is_read: true
      })),
      unreadCount: 0
    })),

  setLoading: (isLoading) => set({ isLoading }),

  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 }))
}));
