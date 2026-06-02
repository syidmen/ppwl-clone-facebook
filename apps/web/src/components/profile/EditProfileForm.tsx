import { useEffect, useState } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { updateProfile, uploadProfileAvatar } from "../../api/profile.api";
import { useAuthStore } from "../../stores/auth.store";
import { X } from "lucide-react";

function GlobeIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="94 401 16 16"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.25"
      aria-hidden="true"
    >
      <path d="M104.107 415.696A7.498 7.498 0 0 1 94.5 408.5a7.48 7.48 0 0 1 3.407-6.283 5.474 5.474 0 0 0-1.653 2.334c-.753 2.217-.217 4.075 2.29 4.075.833 0 1.4.561 1.333 2.375-.013.403.52 1.78 2.45 1.89.7.04 1.184 1.053 1.33 1.74.06.29.127.65.257.97a.174.174 0 0 0 .193.096" />
      <path d="M109.5 408.5c0 3.23-2.04 5.983-4.903 7.036l.07-.036c1.167-1 1.814-2.967 2-3.834.214-1 .303-1.3-.5-1.96-.31-.253-.677-.196-1.04-.476-.246-.19-.356-.59-.606-.73-.594-.337-1.107.11-1.954.223a2.666 2.666 0 0 1-1.15-.123c-.007 0-.007 0-.013-.004l-.083-.03c-.164-.082-.077-.206.006-.36h-.006c.086-.17.086-.376-.05-.529-.19-.214-.54-.214-.804-.224-.106-.003-.21 0-.313.004l-.003-.004c-.04 0-.084.004-.124.004h-.037c-.323.007-.666-.034-.893-.314-.263-.353-.29-.733.097-1.09.28-.26.863-.8 1.807-.22.603.37 1.166.667 1.666.5.33-.11.48-.303.094-.87a1.128 1.128 0 0 1-.214-.73c.067-.776.687-.84 1.164-1.2.466-.356.68-.943.546-1.457-.106-.413-.51-.873-1.28-1.01a7.49 7.49 0 0 1 6.524 7.434" />
    </svg>
  );
}

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
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarImageSize, setAvatarImageSize] = useState({ width: 0, height: 0 });
  const [avatarDiscardOpen, setAvatarDiscardOpen] = useState(false);
  const [avatarPosition, setAvatarPosition] = useState({ x: 0, y: 0 });
  const [avatarDragStart, setAvatarDragStart] = useState<{
    pointerX: number;
    pointerY: number;
    imageX: number;
    imageY: number;
  } | null>(null);

  useEffect(() => {
    if (!avatarFile) return;

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreviewUrl(objectUrl);
    setAvatarZoom(1);
    setAvatarPosition({ x: 0, y: 0 });
    setAvatarImageSize({ width: 0, height: 0 });

    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const closeAvatarModal = () => {
    setAvatarFile(null);
    setAvatarPreviewUrl("");
    setAvatarZoom(1);
    setAvatarPosition({ x: 0, y: 0 });
    setAvatarDragStart(null);
    setAvatarImageSize({ width: 0, height: 0 });
    setAvatarDiscardOpen(false);
  };

  function getAvatarCoverSize(zoom = avatarZoom) {
    const frameSize = 300;

    if (!avatarImageSize.width || !avatarImageSize.height) {
      return { width: frameSize * zoom, height: frameSize * zoom };
    }

    const scale =
      Math.max(
        frameSize / avatarImageSize.width,
        frameSize / avatarImageSize.height
      ) * zoom;

    return {
      width: avatarImageSize.width * scale,
      height: avatarImageSize.height * scale
    };
  }

  function clampAvatarPosition(
    position: { x: number; y: number },
    zoom = avatarZoom
  ) {
    const frameSize = 300;
    const displaySize = getAvatarCoverSize(zoom);
    const maxX = Math.max(0, (displaySize.width - frameSize) / 2);
    const maxY = Math.max(0, (displaySize.height - frameSize) / 2);

    return {
      x: Math.min(maxX, Math.max(-maxX, position.x)),
      y: Math.min(maxY, Math.max(-maxY, position.y))
    };
  }

  useEffect(() => {
    setAvatarPosition((position) => clampAvatarPosition(position));
  }, [avatarImageSize.width, avatarImageSize.height, avatarZoom]);

  async function createCroppedAvatarFile() {
    if (!avatarPreviewUrl) {
      throw new Error("Foto profil belum dipilih.");
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = avatarPreviewUrl;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Gagal membaca foto profil."));
    });

    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Browser tidak mendukung pemrosesan foto.");
    }

    const scale = Math.max(size / image.width, size / image.height) * avatarZoom;
    const width = image.width * scale;
    const height = image.height * scale;
    const x = (size - width) / 2 + avatarPosition.x * (size / 300);
    const y = (size - height) / 2 + avatarPosition.y * (size / 300);

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size, size);
    context.drawImage(image, x, y, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92)
    );

    if (!blob) {
      throw new Error("Gagal memotong foto profil.");
    }

    return new File([blob], "profile-avatar.jpg", { type: "image/jpeg" });
  }

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setApiError("File foto profil harus berupa gambar.");
      return;
    }

    setApiError("");
    setSuccess("");
    setAvatarFile(file);
  }

  async function handleSaveAvatar() {
    setApiError("");
    setSuccess("");
    setAvatarUploading(true);

    try {
      const croppedFile = await createCroppedAvatarFile();
      const uploadedAvatarUrl = await uploadProfileAvatar(croppedFile, token ?? "");
      setAvatarUrl(uploadedAvatarUrl);
      setSuccess("Foto profil berhasil diunggah. Klik Simpan Perubahan untuk menyimpan profil.");
      closeAvatarModal();
    } catch (err: any) {
      setApiError(err.message ?? "Gagal mengunggah foto profil.");
    } finally {
      setAvatarUploading(false);
    }
  }

  function handleAvatarPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (avatarUploading) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    setAvatarDragStart({
      pointerX: event.clientX,
      pointerY: event.clientY,
      imageX: avatarPosition.x,
      imageY: avatarPosition.y
    });
  }

  function handleAvatarPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!avatarDragStart || avatarUploading) return;

    setAvatarPosition(
      clampAvatarPosition({
        x: avatarDragStart.imageX + event.clientX - avatarDragStart.pointerX,
        y: avatarDragStart.imageY + event.clientY - avatarDragStart.pointerY
      })
    );
  }

  function handleAvatarPointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setAvatarDragStart(null);
  }

  function handleAvatarZoomChange(value: number) {
    setAvatarZoom(value);
    setAvatarPosition((position) => clampAvatarPosition(position, value));
  }

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

  const avatarCoverSize = getAvatarCoverSize();

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
          <label className="mb-1 block text-[13px] font-medium text-[#606770]">
            Foto Profil
          </label>
          <label
            className={`inline-flex cursor-pointer items-center justify-center rounded-[6px] border border-[#CED0D4] bg-white px-4 py-2 text-sm font-semibold text-[#1C1E21] transition hover:bg-[#F0F2F5] ${
              loading || avatarUploading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {avatarUploading ? "Mengunggah..." : "Pilih Foto"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={handleAvatarChange}
              disabled={loading || avatarUploading}
            />
          </label>
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

      <Button type="submit" fullWidth loading={loading || avatarUploading}>
        Simpan Perubahan
      </Button>

      {avatarPreviewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-3">
          <div className="relative flex max-h-[92vh] w-full max-w-[662px] flex-col overflow-hidden rounded-[10px] bg-white text-[#1C1E21] shadow-2xl">
            <div className="relative flex h-[58px] shrink-0 items-center justify-center border-b border-[#CED0D4]">
              <h2 className="text-xl font-bold">Pilih foto profil</h2>
              <button
                type="button"
                onClick={() => setAvatarDiscardOpen(true)}
                disabled={avatarUploading}
                className="absolute right-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#E4E6EB] text-[#606770] transition hover:bg-[#D8DADF] disabled:opacity-60"
                aria-label="Tutup"
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>

            {avatarDiscardOpen && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75 px-4 backdrop-blur-[1px]">
                <div className="w-full max-w-[548px] overflow-hidden rounded-[10px] bg-white text-[#1C1E21] shadow-[0_12px_28px_rgba(0,0,0,0.22),0_2px_4px_rgba(0,0,0,0.18)]">
                  <div className="relative flex h-[60px] items-center justify-center border-b border-[#CED0D4] px-14">
                    <h3 className="text-xl font-bold">Hapus Perubahan</h3>
                    <button
                      type="button"
                      onClick={() => setAvatarDiscardOpen(false)}
                      className="absolute right-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#E4E6EB] text-[#050505] transition hover:bg-[#D8DADF]"
                      aria-label="Tutup konfirmasi"
                    >
                      <X size={23} strokeWidth={2.5} />
                    </button>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[15px] text-[#1C1E21]">
                      Anda yakin ingin menghapus perubahan Anda?
                    </p>
                  </div>
                  <div className="flex justify-end gap-3 px-4 pb-4 pt-8">
                    <button
                      type="button"
                      onClick={() => setAvatarDiscardOpen(false)}
                      className="rounded-[6px] px-4 py-2 text-sm font-semibold text-[#0866FF] hover:bg-[#F0F2F5]"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={closeAvatarModal}
                      className="rounded-[6px] bg-[#0866FF] px-10 py-2 text-sm font-bold text-white hover:bg-[#075CE5]"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-8 sm:px-6">
              <div className="flex justify-center">
                <div
                  className="relative h-[300px] w-[300px] cursor-grab overflow-hidden rounded-full bg-[#F0F2F5] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08),0_0_0_9999px_rgba(255,255,255,0.42)] active:cursor-grabbing"
                  onPointerDown={handleAvatarPointerDown}
                  onPointerMove={handleAvatarPointerMove}
                  onPointerUp={handleAvatarPointerEnd}
                  onPointerCancel={handleAvatarPointerEnd}
                >
                  <img
                    src={avatarPreviewUrl}
                    alt="Pratinjau foto profil"
                    className="absolute max-w-none select-none"
                    draggable={false}
                    onLoad={(event) => {
                      const image = event.currentTarget;
                      setAvatarImageSize({
                        width: image.naturalWidth,
                        height: image.naturalHeight
                      });
                      setAvatarPosition((position) =>
                        clampAvatarPosition(position)
                      );
                    }}
                    style={{
                      width: `${avatarCoverSize.width}px`,
                      height: `${avatarCoverSize.height}px`,
                      left: "50%",
                      top: "50%",
                      transform: `translate(calc(-50% + ${avatarPosition.x}px), calc(-50% + ${avatarPosition.y}px))`
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/80" />
                  <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]" />
                </div>
              </div>

              <div className="mx-auto mt-10 flex w-full max-w-[460px] items-center gap-3">
                <span className="text-2xl font-semibold text-[#050505]">-</span>
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.05"
                  value={avatarZoom}
                  onChange={(event) =>
                    handleAvatarZoomChange(Number(event.target.value))
                  }
                  disabled={avatarUploading}
                  className="h-2 flex-1 accent-[#1877F2]"
                  aria-label="Zoom foto profil"
                />
                <span className="text-2xl font-semibold text-[#050505]">+</span>
              </div>

              <p className="mt-7 flex items-center gap-2 text-[15px] font-medium text-[#050505]">
                <span className="shrink-0 text-[#050505]">
                  <GlobeIcon />
                </span>
                Foto profil Anda bersifat Publik.
              </p>
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-[#CED0D4] px-4 py-3">
              <button
                type="button"
                onClick={closeAvatarModal}
                disabled={avatarUploading}
                className="rounded-[6px] px-4 py-2 text-sm font-semibold text-[#0866FF] hover:bg-[#F0F2F5] disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveAvatar}
                disabled={avatarUploading}
                className="rounded-[6px] bg-[#0866FF] px-8 py-2 text-sm font-bold text-white hover:bg-[#075CE5] disabled:opacity-60"
              >
                {avatarUploading ? "Mengunggah..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
