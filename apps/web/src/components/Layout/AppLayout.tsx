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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">
      <Navbar />
      <WelcomeToast />

      {/* Main content: offset top for desktop navbar, offset bottom for mobile bottom nav */}
      <main className="pt-14 pb-16 md:pb-0 min-h-screen">
        {isFeedPage ? (
          <Outlet />
        ) : (
          <div className="max-w-2xl mx-auto px-4 py-4">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
}
