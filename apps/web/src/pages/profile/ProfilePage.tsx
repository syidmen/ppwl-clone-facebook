import { useAuthStore } from "../../stores/auth.store";
import { EditProfileForm } from "../../components/profile/EditProfileForm";
import { AuthGuard } from "../../components/auth/AuthGuard";
import { Avatar } from "../../components/ui/Avatar";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-55.99px)] w-full bg-[#F0F2F5] px-4 py-10 text-[#1C1E21]">
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
            <Avatar
              name={user?.name}
              src={user?.avatarUrl}
              className="h-10 w-10 flex-shrink-0 text-[#1877F2]"
            />
            <div>
              <p className="text-[15px] font-semibold text-[#1C1E21]">{user?.name}</p>
              <p className="text-[13px] text-[#606770]">@{user?.username}</p>
            </div>
          </div>

          <div className="bg-white text-[#1C1E21] rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.2)] px-6 py-8">
            <EditProfileForm />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
