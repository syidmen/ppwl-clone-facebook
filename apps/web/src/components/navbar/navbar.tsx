import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, LogOut, Menu, User, X } from "lucide-react"; 
import { useAuthStore } from "../../stores/auth.store";
import { useNotificationStore } from "../../stores/notification.store";
import { useUIStore } from "../../stores/ui.store";
import { Avatar } from "../ui/Avatar";
import { useEffect } from "react";

// ==========================================
// IMPORT ASET IKON FACEBOOK 
// ==========================================
import facebookLogo from "../../assets/icons/facebook.svg";
import searchIcon from "../../assets/icons/search.png";
import videoIcon from "../../assets/icons/video.png";
import marketplaceIcon from "../../assets/icons/marketplace.png";
import groupIcon from "../../assets/icons/group.png";
import gamingIcon from "../../assets/icons/gaming.png";
import menuGridIcon from "../../assets/icons/menu-grid.png";
import messengerIcon from "../../assets/icons/messenger.png";
import bellIcon from "../../assets/icons/bell.png";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { mobileNavOpen, setMobileNavOpen } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  // NavLinks untuk Mobile Menu
  const navLinks = [
    { to: "/", label: "Beranda", icon: <Home size={22} className={isActive("/") ? "text-[#0866FF]" : "text-gray-500"} fill={isActive("/") ? "#0866FF" : "none"} /> },
    { to: "/video", label: "Video", icon: <img src={videoIcon} alt="Video" className="w-6 h-6 object-contain" /> },
    { to: "/marketplace", label: "Marketplace", icon: <img src={marketplaceIcon} alt="Marketplace" className="w-6 h-6 object-contain" /> },
    { to: "/groups", label: "Grup", icon: <img src={groupIcon} alt="Grup" className="w-6 h-6 object-contain" /> },
    { to: "/gaming", label: "Gaming", icon: <img src={gamingIcon} alt="Gaming" className="w-6 h-6 object-contain" /> },
    ...(isAuthenticated
      ? [
          {
            to: "/notifications",
            label: "Notifikasi",
            icon: (
              <div className="relative">
                <img src={bellIcon} alt="Notifikasi" className="w-6 h-6 object-contain" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#E41E3F] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
            ),
          },
          {
            to: "/profile",
            label: "Profile",
            icon: <Avatar name={user?.name} src={user?.avatarUrl} className="h-6 w-6 text-xs" />,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* ================ */}
      {/* DESKTOP NAVBAR    */}
      {/* ================ */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-[56px] bg-white border-b border-gray-200 items-center px-4 justify-between shadow-sm select-none">
        
        {/* BAGIAN KIRI: Logo & Search Bar */}
        <div className="flex items-center gap-2 min-w-[240px]">
          <Link to="/" className="w-10 h-10 rounded-full hover:opacity-95 transition-opacity">
            <img src={facebookLogo} alt="Facebook" className="w-10 h-10" />
          </Link>
          <div className="hidden lg:flex items-center bg-[#F0F2F5] rounded-full px-3 w-[240px] h-10 gap-2 border border-transparent">
            <img src={searchIcon} alt="Search" className="w-4 h-4 opacity-60" />
            <input 
              type="text" 
              placeholder="Cari di Facebook" 
              className="bg-transparent text-[15px] w-full focus:outline-none placeholder-gray-500 text-gray-800"
              disabled
            />
          </div>
        </div>

        {/* BAGIAN TENGAH: Menu Utama */}
        <div className="flex items-center justify-center h-full flex-1 max-w-[680px] gap-1">
          {/* Beranda */}
          <Link to="/" className={`h-full w-[110px] flex items-center justify-center border-b-[3px] transition-all relative ${isActive("/") ? "border-[#0866FF]" : "border-transparent hover:bg-gray-100 rounded-lg my-1"}`} title="Beranda">
            <Home size={28} className={isActive("/") ? "text-[#0866FF]" : "text-gray-500 opacity-60"} fill={isActive("/") ? "#0866FF" : "none"} />
          </Link>
          {/* Video */}
          <div className="h-full w-[110px] flex items-center justify-center border-b-[3px] border-transparent hover:bg-gray-100 rounded-lg my-1 cursor-not-allowed" title="Video">
            <img src={videoIcon} className="w-7 h-7 object-contain opacity-60" alt="Video" />
          </div>
          {/* Marketplace */}
          <div className="h-full w-[110px] flex items-center justify-center border-b-[3px] border-transparent hover:bg-gray-100 rounded-lg my-1 cursor-not-allowed" title="Marketplace">
            <img src={marketplaceIcon} className="w-7 h-7 object-contain opacity-60" alt="Marketplace" />
          </div>
          {/* Grup */}
          <div className="h-full w-[110px] flex items-center justify-center border-b-[3px] border-transparent hover:bg-gray-100 rounded-lg my-1 cursor-not-allowed" title="Grup">
            <img src={groupIcon} className="w-7 h-7 object-contain opacity-60" alt="Grup" />
          </div>
          {/* Gaming */}
          <div className="h-full w-[110px] flex items-center justify-center border-b-[3px] border-transparent hover:bg-gray-100 rounded-lg my-1 cursor-not-allowed" title="Gaming">
            <img src={gamingIcon} className="w-7 h-7 object-contain opacity-60" alt="Gaming" />
          </div>
        </div>

        {/* BAGIAN KANAN: Menu, Messenger, Notifikasi, Akun */}
        <div className="flex items-center gap-2 min-w-[240px] justify-end">

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Menu Grid */}
              <button className="w-10 h-10 bg-[#E4E6EB] hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors" title="Menu">
                <img src={menuGridIcon} alt="Menu" className="w-5 h-5 object-contain" />
              </button>

              {/* Messenger */}
              <button className="w-10 h-10 bg-[#E4E6EB] hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors" title="Messenger">
                <img src={messengerIcon} alt="Messenger" className="w-[22px] h-[22px] object-contain" />
              </button>

              {/* Notifikasi */}
              <Link to="/notifications" className={`w-10 h-10 rounded-full flex items-center justify-center relative transition-colors ${isActive("/notifications") ? "bg-[#E7F3FF]" : "bg-[#E4E6EB] hover:bg-gray-300"}`} title="Notifikasi">
                <img src={bellIcon} alt="Notifikasi" className="w-5 h-5 object-contain" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#E41E3F] text-white text-[11px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center border-2 border-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* Profil & Keluar */}
              <div className="flex items-center gap-1">
                <Link to="/profile" className="rounded-full hover:opacity-80 transition-opacity ml-1" title="Profil">
                  <Avatar name={user?.name} src={user?.avatarUrl} className="h-10 w-10 text-xs border border-gray-200" />
                </Link>
                <button onClick={handleLogout} className="ml-2 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 p-2 rounded-full transition-colors" title="Keluar">
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-sm font-bold text-[#0866FF] hover:bg-blue-50 rounded-lg transition-colors">Masuk</Link>
              <Link to="/register" className="px-4 py-2 text-sm font-bold text-white bg-[#42B72A] hover:bg-[#36A420] rounded-lg transition-colors shadow-sm">Daftar Baru</Link>
            </div>
          )}
        </div>
      </nav>

      {/* ========================================== */}
      {/* MOBILE TOP BAR          */}
      {/* ========================================== */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm select-none">
        <Link to="/" className="text-2xl font-black text-[#0866FF] tracking-tighter">
          facebook
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
            {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-40 pt-14">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="relative bg-[#F0F2F5] w-72 h-full shadow-2xl p-4 flex flex-col gap-2 transition-transform overflow-y-auto">
            {user && (
              <div className="flex items-center gap-3 p-3 mb-2 bg-white rounded-xl shadow-sm">
                <Avatar name={user.name} src={user.avatarUrl} className="h-10 w-10 flex-shrink-0" />
                <div className="overflow-hidden">
                  <p className="font-bold text-sm text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            )}

            <div className="space-y-1 bg-white rounded-xl p-2 shadow-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    isActive(link.to)
                      ? "bg-[#E7F3FF] text-[#0866FF]"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className={isActive(link.to) ? "opacity-100" : "opacity-70"}>
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              ))}
            </div>

            {!isAuthenticated ? (
              <div className="mt-auto bg-white p-3 rounded-xl shadow-sm flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileNavOpen(false)} className="w-full text-center py-2.5 text-sm font-bold text-[#0866FF] border border-[#0866FF] rounded-lg hover:bg-blue-50">Masuk</Link>
                <Link to="/register" onClick={() => setMobileNavOpen(false)} className="w-full text-center py-2.5 text-sm font-bold text-white bg-[#42B72A] rounded-lg hover:bg-[#36A420]">Daftar Akun Baru</Link>
              </div>
            ) : (
              <button
                onClick={() => { handleLogout(); setMobileNavOpen(false); }}
                className="mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-red-50 text-red-600 font-bold rounded-xl shadow-sm border border-transparent hover:border-red-200 transition-all text-sm mb-20"
              >
                <LogOut size={18} />
                Keluar Akun
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MOBILE BOTTOM NAV BAR */}
      {/* ========================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-white border-t border-gray-200 flex items-center justify-around shadow-lg">
        {navLinks.filter((_, i) => i < 5).map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex flex-col items-center justify-center gap-1 w-14 h-full transition-colors relative ${
              isActive(link.to) ? "opacity-100" : "opacity-50"
            }`}
          >
            {link.icon}
            {isActive(link.to) && <div className="absolute top-0 left-2 right-2 h-[3px] bg-[#0866FF] rounded-b-full" />}
          </Link>
        ))}
        {!isAuthenticated && (
          <Link to="/login" className="flex flex-col items-center justify-center gap-0.5 w-16 h-full text-gray-400">
            <User size={20} />
            <span className="text-[10px] font-bold">Masuk</span>
          </Link>
        )}
      </nav>
    </>
  );
}