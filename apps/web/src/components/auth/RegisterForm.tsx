import { useState } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { registerUser } from "../../api/profile.api";
import { useAuthStore } from "../../stores/auth.store";

type RegisterFormProps = {
  onSuccess?: () => void;
  onGoLogin?: () => void;
};

type Fields = {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FieldErrors = Partial<Record<keyof Fields, string>>;

export function RegisterForm({ onSuccess, onGoLogin }: RegisterFormProps) {
  const setAuth = useAuthStore((s) => s.setAuth);

  const [fields, setFields] = useState<Fields>({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function set(key: keyof Fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((f) => ({ ...f, [key]: e.target.value }));
  }

  function validate(): FieldErrors {
    const errs: FieldErrors = {};
    if (!fields.name.trim()) errs.name = "Nama wajib diisi.";
    if (!fields.username.trim()) errs.username = "Username wajib diisi.";
    else if (!/^[a-z0-9_]{3,20}$/.test(fields.username))
      errs.username = "Username: 3-20 karakter, huruf kecil/angka/underscore.";
    if (!fields.email) errs.email = "Email wajib diisi.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
      errs.email = "Format email tidak valid.";
    if (!fields.password) errs.password = "Password wajib diisi.";
    else if (fields.password.length < 8)
      errs.password = "Password minimal 8 karakter.";
    if (fields.confirmPassword !== fields.password)
      errs.confirmPassword = "Konfirmasi password tidak cocok.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError("");
    setSuccess(false);
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const data = await registerUser({
        name: fields.name,
        username: fields.username,
        email: fields.email,
        password: fields.password,
      });
      setAuth(data.user, data.accessToken);
      setSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      setApiError(err.message ?? "Terjadi kesalahan.");
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
      {success && (
        <div className="rounded-[6px] bg-green-50 border border-[#31A24C] px-4 py-3 text-[13px] text-[#31A24C]">
          Registrasi berhasil! Mengalihkan...
        </div>
      )}

      <Input
        label="Nama Lengkap"
        type="text"
        placeholder="John Doe"
        value={fields.name}
        onChange={set("name")}
        error={errors.name}
        disabled={loading}
        autoComplete="name"
      />
      <Input
        label="Username"
        type="text"
        placeholder="johndoe123"
        value={fields.username}
        onChange={set("username")}
        error={errors.username}
        disabled={loading}
        autoComplete="username"
      />
      <Input
        label="Email"
        type="email"
        placeholder="kamu@email.com"
        value={fields.email}
        onChange={set("email")}
        error={errors.email}
        disabled={loading}
        autoComplete="email"
      />
      <Input
        label="Password"
        type="password"
        placeholder="Min. 8 karakter"
        value={fields.password}
        onChange={set("password")}
        error={errors.password}
        disabled={loading}
        autoComplete="new-password"
      />
      <Input
        label="Konfirmasi Password"
        type="password"
        placeholder="Ulangi password"
        value={fields.confirmPassword}
        onChange={set("confirmPassword")}
        error={errors.confirmPassword}
        disabled={loading}
        autoComplete="new-password"
      />

      <Button type="submit" fullWidth loading={loading}>
        Buat Akun
      </Button>

      <p className="text-center text-[13px] text-[#606770]">
        Sudah punya akun?{" "}
        <button
          type="button"
          onClick={onGoLogin}
          className="text-[#1877F2] font-semibold hover:underline"
        >
          Masuk
        </button>
      </p>
    </form>
  );
}
