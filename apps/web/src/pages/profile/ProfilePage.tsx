import { useAuthStore } from "../../stores/auth.store";
import { EditProfileForm } from "../../components/profile/EditProfileForm";
import { AuthGuard } from "../../components/auth/AuthGuard";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F0F2F5] px-4 py-10">
        <div className="mx-auto w-full max-w-lg">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[20px] font-semibold text-[#1C1E21] leading-[1.3]">Edit Profil</h1>
            <button
              onClick={logout}
              className="text-[13px] text-[#FA3E3E] hover:underline font-medium transition"
            >
              Keluar
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-[#E7F0FD] overflow-hidden flex-shrink-0 flex items-center justify-center text-[#1877F2] font-bold">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.name?.[0]?.toUpperCase() ?? "?"
              )}
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#1C1E21]">{user?.name}</p>
              <p className="text-[13px] text-[#606770]">@{user?.username}</p>
            </div>
          </div>

          <div className="bg-white rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.2)] px-6 py-8">
            <EditProfileForm />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}