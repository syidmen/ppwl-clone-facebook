import { useState } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { updateProfile } from "../../api/profile.api";
import { useAuthStore } from "../../stores/auth.store";

export function EditProfileForm() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);

  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Nama wajib diisi.";
    if (!username.trim()) errs.username = "Username wajib diisi.";
    else if (!/^[a-z0-9_]{3,20}$/.test(username))
      errs.username = "Username: 3-20 karakter, huruf kecil/angka/underscore.";
    if (!email) errs.email = "Email wajib diisi.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Format email tidak valid.";
    if (password && password.length < 8)
      errs.password = "Password minimal 8 karakter.";
    if (password && confirmPassword !== password)
      errs.confirmPassword = "Konfirmasi password tidak cocok.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError("");
    setSuccess("");
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const updated = await updateProfile(token ?? "", {
        name,
        username,
        email,
        avatarUrl,
        ...(password ? { password } : {}),
      });
      setAuth(updated, token ?? "");
      setSuccess("Profil berhasil diperbarui!");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setApiError(err.message ?? "Gagal memperbarui profil.");
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
          {success}
        </div>
      )}

      <div className="flex items-center gap-4">
        <Avatar
          name={name}
          src={avatarUrl}
          alt="Avatar"
          className="h-16 w-16 flex-shrink-0 text-2xl"
        />
        <div className="flex-1">
          <Input
            label="URL Foto Profil"
            type="url"
            placeholder="https://example.com/foto.jpg"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            error={errors.avatarUrl}
            disabled={loading}
          />
        </div>
      </div>

      <Input
        label="Nama Lengkap"
        type="text"
        placeholder="John Doe"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        disabled={loading}
      />

      <Input
        label="Username"
        type="text"
        placeholder="johndoe123"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={errors.username}
        disabled={loading}
      />

      <Input
        label="Email"
        type="email"
        placeholder="kamu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        disabled={loading}
      />

      <hr className="border-[#CED0D4]" />
      <p className="text-xs text-[#606770]">
        Kosongkan password jika tidak ingin mengubahnya.
      </p>

      <Input
        label="Password Baru (opsional)"
        type="password"
        placeholder="Min. 8 karakter"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        disabled={loading}
        autoComplete="new-password"
      />
      {password && (
        <Input
          label="Konfirmasi Password Baru"
          type="password"
          placeholder="Ulangi password baru"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          disabled={loading}
          autoComplete="new-password"
        />
      )}

      <Button type="submit" fullWidth loading={loading}>
        Simpan Perubahan
      </Button>
    </form>
  );
}
