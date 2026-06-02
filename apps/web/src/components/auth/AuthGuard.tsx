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
          <div className="flex min-h-[calc(100vh-55.99px)] w-full items-center justify-center bg-[#F0F2F5] px-4 text-[#1C1E21]">
            <div className="rounded-[8px] bg-white px-6 py-5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
              <p className="text-sm font-semibold text-[#606770]">
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
