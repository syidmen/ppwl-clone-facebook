import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import photoIcon from "../../assets/icons/photo.webp";
import defaultProfile from "../../assets/icons/default-profile.png";

function GlobeIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="94 401 16 16"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.25"
      aria-label="Publik"
    >
      <path d="M104.107 415.696A7.498 7.498 0 0 1 94.5 408.5a7.48 7.48 0 0 1 3.407-6.283 5.474 5.474 0 0 0-1.653 2.334c-.753 2.217-.217 4.075 2.29 4.075.833 0 1.4.561 1.333 2.375-.013.403.52 1.78 2.45 1.89.7.04 1.184 1.053 1.33 1.74.06.29.127.65.257.97a.174.174 0 0 0 .193.096" />
      <path d="M109.5 408.5c0 3.23-2.04 5.983-4.903 7.036l.07-.036c1.167-1 1.814-2.967 2-3.834.214-1 .303-1.3-.5-1.96-.31-.253-.677-.196-1.04-.476-.246-.19-.356-.59-.606-.73-.594-.337-1.107.11-1.954.223a2.666 2.666 0 0 1-1.15-.123c-.007 0-.007 0-.013-.004l-.083-.03c-.164-.082-.077-.206.006-.36h-.006c.086-.17.086-.376-.05-.529-.19-.214-.54-.214-.804-.224-.106-.003-.21 0-.313.004l-.003-.004c-.04 0-.084.004-.124.004h-.037c-.323.007-.666-.034-.893-.314-.263-.353-.29-.733.097-1.09.28-.26.863-.8 1.807-.22.603.37 1.166.667 1.666.5.33-.11.48-.303.094-.87a1.128 1.128 0 0 1-.214-.73c.067-.776.687-.84 1.164-1.2.466-.356.68-.943.546-1.457-.106-.413-.51-.873-1.28-1.01a7.49 7.49 0 0 1 6.524 7.434" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M19.884 5.884a1.25 1.25 0 0 0-1.768-1.768L12 10.232 5.884 4.116a1.25 1.25 0 1 0-1.768 1.768L10.232 12l-6.116 6.116a1.25 1.25 0 0 0 1.768 1.768L12 13.768l6.116 6.116a1.25 1.25 0 0 0 1.768-1.768L13.768 12l6.116-6.116z"
        fill="currentColor"
      />
    </svg>
  );
}

interface Author {
  name: string;
  avatar: string;
}

interface PostFormProps {
  currentUser: Author;
  onClose: () => void;
  onSavePost: (text: string, imageFile: File | null) => Promise<void>;
}

export default function PostForm({
  currentUser,
  onClose,
  onSavePost
}: PostFormProps) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!text.trim() && !imageFile) return;

    setLoading(true);
    try {
      await onSavePost(text, imageFile);
    } catch (error: any) {
      alert(error.message || "Gagal membuat postingan.");
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative flex max-h-[92vh] w-full max-w-[500px] flex-col overflow-hidden rounded-lg bg-white shadow-[0_12px_28px_rgba(0,0,0,0.28),0_2px_4px_rgba(0,0,0,0.18)]">
        <div className="relative flex shrink-0 items-center justify-center border-b border-[#ced0d4] px-4 py-4">
          <h3 className="m-0 text-[20px] font-black leading-tight text-[#050505]">
            Buat postingan
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 flex h-[35.99px] w-[35.99px] items-center justify-center rounded-full border-0 bg-[#e4e6eb] text-[#050505] hover:bg-[#d8dadf]"
            aria-label="Tutup"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="mb-4 flex items-center gap-3">
            <img
              src={currentUser.avatar || defaultProfile}
              alt={currentUser.name}
              className="h-[38px] w-[38px] rounded-full object-cover"
            />
            <div>
              <div className="text-[15px] font-semibold text-[#050505]">
                {currentUser.name}
              </div>
              <div className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-[#e4e6eb] px-3 py-1 text-xs font-semibold text-[#050505]">
                <GlobeIcon />
                Publik
              </div>
            </div>
          </div>

          <textarea
            placeholder={`Apa yang Anda pikirkan, ${currentUser.name.split(" ")[0]}?`}
            value={text}
            onChange={(event) => setText(event.target.value)}
            disabled={loading}
            className="mb-3 min-h-[150px] w-full resize-none border-0 text-[22px] text-[#050505] outline-none placeholder:text-[#65676b]"
          />

          {imagePreview && (
            <div className="relative mb-4 overflow-hidden rounded-md border border-[#ced0d4] bg-[#f0f2f5]">
              <img
                src={imagePreview}
                alt="Pratinjau unggahan"
                className="max-h-[360px] w-full object-contain"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute right-2 top-2 flex h-[35.99px] w-[35.99px] items-center justify-center rounded-full border-0 bg-white text-[#050505] shadow"
                aria-label="Hapus gambar"
              >
                <CloseIcon />
              </button>
            </div>
          )}

          <div className="mb-4 flex items-center justify-between rounded-lg border border-[#ced0d4] px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.16)]">
            <span className="text-[15px] font-semibold text-[#050505]">
              Tambahkan ke postingan Anda
            </span>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#f0f2f5]"
              aria-label="Tambah foto"
            >
              <img src={photoIcon} alt="" className="h-6 w-6 object-contain" />
            </button>
          </div>
        </div>

        <div className="shrink-0 p-4 pt-0">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={(!text.trim() && !imageFile) || loading}
            className="w-full rounded-md bg-[#1877f2] py-2.5 text-[15px] font-semibold text-white disabled:bg-[#e4e6eb] disabled:text-[#bcc0c4]"
          >
            {loading ? "Memproses..." : "Kirim"}
          </button>
        </div>

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-white/82 text-[#050505] backdrop-blur-[2px]">
            <div className="fb-spinner h-12 w-12 rounded-full border-[3px] border-[#050505] border-r-transparent" />
            <div className="mt-4 text-[24px] leading-tight">Memposting</div>
          </div>
        )}
      </div>
    </div>
  );
}
