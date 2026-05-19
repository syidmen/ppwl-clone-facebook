import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { loginUser, loginWithGoogle } from "../../api/profile.api";
import { useAuthStore } from "../../stores/auth.store";

type LoginFormProps = {
  onSuccess?: () => void;
  onGoRegister?: () => void;
};

export function LoginForm({ onSuccess, onGoRegister }: LoginFormProps) {
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs: typeof errors = {};
    if (!email) errs.email = "Email wajib diisi.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Format email tidak valid.";
    if (!password) errs.password = "Password wajib diisi.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      setAuth(data.user, data.accessToken);
      onSuccess?.();
    } catch (err: any) {
      setApiError(err.message ?? "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(token?: string) {
    if (!token) {
      setApiError("Login Google gagal. Token tidak ditemukan.");
      return;
    }

    setApiError("");
    setLoading(true);
    try {
      const data = await loginWithGoogle(token);
      setAuth(data.user, data.accessToken);
      onSuccess?.();
    } catch (err: any) {
      setApiError(err.message ?? "Login Google gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {apiError && (
        <div className="rounded-[6px] bg-red-50 border border-[#FA3E3E] px-4 py-3 text-[13px] text-[#FA3E3E]">
          {apiError}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="kamu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        disabled={loading}
        autoComplete="email"
      />

      <Input
        label="Password"
        type="password"
        placeholder="********"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        disabled={loading}
        autoComplete="current-password"
      />

      <Button type="submit" fullWidth loading={loading}>
        Masuk
      </Button>

      <div className="flex items-center gap-3">
        <hr className="flex-1 border-[#CED0D4]" />
        <span className="text-xs text-[#606770]">atau</span>
        <hr className="flex-1 border-[#CED0D4]" />
      </div>

      <div className={loading ? "pointer-events-none opacity-60" : ""}>
        <GoogleLogin
          width="360"
          onSuccess={(credentialResponse) =>
            handleGoogleLogin(credentialResponse.credential)
          }
          onError={() => setApiError("Login Google dibatalkan atau gagal.")}
        />
      </div>

      <p className="text-center text-[13px] text-[#606770]">
        Belum punya akun?{" "}
        <button
          type="button"
          onClick={onGoRegister}
          className="text-[#1877F2] font-semibold hover:underline"
        >
          Daftar sekarang
        </button>
      </p>
    </form>
  );
}
