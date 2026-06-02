import { LoginForm } from "../../components/auth/LoginForm";
import fakebookLogo from "../../assets/icons/Fakebook-1.png";

type LoginPageProps = {
  onSuccess?: () => void;
  onGoRegister?: () => void;
};

export default function LoginPage({ onSuccess, onGoRegister }: LoginPageProps) {
  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#1C1E21] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={fakebookLogo} alt="Fakebook" className="mx-auto mb-4 h-14 w-14 object-contain" />
          <h1 className="text-[24px] font-semibold text-[#1C1E21] leading-[1.3]">Selamat datang!</h1>
          <p className="text-[13px] text-[#606770] mt-1">
            Masuk ke akun kamu untuk melanjutkan.
          </p>
        </div>

        <div className="bg-white text-[#1C1E21] rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.2)] px-6 py-8">
          <LoginForm onSuccess={onSuccess} onGoRegister={onGoRegister} />
        </div>
      </div>
    </div>
  );
}
