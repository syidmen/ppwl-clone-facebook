import { create } from "zustand";
import { persist } from "zustand/middleware";

type UIStore = {
  theme: "light" | "dark";
  sidebarOpen: boolean;
  mobileNavOpen: boolean;

  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
};

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: "light",
      sidebarOpen: true,
      mobileNavOpen: false,

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),

      setTheme: (theme) => set({ theme }),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
    }),
    { name: "ui-storage" }
  )
);