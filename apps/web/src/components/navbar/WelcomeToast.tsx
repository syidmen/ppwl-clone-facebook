import { useEffect, useRef } from "react";
import { toast, Toaster } from "sonner";
import { useAuthStore } from "../../stores/auth.store";

export default function WelcomeToast() {
  const { isAuthenticated, user } = useAuthStore();
  const hasShown = useRef(false);

  useEffect(() => {
    if (isAuthenticated && user && !hasShown.current) {
      hasShown.current = true;
      toast.success(`Selamat datang, ${user.name}! 👋`, {
        description: "Senang melihatmu kembali.",
        duration: 4000,
        position: "top-center",
      });
    }

    if (!isAuthenticated) {
      hasShown.current = false;
    }
  }, [isAuthenticated, user]);

  return <Toaster richColors closeButton />;
}