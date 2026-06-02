import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../stores/auth.store";
import { useNotificationStore } from "../../stores/notification.store";
import { useUIStore } from "../../stores/ui.store";
import { Avatar } from "../ui/Avatar";
import fakebookLogo from "../../assets/icons/Fakebook-1.png";
import keluarIcon from "../../assets/icons/keluar.png";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9.464 1.286C10.294.803 11.092.5 12 .5c.908 0 1.707.303 2.537.786.795.462 1.7 1.142 2.815 1.977l2.232 1.675c1.391 1.042 2.359 1.766 2.888 2.826.53 1.059.53 2.268.528 4.006v4.3c0 1.355 0 2.471-.119 3.355-.124.928-.396 1.747-1.052 2.403-.657.657-1.476.928-2.404 1.053-.884.119-2 .119-3.354.119H7.93c-1.354 0-2.471 0-3.355-.119-.928-.125-1.747-.396-2.403-1.053-.656-.656-.928-1.475-1.053-2.403C1 18.541 1 17.425 1 16.07v-4.3c0-1.738-.002-2.947.528-4.006.53-1.06 1.497-1.784 2.888-2.826L6.65 3.263c1.114-.835 2.02-1.515 2.815-1.977zM10.5 13A1.5 1.5 0 0 0 9 14.5V21h6v-6.5a1.5 1.5 0 0 0-1.5-1.5h-3z"
        fill={active ? "#0866FF" : "currentColor"}
      />
    </svg>
  );
}

function NotificationIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 9.5a9 9 0 1 1 18 0v2.927c0 1.69.475 3.345 1.37 4.778a1.5 1.5 0 0 1-1.272 2.295h-4.625a4.5 4.5 0 0 1-8.946 0H2.902a1.5 1.5 0 0 1-1.272-2.295A9.01 9.01 0 0 0 3 12.43V9.5zm6.55 10a2.5 2.5 0 0 0 4.9 0h-4.9z"
        fill={active ? "#0866FF" : "currentColor"}
      />
    </svg>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { mobileNavOpen, setMobileNavOpen } = useUIStore();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    if (!profileMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [profileMenuOpen]);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    navigate("/login");
  };

  const refreshHome = () => {
    window.location.href = "/";
  };

  const homeLink = {
    to: "/",
    label: "Beranda",
    icon: <HomeIcon active={isActive("/")} />
  };

  const navLinks = [
    homeLink,
    ...(isAuthenticated
      ? [
          {
            to: "/notifications",
            label: "Notifikasi",
            icon: (
              <span className="relative inline-flex">
                <NotificationIcon active={isActive("/notifications")} />
                {unreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#E41E3F] px-1 text-[11px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
            )
          },
          {
            to: "/profile",
            label: "Profil",
            icon: <Avatar name={user?.name} src={user?.avatarUrl} className="h-7 w-7 text-xs" />
          }
        ]
      : [])
  ];

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-50 hidden h-[55.99px] select-none items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm md:flex">
        <button
          type="button"
          onClick={refreshHome}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-90"
          aria-label="Refresh beranda"
        >
          <img src={fakebookLogo} alt="FBook" className="h-10 w-10 object-contain" />
        </button>

        <div className="flex h-full flex-1 items-center justify-center">
          <Link
            to={homeLink.to}
            title={homeLink.label}
            className={`relative flex h-full w-[112px] items-center justify-center border-b-[3px] transition-colors ${
              isActive(homeLink.to)
                ? "border-[#0866FF] text-[#0866FF]"
                : "border-transparent text-gray-500 hover:bg-gray-100"
            }`}
          >
            {homeLink.icon}
          </Link>
        </div>

        <div className="flex min-w-[112px] items-center justify-end gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/notifications"
                title="Notifikasi"
                className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  isActive("/notifications") ? "bg-[#E7F3FF] text-[#0866FF]" : "bg-[#E4E6EB] text-[#050505] hover:bg-gray-300"
                }`}
                aria-label="Notifikasi"
              >
                <NotificationIcon active={isActive("/notifications")} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#E41E3F] px-1 text-[11px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              <div ref={profileMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((value) => !value)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    profileMenuOpen || isActive("/profile") ? "bg-[#E7F3FF]" : "bg-[#E4E6EB] hover:bg-gray-300"
                  }`}
                  aria-label="Profil"
                  aria-expanded={profileMenuOpen}
                >
                  <Avatar name={user?.name} src={user?.avatarUrl} className="h-10 w-10 text-xs" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 top-12 w-[300px] rounded-lg bg-white p-3 text-[#050505] shadow-[0_4px_18px_rgba(0,0,0,0.2)]">
                    <Link
                      to="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-[#F0F2F5]"
                    >
                      <Avatar name={user?.name} src={user?.avatarUrl} className="h-10 w-10 shrink-0 text-xs" />
                      <p className="min-w-0 truncate text-[17px] font-bold">{user?.name ?? "Profil"}</p>
                    </Link>
                    <div className="my-2 h-px bg-[#CED0D4]" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-[15px] font-semibold hover:bg-[#F0F2F5]"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E4E6EB]">
                        <img src={keluarIcon} alt="" className="h-5 w-5 object-contain" />
                      </span>
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="text-sm font-bold text-[#0866FF] hover:underline">
              Masuk
            </Link>
          )}
        </div>
      </nav>

      <nav className="fixed left-0 right-0 top-0 z-50 flex h-[55.99px] select-none items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm md:hidden">
        <button
          type="button"
          onClick={refreshHome}
          className="flex h-10 w-10 items-center justify-center rounded-full"
          aria-label="Refresh beranda"
        >
          <img src={fakebookLogo} alt="FBook" className="h-10 w-10 object-contain" />
        </button>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500"
          aria-label={mobileNavOpen ? "Tutup navigasi" : "Buka navigasi"}
        >
          {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 pt-[55.99px] md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="relative flex h-full w-72 flex-col gap-2 overflow-y-auto bg-[#F0F2F5] p-4 shadow-2xl">
            {user && (
              <div className="mb-2 flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
                <Avatar name={user.name} src={user.avatarUrl} className="h-10 w-10 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-900">{user.name}</p>
                  <p className="truncate text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            )}

            <div className="space-y-1 rounded-lg bg-white p-2 shadow-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive(link.to) ? "bg-[#E7F3FF] text-[#0866FF]" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>

            {!isAuthenticated && (
              <Link
                to="/login"
                onClick={() => setMobileNavOpen(false)}
                className="mt-auto rounded-lg bg-white px-4 py-3 text-center text-sm font-bold text-[#0866FF] shadow-sm"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      )}

    </>
  );
}
