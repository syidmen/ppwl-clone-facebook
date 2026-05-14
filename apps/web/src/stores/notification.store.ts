import type { NotificationItem } from "@ppwl/shared";
import { create } from "zustand";

type NotificationStore = {
  notifications: NotificationItem[];
  unreadCount: number;

  setNotifications: (notifications: NotificationItem[]) => void;
  markAsRead: (id: string) => void;
  reset: () => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.readAt).length
    }),

  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.readAt).length
      };
    }),

  reset: () => set({ notifications: [], unreadCount: 0 })
}));
