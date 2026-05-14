import { create } from "zustand";
import { persist } from "zustand/middleware";

type UIStore = {
  theme: "light" | "dark";
  sidebarOpen: boolean;

  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
};

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: "light",
      sidebarOpen: false,

      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open })
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({ theme: state.theme })
    }
  )
);
