import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../navbar/navbar";
import { useUIStore } from "../../stores/ui.store";
import { useEffect } from "react";
import WelcomeToast from "../navbar/WelcomeToast";

export default function AppLayout() {
  const { theme } = useUIStore();
  const location = useLocation();
  const isFeedPage = location.pathname === "/";

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    // UBAH: bg-gray-50 diganti bg-[#F0F2F5] agar warna background-nya abu-abu pudar persis Facebook asli
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-gray-950 text-gray-900 dark:text-white font-sans antialiased transition-colors">
      <Navbar />
      {/* Syafira, WelcomeToast ditaruh di sini agar posisinya relatif terhadap layar utama */}
      <WelcomeToast />

      {/* Main content: pt-14 disesuaikan dengan tinggi Navbar Facebook (h-14) */}
      <main className="pt-14 pb-16 md:pb-0 min-h-screen">
        {isFeedPage ? (
          // Jika di halaman beranda (Feed), biarkan full-width agar halaman 3-kolom milik Atikoh bisa terbentang rapi
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