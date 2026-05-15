import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: any, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
        toast(`Selamat datang di Facebook, ${user.firstName}!`, {
            description: "Senang melihat Anda kembali.",
            icon: "👋", // Facebook suka pakai icon simpel
        });
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('auth-storage');
        toast.info("Anda telah keluar dari akun.");
      },
    }),
    { name: 'auth-storage' }
  )
);