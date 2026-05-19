import { RegisterForm } from "../../components/auth/RegisterForm";

type RegisterPageProps = {
  onSuccess?: () => void;
  onGoLogin?: () => void;
};

export default function RegisterPage({ onSuccess, onGoLogin }: RegisterPageProps) {
  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1877F2] text-white text-xl font-bold mb-4">
            F
          </div>
          <h1 className="text-[24px] font-semibold text-[#1C1E21] leading-[1.3]">Buat akun baru</h1>
          <p className="text-[13px] text-[#606770] mt-1">
            Bergabung dan mulai berbagi momen kamu.
          </p>
        </div>

        <div className="bg-white rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.2)] px-6 py-8">
          <RegisterForm onSuccess={onSuccess} onGoLogin={onGoLogin} />
        </div>
      </div>
    </div>
  );
}