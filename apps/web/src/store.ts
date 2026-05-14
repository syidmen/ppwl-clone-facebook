// Re-export semua stores untuk backward compatibility
// File ini menggantikan store.ts lama yang pakai localStorage manual

export { useAuthStore } from "./stores/auth.store";
export { useNotificationStore } from "./stores/notification.store";
export { useUIStore } from "./stores/ui.store";

// Alias untuk kode lama yang masih pakai useAuthStore dengan shape { auth, setAuth }
// Buat adapter agar tidak break App.tsx yang lama
import { useAuthStore as _useAuthStore } from "./stores/auth.store";

/**
 * @deprecated Gunakan useAuthStore dari ./stores/auth.store langsung.
 * Adapter ini menjaga kompatibilitas dengan App.tsx yang pakai { auth, setAuth }.
 */
export function useLegacyAuthStore() {
  const store = _useAuthStore();
  return {
    auth: store.user ? { ...store.user, token: store.token! } : null,
    setAuth: (user: Parameters<typeof store.setAuth>[0] | null) => {
      if (user) {
        const { token, ...rest } = user as typeof user & { token: string };
        store.setAuth(rest as Parameters<typeof store.setAuth>[0], token);
      } else {
        store.logout();
      }
    }
  };
}
