import { useEffect, useRef } from "react";
import { toast, Toaster } from "sonner";
import { useAuthStore } from "../../stores/auth.store";

export default function WelcomeToast() {
  const { isAuthenticated, user } = useAuthStore();
  const hasShown = useRef(false);

  useEffect(() => {
    if (isAuthenticated && user && !hasShown.current) {
      hasShown.current = true;
      
      toast.custom((t) => (
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4 w-full max-w-sm border-l-4 border-l-[#0866FF] text-gray-900 dark:text-white pointer-events-auto select-none transition-all duration-300">
          {/* Bulatan Ikon Lambai Tangan */}
          <div className="w-10 h-10 bg-[#E7F3FF] dark:bg-blue-950/50 rounded-full flex items-center justify-center text-xl shrink-0">
            👋
          </div>
          
          {/* Isi Teks Berita */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
              Selamat datang, {user.name}!
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Senang melihatmu kembali di Facebook Clone.
            </p>
          </div>
          
          {/* Tombol Silang Tolak (Close) */}
          <button 
            onClick={() => toast.dismiss(t)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-bold p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full h-6 w-6 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>
      ), {
        duration: 4000,
        position: "bottom-left" // DIUBAH: dipindah ke pojok kiri bawah agar tidak menutupi tengah layar/navbar
      });
    }

    if (!isAuthenticated) {
      hasShown.current = false;
    }
  }, [isAuthenticated, user]);

  // DIUBAH: Menghapus properti richColors bawaan sonner agar warna hijau aslinya mati
  return <Toaster position="bottom-left" closeButton={false} />;
}