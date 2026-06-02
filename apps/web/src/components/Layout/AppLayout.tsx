import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../navbar/navbar";
import { useUIStore } from "../../stores/ui.store";
import { useCallback, useEffect } from "react";
import WelcomeToast from "../navbar/WelcomeToast";
import { useAuthStore } from "../../stores/auth.store";
import { useNotificationStore } from "../../stores/notification.store";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function AppLayout() {
  const { theme } = useUIStore();
  const { isAuthenticated, token } = useAuthStore();
  const { setNotifications } = useNotificationStore();
  const location = useLocation();
  const isFeedPage = location.pathname === "/";
  const isFullWidthPage =
    isFeedPage ||
    location.pathname === "/notifications" ||
    location.pathname === "/profile";

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setNotifications([], 0);
      return;
    }

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
    }
  }, [isAuthenticated, token, setNotifications]);

  useEffect(() => {
    fetchNotifications();

    const handleFocus = () => {
      fetchNotifications();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchNotifications]);

  return (
    // UBAH: bg-gray-50 diganti bg-[#F0F2F5] agar warna background-nya abu-abu pudar persis Facebook asli
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-gray-950 text-gray-900 dark:text-white font-sans antialiased transition-colors">
      <Navbar />
      {/* Syafira, WelcomeToast ditaruh di sini agar posisinya relatif terhadap layar utama */}
      <WelcomeToast />

      {/* Main content mengikuti tinggi navbar 55.99px. */}
      <main className="min-h-[calc(100vh-55.99px)] pt-[55.99px]">
        {isFullWidthPage ? (
          // Feed, notifikasi, dan profil dibiarkan full-width agar background halaman mengisi layar.
          <div className="w-full">
            <Outlet />
          </div>
        ) : (
          // Jika di halaman lain (seperti halaman login, profile, dll), dibatasi max-w 1200px agar posisinya manis di tengah
          <div className="max-w-[1200px] mx-auto px-4 py-4">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
}
