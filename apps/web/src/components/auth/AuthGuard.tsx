import { useAuthStore } from "../../stores/auth.store";

type AuthGuardProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <>
        {fallback ?? (
          <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                Kamu harus login untuk mengakses halaman ini.
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}
